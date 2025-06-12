<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivraisonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'annonce_id' => $this->annonce_id,
            'annonce' => $this->whenLoaded('annonce', function() {
                return new AnnonceResource($this->annonce);
            }),
            'livreur_id' => $this->livreur_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'tracking_code' => $this->tracking_code,
            'delivery_date' => $this->delivery_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
