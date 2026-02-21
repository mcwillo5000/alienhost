<?php
namespace Pterodactyl\Jobs\Server\Hytale;
use Pterodactyl\Jobs\Job;
use Pterodactyl\Models\Server;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Hytale\HytaleWorldService;
class InstallHytaleWorldJob extends Job
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $tries = 1;
    public $timeout = 600;
    public string $jobIdentifier;
    private function returnFinalRedirect(string $url, int $max = 5, int $used = 0, string|null $prev = null): string
    {
        if ($used >= $max) {
            return $url;
        }
        if (str_starts_with($url, '/')) {
            $host = parse_url($prev, PHP_URL_HOST);
            if (!$host) {
                throw new \Exception('Failed to determine host.');
            }
            $url = sprintf('%s://%s%s', parse_url($prev, PHP_URL_SCHEME), $host, $url);
        }
        $response = get_headers($url, true);
        if (!$response) {
            throw new \Exception('Failed to query URL.');
        }
        $response = array_change_key_case($response, CASE_LOWER);
        if (array_key_exists('location', $response)) {
            try {
                if (is_array($response['location'])) {
                    return $this->returnFinalRedirect($response['location'][count($response['location']) - 1], $max, $used + 1, $url);
                } else {
                    return $this->returnFinalRedirect($response['location'], $max, $used + 1, $url);
                }
            } catch (\Throwable $e) {
                return $url;
            }
        }
        return $url;
    }
    public function __construct(
        public Server $server,
        public string $worldId,
        public string $versionId
    ) {
        $this->jobIdentifier = 'hytale_world_' . uniqid();
    }
    public function getJobIdentifier(): string
    {
        return $this->jobIdentifier;
    }
    public function handle(
        DaemonFileRepository $repository,
        HytaleWorldService $service
    ) {
        try {
            $downloadDetails = $service->getDownloadDetails($this->worldId, $this->versionId);
            $filename = $downloadDetails['fileName'] ?? 'world.zip';
            $repository->setServer($this->server);
            $realUrl = $this->returnFinalRedirect($downloadDetails['downloadUrl']);
            \Cache::put("hytale_world_download:{$this->jobIdentifier}", [
                'download_id' => $this->jobIdentifier,
                'filename' => $filename,
                'server_id' => $this->server->id,
                'status' => 'downloading'
            ], 3600);
            logger()->info('Starting Hytale world download job', [
                'world_id' => $this->worldId,
                'version_id' => $this->versionId,
                'job_id' => $this->jobIdentifier,
                'filename' => $filename,
            ]);
            $pullOptions = [
                'filename' => $filename,
                'use_header' => $downloadDetails['use_header'] ?? true,
                'foreground' => true
            ];
            foreach ($downloadDetails as $key => $value) {
                if (!in_array($key, ['downloadUrl', 'fileName', 'use_header'])) {
                    $pullOptions[$key] = $value;
                }
            }
            $response = $repository->pull(
                $realUrl,
                '/',
                $pullOptions
            );
            sleep(2);
            try {
                $files = $repository->setServer($this->server)->getDirectory('/');
                $worldFile = collect($files)->firstWhere('name', $filename);
                if ($worldFile && $worldFile['size'] > 0) {
                    logger()->info('Hytale world file downloaded, starting decompression', [
                        'filename' => $filename,
                        'size' => $worldFile['size']
                    ]);
                    $repository->setServer($this->server)->decompressFile('/', $filename);
                    $repository->setServer($this->server)->deleteFiles('/', [$filename]);
                    \Cache::put("hytale_world_download:{$this->jobIdentifier}", [
                        'download_id' => $this->jobIdentifier,
                        'filename' => $filename,
                        'server_id' => $this->server->id,
                        'status' => 'completed',
                        'decompressed' => true
                    ], 3600);
                    logger()->info('Hytale world installed successfully', [
                        'job_id' => $this->jobIdentifier,
                        'filename' => $filename
                    ]);
                }
            } catch (\Exception $decompressError) {
                logger()->error('Failed to decompress Hytale world file', [
                    'error' => $decompressError->getMessage(),
                    'filename' => $filename
                ]);
                try {
                    $repository->setServer($this->server)->deleteFiles('/', [$filename]);
                } catch (\Exception $deleteError) {
                }
                \Cache::put("hytale_world_download:{$this->jobIdentifier}", [
                    'download_id' => $this->jobIdentifier,
                    'filename' => $filename,
                    'server_id' => $this->server->id,
                    'status' => 'failed',
                    'error' => 'Decompression failed: ' . $decompressError->getMessage()
                ], 3600);
            }
        } catch (\Exception $e) {
            logger()->error('Failed to download Hytale world', [
                'world_id' => $this->worldId,
                'version_id' => $this->versionId,
                'job_id' => $this->jobIdentifier,
                'error' => $e->getMessage(),
            ]);
            \Cache::put("hytale_world_download:{$this->jobIdentifier}", [
                'download_id' => $this->jobIdentifier,
                'filename' => $filename ?? 'unknown',
                'server_id' => $this->server->id,
                'status' => 'failed',
                'error' => 'Download failed: ' . $e->getMessage()
            ], 3600);
            return;
        }
    }
}
