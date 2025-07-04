<?php

namespace App\Http\Controllers\Api\Commercant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display dashboard data for commerçant.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Données du tableau de bord commerçant récupérées avec succès',
            'data' => []
        ]);
    }
}
