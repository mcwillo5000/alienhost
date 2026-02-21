<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Models\Permission;
use Pterodactyl\Services\Minecraft\MinecraftSoftwareService;

class MinecraftSoftwareController extends ClientApiController
{
    /**
     * MinecraftSoftwareController constructor.
     */
    public function __construct(private MinecraftSoftwareService $minecraftSoftwareService)
    {
        parent::__construct();
    }

    /**
     * Returns current server software information.
     */
    public function index(Request $request, Server $server): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }

        return $this->minecraftSoftwareService->setServer($server)->getServerBuildInformation();
    }
}
