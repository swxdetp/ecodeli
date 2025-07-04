<?php

namespace App\Http\Controllers\Api\Dashboard;

use Illuminate\Http\Request;

class AdminDashboardController extends AbstractDashboardController
{
    /**
     * Affiche les données du tableau de bord de l'administrateur
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return $this->getDashboardStats($request, 'admin');
    }
}
