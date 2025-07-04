<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestAuthController extends Controller
{
    /**
     * Test si l'authentification fonctionne correctement.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function testAuth(Request $request)
    {
        // Récupération des informations pour le débogage
        $user = $request->user();
        $bearerToken = $request->bearerToken();
        $headers = $request->header();
        
        // Journaliser toutes les informations pertinentes
        Log::info('Test Auth Controller', [
            'user_exists' => !is_null($user),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'has_bearer_token' => !is_null($bearerToken),
            'token_length' => $bearerToken ? strlen($bearerToken) : 0,
            'all_headers' => $headers,
        ]);
        
        if ($user) {
            return response()->json([
                'success' => true,
                'message' => 'Vous êtes authentifié avec succès',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'role' => $user->role,
                ],
                'token_info' => [
                    'exists' => !is_null($bearerToken),
                    'length' => $bearerToken ? strlen($bearerToken) : 0
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Authentification échouée',
            'token_info' => [
                'exists' => !is_null($bearerToken),
                'length' => $bearerToken ? strlen($bearerToken) : 0
            ],
            'debug' => [
                'has_authorization_header' => isset($headers['authorization']),
                'auth_header' => isset($headers['authorization']) ? $headers['authorization'] : null
            ]
        ], 401);
    }
}
