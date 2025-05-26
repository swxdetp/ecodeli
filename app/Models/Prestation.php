<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prestation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'annonce_id',
        'prestataire_id',
        'type', // service type
        'status', // pending, accepted, in_progress, completed, canceled
        'start_date',
        'end_date',
        'price',
        'notes',
        'rating',
        'review',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
    ];

    /**
     * Get the annonce that owns the prestation.
     */
    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    /**
     * Get the prestataire that owns the prestation.
     */
    public function prestataire()
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    /**
     * Get the paiements for the prestation.
     */
    public function paiements()
    {
        return $this->morphMany(Paiement::class, 'payable');
    }

    /**
     * Get the facture for the prestation.
     */
    public function facture()
    {
        return $this->morphOne(Facture::class, 'facturable');
    }
}
