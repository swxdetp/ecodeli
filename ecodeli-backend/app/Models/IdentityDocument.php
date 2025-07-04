<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentityDocument extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'document_type',
        'document_number',
        'file_path',
        'status',
        'rejection_reason',
        'verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'verified_at' => 'datetime',
    ];

    /**
     * Get the user that owns the identity document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
