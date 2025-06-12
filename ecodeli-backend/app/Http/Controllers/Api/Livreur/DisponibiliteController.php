<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Models\Disponibilite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisponibiliteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Auth::user()->disponibilites();
        
        // Filtrer par jour si spécifié
        if ($request->has('jour')) {
            $query->where('jour', $request->jour);
        }
        
        // Filtrer par date spécifique si spécifiée
        if ($request->has('date')) {
            $query->where('date_specifique', $request->date);
        }
        
        $disponibilites = $query->orderBy('jour')->orderBy('heure_debut')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des disponibilités récupérée avec succès',
            'data' => $disponibilites
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jour' => 'required_without:date_specifique|nullable|string|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'recurrent' => 'sometimes|boolean',
            'date_specifique' => 'required_without:jour|nullable|date|after_or_equal:today',
            'zone_geographique' => 'nullable|array',
            'status' => 'sometimes|in:available,unavailable,busy',
        ]);
        
        // Vérifier s'il y a déjà une disponibilité qui chevauche
        $query = Auth::user()->disponibilites();
        
        if (isset($validated['jour'])) {
            $query->where('jour', $validated['jour']);
        }
        
        if (isset($validated['date_specifique'])) {
            $query->where('date_specifique', $validated['date_specifique']);
        }
        
        $overlapping = $query->where(function($query) use ($validated) {
            $query->where(function($query) use ($validated) {
                $query->where('heure_debut', '<=', $validated['heure_debut'])
                      ->where('heure_fin', '>', $validated['heure_debut']);
            })->orWhere(function($query) use ($validated) {
                $query->where('heure_debut', '<', $validated['heure_fin'])
                      ->where('heure_fin', '>=', $validated['heure_fin']);
            })->orWhere(function($query) use ($validated) {
                $query->where('heure_debut', '>=', $validated['heure_debut'])
                      ->where('heure_fin', '<=', $validated['heure_fin']);
            });
        })->exists();
        
        if ($overlapping) {
            return response()->json([
                'success' => false,
                'message' => 'Il existe déjà une disponibilité qui chevauche cette période',
                'data' => null
            ], 400);
        }
        
        $disponibilite = Auth::user()->disponibilites()->create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Disponibilité créée avec succès',
            'data' => $disponibilite
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Disponibilite $disponibilite)
    {
        // Vérifier que la disponibilité appartient au livreur connecté
        if ($disponibilite->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette disponibilité',
                'data' => null
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de la disponibilité récupérés avec succès',
            'data' => $disponibilite
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Disponibilite $disponibilite)
    {
        // Vérifier que la disponibilité appartient au livreur connecté
        if ($disponibilite->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette disponibilité',
                'data' => null
            ], 403);
        }
        
        $validated = $request->validate([
            'jour' => 'sometimes|string|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'heure_debut' => 'sometimes|date_format:H:i',
            'heure_fin' => 'sometimes|date_format:H:i|after:heure_debut',
            'recurrent' => 'sometimes|boolean',
            'date_specifique' => 'sometimes|date|after_or_equal:today',
            'zone_geographique' => 'nullable|array',
            'status' => 'sometimes|in:available,unavailable,busy',
        ]);
        
        $disponibilite->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Disponibilité mise à jour avec succès',
            'data' => $disponibilite
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Disponibilite $disponibilite)
    {
        // Vérifier que la disponibilité appartient au livreur connecté
        if ($disponibilite->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette disponibilité',
                'data' => null
            ], 403);
        }
        
        $disponibilite->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Disponibilité supprimée avec succès',
            'data' => null
        ]);
    }
}
