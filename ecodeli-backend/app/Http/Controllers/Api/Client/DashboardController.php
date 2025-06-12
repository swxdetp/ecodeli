<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Annonce;
use App\Models\Livraison;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Display the dashboard data for the client.
     */
    public function index()
    {
        try {
            // ÉTAPE 0 : Récupération de l'utilisateur connecté uniquement
            $user = Auth::user();
            
            // Initialiser les variables avec des valeurs par défaut
            $activeAnnonces = 0;
            $recentAnnonces = [];
            $activeDeliveries = 0;
            $completedDeliveries = 0;
            $recentDeliveries = [];
            $subscriptionInfo = null;
            
            // ÉTAPE 1 : Récupération des annonces
            try {
                // Compter les annonces actives
                $activeAnnonces = DB::table('annonces')
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->count();
                
                // Récupérer les dernières annonces
                $recentAnnonces = DB::table('annonces')
                    ->where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'title', 'description', 'status', 'created_at']);
                    
                Log::info('Annonces récupérées avec succès');
            } catch (\Exception $e) {
                Log::error('Erreur dans le dashboard client (étape 1 - annonces): ' . $e->getMessage());
                // Continuer avec les valeurs par défaut
            }
            
            // ÉTAPE 2 : Récupération des livraisons
            try {
                // Vérifier d'abord si la table livraisons existe
                if (Schema::hasTable('livraisons') && Schema::hasTable('annonces')) {
                    // Livraisons en cours
                    $activeDeliveries = DB::table('livraisons')
                        ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                        ->where('annonces.user_id', $user->id)
                        ->whereIn('livraisons.status', ['accepted', 'in_progress'])
                        ->count();
                    
                    // Livraisons terminées
                    $completedDeliveries = DB::table('livraisons')
                        ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                        ->where('annonces.user_id', $user->id)
                        ->where('livraisons.status', 'delivered')
                        ->count();
                    
                    // Récupérer les dernières livraisons
                    $recentDeliveries = DB::table('livraisons')
                        ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                        ->where('annonces.user_id', $user->id)
                        ->orderBy('livraisons.created_at', 'desc')
                        ->limit(5)
                        ->select(
                            'livraisons.id',
                            'livraisons.status',
                            'livraisons.tracking_code',
                            'livraisons.created_at',
                            'annonces.title as annonce_title'
                        )
                        ->get();
                }
                
                Log::info('Livraisons récupérées avec succès');
            } catch (\Exception $e) {
                Log::error('Erreur dans le dashboard client (étape 2 - livraisons): ' . $e->getMessage());
                // Continuer avec les valeurs par défaut
            }
            
            // ÉTAPE 3 : Récupération des informations d'abonnement
            try {
                // Vérifier si l'utilisateur a un abonnement
                if (Schema::hasColumn('users', 'subscription_id') && $user->subscription_id) {
                    // Récupérer les informations de base de l'abonnement sans utiliser de relation
                    $abonnement = DB::table('abonnements')
                        ->where('id', $user->subscription_id)
                        ->first();
                    
                    if ($abonnement) {
                        $subscriptionInfo = [
                            'name' => $abonnement->name ?? 'Abonnement'
                        ];
                        
                        // Vérifier si la table pivot existe
                        if (Schema::hasTable('abonnement_user')) {
                            $pivotData = DB::table('abonnement_user')
                                ->where('user_id', $user->id)
                                ->where('abonnement_id', $user->subscription_id)
                                ->first();
                                
                            if ($pivotData && isset($pivotData->expires_at)) {
                                $subscriptionInfo['expires_at'] = $pivotData->expires_at;
                            }
                        }
                    }
                }
                
                Log::info('Informations d\'abonnement récupérées avec succès');
            } catch (\Exception $e) {
                Log::error('Erreur dans le dashboard client (étape 3 - abonnement): ' . $e->getMessage());
                // Continuer avec les valeurs par défaut
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Données du tableau de bord récupérées avec succès',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'subscription' => $subscriptionInfo
                    ],
                    'stats' => [
                        'active_annonces' => $activeAnnonces,
                        'active_deliveries' => $activeDeliveries,
                        'completed_deliveries' => $completedDeliveries
                    ],
                    'recent_annonces' => $recentAnnonces,
                    'recent_deliveries' => $recentDeliveries
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur globale dans le dashboard client: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des données du tableau de bord',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
