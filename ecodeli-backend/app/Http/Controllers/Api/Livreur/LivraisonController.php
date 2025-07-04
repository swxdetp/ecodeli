<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Http\Requests\Livreur\LivraisonStoreRequest;
use App\Http\Requests\Livreur\LivraisonUpdateRequest;
use App\Http\Resources\LivraisonResource;
use App\Models\Annonce;
use App\Models\Livraison;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivraisonController extends Controller
{
    use ApiResponder;
    
    /**
     * Affiche le tableau de bord du livreur avec ses statistiques et activités récentes
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Récupérer les statistiques du livreur
            $stats = [
                'completed' => Livraison::where('livreur_id', $user->id)
                                ->where('status', 'completed')->count(),
                'pending' => Livraison::where('livreur_id', $user->id)
                                ->whereIn('status', ['pending', 'accepted'])->count(),
                'earnings' => 0 // La colonne amount n'existe pas, on met 0 par défaut
            ];
            
            // Récupérer les activités récentes (limité à 10)
            $recentActivities = $user->livraisons()
                ->with('annonce')
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($livraison) {
                    return [
                        'id' => $livraison->id,
                        'type' => 'livraison',
                        'title' => $livraison->annonce ? $livraison->annonce->title : 'Annonce inconnue',
                        'status' => $livraison->status,
                        'date' => $livraison->updated_at->format('Y-m-d H:i:s')
                    ];
                });
            
            return $this->successResponse([
                'stats' => $stats,
                'recent_activities' => $recentActivities
            ], 'Dashboard livreur récupéré avec succès');
            
        } catch (\Exception $e) {
            \Log::error('LivraisonController@dashboard - Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->errorResponse(
                'Une erreur est survenue lors de la récupération du dashboard: ' . $e->getMessage(), 
                500
            );
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        
        $query = Auth::user()->livraisons();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $livraisons = $query->with('annonce')->latest()->paginate($perPage);
        
        return $this->successResponse(
            LivraisonResource::collection($livraisons),
            'Liste des livraisons récupérée avec succès'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LivraisonStoreRequest $request)
    {
        $validated = $request->validated();
        
        // La validation complexe est gérée dans le FormRequest
        $annonce = Annonce::findOrFail($validated['annonce_id']);
        
        $livraison = Auth::user()->livraisons()->create([
            'annonce_id' => $annonce->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return $this->createdResponse(
            new LivraisonResource($livraison),
            'Demande de livraison créée avec succès'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette livraison');
        }
        
        $livraison->load('annonce');
        
        return $this->successResponse(
            new LivraisonResource($livraison),
            'Détails de la livraison récupérés avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LivraisonUpdateRequest $request, Livraison $livraison)
    {
        try {
            // La validation et l'autorisation sont gérées par le FormRequest
            $validated = $request->validated();
            
            // Si la livraison est marquée comme livrée, définir la date de livraison
            // et créer une notification pour l'administrateur
            if (isset($validated['status']) && $validated['status'] === 'delivered') {
                // Définir la date de livraison
                $validated['delivery_date'] = now();
                
                // Récupérer les détails de la livraison pour la notification
                $livraison->load('annonce'); // Charger l'annonce associée si nécessaire
                
                // Créer une notification pour les administrateurs
                $this->createAdminNotification(
                    $livraison->id,
                    'Nouvelle livraison à valider',
                    'Le livreur ' . Auth::user()->name . ' a marqué la livraison #' . $livraison->id . ' comme livrée. Une validation est requise.',
                    'admin/livraisons/' . $livraison->id
                );
            }
            
            // Mettre à jour la livraison
            $livraison->update($validated);
            
            return $this->updatedResponse(
                new LivraisonResource($livraison),
                'Livraison mise à jour avec succès'
            );
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour de la livraison: ' . $e->getMessage(), [
                'livraison_id' => $livraison->id,
                'user_id' => Auth::id(),
                'data' => $request->all()
            ]);
            
            return $this->errorResponse(
                'Une erreur est survenue lors de la mise à jour de la livraison: ' . $e->getMessage(),
                500
            );
        }
    }
    
    /**
     * Mettre à jour uniquement le statut d'une livraison
     * 
     * @param Request $request
     * @param Livraison $livraison
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, Livraison $livraison)
    {
        try {
            // Vérifier que la livraison appartient au livreur connecté
            if ($livraison->livreur_id !== Auth::id()) {
                return $this->forbiddenResponse('Accès non autorisé à cette livraison');
            }
            
            // Valider les données
            $validated = $request->validate([
                'status' => 'required|string|in:pending,accepted,in_progress,delivered,completed,canceled',
            ]);
            
            // Vérifier les transitions de statut autorisées
            $currentStatus = $livraison->status;
            $newStatus = $validated['status'];
            
            // Liste des transitions autorisées
            $allowedTransitions = [
                'accepted' => ['in_progress', 'canceled'],
                'in_progress' => ['delivered', 'canceled'],
                'pending' => ['accepted', 'canceled'],
                'delivered' => ['completed', 'canceled'],
            ];
            
            // Vérifier si la transition est autorisée
            if (isset($allowedTransitions[$currentStatus]) && !in_array($newStatus, $allowedTransitions[$currentStatus])) {
                return $this->errorResponse(
                    "Transition de statut non autorisée: {$currentStatus} -> {$newStatus}",
                    400
                );
            }
            
            // Si la livraison est marquée comme livrée, définir la date de livraison
            // et créer une notification pour l'administrateur
            if ($newStatus === 'delivered') {
                // Définir la date de livraison
                $validated['delivery_date'] = now();
                
                // Récupérer les détails de la livraison pour la notification
                $livraison->load('annonce'); // Charger l'annonce associée si nécessaire
                
                // Créer une notification pour les administrateurs
                $this->createAdminNotification(
                    $livraison->id,
                    'Nouvelle livraison à valider',
                    'Le livreur ' . Auth::user()->name . ' a marqué la livraison #' . $livraison->id . ' comme livrée. Une validation est requise.',
                    'admin/livraisons/' . $livraison->id
                );
            }
            
            // Mettre à jour la livraison
            $livraison->update([
                'status' => $newStatus,
                'delivery_date' => $validated['delivery_date'] ?? $livraison->delivery_date
            ]);
            
            return $this->updatedResponse(
                new LivraisonResource($livraison),
                'Statut de la livraison mis à jour avec succès'
            );
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour du statut de la livraison: ' . $e->getMessage(), [
                'livraison_id' => $livraison->id,
                'user_id' => Auth::id(),
                'data' => $request->all()
            ]);
            
            return $this->errorResponse(
                'Une erreur est survenue lors de la mise à jour du statut de la livraison: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Crée une notification pour les administrateurs
     *
     * @param int $livraisonId
     * @param string $title
     * @param string $message
     * @param string $link
     * @return void
     */
    private function createAdminNotification($livraisonId, $title, $message, $link)
    {
        try {
            // Récupérer tous les administrateurs
            $admins = \App\Models\User::where('role', 'admin')->get();
            
            foreach ($admins as $admin) {
                // Créer une notification pour chaque admin
                \App\Models\AdminNotification::create([
                    'user_id' => $admin->id,
                    'title' => $title,
                    'message' => $message,
                    'link' => $link,
                    'livraison_id' => $livraisonId,
                    'read' => false
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de notification admin: ' . $e->getMessage());
            // On ne fait pas échouer la requête principale si la notification échoue
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette livraison');
        }
        
        // Vérifier si la livraison peut être annulée
        if (!in_array($livraison->status, ['pending', 'accepted'])) {
            return $this->errorResponse(
                'Impossible d\'annuler une livraison déjà en cours ou terminée',
                400
            );
        }
        
        // Récupérer l'annonce associée avant de mettre à jour la livraison
        $annonce = $livraison->annonce;
        
        // Mettre à jour le statut de la livraison
        $livraison->update(['status' => 'canceled']);
        
        // Libérer l'annonce pour la rendre à nouveau disponible aux livreurs
        if ($annonce) {
            $annonce->update([
                'livreur_id' => null,
                'status' => 'active'
            ]);
        }
        
        return $this->deletedResponse('Livraison annulée avec succès et annonce remise à disposition');
    }
}
