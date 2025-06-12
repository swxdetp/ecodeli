<?php

namespace App\Services;

use App\Models\User;
use App\Models\Annonce;
use App\Models\Livraison;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    /**
     * Récupère les statistiques pour le tableau de bord d'un client
     *
     * @param User $user L'utilisateur client connecté
     * @return array Les données du tableau de bord
     */
    public function getClientStats(User $user)
    {
        try {
            // Récupérer les statistiques des annonces
            $annonceStats = $this->getAnnonceStats($user->id);
            
            // Récupérer les statistiques des livraisons
            $livraisonStats = $this->getLivraisonStats($user->id);
            
            // Récupérer les informations d'abonnement
            $subscriptionInfo = $this->getSubscriptionInfo($user);
            
            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'subscription' => $subscriptionInfo
                ],
                'stats' => [
                    'active_annonces' => $annonceStats['active'],
                    'active_deliveries' => $livraisonStats['active'],
                    'completed_deliveries' => $livraisonStats['completed']
                ],
                'recent_annonces' => $annonceStats['recent'],
                'recent_deliveries' => $livraisonStats['recent']
            ];
        } catch (\Exception $e) {
            Log::error('Erreur dans DashboardService::getClientStats: ' . $e->getMessage());
            
            // Retourner un ensemble de données minimal pour éviter d'avoir une erreur 500
            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'subscription' => null
                ],
                'stats' => [
                    'active_annonces' => 0,
                    'active_deliveries' => 0,
                    'completed_deliveries' => 0
                ],
                'recent_annonces' => [],
                'recent_deliveries' => []
            ];
        }
    }
    
    /**
     * Récupère les statistiques des annonces pour un utilisateur
     *
     * @param int $userId ID de l'utilisateur
     * @return array Statistiques des annonces
     */
    private function getAnnonceStats($userId)
    {
        try {
            // Compter les annonces actives
            $activeAnnonces = DB::table('annonces')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->count();
            
            // Récupérer les dernières annonces
            $recentAnnonces = DB::table('annonces')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'description', 'status', 'created_at']);
                
            return [
                'active' => $activeAnnonces,
                'recent' => $recentAnnonces
            ];
        } catch (\Exception $e) {
            Log::error('Erreur dans DashboardService::getAnnonceStats: ' . $e->getMessage());
            return [
                'active' => 0,
                'recent' => []
            ];
        }
    }
    
    /**
     * Récupère les statistiques des livraisons pour un utilisateur
     *
     * @param int $userId ID de l'utilisateur
     * @return array Statistiques des livraisons
     */
    private function getLivraisonStats($userId)
    {
        try {
            // Vérifier si les tables existent
            if (!DB::getSchemaBuilder()->hasTable('livraisons') || !DB::getSchemaBuilder()->hasTable('annonces')) {
                return [
                    'active' => 0,
                    'completed' => 0,
                    'recent' => []
                ];
            }
            
            // Livraisons en cours
            $activeDeliveries = DB::table('livraisons')
                ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                ->where('annonces.user_id', $userId)
                ->whereIn('livraisons.status', ['accepted', 'in_progress'])
                ->count();
            
            // Livraisons terminées
            $completedDeliveries = DB::table('livraisons')
                ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                ->where('annonces.user_id', $userId)
                ->where('livraisons.status', 'delivered')
                ->count();
            
            // Récupérer les dernières livraisons
            $recentDeliveries = DB::table('livraisons')
                ->join('annonces', 'livraisons.annonce_id', '=', 'annonces.id')
                ->where('annonces.user_id', $userId)
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
                
            return [
                'active' => $activeDeliveries,
                'completed' => $completedDeliveries,
                'recent' => $recentDeliveries
            ];
        } catch (\Exception $e) {
            Log::error('Erreur dans DashboardService::getLivraisonStats: ' . $e->getMessage());
            return [
                'active' => 0,
                'completed' => 0,
                'recent' => []
            ];
        }
    }
    
    /**
     * Récupère les informations d'abonnement d'un utilisateur
     *
     * @param User $user L'utilisateur
     * @return array|null Informations d'abonnement
     */
    private function getSubscriptionInfo(User $user)
    {
        try {
            // Vérifier si l'utilisateur a un abonnement
            if (!DB::getSchemaBuilder()->hasColumn('users', 'subscription_id') || !$user->subscription_id) {
                return null;
            }
            
            // Récupérer les informations de base de l'abonnement
            $abonnement = DB::table('abonnements')
                ->where('id', $user->subscription_id)
                ->first();
            
            if (!$abonnement) {
                return null;
            }
            
            $subscriptionInfo = [
                'name' => $abonnement->name ?? 'Abonnement'
            ];
            
            // Vérifier si la table pivot existe
            if (DB::getSchemaBuilder()->hasTable('abonnement_user')) {
                $pivotData = DB::table('abonnement_user')
                    ->where('user_id', $user->id)
                    ->where('abonnement_id', $user->subscription_id)
                    ->first();
                    
                if ($pivotData && isset($pivotData->expires_at)) {
                    $subscriptionInfo['expires_at'] = $pivotData->expires_at;
                }
            }
            
            return $subscriptionInfo;
        } catch (\Exception $e) {
            Log::error('Erreur dans DashboardService::getSubscriptionInfo: ' . $e->getMessage());
            return null;
        }
    }
}
