<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Annonce;
use Illuminate\Support\Facades\DB;

echo "=== DIAGNOSTIC ANNONCES LIVREUR ===\n\n";

// 1. Vérifier la structure de la table annonces
echo "STRUCTURE DE LA TABLE ANNONCES:\n";
$columns = DB::getSchemaBuilder()->getColumnListing('annonces');
print_r($columns);
echo "\n\n";

// 2. Compter les annonces sans livreur_id et actives
$count = Annonce::whereNull('livreur_id')->where('status', 'active')->count();
echo "NOMBRE D'ANNONCES ACTIVES SANS LIVREUR: $count\n\n";

// 3. Récupérer ces annonces de manière brute
echo "ANNONCES ACTIVES SANS LIVREUR (RAW SQL):\n";
$rawAnnonces = DB::select("SELECT id, title, status, livreur_id FROM annonces WHERE livreur_id IS NULL AND status = 'active'");
print_r($rawAnnonces);
echo "\n\n";

// 4. Récupérer via Eloquent avec requête SQL en log
echo "ANNONCES ACTIVES SANS LIVREUR (ELOQUENT):\n";
DB::enableQueryLog();
$eloquentAnnonces = Annonce::whereNull('livreur_id')
    ->where('status', 'active')
    ->get(['id', 'title', 'status', 'livreur_id']);

$queryLog = DB::getQueryLog();
echo "REQUÊTE SQL EXÉCUTÉE:\n";
print_r(end($queryLog));
echo "\n\n";

echo "RÉSULTAT ELOQUENT:\n";
print_r($eloquentAnnonces->toArray());
echo "\n\n";

// 5. Essayer via le contrôleur directement
echo "TEST DU CONTRÔLEUR ANNONCE:\n";
$controller = new App\Http\Controllers\Api\Livreur\AnnonceController();
$request = new Illuminate\Http\Request();
$response = $controller->index($request);

echo "STRUCTURE DE LA RÉPONSE DU CONTRÔLEUR:\n";
print_r($response->getData());
echo "\n\n";

echo "CONTENU JSON DE LA RÉPONSE:\n";
echo json_encode($response->getData(), JSON_PRETTY_PRINT);
echo "\n\n";

echo "FIN DU DIAGNOSTIC\n";
