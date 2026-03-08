<?php

namespace Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Requests;

use Pterodactyl\Models\Permission;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class DatabaseExportRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_DATABASE_VIEW_PASSWORD;
    }
}
