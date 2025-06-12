<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    




    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'lang',
        'profile_photo',
        'subscription_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Get the annonces for the user (client or commercant).
     */
    public function annonces()
    {
        return $this->hasMany(Annonce::class);
    }
    
    /**
     * Get the livraisons for the user (livreur).
     */
    public function livraisons()
    {
        return $this->hasMany(Livraison::class, 'livreur_id');
    }
    
    /**
     * Get the prestations for the user (prestataire).
     */
    public function prestations()
    {
        return $this->hasMany(Prestation::class, 'prestataire_id');
    }
    
    /**
     * Get the favoris for the user (client).
     */
    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }
    
    /**
     * Get the boxes for the user (client).
     */
    public function boxes()
    {
        return $this->hasMany(Box::class);
    }
    
    /**
     * Get the disponibilites for the user (livreur or prestataire).
     */
    public function disponibilites()
    {
        return $this->hasMany(Disponibilite::class);
    }
    
    /**
     * Get the factures for the user.
     */
    public function factures()
    {
        return $this->hasMany(Facture::class);
    }
    
    /**
     * Get the paiements for the user.
     */
    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
    
    /**
     * Get the contrat for the user (commercant).
     */
    public function contrat()
    {
        return $this->hasOne(Contrat::class);
    }
    
    /**
     * Get the abonnement for the user (client).
     */
    public function abonnement()
    {
        return $this->belongsTo(Abonnement::class, 'subscription_id');
    }
    
    /**
     * Get the notifications for the user.
     */
    public function userNotifications()
    {
        return $this->hasMany(Notification::class);
    }
}
