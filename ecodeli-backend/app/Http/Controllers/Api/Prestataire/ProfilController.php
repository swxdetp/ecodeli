<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Display the prestataire's profile.
     */
    public function show()
    {
        return response()->json([
            'success' => true,
            'message' => 'Profil prestataire récupéré avec succès',
            'data' => auth()->user()
        ]);
    }

    /**
     * Update the prestataire's profile.
     */
    public function update(Request $request)
    {
        // À implémenter
    }
}
