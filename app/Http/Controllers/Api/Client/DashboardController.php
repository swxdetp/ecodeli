<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Annonce;
use App\Models\Livraison;

class DashboardController extends Controller
{
    /**
     * Display the dashboard data for the client.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Récupérer les annonces actives
        $activeAnnonces = $user->annonces()
            ->where('status', 'active')
            ->count();
            
        // Récupérer les livraisons en cours
        $activeDeliveries = Livraison::whereHas('annonce', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereIn('status', ['accepted', 'in_progress'])
        ->count();
        
        // Récupérer les livraisons terminées
        $completedDeliveries = Livraison::whereHas('annonce', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'delivered')
        ->count();
        
        // Récupérer les dernières annonces
        $recentAnnonces = $user->annonces()
            ->latest()
            ->take(5)
            ->get();
            
        // Récupérer les dernières livraisons
        $recentDeliveries = Livraison::whereHas('annonce', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with('annonce')
        ->latest()
        ->take(5)
        ->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Données du tableau de bord récupérées avec succès',
            'data' => [
                'stats' => [
                    'active_annonces' => $activeAnnonces,
                    'active_deliveries' => $activeDeliveries,
                    'completed_deliveries' => $completedDeliveries,
                ],
                'recent_annonces' => $recentAnnonces,
                'recent_deliveries' => $recentDeliveries,
                'user_info' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'subscription' => $user->abonnement ? [
                        'name' => $user->abonnement->name,
                        'expires_at' => $user->abonnement->pivot->expires_at ?? null,
                    ] : null,
                ]
            ]
        ]);
    }
}
