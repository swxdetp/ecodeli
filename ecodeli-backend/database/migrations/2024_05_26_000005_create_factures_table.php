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
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('facturable');
            $table->foreignId('paiement_id')->nullable()->constrained()->nullOnDelete();
            $table->string('numero')->unique();
            $table->decimal('montant_ht', 10, 2);
            $table->decimal('tva', 5, 2);
            $table->decimal('montant_ttc', 10, 2);
            $table->dateTime('date_emission');
            $table->dateTime('date_echeance');
            $table->string('status')->default('pending'); // paid, pending, canceled
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
