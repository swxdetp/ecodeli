<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('jour')->nullable(); // lundi, mardi, etc.
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->boolean('recurrent')->default(true);
            $table->date('date_specifique')->nullable();
            $table->json('zone_geographique')->nullable();
            $table->string('status')->default('available'); // available, unavailable, busy
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disponibilites');
    }
};
