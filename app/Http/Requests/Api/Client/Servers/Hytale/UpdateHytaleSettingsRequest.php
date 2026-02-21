<?php
namespace Pterodactyl\Http\Requests\Api\Client\Servers\Hytale;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
class UpdateHytaleSettingsRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'file.update';
    }
    public function rules(): array
    {
        return [
            'serverName' => 'sometimes|string|max:255',
            'motd' => 'sometimes|nullable|string|max:500',
            'serverPassword' => 'sometimes|nullable|string|max:255',
            'maxPlayers' => 'sometimes|integer|min:1|max:1000',
            'gamemode' => 'sometimes|string|in:Adventure,Creative,Spectator',
            'worldName' => 'sometimes|string|max:255',
            'viewDistanceRadius' => 'sometimes|integer|min:3|max:32',
        ];
    }
}
