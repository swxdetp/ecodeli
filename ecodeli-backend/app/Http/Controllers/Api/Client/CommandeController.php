<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    /**
     * Display a listing of the commandes.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des commandes récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created commande in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified commande.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified commande in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified commande from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
