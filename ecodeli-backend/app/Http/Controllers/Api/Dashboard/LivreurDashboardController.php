<?php

namespace App\Http\Controllers\Api\Dashboard;

use Illuminate\Http\Request;

class LivreurDashboardController extends AbstractDashboardController
{
    /**
     * Affiche les données du tableau de bord du livreur
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return $this->getDashboardStats($request, 'livreur');
    }
}
