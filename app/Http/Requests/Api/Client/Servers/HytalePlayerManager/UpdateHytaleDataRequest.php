<?php
namespace Pterodactyl\Http\Requests\Api\Client\Servers\HytalePlayerManager;
use Pterodactyl\Models\Permission;
use Pterodactyl\Contracts\Http\ClientPermissionsRequest;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
class UpdateHytaleDataRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_UPDATE;
    }
    public function rules(): array
    {
        return [];
    }
}
