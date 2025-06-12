<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AbonnementController extends Controller
{
    /**
     * Display a listing of the abonnements.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des abonnements récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created abonnement in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified abonnement.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified abonnement in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified abonnement from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
