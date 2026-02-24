<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Files;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class FolderSizeRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'file.read';
    }
}
