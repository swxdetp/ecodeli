<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
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
        'type',
        'date_debut',
        'date_fin',
        'montant_mensuel',
        'status',
        'conditions',
        'document_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'montant_mensuel' => 'decimal:2',
        'conditions' => 'array',
    ];

    /**
     * Get the user that owns the contrat.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
