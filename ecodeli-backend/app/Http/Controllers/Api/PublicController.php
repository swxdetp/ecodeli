<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnonceResource;
use App\Models\Annonce;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    use ApiResponder;
    
    /**
     * Display a listing of public announcements.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllListings(Request $request)
    {
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        
        try {
            $annonces = Annonce::latest()->paginate($perPage);
            
            return $this->successResponse(
                AnnonceResource::collection($annonces),
                'Liste des annonces publiques récupérée avec succès'
            );
        } catch (\Exception $e) {
            \Log::error('PublicController@getAllListings - Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->errorResponse(
                'Une erreur est survenue lors de la récupération des annonces',
                500
            );
        }
    }
}
