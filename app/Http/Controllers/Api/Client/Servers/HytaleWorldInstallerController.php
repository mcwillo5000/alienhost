<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Pterodactyl\Exceptions\DisplayException;
use Illuminate\Auth\Access\AuthorizationException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Hytale\HytaleWorldService;
use Pterodactyl\Jobs\Server\Hytale\InstallHytaleWorldJob;
class HytaleWorldInstallerController extends ClientApiController
{
    /**
     * HytaleWorldInstallerController constructor.
     */
    public function __construct(private DaemonFileRepository $daemonFileRepository)
    {
        parent::__construct();
    }
    /**
     * Returns searched Hytale worlds.
     */
    public function index(Request $request, Server $server): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'page' => 'required|numeric|integer|min:1',
            'page_size' => 'required|numeric|integer|max:50', 
            'search_query' => 'nullable|string',
            'hytale_version' => 'nullable|string',
            'sort' => 'nullable|string',
        ]);
        $page = (int) $validated['page'];
        $pageSize = (int) $validated['page_size'];
        $searchQuery = $validated['search_query'] ?? '';
        $hytaleVersion = $validated['hytale_version'] ?? '';
        $sort = $validated['sort'] ?? 'relevance';
        $service = app(HytaleWorldService::class);
        $data = $service->search([
            'searchQuery' => $searchQuery,
            'pageSize' => $pageSize,
            'page' => $page,
            'hytale_version' => $hytaleVersion,
            'sort' => $sort,
        ]);
        $worlds = $data['data'];
        return [
            'object' => 'list',
            'data' => $worlds,
            'meta' => [
                'pagination' => [
                    'total' => $data['total'],
                    'count' => count($worlds),
                    'per_page' => $pageSize,
                    'current_page' => $page,
                    'total_pages' => ceil($data['total'] / $pageSize),
                    'links' => [],
                ],
            ],
        ];
    }
    /**
     * Returns a world's installable versions.
     */
    public function versions(Request $request, Server $server, string $worldId): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'hytale_version' => 'nullable|string',
        ]);
        $hytaleVersion = $validated['hytale_version'] ?? null;
        $service = app(HytaleWorldService::class);
        $worldDetails = $service->getModDetails($worldId);
        $versions = $service->versions($worldId, $hytaleVersion);
        return [
            'project' => $worldDetails,
            'versions' => $versions,
        ];
    }
    /**
     * Install a world using background job.
     */
    public function install(Request $request, Server $server)
    {
        if (!$request->user()->can(Permission::ACTION_FILE_CREATE, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'world_id' => 'required|string',
            'version' => 'required|string',
        ]);
        $worldId = $validated['world_id'];
        $versionId = $validated['version'];
        $job = new InstallHytaleWorldJob($server, $worldId, $versionId);
        $jobId = $job->getJobIdentifier();
        dispatch($job);
        logger()->info('Dispatched Hytale world installation job', [
            'world_id' => $worldId,
            'version_id' => $versionId,
            'job_id' => $jobId,
        ]);
        return response()->json([
            'download_id' => $jobId,
            'message' => 'World download started in background'
        ]);
    }
    /**
     * Check world download status.
     */
    public function downloadStatus(Request $request, Server $server, string $downloadId)
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }
        $cachedData = \Cache::get("hytale_world_download:{$downloadId}");
        if (!$cachedData) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Download not found or expired'
            ], 404);
        }
        return response()->json([
            'status' => $cachedData['status'] ?? 'unknown',
            'filename' => $cachedData['filename'] ?? 'unknown',
            'download_id' => $cachedData['download_id'] ?? $downloadId,
            'decompressed' => $cachedData['decompressed'] ?? false,
            'error' => $cachedData['error'] ?? null
        ]);
    }
    /**
     * Returns normalized world versions from `worlds/` hashes.
     *
     * @return array{identified: array<array{id: string, project_id: string, name: string}>, other: array<string>}
     */
    public function getInstalledWorldsVersions(Server $server): array
    {
        return $this->getInstalledProjectsVersions($server, 'worlds');
    }
    /**
     * Get Hytale versions for filtering.
     */
    public function getHytaleVersions(Request $request, Server $server): array
    {
        $service = app(HytaleWorldService::class);
        return $service->getHytaleVersions();
    }
    /**
     * Returns normalized world versions from `worlds/` hashes.
     *
     * @return array{identified: array<array{id: string, project_id: string, name: string}>, other: array<string>}
     */
    private function getInstalledProjectsVersions(Server $server, string $directory): array
    {
        return [
            'identified' => [],
            'other' => [],
        ];
    }
}
