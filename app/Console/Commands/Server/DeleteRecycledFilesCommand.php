<?php

namespace Pterodactyl\Console\Commands\Server;

use Illuminate\Console\Command;
use Pterodactyl\Models\RecycledFile;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class DeleteRecycledFilesCommand extends Command
{
    protected $signature = 'p:server:delete-recycled-files';
    protected $description = 'Permanently deletes recycled files older than 24 hours.';

    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    public function handle()
    {
        $expiredFiles = RecycledFile::where('created_at', '<=', now()->subHours(24))->get();

        foreach ($expiredFiles->groupBy('server_id') as $serverId => $files) {
            $server = $files->first()->server;
            if (!$server || !$server->node) {
                continue;
            }
            try {
                $this->fileRepository
                    ->setServer($server)
                    ->deleteFiles('/.trash', $files->pluck('id')->map(fn($id) => strval($id))->toArray());
            } catch (\Exception $e) {
                $this->error("Failed to delete for server {$serverId}: " . $e->getMessage());
            }
            RecycledFile::whereIn('id', $files->pluck('id'))->delete();
        }

        $this->info('Recycled files older than 24 hours have been purged.');
    }
}
