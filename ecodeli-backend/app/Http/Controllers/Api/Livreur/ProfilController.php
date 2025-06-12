<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Display the livreur's profile.
     */
    public function show()
    {
        return response()->json([
            'success' => true,
            'message' => 'Profil livreur récupéré avec succès',
            'data' => auth()->user()
        ]);
    }

    /**
     * Update the livreur's profile.
     */
    public function update(Request $request)
    {
        // À implémenter
    }
}
