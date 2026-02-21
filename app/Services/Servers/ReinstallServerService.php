<?php

namespace Pterodactyl\Services\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Repositories\Eloquent\ServerVariableRepository;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class ReinstallServerService
{
    /**
     * ReinstallService constructor.
     */
public function __construct(
    private ConnectionInterface $connection,
    private DaemonServerRepository $daemonServerRepository,
    private DaemonFileRepository $daemonFileRepository,
    private ServerVariableRepository $serverVariableRepository,
) {
}

    /**
     * Reinstall a server on the remote daemon.
     *
     * @throws \Throwable
     */
public function handle(Server $server, string $reinstallType = 'keep_files'): Server
{
        return $this->connection->transaction(function () use ($server, $reinstallType) {
            // Log the reinstall type for debugging
            \Log::info("ReinstallServerService: Starting reinstall for server {$server->uuid} with type: {$reinstallType}");

            $server->fill(['status' => Server::STATUS_INSTALLING])->save();

            // Factory reset: reset startup variables to default values
            if ($reinstallType === 'factory_reset') {
                \Log::info("ReinstallServerService: Resetting startup variables for server {$server->uuid}");
                $this->resetStartupVariables($server);
            }

            // Determine if files should be deleted (purged)
            $purgeFiles = in_array($reinstallType, ['delete_files', 'factory_reset']);

            if ($purgeFiles) {
                // Manually delete files since Wings might not support purge_files flag
                \Log::info("ReinstallServerService: Deleting files for server {$server->uuid}");
                $this->deleteServerFiles($server);
            } else {
                \Log::info("ReinstallServerService: Keeping files for server {$server->uuid}");
            }

            \Log::info("ReinstallServerService: Calling Wings reinstall for server {$server->uuid} with purge=" . ($purgeFiles ? 'true' : 'false'));
            $this->daemonServerRepository->setServer($server)->reinstall($purgeFiles);

            return $server->refresh();
        });
    }
    /**
     * Delete all files in the server's root directory.
     *
     * @throws \Throwable
     */
    private function deleteServerFiles(Server $server): void
    {
        try {
            $this->daemonFileRepository->setServer($server);
            $files = $this->daemonFileRepository->getDirectory('/');

            $filesToDelete = array_map(function ($file) {
                return $file['name'];
            }, $files);

            if (!empty($filesToDelete)) {
                $this->daemonFileRepository->deleteFiles('/', $filesToDelete);
            }
        } catch (\Exception $exception) {
            // Log the error but verify if we should block the reinstall.
            // For now, we propagate the exception to ensure the user knows something went wrong.
            throw $exception;
        }
    }

    /**
     * Reset all server variables to their default values.
     */
    private function resetStartupVariables(Server $server): void
    {
        // Get all server variables
        $serverVariables = \Pterodactyl\Models\ServerVariable::where('server_id', $server->id)
            ->with('variable')
            ->get();

        foreach ($serverVariables as $serverVariable) {
            // Get default value from the egg variable
            $defaultValue = $serverVariable->variable->default_value ?? '';

            $serverVariable->update([
                'variable_value' => $defaultValue,
            ]);

            \Log::info("ReinstallServerService: Reset variable {$serverVariable->variable->name} to default: {$defaultValue}");
        }
    }
}
