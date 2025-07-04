<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class TestLogin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:login {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test authentication pour un utilisateur';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $this->info("Tentative de connexion pour: $email");

        // Vérifier si l'utilisateur existe
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("Utilisateur non trouvé pour l'email: $email");
            return 1;
        }

        $this->info("Utilisateur trouvé: ID={$user->id}, Nom={$user->name}");

        // Vérifier le mot de passe
        if (!Hash::check($password, $user->password)) {
            $this->error("Mot de passe invalide pour: $email");
            return 1;
        }

        $this->info("Authentification réussie pour: $email");
        
        // Créer un token
        $token = $user->createToken('test-cli')->plainTextToken;
        
        $this->info("Token généré: $token");
        
        return 0;
    }
}
