<?php

namespace App\Http\Controllers\Api\Commercant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContratController extends Controller
{
    /**
     * Display a listing of the contrats.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des contrats récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created contrat in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified contrat.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified contrat in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified contrat from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
