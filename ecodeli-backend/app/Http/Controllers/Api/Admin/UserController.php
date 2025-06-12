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
        $role = $request->query('role');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        
        $query = User::query();
        
        if ($role) {
            $query->where('role', $role);
        }
        
        $users = $query->latest()->paginate($perPage);
        
        return $this->successResponse(
            UserResource::collection($users),
            'Liste des utilisateurs récupérée avec succès'
        );
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
