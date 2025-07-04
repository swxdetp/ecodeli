<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrestationController extends Controller
{
    /**
     * Display a listing of the prestations.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des prestations récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created prestation in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified prestation.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified prestation in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified prestation from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
