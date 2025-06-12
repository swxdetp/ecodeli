<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display dashboard data for livreur.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Données du tableau de bord récupérées avec succès',
            'data' => []
        ]);
    }
}
