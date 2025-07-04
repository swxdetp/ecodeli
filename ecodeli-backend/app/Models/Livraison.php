<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'annonce_id',
        'livreur_id',
        'status', // pending, accepted, in_progress, delivered, canceled
        'start_date',
        'delivery_date',
        'tracking_code',
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
        'delivery_date' => 'datetime',
        'rating' => 'decimal:1',
    ];

    /**
     * Get the annonce that owns the livraison.
     */
    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    /**
     * Get the livreur that owns the livraison.
     */
    public function livreur()
    {
        return $this->belongsTo(User::class, 'livreur_id');
    }

    /**
     * Get the paiements for the livraison.
     */
    public function paiements()
    {
        return $this->morphMany(Paiement::class, 'payable');
    }

    /**
     * Get the facture for the livraison.
     */
    public function facture()
    {
        return $this->morphOne(Facture::class, 'facturable');
    }
}
