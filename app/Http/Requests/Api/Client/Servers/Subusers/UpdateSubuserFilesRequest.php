<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Subusers;

class UpdateSubuserFilesRequest extends SubuserRequest
{
    public function rules(): array
    {
        return [
            'denyfiles' => 'required|array',
            'hidefiles' => 'required|bool',
        ];
    }
}
