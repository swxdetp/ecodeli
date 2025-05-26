<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $role = $request->query('role');
        $query = User::query();
        
        if ($role) {
            $query->where('role', $role);
        }
        
        $users = $query->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des utilisateurs récupérée avec succès',
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:client,livreur,prestataire,commercant,admin',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'nullable|string',
            'lang' => 'nullable|string|in:fr,en',
            'profile_photo' => 'nullable|string',
            'subscription_id' => 'nullable|exists:abonnements,id',
        ]);
        
        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => $user
        ], 201);
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
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de l\'utilisateur récupérés avec succès',
            'data' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|string|in:client,livreur,prestataire,commercant,admin',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'nullable|string',
            'lang' => 'nullable|string|in:fr,en',
            'profile_photo' => 'nullable|string',
            'subscription_id' => 'nullable|exists:abonnements,id',
        ]);
        
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        
        $user->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user
        ]);
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
            return response()->json([
                'success' => false,
                'message' => $message,
                'data' => null
            ], 400);
        }
        
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès',
            'data' => null
        ]);
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
            
        return response()->json([
            'success' => true,
            'message' => 'Statistiques récupérées avec succès',
            'data' => [
                'users_by_role' => $usersByRole,
                'users_by_month' => $usersByMonth,
                'active_clients' => $activeClients,
                'active_livreurs' => $activeLivreurs,
                'active_prestataires' => $activePrestataires
            ]
        ]);
    }
}
