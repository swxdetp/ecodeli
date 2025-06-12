<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\AnnonceStoreRequest;
use App\Http\Requests\Client\AnnonceUpdateRequest;
use App\Http\Resources\AnnonceResource;
use App\Models\Annonce;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnonceController extends Controller
{
    use ApiResponder;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        
        $annonces = Auth::user()->annonces()->latest()->paginate($perPage);
        
        return $this->successResponse(
            AnnonceResource::collection($annonces),
            'Liste des annonces récupérée avec succès'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AnnonceStoreRequest $request)
    {
        // La validation est automatiquement gérée par le FormRequest
        $validated = $request->validated();
        
        $annonce = Auth::user()->annonces()->create($validated);

        return $this->createdResponse(
            new AnnonceResource($annonce),
            'Annonce créée avec succès'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Annonce $annonce)
    {
        // Vérifier que l'annonce appartient à l'utilisateur connecté
        if ($annonce->user_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette annonce');
        }

        return $this->successResponse(
            new AnnonceResource($annonce),
            'Détails de l\'annonce récupérés avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AnnonceUpdateRequest $request, Annonce $annonce)
    {
        // La validation et l'autorisation sont gérées par le FormRequest
        $validated = $request->validated();
        
        $annonce->update($validated);

        return $this->updatedResponse(
            new AnnonceResource($annonce),
            'Annonce mise à jour avec succès'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Annonce $annonce)
    {
        // Vérifier que l'annonce appartient à l'utilisateur connecté
        if ($annonce->user_id !== Auth::id()) {
            return $this->forbiddenResponse('Accès non autorisé à cette annonce');
        }

        // Vérifier si l'annonce peut être supprimée (pas de livraison en cours, etc.)
        if ($annonce->livraisons()->where('status', '!=', 'completed')->exists()) {
            return $this->errorResponse(
                'Impossible de supprimer cette annonce car elle a des livraisons en cours',
                400
            );
        }

        $annonce->delete();

        return $this->deletedResponse('Annonce supprimée avec succès');
    }
}
