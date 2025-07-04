<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds to create admin user.
     */
    public function run(): void
    {
        // Check if admin user already exists
        if (!User::where('email', 'esgiadmin@ecodeli.com')->exists()) {
            User::create([
                'name' => 'Admin EcoDeli',
                'email' => 'esgiadmin@ecodeli.com',
                'password' => Hash::make('Sananes69'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Admin user has been created successfully.');
        } else {
            $this->command->info('Admin user already exists, no changes made.');
        }
    }
}
