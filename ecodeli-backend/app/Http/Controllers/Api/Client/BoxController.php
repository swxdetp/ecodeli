<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BoxController extends Controller
{
    /**
     * Display a listing of the boxes.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des boxes récupérée avec succès',
            'data' => []
        ]);
    }

    /**
     * Store a newly created box in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified box.
     */
    public function show(string $id)
    {
        // À implémenter
    }

    /**
     * Update the specified box in storage.
     */
    public function update(Request $request, string $id)
    {
        // À implémenter
    }

    /**
     * Remove the specified box from storage.
     */
    public function destroy(string $id)
    {
        // À implémenter
    }
}
