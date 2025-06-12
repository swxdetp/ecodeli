<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth;
use App\Http\Controllers\Api\Client;
use App\Http\Controllers\Api\Livreur;
use App\Http\Controllers\Api\Prestataire;
use App\Http\Controllers\Api\Commercant;
use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\Client\AnnonceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques
Route::get('traductions', function (Request $request) {
    $lang = $request->query('lang', 'fr');
    $translations = json_decode(file_get_contents(resource_path("lang/{$lang}.json")), true);
    
    return response()->json([
        'success' => true,
        'message' => 'Traductions récupérées avec succès',
        'data' => $translations
    ]);
});

// Route de test pour déboguer le problème de routage API
Route::get('test', function () {
    return response()->json([
        'message' => 'La route API de test fonctionne correctement',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Routes d'authentification
Route::post('register', [Auth\AuthController::class, 'register']);
Route::post('auth/register', [Auth\AuthController::class, 'register']);
Route::post('login', [Auth\AuthController::class, 'login']);

// Routes protégées par authentification
Route::middleware(['auth:sanctum'])->group(function () {

    // Route spécifique pour les annonces client
    Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
        Route::get('/client/annonces', [AnnonceController::class, 'index']);
    });

    // Route commune pour récupérer le profil utilisateur
    Route::get('user', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Profil utilisateur récupéré avec succès',
            'data' => $request->user()
        ]);
    });
    
    Route::post('logout', [Auth\AuthController::class, 'logout']);
    
    // Routes pour les clients
    Route::prefix('client')->middleware(['role:client'])->group(function () {
        // Nouvelles routes dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [Client\DashboardController::class, 'index']);
            Route::get('/stats', [Client\DashboardController::class, 'getStatistics']);
            Route::get('/recent-activities', [Client\DashboardController::class, 'getRecentActivities']);
            Route::get('/profile-completion', [Client\DashboardController::class, 'getProfileCompletion']);
            Route::get('/notifications', [Client\DashboardController::class, 'getNotifications']);
        });
        Route::apiResource('annonces', Client\AnnonceController::class);
        Route::apiResource('commandes', Client\CommandeController::class);
        Route::apiResource('favoris', Client\FavorisController::class);
        Route::apiResource('boxes', Client\BoxController::class);
        Route::get('profil', [Client\ProfilController::class, 'show']);
        Route::put('profil', [Client\ProfilController::class, 'update']);
    });
    
    // Routes pour les livreurs
    Route::prefix('livreur')->middleware(['role:livreur'])->group(function () {
        // Nouvelles routes dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [Livreur\DashboardController::class, 'index']);
            Route::get('/stats', [Livreur\DashboardController::class, 'getStatistics']);
            Route::get('/recent-activities', [Livreur\DashboardController::class, 'getRecentActivities']);
            Route::get('/profile-completion', [Livreur\DashboardController::class, 'getProfileCompletion']);
            Route::get('/notifications', [Livreur\DashboardController::class, 'getNotifications']);
            Route::get('/earnings', [Livreur\DashboardController::class, 'getEarnings']);
        });
        Route::apiResource('livraisons', Livreur\LivraisonController::class);
        Route::apiResource('disponibilites', Livreur\DisponibiliteController::class);
        Route::get('paiements', [Livreur\PaiementController::class, 'index']);
        Route::get('paiements/{paiement}', [Livreur\PaiementController::class, 'show']);
        Route::get('paiements/summary', [Livreur\PaiementController::class, 'summary']);
        Route::post('paiements/request', [Livreur\PaiementController::class, 'requestPayment']);
        Route::get('profil', [Livreur\ProfilController::class, 'show']);
        Route::put('profil', [Livreur\ProfilController::class, 'update']);
    });
    
    // Routes pour les prestataires
    Route::prefix('prestataire')->middleware(['role:prestataire'])->group(function () {
        // Nouvelles routes dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [Prestataire\DashboardController::class, 'index']);
            Route::get('/stats', [Prestataire\DashboardController::class, 'getStatistics']);
            Route::get('/recent-activities', [Prestataire\DashboardController::class, 'getRecentActivities']);
            Route::get('/profile-completion', [Prestataire\DashboardController::class, 'getProfileCompletion']);
            Route::get('/notifications', [Prestataire\DashboardController::class, 'getNotifications']);
            Route::get('/revenue', [Prestataire\DashboardController::class, 'getRevenue']);
        });
        Route::apiResource('prestations', Prestataire\PrestationController::class);
        Route::apiResource('factures', Prestataire\FactureController::class)->except(['update', 'destroy']);
        Route::get('factures/{facture}/download', [Prestataire\FactureController::class, 'download']);
        Route::post('factures/generate-monthly', [Prestataire\FactureController::class, 'generateMonthly']);
        Route::apiResource('disponibilites', Prestataire\DisponibiliteController::class);
        Route::get('profil', [Prestataire\ProfilController::class, 'show']);
        Route::put('profil', [Prestataire\ProfilController::class, 'update']);
    });
    
    // Routes pour les commerçants
    Route::prefix('commercant')->middleware(['role:commercant'])->group(function () {
        // Nouvelles routes dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [Commercant\DashboardController::class, 'index']);
            Route::get('/stats', [Commercant\DashboardController::class, 'getStatistics']);
            Route::get('/recent-activities', [Commercant\DashboardController::class, 'getRecentActivities']);
            Route::get('/profile-completion', [Commercant\DashboardController::class, 'getProfileCompletion']);
            Route::get('/notifications', [Commercant\DashboardController::class, 'getNotifications']);
            Route::get('/sales', [Commercant\DashboardController::class, 'getSales']);
        });
        Route::apiResource('annonces', Commercant\AnnonceController::class);
        Route::get('annonces/statistics', [Commercant\AnnonceController::class, 'statistics']);
        Route::apiResource('factures', Commercant\FactureController::class)->only(['index', 'show']);
        Route::get('factures/{facture}/download', [Commercant\FactureController::class, 'download']);
        Route::post('factures/{facture}/pay', [Commercant\FactureController::class, 'pay']);
        Route::get('factures/summary', [Commercant\FactureController::class, 'summary']);
        Route::apiResource('contrats', Commercant\ContratController::class);
    });
    
    // Routes pour les administrateurs
    Route::prefix('admin')->middleware(['role:admin'])->group(function () {
        // Nouvelles routes dashboard
        // Routes de dashboard temporairement commentées - contrôleur manquant
        // Route::prefix('dashboard')->group(function () {
        //     Route::get('/', [Admin\DashboardController::class, 'index']);
        //     Route::get('/stats', [Admin\DashboardController::class, 'getStatistics']);
        //     Route::get('/recent-activities', [Admin\DashboardController::class, 'getRecentActivities']);
        //     Route::get('/system-health', [Admin\DashboardController::class, 'getSystemHealth']);
        //     Route::get('/notifications', [Admin\DashboardController::class, 'getNotifications']);
        // });
        Route::apiResource('users', Admin\UserController::class);
        Route::get('users/statistics', [Admin\UserController::class, 'statistics']);
        
        Route::apiResource('annonces', Admin\AnnonceController::class);
        Route::get('annonces/statistics', [Admin\AnnonceController::class, 'statistics']);
        
        Route::apiResource('livraisons', Admin\LivraisonController::class);
        
        Route::apiResource('prestations', Admin\PrestationController::class);
        
        Route::apiResource('paiements', Admin\PaiementController::class)->except(['store', 'destroy']);
        Route::post('paiements/{paiement}/process', [Admin\PaiementController::class, 'process']);
        Route::get('paiements/statistics', [Admin\PaiementController::class, 'statistics']);
        Route::get('paiements/export', [Admin\PaiementController::class, 'export']);
        
        Route::apiResource('factures', Admin\FactureController::class)->except(['store', 'destroy']);
        Route::get('factures/export', [Admin\FactureController::class, 'export']);
        
        Route::apiResource('abonnements', Admin\AbonnementController::class);
    });
});
