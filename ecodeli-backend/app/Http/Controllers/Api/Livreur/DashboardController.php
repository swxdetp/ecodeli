<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Annonce;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Display dashboard data for livreur.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Récupérer les annonces du livreur
        $completedDeliveries = Annonce::where('livreur_id', $user->id)
            ->where('status', 'completed')
            ->count();
            
        $pendingDeliveries = Annonce::where('livreur_id', $user->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->count();
            
        // Calculer les gains totaux (exemple simplifié)
        $earnings = Annonce::where('livreur_id', $user->id)
            ->where('status', 'completed')
            ->sum('prix_livraison') ?? 0.00;
            
        // Récupérer les activités récentes
        $recentActivities = Annonce::where('livreur_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($annonce) {
                $statusMap = [
                    'pending' => 'En attente',
                    'accepted' => 'Acceptée',
                    'in_progress' => 'En cours',
                    'completed' => 'Terminée',
                    'canceled' => 'Annulée'
                ];
                
                return [
                    'id' => $annonce->id,
                    'type' => 'livraison',
                    'status' => $annonce->status,
                    'date' => $annonce->updated_at->format('Y-m-d'),
                    'description' => 'Livraison #' . $annonce->id . ' - ' . substr($annonce->titre, 0, 30)
                ];
            });
        
        return response()->json([
            'success' => true,
            'message' => 'Données du tableau de bord récupérées avec succès',
            'data' => [
                'completed_deliveries' => $completedDeliveries,
                'pending_deliveries' => $pendingDeliveries,
                'earnings' => $earnings,
                'recent_activities' => $recentActivities
            ]
        ]);
    }
}
