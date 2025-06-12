<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

abstract class AbstractDashboardController extends Controller
{
    use ApiResponder;

    /**
     * Le service de tableau de bord
     *
     * @var DashboardService
     */
    protected $dashboardService;

    /**
     * Constructeur avec injection du service
     *
     * @param DashboardService $dashboardService
     */
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Affiche les données du tableau de bord pour l'utilisateur connecté
     *
     * @param Request $request
     * @param string $requiredRole Rôle requis pour accéder à ce dashboard
     * @return \Illuminate\Http\JsonResponse
     */
    protected function getDashboardStats(Request $request, string $requiredRole)
    {
        try {
            $user = Auth::user();
            
            // Vérification complémentaire que l'utilisateur a le rôle requis
            if ($user->role !== $requiredRole) {
                return $this->errorResponse(
                    "Vous n'avez pas les permissions nécessaires pour accéder à ce tableau de bord.",
                    403
                );
            }
            
            // Récupération des statistiques via le service
            $stats = $this->dashboardService->getStatsByRole($user, $requiredRole);
            
            return $this->successResponse(
                $stats,
                'Données du tableau de bord récupérées avec succès'
            );
        } catch (\Exception $e) {
            Log::error('Erreur dans AbstractDashboardController::getDashboardStats: ' . $e->getMessage());
            return $this->errorResponse(
                'Une erreur est survenue lors de la récupération des données du tableau de bord.',
                500
            );
        }
    }
}
