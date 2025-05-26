<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnonceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $annonces = Auth::user()->annonces()->latest()->paginate(10);
        
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
            'address_to' => 'required|string',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'is_fragile' => 'nullable|boolean',
            'is_urgent' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ]);

        $annonce = Auth::user()->annonces()->create($validated);

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
        // Vérifier que l'annonce appartient à l'utilisateur connecté
        if ($annonce->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette annonce',
                'data' => null
            ], 403);
        }

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
        // Vérifier que l'annonce appartient à l'utilisateur connecté
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
        // Vérifier que l'annonce appartient à l'utilisateur connecté
        if ($annonce->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette annonce',
                'data' => null
            ], 403);
        }

        // Vérifier si l'annonce peut être supprimée (pas de livraison en cours, etc.)
        if ($annonce->livraisons()->where('status', '!=', 'completed')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer cette annonce car elle a des livraisons en cours',
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
}
