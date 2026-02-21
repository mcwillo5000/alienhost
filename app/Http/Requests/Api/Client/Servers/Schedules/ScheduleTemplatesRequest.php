<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Schedules;

use Pterodactyl\Models\Permission;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class ScheduleTemplatesRequest extends ClientApiRequest
{
    /**
     * Define the permission required to perform this request.
     *
     * @return string
     */
    public function permission()
    {
        return Permission::ACTION_SCHEDULE_CREATE;
    }
}