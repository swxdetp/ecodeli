<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Models\Livraison;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->livraisons();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $livraisons = $query->with('annonce')->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des livraisons récupérée avec succès',
            'data' => $livraisons
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'annonce_id' => 'required|exists:annonces,id',
            'notes' => 'nullable|string',
        ]);
        
        // Vérifier que l'annonce est disponible
        $annonce = Annonce::findOrFail($validated['annonce_id']);
        
        if ($annonce->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Cette annonce n\'est plus disponible',
                'data' => null
            ], 400);
        }
        
        // Vérifier si le livreur a déjà postulé pour cette annonce
        $existingLivraison = Auth::user()->livraisons()
            ->where('annonce_id', $annonce->id)
            ->exists();
            
        if ($existingLivraison) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà postulé pour cette annonce',
                'data' => null
            ], 400);
        }
        
        $livraison = Auth::user()->livraisons()->create([
            'annonce_id' => $annonce->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Demande de livraison créée avec succès',
            'data' => $livraison
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette livraison',
                'data' => null
            ], 403);
        }
        
        $livraison->load('annonce');
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de la livraison récupérés avec succès',
            'data' => $livraison
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette livraison',
                'data' => null
            ], 403);
        }
        
        $validated = $request->validate([
            'status' => 'sometimes|in:in_progress,delivered',
            'notes' => 'nullable|string',
            'tracking_code' => 'nullable|string',
        ]);
        
        // Vérifier les transitions d'état valides
        if (isset($validated['status'])) {
            if ($validated['status'] === 'in_progress' && $livraison->status !== 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'La livraison doit être acceptée avant de pouvoir être en cours',
                    'data' => null
                ], 400);
            }
            
            if ($validated['status'] === 'delivered' && $livraison->status !== 'in_progress') {
                return response()->json([
                    'success' => false,
                    'message' => 'La livraison doit être en cours avant de pouvoir être livrée',
                    'data' => null
                ], 400);
            }
            
            // Si la livraison est marquée comme livrée, définir la date de livraison
            if ($validated['status'] === 'delivered') {
                $validated['delivery_date'] = now();
            }
        }
        
        $livraison->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Livraison mise à jour avec succès',
            'data' => $livraison
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette livraison',
                'data' => null
            ], 403);
        }
        
        // Vérifier si la livraison peut être annulée
        if (!in_array($livraison->status, ['pending', 'accepted'])) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'annuler une livraison déjà en cours ou terminée',
                'data' => null
            ], 400);
        }
        
        $livraison->update(['status' => 'canceled']);
        
        return response()->json([
            'success' => true,
            'message' => 'Livraison annulée avec succès',
            'data' => null
        ]);
    }
}
