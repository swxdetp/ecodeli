<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Annonce;
use Illuminate\Support\Facades\DB;

// Vérifier les annonces disponibles
$activeAnnonces = Annonce::whereNull('livreur_id')
    ->where('status', 'active')
    ->get();

echo "Annonces actives et non attribuées: " . count($activeAnnonces) . "\n";

// Afficher toutes les annonces
$allAnnonces = Annonce::all();
echo "Total annonces en base: " . count($allAnnonces) . "\n";

// Si pas d'annonces actives et non attribuées, en créer une
if (count($activeAnnonces) == 0) {
    echo "Création d'une annonce de test...\n";
    
    try {
        DB::beginTransaction();
        
        // Créer une annonce de test
        $annonce = new Annonce();
        $annonce->user_id = 1; // Supposons que l'utilisateur 1 existe
        $annonce->livreur_id = null;
        $annonce->title = "Test livraison #1";
        $annonce->description = "Livraison de test numéro 1 pour les livreurs";
        $annonce->type = "express";
        $annonce->status = "active";
        $annonce->price = "49.00";
        $annonce->address_from = "242 Rue du Faubourg Saint-Antoine, 75012 Paris";
        $annonce->address_to = "123 Avenue des Tests 1, Paris";
        $annonce->date_from = "2025-07-01T00:00:00.000000Z";
        $annonce->date_to = "2025-07-01T00:00:00.000000Z";
        $annonce->weight = null;
        $annonce->save();
        
        DB::commit();
        
        echo "Annonce créée avec succès! ID: " . $annonce->id . "\n";
    } catch (\Exception $e) {
        DB::rollback();
        echo "Erreur lors de la création de l'annonce: " . $e->getMessage() . "\n";
    }
}

echo "Vérification finale des annonces disponibles...\n";
$activeAnnonces = Annonce::whereNull('livreur_id')
    ->where('status', 'active')
    ->get();
echo "Annonces actives et non attribuées après script: " . count($activeAnnonces) . "\n";

foreach ($activeAnnonces as $annonce) {
    echo "ID: " . $annonce->id . ", Titre: " . $annonce->title . ", Status: " . $annonce->status . "\n";
}
