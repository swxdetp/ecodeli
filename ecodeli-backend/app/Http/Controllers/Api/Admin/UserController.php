<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserStoreRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponder;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            // Récupérer tous les utilisateurs
            $users = User::all();
            
            // Format de réponse simple et robuste
            return response()->json([
                'success' => true,
                'message' => 'Liste des utilisateurs récupérée avec succès',
                'data' => $users->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at
                    ];
                })
            ]);
            
        } catch (\Exception $e) {
            // Log d'erreur et réponse d'erreur simplifiée
            \Log::error('Erreur lors de la récupération des utilisateurs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'data' => []
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserStoreRequest $request)
    {
        $validated = $request->validated();
        
        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);
        
        return $this->createdResponse(
            new UserResource($user),
            'Utilisateur créé avec succès'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        // Charger les relations pertinentes en fonction du rôle
        switch ($user->role) {
            case 'client':
                $user->load(['annonces', 'favoris', 'boxes', 'abonnement']);
                break;
            case 'livreur':
                $user->load(['livraisons', 'disponibilites', 'paiements']);
                break;
            case 'prestataire':
                $user->load(['prestations', 'disponibilites', 'factures']);
                break;
            case 'commercant':
                $user->load(['annonces', 'contrat', 'factures']);
                break;
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Détails de l\'utilisateur récupérés avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        $validated = $request->validated();
        
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        
        $user->update($validated);
        
        return $this->updatedResponse(
            new UserResource($user),
            'Utilisateur mis à jour avec succès'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Vérifier si l'utilisateur peut être supprimé
        $canDelete = true;
        $message = '';
        
        switch ($user->role) {
            case 'livreur':
                if ($user->livraisons()->whereIn('status', ['accepted', 'in_progress'])->exists()) {
                    $canDelete = false;
                    $message = 'Impossible de supprimer cet utilisateur car il a des livraisons en cours';
                }
                break;
            case 'prestataire':
                if ($user->prestations()->whereIn('status', ['accepted', 'in_progress'])->exists()) {
                    $canDelete = false;
                    $message = 'Impossible de supprimer cet utilisateur car il a des prestations en cours';
                }
                break;
            case 'commercant':
                if ($user->annonces()->whereHas('livraisons', function($query) {
                    $query->whereIn('status', ['accepted', 'in_progress']);
                })->exists()) {
                    $canDelete = false;
                    $message = 'Impossible de supprimer cet utilisateur car il a des annonces avec des livraisons en cours';
                }
                break;
        }
        
        if (!$canDelete) {
            return $this->errorResponse($message, 400);
        }
        
        $user->delete();
        
        return $this->deletedResponse('Utilisateur supprimé avec succès');
    }

    /**
     * Get statistics about users.
     */
    public function statistics()
    {
        // Nombre d'utilisateurs par rôle
        $usersByRole = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role')
            ->toArray();
            
        // Nombre d'utilisateurs créés par mois
        $usersByMonth = User::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, count(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();
            
        // Utilisateurs les plus actifs
        $activeClients = User::where('role', 'client')
            ->withCount('annonces')
            ->orderBy('annonces_count', 'desc')
            ->take(5)
            ->get();
            
        $activeLivreurs = User::where('role', 'livreur')
            ->withCount('livraisons')
            ->orderBy('livraisons_count', 'desc')
            ->take(5)
            ->get();
            
        $activePrestataires = User::where('role', 'prestataire')
            ->withCount('prestations')
            ->orderBy('prestations_count', 'desc')
            ->take(5)
            ->get();
            
        $stats = [
            'users_by_role' => $usersByRole,
            'users_by_month' => $usersByMonth,
            'active_clients' => UserResource::collection($activeClients),
            'active_livreurs' => UserResource::collection($activeLivreurs),
            'active_prestataires' => UserResource::collection($activePrestataires)
        ];
        
        return $this->successResponse($stats, 'Statistiques récupérées avec succès');
    }
}
