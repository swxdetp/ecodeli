<?php

namespace App\Http\Controllers\Api\Dashboard;

use Illuminate\Http\Request;

class PrestataireDashboardController extends AbstractDashboardController
{
    /**
     * Affiche les données du tableau de bord du prestataire
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return $this->getDashboardStats($request, 'prestataire');
    }
}
