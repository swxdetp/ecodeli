<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'livreur_id',
        'title',
        'description',
        'type', // livraison, service, etc.
        'status', // active, completed, canceled
        'price',
        'address_from',
        'address_to',
        'date_from',
        'date_to',
        'weight',
        'dimensions',
        'is_fragile',
        'is_urgent',
        'photos',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'date_from' => 'datetime',
        'date_to' => 'datetime',
        'is_fragile' => 'boolean',
        'is_urgent' => 'boolean',
        'photos' => 'array',
    ];
    
    /**
     * Get the default departure address
     */
    public function getAddressFromAttribute($value)
    {
        return $value ?: "ESGI, 242 Rue du Faubourg Saint-Antoine, 75012 Paris";
    }

    /**
     * Get the user that owns the annonce.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the livreur assigned to the annonce.
     */
    public function livreur()
    {
        return $this->belongsTo(User::class, 'livreur_id');
    }

    /**
     * Get the livraisons for the annonce.
     */
    public function livraisons()
    {
        return $this->hasMany(Livraison::class);
    }

    /**
     * Get the prestations for the annonce.
     */
    public function prestations()
    {
        return $this->hasMany(Prestation::class);
    }

    /**
     * Get the favoris for the annonce.
     */
    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }
}
