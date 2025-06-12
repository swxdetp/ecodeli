<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Http\Requests\Livreur\LivraisonStoreRequest;
use App\Http\Requests\Livreur\LivraisonUpdateRequest;
use App\Http\Resources\LivraisonResource;
use App\Models\Annonce;
use App\Models\Livraison;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivraisonController extends Controller
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
        
        $query = Auth::user()->livraisons();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $livraisons = $query->with('annonce')->latest()->paginate($perPage);
        
        return $this->successResponse(
            LivraisonResource::collection($livraisons),
            'Liste des livraisons récupérée avec succès'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LivraisonStoreRequest $request)
    {
        $validated = $request->validated();
        
        // La validation complexe est gérée dans le FormRequest
        $annonce = Annonce::findOrFail($validated['annonce_id']);
        
        $livraison = Auth::user()->livraisons()->create([
            'annonce_id' => $annonce->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return $this->createdResponse(
            new LivraisonResource($livraison),
            'Demande de livraison créée avec succès'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette livraison');
        }
        
        $livraison->load('annonce');
        
        return $this->successResponse(
            new LivraisonResource($livraison),
            'Détails de la livraison récupérés avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LivraisonUpdateRequest $request, Livraison $livraison)
    {
        // La validation et l'autorisation sont gérées par le FormRequest
        $validated = $request->validated();
        
        // Si la livraison est marquée comme livrée, définir la date de livraison
        if (isset($validated['status']) && $validated['status'] === 'delivered') {
            $validated['delivery_date'] = now();
        }
        
        $livraison->update($validated);
        
        return $this->updatedResponse(
            new LivraisonResource($livraison),
            'Livraison mise à jour avec succès'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livraison $livraison)
    {
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette livraison');
        }
        
        // Vérifier si la livraison peut être annulée
        if (!in_array($livraison->status, ['pending', 'accepted'])) {
            return $this->errorResponse(
                'Impossible d\'annuler une livraison déjà en cours ou terminée',
                400
            );
        }
        
        $livraison->update(['status' => 'canceled']);
        
        return $this->deletedResponse('Livraison annulée avec succès');
    }
}
