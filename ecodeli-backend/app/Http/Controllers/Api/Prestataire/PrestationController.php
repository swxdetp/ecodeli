<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prestataire\PrestationStoreRequest;
use App\Http\Requests\Prestataire\PrestationUpdateRequest;
use App\Http\Resources\PrestationResource;
use App\Models\Annonce;
use App\Models\Prestation;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrestationController extends Controller
{
    use ApiResponder;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        
        $query = Auth::user()->prestations();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $prestations = $query->with('annonce')->latest()->paginate($perPage);
        
        return $this->successResponse(
            PrestationResource::collection($prestations),
            'Liste des prestations récupérée avec succès'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PrestationStoreRequest $request)
    {
        $validated = $request->validated();
        
        // La validation complexe est gérée dans le FormRequest
        $annonce = Annonce::findOrFail($validated['annonce_id']);
        
        $prestation = Auth::user()->prestations()->create([
            'annonce_id' => $annonce->id,
            'type' => $validated['type'],
            'price' => $validated['price'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return $this->createdResponse(
            new PrestationResource($prestation),
            'Proposition de prestation créée avec succès'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Prestation $prestation)
    {
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette prestation');
        }
        
        $prestation->load('annonce');
        
        return $this->successResponse(
            new PrestationResource($prestation),
            'Détails de la prestation récupérés avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PrestationUpdateRequest $request, Prestation $prestation)
    {
        // La validation et l'autorisation sont gérées par le FormRequest
        $validated = $request->validated();
        
        // Si la prestation est marquée comme terminée, définir la date de fin
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['end_date'] = now();
        }
        
        $prestation->update($validated);
        
        return $this->updatedResponse(
            new PrestationResource($prestation),
            'Prestation mise à jour avec succès'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prestation $prestation)
    {
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette prestation');
        }
        
        // Vérifier si la prestation peut être annulée
        if (!in_array($prestation->status, ['pending', 'accepted'])) {
            return $this->errorResponse(
                'Impossible d\'annuler une prestation déjà en cours ou terminée',
                400
            );
        }
        
        $prestation->update(['status' => 'canceled']);
        
        return $this->deletedResponse('Prestation annulée avec succès');
    }
    
    /**
     * Accepter une prestation.
     */
    public function accepter($id)
    {
        $prestation = Prestation::findOrFail($id);
        
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette prestation');
        }
        
        // Vérifier que la prestation est en attente
        if ($prestation->status !== 'pending') {
            return $this->errorResponse(
                'Seules les prestations en attente peuvent être acceptées',
                400
            );
        }
        
        $prestation->update([
            'status' => 'accepted',
            'accepted_at' => now()
        ]);
        
        return $this->successResponse(
            new PrestationResource($prestation),
            'Prestation acceptée avec succès'
        );
    }
    
    /**
     * Refuser une prestation.
     */
    public function refuser($id, Request $request)
    {
        $prestation = Prestation::findOrFail($id);
        
        // Valider la raison
        $validated = $request->validate([
            'raison' => 'required|string|max:500'
        ]);
        
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette prestation');
        }
        
        // Vérifier que la prestation est en attente
        if ($prestation->status !== 'pending') {
            return $this->errorResponse(
                'Seules les prestations en attente peuvent être refusées',
                400
            );
        }
        
        $prestation->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['raison'],
            'rejected_at' => now()
        ]);
        
        return $this->successResponse(
            new PrestationResource($prestation),
            'Prestation refusée avec succès'
        );
    }
    
    /**
     * Terminer une prestation.
     */
    public function terminer($id, Request $request)
    {
        $prestation = Prestation::findOrFail($id);
        
        // Valider les détails
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
            'duree_minutes' => 'nullable|integer|min:1'
        ]);
        
        // Vérifier que la prestation appartient au prestataire connecté
        if ($prestation->prestataire_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette prestation');
        }
        
        // Vérifier que la prestation est en cours ou acceptée
        if (!in_array($prestation->status, ['accepted', 'in_progress'])) {
            return $this->errorResponse(
                'Seules les prestations acceptées ou en cours peuvent être terminées',
                400
            );
        }
        
        $updateData = [
            'status' => 'completed',
            'completed_at' => now()
        ];
        
        // Ajouter les notes si présentes
        if (isset($validated['notes'])) {
            $updateData['completion_notes'] = $validated['notes'];
        }
        
        // Ajouter la durée si présente
        if (isset($validated['duree_minutes'])) {
            $updateData['duration_minutes'] = $validated['duree_minutes'];
        }
        
        $prestation->update($updateData);
        
        return $this->successResponse(
            new PrestationResource($prestation),
            'Prestation terminée avec succès'
        );
    }
}
