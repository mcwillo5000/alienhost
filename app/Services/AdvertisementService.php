<?php

namespace Pterodactyl\Services;

use Pterodactyl\Models\Advertisement;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonCommandRepository;
use Illuminate\Support\Facades\Log;

class AdvertisementService
{
    public function __construct(
        protected DaemonCommandRepository $commandRepository
    ) {}

    public function sendAdvertisements(): void
    {
        $advertisements = Advertisement::where('is_active', true)
            ->with('nest')
            ->get();

        foreach ($advertisements as $advertisement) {
            $this->sendAdvertisement($advertisement);
        }
    }

    public function sendAdvertisement(Advertisement $advertisement): array
    {
        $servers = Server::whereIn('egg_id', function($query) use ($advertisement) {
            $query->select('id')
                ->from('eggs')
                ->where('nest_id', $advertisement->nest_id);
        })
        ->whereNull('status')
        ->get();

        $successCount = 0;
        $failedCount = 0;

        foreach ($servers as $server) {
            try {
                $this->sendToServer($server, $advertisement);
                $successCount++;
            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Failed to send advertisement to server', [
                    'server_id' => $server->id,
                    'server_name' => $server->name,
                    'advertisement_id' => $advertisement->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'success' => $successCount,
            'failed' => $failedCount,
            'total' => $servers->count(),
        ];
    }

    protected function sendToServer(Server $server, Advertisement $advertisement): void
    {
        $commands = is_array($advertisement->commands) ? $advertisement->commands : [$advertisement->commands ?? ''];
        
        foreach ($commands as $command) {
            if (!empty(trim($command))) {
                $this->commandRepository->setServer($server)->send($command);
            }
        }
        
        Log::info('Advertisement sent to server', [
            'server_id' => $server->id,
            'server_name' => $server->name,
            'server_uuid' => $server->uuid,
            'advertisement_id' => $advertisement->id,
            'advertisement_name' => $advertisement->name,
            'commands' => $commands,
        ]);
    }
}

