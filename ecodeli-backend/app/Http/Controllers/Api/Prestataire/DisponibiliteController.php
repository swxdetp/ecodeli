<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DisponibiliteController extends Controller
{
    /**
     * Display a listing of the disponibilités.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des disponibilités récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created disponibilité in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified disponibilité.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified disponibilité in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified disponibilité from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
