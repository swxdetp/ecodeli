<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'jour',
        'heure_debut',
        'heure_fin',
        'recurrent',
        'date_specifique',
        'zone_geographique',
        'status', // available, unavailable, busy
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'heure_debut' => 'datetime',
        'heure_fin' => 'datetime',
        'recurrent' => 'boolean',
        'date_specifique' => 'date',
        'zone_geographique' => 'array',
    ];

    /**
     * Get the user that owns the disponibilite.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
