<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'favoris';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'annonce_id',
    ];

    /**
     * Get the user that owns the favori.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the annonce that is favorited.
     */
    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
