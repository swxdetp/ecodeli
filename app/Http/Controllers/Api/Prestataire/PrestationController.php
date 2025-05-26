<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use App\Models\Prestation;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrestationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->prestations();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $prestations = $query->with('annonce')->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des prestations récupérée avec succès',
            'data' => $prestations
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'annonce_id' => 'required|exists:annonces,id',
            'type' => 'required|string',
            'price' => 'required|numeric',
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
        
        // Vérifier si le prestataire a déjà postulé pour cette annonce
        $existingPrestation = Auth::user()->prestations()
            ->where('annonce_id', $annonce->id)
            ->exists();
            
        if ($existingPrestation) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà postulé pour cette annonce',
                'data' => null
            ], 400);
        }
        
        $prestation = Auth::user()->prestations()->create([
            'annonce_id' => $annonce->id,
            'type' => $validated['type'],
            'price' => $validated['price'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Proposition de prestation créée avec succès',
            'data' => $prestation
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Prestation $prestation)
    {
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette prestation',
                'data' => null
            ], 403);
        }
        
        $prestation->load('annonce');
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de la prestation récupérés avec succès',
            'data' => $prestation
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prestation $prestation)
    {
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette prestation',
                'data' => null
            ], 403);
        }
        
        $validated = $request->validate([
            'status' => 'sometimes|in:in_progress,completed',
            'notes' => 'nullable|string',
            'price' => 'sometimes|numeric',
        ]);
        
        // Vérifier les transitions d'état valides
        if (isset($validated['status'])) {
            if ($validated['status'] === 'in_progress' && $prestation->status !== 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'La prestation doit être acceptée avant de pouvoir être en cours',
                    'data' => null
                ], 400);
            }
            
            if ($validated['status'] === 'completed' && $prestation->status !== 'in_progress') {
                return response()->json([
                    'success' => false,
                    'message' => 'La prestation doit être en cours avant de pouvoir être terminée',
                    'data' => null
                ], 400);
            }
            
            // Si la prestation est marquée comme terminée, définir la date de fin
            if ($validated['status'] === 'completed') {
                $validated['end_date'] = now();
            }
        }
        
        $prestation->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Prestation mise à jour avec succès',
            'data' => $prestation
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prestation $prestation)
    {
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette prestation',
                'data' => null
            ], 403);
        }
        
        // Vérifier si la prestation peut être annulée
        if (!in_array($prestation->status, ['pending', 'accepted'])) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'annuler une prestation déjà en cours ou terminée',
                'data' => null
            ], 400);
        }
        
        $prestation->update(['status' => 'canceled']);
        
        return response()->json([
            'success' => true,
            'message' => 'Prestation annulée avec succès',
            'data' => null
        ]);
    }
}
