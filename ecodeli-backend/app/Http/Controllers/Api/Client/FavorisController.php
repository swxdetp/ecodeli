<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FavorisController extends Controller
{
    /**
     * Display a listing of the favoris.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des favoris récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created favori in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified favori.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified favori in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified favori from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
