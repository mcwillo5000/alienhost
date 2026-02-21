<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Services\Servers\HytaleConfigService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Hytale\GetHytaleSettingsRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Hytale\UpdateHytaleSettingsRequest;
class HytaleSettingsController extends ClientApiController
{
    public function __construct(
        private HytaleConfigService $hytaleConfigService
    ) {
        parent::__construct();
    }
    /**
     * Get current Hytale server settings.
     *
     * @throws \Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException
     */
    public function index(GetHytaleSettingsRequest $request, Server $server): JsonResponse
    {
        try {
            $config = $this->hytaleConfigService->getConfig($server);
            return new JsonResponse([
                'object' => 'hytale_settings',
                'attributes' => [
                    'serverName' => $config['serverName'] ?? '',
                    'motd' => $config['motd'] ?? '',
                    'serverPassword' => $config['serverPassword'] ?? '',
                    'maxPlayers' => $config['maxPlayers'] ?? 20,
                    'gamemode' => $config['gamemode'] ?? 'Adventure',
                    'worldName' => $config['worldName'] ?? 'world',
                    'viewDistanceRadius' => $config['viewDistanceRadius'] ?? 10,
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to load Hytale settings: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Update Hytale server settings.
     *
     * @throws \Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException
     */
    public function update(UpdateHytaleSettingsRequest $request, Server $server): JsonResponse
    {
        try {
            $settings = $request->validated();
            $this->hytaleConfigService->updateConfig($server, $settings);
            Activity::event('server:hytale.settings.update')
                ->property('settings', $settings)
                ->log();
            return new JsonResponse([
                'object' => 'hytale_settings',
                'attributes' => $settings,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to update Hytale settings: ' . $e->getMessage(),
            ], 500);
        }
    }
}
