<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;

class AnnonceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Annonce::query();
        
        // Filtrer par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filtrer par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filtrer par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filtrer par date
        if ($request->has('date_from')) {
            $query->where('date_from', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('date_to', '<=', $request->date_to);
        }
        
        $annonces = $query->with('user')->latest()->paginate(10);
        
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
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string',
            'price' => 'required|numeric',
            'address_from' => 'required|string',
            'address_to' => 'required|string',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'is_fragile' => 'nullable|boolean',
            'is_urgent' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ]);

        $annonce = Annonce::create($validated);

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
        $annonce->load(['user', 'livraisons', 'prestations']);
        
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
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
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
        // Vérifier si l'annonce a des livraisons ou prestations
        $hasServices = $annonce->livraisons()->exists() || $annonce->prestations()->exists();
        
        if ($hasServices) {
            // Annuler l'annonce au lieu de la supprimer
            $annonce->update(['status' => 'canceled']);
            
            return response()->json([
                'success' => true,
                'message' => 'Annonce annulée avec succès (non supprimée car elle a des services associés)',
                'data' => $annonce
            ]);
        }
        
        $annonce->delete();

        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée avec succès',
            'data' => null
        ]);
    }

    /**
     * Get statistics about annonces.
     */
    public function statistics()
    {
        // Nombre d'annonces par statut
        $annoncesByStatus = Annonce::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
            
        // Nombre d'annonces par type
        $annoncesByType = Annonce::selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type')
            ->toArray();
            
        // Nombre d'annonces créées par mois
        $annoncesByMonth = Annonce::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, count(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();
            
        // Utilisateurs avec le plus d'annonces
        $topUsers = Annonce::selectRaw('user_id, count(*) as count')
            ->with('user:id,name,email,role')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->take(5)
            ->get();
            
        return response()->json([
            'success' => true,
            'message' => 'Statistiques récupérées avec succès',
            'data' => [
                'annonces_by_status' => $annoncesByStatus,
                'annonces_by_type' => $annoncesByType,
                'annonces_by_month' => $annoncesByMonth,
                'top_users' => $topUsers
            ]
        ]);
    }
}
