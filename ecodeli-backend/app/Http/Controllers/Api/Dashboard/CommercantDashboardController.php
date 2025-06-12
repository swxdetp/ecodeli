<?php

namespace App\Http\Controllers\Api\Dashboard;

use Illuminate\Http\Request;

class CommercantDashboardController extends AbstractDashboardController
{
    /**
     * Affiche les données du tableau de bord du commerçant
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return $this->getDashboardStats($request, 'commercant');
    }
}
