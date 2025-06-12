<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'facturable_id',
        'facturable_type',
        'paiement_id',
        'numero',
        'montant_ht',
        'tva',
        'montant_ttc',
        'date_emission',
        'date_echeance',
        'status', // paid, pending, canceled
        'pdf_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'montant_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'date_emission' => 'datetime',
        'date_echeance' => 'datetime',
    ];

    /**
     * Get the user that owns the facture.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the facturable model (livraison or prestation).
     */
    public function facturable()
    {
        return $this->morphTo();
    }

    /**
     * Get the paiement associated with the facture.
     */
    public function paiement()
    {
        return $this->belongsTo(Paiement::class);
    }
}
