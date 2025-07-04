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
        Schema::create('identity_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('document_type')->comment('Type de document: carte d\'identité, passeport, etc.');
            $table->string('document_number')->nullable(); // Numéro du document si applicable
            $table->string('file_path'); // Chemin vers le fichier stocké
            $table->string('status')->default('pending')->comment('pending, approved, rejected'); // Statut de vérification
            $table->text('rejection_reason')->nullable(); // Raison du rejet si applicable
            $table->timestamp('verified_at')->nullable(); // Date de vérification
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identity_documents');
    }
};
