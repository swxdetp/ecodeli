<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LivraisonController extends Controller
{
    /**
     * Display a listing of the livraisons.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des livraisons récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created livraison in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified livraison.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified livraison in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified livraison from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
