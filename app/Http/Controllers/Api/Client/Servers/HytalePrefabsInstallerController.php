<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Pterodactyl\Exceptions\DisplayException;
use Illuminate\Auth\Access\AuthorizationException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Hytale\HytalePrefabsService;
use Illuminate\Support\Facades\Log;
class HytalePrefabsInstallerController extends ClientApiController
{
    private const MANIFEST_PATH = '/prefabs/.installed_prefabs.json';

    /**
     * HytalePrefabsInstallerController constructor.
     */
    public function __construct(private DaemonFileRepository $daemonFileRepository)
    {
        parent::__construct();
    }

    /**
     * Read the installed prefabs manifest from the server.
     */
    private function readManifest(Server $server): array
    {
        try {
            $content = $this->daemonFileRepository->setServer($server)->getContent(self::MANIFEST_PATH);
            $data = json_decode($content, true);
            return is_array($data) ? $data : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Write the installed prefabs manifest to the server.
     */
    private function writeManifest(Server $server, array $manifest): void
    {
        $this->daemonFileRepository->setServer($server)->putContent(
            self::MANIFEST_PATH,
            json_encode(array_values($manifest), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
    /**
     * Returns searched Hytale prefabs.
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
        $service = app(HytalePrefabsService::class);
        $data = $service->search([
            'searchQuery' => $searchQuery,
            'pageSize' => $pageSize,
            'page' => $page,
            'hytale_version' => $hytaleVersion,
            'sort' => $sort,
        ]);
        $prefabs = $data['data'];
        return [
            'object' => 'list',
            'data' => $prefabs,
            'meta' => [
                'pagination' => [
                    'total' => $data['total'],
                    'count' => count($prefabs),
                    'per_page' => $pageSize,
                    'current_page' => $page,
                    'total_pages' => ceil($data['total'] / $pageSize),
                    'links' => [],
                ],
            ],
        ];
    }
    /**
     * Returns a prefab's installable versions.
     */
    public function versions(Request $request, Server $server, string $prefabId): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'hytale_version' => 'nullable|string',
        ]);
        $hytaleVersion = $validated['hytale_version'] ?? null;
        $service = app(HytalePrefabsService::class);
        $prefabDetails = $service->getModDetails($prefabId);
        $versions = $service->versions($prefabId, $hytaleVersion);
        return [
            'project' => $prefabDetails,
            'versions' => $versions,
        ];
    }
    /**
     * Install a prefab.
     */
    public function install(Request $request, Server $server)
    {
        if (!$request->user()->can(Permission::ACTION_FILE_CREATE, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'prefab_id' => 'required|string',
            'version' => 'required|string',
        ]);
        $prefabId = $validated['prefab_id'];
        $versionId = $validated['version'];
        $service = app(HytalePrefabsService::class);
        $downloadDetails = $service->getDownloadDetails($prefabId, $versionId);
        try {
            $pullOptions = [
                'foreground' => true,
                'filename' => $downloadDetails['fileName'] ?? null,
                'decompress' => true,
            ];
            if (isset($downloadDetails['use_header'])) {
                $pullOptions['use_header'] = $downloadDetails['use_header'];
            } else {
                $pullOptions['use_header'] = true; 
            }
            foreach ($downloadDetails as $key => $value) {
                if (!in_array($key, ['downloadUrl', 'fileName', 'use_header'])) {
                    $pullOptions[$key] = $value;
                }
            }
            logger()->info('Attempting to download Hytale prefab', [
                'prefab_id' => $prefabId,
                'version_id' => $versionId,
                'download_url' => $downloadDetails['downloadUrl'],
                'file_name' => $downloadDetails['fileName'] ?? null,
            ]);
            $this->daemonFileRepository->setServer($server)->pull(
                $downloadDetails['downloadUrl'],
                '/prefabs',
                $pullOptions
            );

            // If the downloaded file is a zip, decompress it and remove the zip
            $fileName = $downloadDetails['fileName'] ?? '';
            $extractedFileName = $fileName;
            if ($fileName && preg_match('/\.zip$/i', $fileName)) {
                try {
                    // List files before decompression
                    $filesBefore = collect($this->daemonFileRepository->getDirectory('/prefabs'))->pluck('name')->all();

                    logger()->info('Decompressing prefab zip file', ['file' => $fileName]);
                    $this->daemonFileRepository->decompressFile('/prefabs', $fileName);

                    // Delete the zip file after successful decompression
                    $this->daemonFileRepository->deleteFiles('/prefabs', [$fileName]);
                    logger()->info('Deleted zip file after decompression', ['file' => $fileName]);

                    // Find newly extracted files by comparing before/after
                    $filesAfter = collect($this->daemonFileRepository->getDirectory('/prefabs'))->pluck('name')->all();
                    $newFiles = array_values(array_diff($filesAfter, $filesBefore));
                    // Remove the zip itself from the diff (already deleted but just in case)
                    $newFiles = array_values(array_filter($newFiles, fn($f) => $f !== $fileName));

                    if (!empty($newFiles)) {
                        // Use the first extracted file as the tracked file name
                        $extractedFileName = $newFiles[0];
                        logger()->info('Extracted prefab file', ['extracted' => $extractedFileName, 'all_new' => $newFiles]);
                    } else {
                        // Fallback: try filename without .zip extension
                        $extractedFileName = preg_replace('/\.zip$/i', '', $fileName);
                        logger()->info('No new files detected, using stripped zip name', ['file' => $extractedFileName]);
                    }
                } catch (\Exception $decompressError) {
                    logger()->warning('Failed to decompress prefab zip file', [
                        'file' => $fileName,
                        'error' => $decompressError->getMessage(),
                    ]);
                    $extractedFileName = $fileName; // Keep zip name if decompress failed
                }
            }
        } catch (\Exception $e) {
            logger()->error('Failed to download Hytale prefab', [
                'prefab_id' => $prefabId,
                'version_id' => $versionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw new DisplayException('You need to download this prefab manually at ' . $downloadDetails['downloadUrl']);
        }

        // Save to installed prefabs manifest
        $prefabName = $request->input('prefab_name', '');
        $prefabIcon = $request->input('prefab_icon', '');
        $prefabAuthor = $request->input('prefab_author', '');
        $fileName = $extractedFileName ?? ($downloadDetails['fileName'] ?? '');

        try {
            $manifest = $this->readManifest($server);

            // Remove old entry if exists (update scenario)
            $oldFileName = null;
            $manifest = array_filter($manifest, function ($entry) use ($prefabId, &$oldFileName) {
                if ((string) ($entry['prefab_id'] ?? '') === (string) $prefabId) {
                    $oldFileName = $entry['file_name'] ?? null;
                    return false;
                }
                return true;
            });

            // If updating and old file differs, delete old file
            if ($oldFileName && $oldFileName !== $fileName && !empty($oldFileName)) {
                try {
                    $this->daemonFileRepository->deleteFiles('/prefabs', [$oldFileName]);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete old prefab file during update', ['file' => $oldFileName, 'error' => $e->getMessage()]);
                }
            }

            $manifest[] = [
                'prefab_id' => $prefabId,
                'version_id' => $versionId,
                'prefab_name' => $prefabName,
                'prefab_icon' => $prefabIcon,
                'prefab_author' => $prefabAuthor,
                'file_name' => $fileName,
                'installed_at' => now()->toIso8601String(),
            ];

            $this->writeManifest($server, $manifest);
        } catch (\Exception $e) {
            Log::warning('Failed to update installed prefabs manifest', ['error' => $e->getMessage()]);
        }

        return response()->noContent();
    }
    /**
     * Returns normalized prefab versions from `prefabs/` hashes.
     *
     * @return array{identified: array<array{id: string, project_id: string, name: string}>, other: array<string>}
     */
    public function getInstalledPrefabsVersions(Server $server): array
    {
        return $this->getInstalledProjectsVersions($server, 'prefabs');
    }
    /**
     * Get Hytale versions for filtering.
     */
    public function getHytaleVersions(Request $request, Server $server): array
    {
        $service = app(HytalePrefabsService::class);
        return $service->getHytaleVersions();
    }
    /**
     * Returns normalized prefab versions from `prefabs/` hashes.
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

    /**
     * Get list of installed prefabs from manifest.
     */
    public function getInstalledPrefabs(Request $request, Server $server): JsonResponse
    {
        try {
            $this->daemonFileRepository->setServer($server);
            $manifest = $this->readManifest($server);

            // Verify file existence — auto-remove entries whose files were manually deleted
            try {
                $files = $this->daemonFileRepository->getDirectory('/prefabs');
                $existingFiles = collect($files)->pluck('name')->all();
                $originalCount = count($manifest);

                $manifest = array_filter($manifest, function ($entry) use ($existingFiles) {
                    $fileName = $entry['file_name'] ?? '';
                    return $fileName === '' || in_array($fileName, $existingFiles);
                });

                if (count($manifest) < $originalCount) {
                    try {
                        $this->writeManifest($server, $manifest);
                    } catch (\Exception $e) {
                        Log::warning('Failed to auto-clean installed prefabs manifest', ['error' => $e->getMessage()]);
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to list prefabs directory for file verification', ['error' => $e->getMessage()]);
            }

            // Check for updates via CurseForge versions API
            $service = app(HytalePrefabsService::class);
            $enriched = [];
            foreach ($manifest as $entry) {
                $hasUpdate = false;
                $latestVersionId = null;
                $latestVersionName = null;

                try {
                    $versions = $service->versions((string) ($entry['prefab_id'] ?? ''));
                    if (!empty($versions)) {
                        $latestVersionId = $versions[0]['id'] ?? null;
                        $latestVersionName = $versions[0]['name'] ?? null;
                        $currentVersionId = $entry['version_id'] ?? '';
                        if ($latestVersionId && (string) $latestVersionId !== (string) $currentVersionId) {
                            $hasUpdate = true;
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to check prefab updates', ['prefab_id' => $entry['prefab_id'] ?? '', 'error' => $e->getMessage()]);
                }

                $enriched[] = [
                    'prefab_id' => $entry['prefab_id'] ?? '',
                    'version_id' => $entry['version_id'] ?? '',
                    'prefab_name' => $entry['prefab_name'] ?? '',
                    'prefab_icon' => $entry['prefab_icon'] ?? '',
                    'prefab_author' => $entry['prefab_author'] ?? '',
                    'file_name' => $entry['file_name'] ?? '',
                    'installed_at' => $entry['installed_at'] ?? '',
                    'latest_version_id' => $latestVersionId,
                    'latest_version_name' => $latestVersionName,
                    'has_update' => $hasUpdate,
                ];
            }

            return new JsonResponse(['data' => $enriched]);
        } catch (\Exception $e) {
            Log::error('Error fetching installed prefabs', ['error' => $e->getMessage()]);
            return new JsonResponse(['data' => []]);
        }
    }

    /**
     * Remove an installed prefab.
     */
    public function removePrefab(Request $request, Server $server, string $prefabId): JsonResponse
    {
        try {
            $this->daemonFileRepository->setServer($server);
            $manifest = $this->readManifest($server);
            $fileToDelete = null;

            $manifest = array_filter($manifest, function ($entry) use ($prefabId, &$fileToDelete) {
                if ((string) ($entry['prefab_id'] ?? '') === (string) $prefabId) {
                    $fileToDelete = $entry['file_name'] ?? null;
                    return false;
                }
                return true;
            });

            // Delete the actual prefab file
            if ($fileToDelete) {
                try {
                    $this->daemonFileRepository->deleteFiles('/prefabs', [$fileToDelete]);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete prefab file', ['file' => $fileToDelete, 'error' => $e->getMessage()]);
                }
            }

            // Update manifest
            $this->writeManifest($server, $manifest);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error removing prefab', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Failed to remove prefab: ' . $e->getMessage()], 500);
        }
    }
}
