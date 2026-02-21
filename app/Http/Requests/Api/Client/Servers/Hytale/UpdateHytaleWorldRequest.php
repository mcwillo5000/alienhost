<?php
namespace Pterodactyl\Http\Requests\Api\Client\Servers\Hytale;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
class UpdateHytaleWorldRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'file.update';
    }
    public function rules(): array
    {
        return [
            'IsPvpEnabled' => 'sometimes|boolean',
            'IsFallDamageEnabled' => 'sometimes|boolean',
            'GameTime' => 'sometimes|string',
            'IsGameTimePaused' => 'sometimes|boolean',
            'ItemsLossMode' => 'sometimes|string|in:None,All,Configured',
            'ItemsAmountLossPercentage' => 'sometimes|integer|min:0|max:100',
            'ItemsDurabilityLossPercentage' => 'sometimes|integer|min:0|max:100',
            'DaytimeDurationSeconds' => 'sometimes|integer|min:1',
            'NighttimeDurationSeconds' => 'sometimes|integer|min:1',
            'IsTicking' => 'sometimes|boolean',
            'IsSpawningNPC' => 'sometimes|boolean',
            'IsSpawnMarkersEnabled' => 'sometimes|boolean',
            'IsBlockTicking' => 'sometimes|boolean',
            'IsAllNPCFrozen' => 'sometimes|boolean',
            'PregenerateRadius' => 'sometimes|integer|min:0',
        ];
    }
}
