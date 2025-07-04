<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrestationResource extends JsonResource
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
            'prestataire_id' => $this->prestataire_id,
            'type' => $this->type,
            'price' => $this->price,
            'status' => $this->status,
            'notes' => $this->notes,
            'end_date' => $this->end_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
