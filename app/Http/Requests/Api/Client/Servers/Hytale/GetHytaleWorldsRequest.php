<?php
namespace Pterodactyl\Http\Requests\Api\Client\Servers\Hytale;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
class GetHytaleWorldsRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'file.read';
    }
}
