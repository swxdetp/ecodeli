<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnonceResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'price' => $this->price,
            'address_from' => $this->address_from,
            'address_to' => $this->address_to,
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'weight' => $this->weight,
            'dimensions' => $this->dimensions,
            'is_fragile' => $this->is_fragile,
            'is_urgent' => $this->is_urgent,
            'photos' => $this->photos,
            'status' => $this->status,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
