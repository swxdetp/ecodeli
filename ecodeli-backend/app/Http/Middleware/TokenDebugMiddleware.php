<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TokenDebugMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Récupérer le token de l'en-tête Authorization
        $bearerToken = $request->bearerToken();
        
        // Journaliser les informations de débogage
        \Log::info('TokenDebug: Requête reçue', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'has_bearer_token' => !empty($bearerToken),
            'token_length' => $bearerToken ? strlen($bearerToken) : 0,
            'all_headers' => $request->header(),
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ] : null,
        ]);

        // Poursuivre le traitement de la requête
        $response = $next($request);

        // Journaliser le code de statut de la réponse
        \Log::info('TokenDebug: Réponse envoyée', [
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
