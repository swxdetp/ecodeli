<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route pour les listings utilisateur - sans middleware ici (défini dans le RouteServiceProvider)
Route::get('user/listings', function () {
    return response()->json([
        'message' => 'OK',
        'listings' => []
    ]);
});
