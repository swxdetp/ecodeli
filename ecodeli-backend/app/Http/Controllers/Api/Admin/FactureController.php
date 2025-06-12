<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    /**
     * Display a listing of the factures.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des factures récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Display the specified facture.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified facture in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Export factures data.
     */
    public function export()
    {
        return response()->json([
            'success' => true,
            'message' => 'Export des factures en cours',
            'data' => []
        ]);
    }
}
