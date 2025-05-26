<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth;
use App\Http\Controllers\Api\Client;
use App\Http\Controllers\Api\Livreur;
use App\Http\Controllers\Api\Prestataire;
use App\Http\Controllers\Api\Commercant;
use App\Http\Controllers\Api\Admin;

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

// Routes d'authentification
Route::post('register', [Auth\AuthController::class, 'register']);
Route::post('login', [Auth\AuthController::class, 'login']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
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
    Route::prefix('client')->middleware('role:client')->group(function () {
        Route::get('dashboard', [Client\DashboardController::class, 'index']);
        Route::apiResource('annonces', Client\AnnonceController::class);
        Route::apiResource('commandes', Client\CommandeController::class);
        Route::apiResource('favoris', Client\FavorisController::class);
        Route::apiResource('boxes', Client\BoxController::class);
        Route::get('profil', [Client\ProfilController::class, 'show']);
        Route::put('profil', [Client\ProfilController::class, 'update']);
    });
    
    // Routes pour les livreurs
    Route::prefix('livreur')->middleware('role:livreur')->group(function () {
        Route::get('dashboard', [Livreur\DashboardController::class, 'index']);
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
    Route::prefix('prestataire')->middleware('role:prestataire')->group(function () {
        Route::get('dashboard', [Prestataire\DashboardController::class, 'index']);
        Route::apiResource('prestations', Prestataire\PrestationController::class);
        Route::apiResource('factures', Prestataire\FactureController::class)->except(['update', 'destroy']);
        Route::get('factures/{facture}/download', [Prestataire\FactureController::class, 'download']);
        Route::post('factures/generate-monthly', [Prestataire\FactureController::class, 'generateMonthly']);
        Route::apiResource('disponibilites', Prestataire\DisponibiliteController::class);
        Route::get('profil', [Prestataire\ProfilController::class, 'show']);
        Route::put('profil', [Prestataire\ProfilController::class, 'update']);
    });
    
    // Routes pour les commerçants
    Route::prefix('commercant')->middleware('role:commercant')->group(function () {
        Route::get('dashboard', [Commercant\DashboardController::class, 'index']);
        Route::apiResource('annonces', Commercant\AnnonceController::class);
        Route::get('annonces/statistics', [Commercant\AnnonceController::class, 'statistics']);
        Route::apiResource('factures', Commercant\FactureController::class)->only(['index', 'show']);
        Route::get('factures/{facture}/download', [Commercant\FactureController::class, 'download']);
        Route::post('factures/{facture}/pay', [Commercant\FactureController::class, 'pay']);
        Route::get('factures/summary', [Commercant\FactureController::class, 'summary']);
        Route::apiResource('contrats', Commercant\ContratController::class);
    });
    
    // Routes pour les administrateurs
    Route::prefix('admin')->middleware('role:admin')->group(function () {
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
