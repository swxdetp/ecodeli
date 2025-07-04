<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryReview extends Model
{
    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'livraison_id',
        'livreur_id',
        'client_id',
        'rating',
        'comment',
        'nfc_session_id',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
    ];

    /**
     * Récupère le livreur associé à l'avis.
     */
    public function livreur()
    {
        return $this->belongsTo(User::class, 'livreur_id');
    }

    /**
     * Récupère le client qui a laissé l'avis.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Récupère la livraison associée à l'avis.
     */
    public function livraison()
    {
        return $this->belongsTo(Livraison::class);
    }
}
