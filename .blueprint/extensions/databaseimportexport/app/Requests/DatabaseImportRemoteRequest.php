<?php

namespace Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Requests;

use Pterodactyl\Models\Permission;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class DatabaseImportRemoteRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_DATABASE_VIEW_PASSWORD;
    }

    public function rules(): array
    {
        return [
            'wipe' => 'required|boolean',
            'host' => 'required|string',
            'port' => 'required|integer|between:1,65535',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
        ];
    }
}
