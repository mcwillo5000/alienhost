<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Services\Servers\HytaleWorldService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Hytale\GetHytaleWorldsRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Hytale\UpdateHytaleWorldRequest;
class HytaleWorldsController extends ClientApiController
{
    public function __construct(
        private HytaleWorldService $hytaleWorldService
    ) {
        parent::__construct();
    }
    /**
     * Get list of worlds.
     */
    public function index(GetHytaleWorldsRequest $request, Server $server): JsonResponse
    {
        try {
            $worlds = $this->hytaleWorldService->getWorldsList($server);
            return new JsonResponse([
                'object' => 'list',
                'data' => $worlds,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to load worlds: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Get world configuration.
     */
    public function show(GetHytaleWorldsRequest $request, Server $server, string $world): JsonResponse
    {
        try {
            $config = $this->hytaleWorldService->getWorldConfig($server, $world);
            return new JsonResponse([
                'object' => 'world_config',
                'attributes' => $config,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to load world config: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Update world configuration.
     */
    public function update(UpdateHytaleWorldRequest $request, Server $server, string $world): JsonResponse
    {
        try {
            $settings = $request->validated();
            $this->hytaleWorldService->updateWorldConfig($server, $world, $settings);
            Activity::event('server:hytale.world.update')
                ->property('world', $world)
                ->property('settings', $settings)
                ->log();
            return new JsonResponse([
                'object' => 'world_config',
                'message' => 'World configuration updated successfully',
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to update world config: ' . $e->getMessage(),
            ], 500);
        }
    }
}
