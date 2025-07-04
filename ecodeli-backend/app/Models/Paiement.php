<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'payable_id',
        'payable_type',
        'amount',
        'status', // pending, completed, failed, refunded
        'payment_method', // stripe, paypal, etc.
        'payment_id', // external payment ID
        'transaction_date',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    /**
     * Get the user that owns the paiement.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payable model (livraison or prestation).
     */
    public function payable()
    {
        return $this->morphTo();
    }

    /**
     * Get the facture for the paiement.
     */
    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}
