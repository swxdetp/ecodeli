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
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('type'); // livraison, service, etc.
            $table->string('status')->default('active'); // active, completed, canceled
            $table->decimal('price', 10, 2);
            $table->string('address_from')->nullable();
            $table->string('address_to')->nullable();
            $table->dateTime('date_from');
            $table->dateTime('date_to');
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('dimensions')->nullable();
            $table->boolean('is_fragile')->default(false);
            $table->boolean('is_urgent')->default(false);
            $table->json('photos')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
