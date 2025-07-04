<?php

use Illuminate\Support\Facades\Route;

// Route d'accueil simple sans Inertia (API-only)
Route::get('/', function () {
    return response()->json(['message' => 'API EcoDeli fonctionne correctement', 'status' => 'ok']);
});
