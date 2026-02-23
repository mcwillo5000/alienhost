<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Files;

use Pterodactyl\Models\Server;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class RestoreFilesRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'file.delete';
    }

    public function rules(): array
    {
        return [
            'files' => 'required|array',
            'files.*' => 'required|integer',
        ];
    }
}
