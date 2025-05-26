<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Box extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'reference',
        'taille',
        'adresse',
        'code_acces',
        'date_debut',
        'date_fin',
        'status', // active, inactive, reserved
        'prix_mensuel',
        'contenu',
        'photos',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'prix_mensuel' => 'decimal:2',
        'contenu' => 'array',
        'photos' => 'array',
    ];

    /**
     * Get the user that owns the box.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
