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
}
