<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Files;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class GitRequest extends ClientApiRequest
{
    /**
     * Check that the user making this request to the API is authorized to list all
     * the files that exist for a given server.
     */
    public function permission(): string
    {
        return 'file.git';
    }
}
