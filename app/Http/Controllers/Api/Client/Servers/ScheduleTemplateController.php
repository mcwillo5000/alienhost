<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\VeltaStudios\ScheduleTemplate;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\ScheduleTemplatesRequest;
use Illuminate\Http\JsonResponse;

class ScheduleTemplateController extends ClientApiController
{
    /**
     * Retrieve all schedule templates.
     *
     * @param \Pterodactyl\Http\Requests\Api\Client\Servers\GetScheduleTemplatesRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(ScheduleTemplatesRequest $request): JsonResponse
    {
        $templates = ScheduleTemplate::with('tasks')->get();
        return new JsonResponse($templates);
    }
}