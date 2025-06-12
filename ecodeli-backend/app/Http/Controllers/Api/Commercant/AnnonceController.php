<?php

namespace App\Http\Controllers\Api\Commercant;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnonceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->annonces();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $annonces = $query->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des annonces récupérée avec succès',
            'data' => $annonces
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string',
            'price' => 'required|numeric',
            'address_from' => 'required|string',
            'address_to' => 'nullable|string',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'is_fragile' => 'nullable|boolean',
            'is_urgent' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ]);

        // Vérifier que le commerçant a un contrat actif
        $user = Auth::user();
        if (!$user->contrat || $user->contrat->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez avoir un contrat actif pour créer des annonces',
                'data' => null
            ], 403);
        }

        $annonce = $user->annonces()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès',
            'data' => $annonce
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Annonce $annonce)
    {
        // Vérifier que l'annonce appartient au commerçant connecté
        if ($annonce->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette annonce',
                'data' => null
            ], 403);
        }

        // Charger les relations pertinentes
        $annonce->load(['livraisons', 'prestations']);

        return response()->json([
            'success' => true,
            'message' => 'Détails de l\'annonce récupérés avec succès',
            'data' => $annonce
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Annonce $annonce)
    {
        // Vérifier que l'annonce appartient au commerçant connecté
        if ($annonce->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette annonce',
                'data' => null
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'type' => 'sometimes|string',
            'status' => 'sometimes|in:active,completed,canceled',
            'price' => 'sometimes|numeric',
            'address_from' => 'sometimes|string',
            'address_to' => 'sometimes|string',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after:date_from',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'is_fragile' => 'nullable|boolean',
            'is_urgent' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ]);

        // Vérifier si l'annonce a des livraisons ou prestations en cours
        if (isset($validated['status']) && $validated['status'] === 'canceled') {
            $hasActiveServices = $annonce->livraisons()->whereIn('status', ['accepted', 'in_progress'])->exists() ||
                                $annonce->prestations()->whereIn('status', ['accepted', 'in_progress'])->exists();
            
            if ($hasActiveServices) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible d\'annuler cette annonce car elle a des livraisons ou prestations en cours',
                    'data' => null
                ], 400);
            }
        }

        $annonce->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Annonce mise à jour avec succès',
            'data' => $annonce
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Annonce $annonce)
    {
        // Vérifier que l'annonce appartient au commerçant connecté
        if ($annonce->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette annonce',
                'data' => null
            ], 403);
        }

        // Vérifier si l'annonce peut être supprimée
        $hasServices = $annonce->livraisons()->exists() || $annonce->prestations()->exists();
        
        if ($hasServices) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer cette annonce car elle a des livraisons ou prestations associées',
                'data' => null
            ], 400);
        }

        $annonce->delete();

        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée avec succès',
            'data' => null
        ]);
    }

    /**
     * Get statistics for the commerçant's annonces.
     */
    public function statistics()
    {
        $user = Auth::user();
        
        // Nombre d'annonces par statut
        $statsByStatus = $user->annonces()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
            
        // Nombre de livraisons/prestations par annonce
        $topAnnonces = $user->annonces()
            ->withCount(['livraisons', 'prestations'])
            ->orderByRaw('livraisons_count + prestations_count DESC')
            ->take(5)
            ->get();
            
        // Statistiques mensuelles
        $monthlyStats = $user->annonces()
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, count(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(6)
            ->get();
            
        return response()->json([
            'success' => true,
            'message' => 'Statistiques récupérées avec succès',
            'data' => [
                'stats_by_status' => $statsByStatus,
                'top_annonces' => $topAnnonces,
                'monthly_stats' => $monthlyStats
            ]
        ]);
    }
}
