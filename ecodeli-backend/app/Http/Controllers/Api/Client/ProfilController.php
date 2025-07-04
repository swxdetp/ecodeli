<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Display the user's profile.
     */
    public function show()
    {
        return response()->json([
            'success' => true,
            'message' => 'Profil récupéré avec succès',
            'data' => auth()->user()
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(Request $request)
    {
        // À implémenter
    }
}
