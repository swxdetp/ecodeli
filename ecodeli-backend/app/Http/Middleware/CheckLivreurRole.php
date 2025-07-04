<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckLivreurRole
{
    /**
     * Handle an incoming request and check if the user has the livreur role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Non autorisé. Veuillez vous authentifier.'], 401);
        }

        if (Auth::user()->role !== 'livreur') {
            return response()->json(['message' => 'Accès refusé. Vous devez être un livreur pour accéder à cette ressource.'], 403);
        }

        return $next($request);
    }
}
