<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Annonce;
use App\Models\User;

class TestAnnoncesSeeder extends Seeder
{
    /**
     * Seed test annonces for livreur testing.
     */
    public function run(): void
    {
        // Vérifier s'il y a au moins un utilisateur client pour créer des annonces
        $clientUser = User::where('role', 'client')->first();

        if (!$clientUser) {
            // Si aucun client n'existe, en créer un
            $clientUser = User::create([
                'name' => 'Client Test',
                'email' => 'client@test.com',
                'password' => bcrypt('password'),
                'role' => 'client'
            ]);
        }

        // Créer 5 annonces disponibles pour les livreurs
        for ($i = 1; $i <= 5; $i++) {
            Annonce::create([
                'user_id' => $clientUser->id,
                'title' => "Test livraison #$i",
                'description' => "Livraison de test numéro $i pour les livreurs",
                'address_from' => '242 Rue du Faubourg Saint-Antoine, 75012 Paris',
                'address_to' => "123 Avenue des Tests $i, Paris",
                'price' => rand(10, 50),
                'type' => ['standard', 'express', 'fragile'][rand(0, 2)],
                'status' => 'active',
                'date_from' => now()->addDays(rand(1, 5))->format('Y-m-d'),
                'date_to' => now()->addDays(rand(6, 10))->format('Y-m-d'),
                'livreur_id' => null,
            ]);
        }

        $this->command->info('5 annonces test ont été créées avec succès!');
    }
}
