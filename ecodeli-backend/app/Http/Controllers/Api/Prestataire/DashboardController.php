<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display dashboard data for prestataire.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Données du tableau de bord prestataire récupérées avec succès',
            'data' => []
        ]);
    }
}
