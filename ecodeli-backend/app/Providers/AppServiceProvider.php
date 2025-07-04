<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Inertia ServiceProvider supprimé car nous utilisons uniquement une API REST
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
