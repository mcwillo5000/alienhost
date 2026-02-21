<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Pterodactyl\Exceptions\DisplayException;
use Illuminate\Auth\Access\AuthorizationException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Hytale\HytaleModService;
class HytaleModInstallerController extends ClientApiController
{
    private const MANIFEST_PATH = '/mods/.installed_mods.json';

    /**
     * HytaleModInstallerController constructor.
     */
    public function __construct(private DaemonFileRepository $daemonFileRepository)
    {
        parent::__construct();
    }

    /**
     * Read the installed mods manifest from the server.
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
     * Write the installed mods manifest to the server.
     */
    private function writeManifest(Server $server, array $manifest): void
    {
        $this->daemonFileRepository->setServer($server)->putContent(
            self::MANIFEST_PATH,
            json_encode(array_values($manifest), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }

    /**
     * Returns searched Hytale mods.
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
        $service = app(HytaleModService::class);
        $data = $service->search([
            'searchQuery' => $searchQuery,
            'pageSize' => $pageSize,
            'page' => $page,
            'hytale_version' => $hytaleVersion,
            'sort' => $sort,
        ]);
        $mods = $data['data'];
        return [
            'object' => 'list',
            'data' => $mods,
            'meta' => [
                'pagination' => [
                    'total' => $data['total'],
                    'count' => count($mods),
                    'per_page' => $pageSize,
                    'current_page' => $page,
                    'total_pages' => ceil($data['total'] / $pageSize),
                    'links' => [],
                ],
            ],
        ];
    }
    /**
     * Returns a mod's installable versions.
     */
    public function versions(Request $request, Server $server, string $modId): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'hytale_version' => 'nullable|string',
        ]);
        $hytaleVersion = $validated['hytale_version'] ?? null;
        $service = app(HytaleModService::class);
        $modDetails = $service->getModDetails($modId);
        $versions = $service->versions($modId, $hytaleVersion);
        return [
            'project' => $modDetails,
            'versions' => $versions,
        ];
    }
    /**
     * Install a mod.
     */
    public function install(Request $request, Server $server)
    {
        if (!$request->user()->can(Permission::ACTION_FILE_CREATE, $server)) {
            throw new AuthorizationException();
        }
        $validated = $request->validate([
            'mod_id' => 'required|string',
            'version' => 'required|string',
            'mod_name' => 'nullable|string',
            'mod_icon' => 'nullable|string',
            'mod_author' => 'nullable|string',
        ]);
        $modId = $validated['mod_id'];
        $versionId = $validated['version'];
        $service = app(HytaleModService::class);
        $downloadDetails = $service->getDownloadDetails($modId, $versionId);
        $fileName = $downloadDetails['fileName'] ?? null;
        try {
            $pullOptions = [
                'foreground' => true,
                'filename' => $fileName,
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
            logger()->info('Attempting to download Hytale mod', [
                'mod_id' => $modId,
                'version_id' => $versionId,
                'download_url' => $downloadDetails['downloadUrl'],
                'file_name' => $fileName,
            ]);
            $this->daemonFileRepository->setServer($server)->pull(
                $downloadDetails['downloadUrl'],
                '/mods',
                $pullOptions
            );

            // If the downloaded file is a zip, decompress it and remove the zip
            $extractedFileName = $fileName;
            if ($fileName && preg_match('/\.zip$/i', $fileName)) {
                try {
                    // List files before decompression
                    $filesBefore = collect($this->daemonFileRepository->getDirectory('/mods'))->pluck('name')->all();

                    logger()->info('Decompressing mod zip file', ['file' => $fileName]);
                    $this->daemonFileRepository->decompressFile('/mods', $fileName);

                    // Delete the zip file after successful decompression
                    $this->daemonFileRepository->deleteFiles('/mods', [$fileName]);
                    logger()->info('Deleted zip file after decompression', ['file' => $fileName]);

                    // Find newly extracted files by comparing before/after
                    $filesAfter = collect($this->daemonFileRepository->getDirectory('/mods'))->pluck('name')->all();
                    $newFiles = array_values(array_diff($filesAfter, $filesBefore));
                    $newFiles = array_values(array_filter($newFiles, fn($f) => $f !== $fileName));

                    if (!empty($newFiles)) {
                        $extractedFileName = $newFiles[0];
                        logger()->info('Extracted mod file', ['extracted' => $extractedFileName, 'all_new' => $newFiles]);
                    } else {
                        $extractedFileName = preg_replace('/\.zip$/i', '', $fileName);
                        logger()->info('No new files detected, using stripped zip name', ['file' => $extractedFileName]);
                    }
                } catch (\Exception $decompressError) {
                    logger()->warning('Failed to decompress mod zip file', [
                        'file' => $fileName,
                        'error' => $decompressError->getMessage(),
                    ]);
                    $extractedFileName = $fileName;
                }
            }
        } catch (\Exception $e) {
            logger()->error('Failed to download Hytale mod', [
                'mod_id' => $modId,
                'version_id' => $versionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw new DisplayException('You need to download this mod manually at ' . $downloadDetails['downloadUrl']);
        }

        // Save to installed mods manifest
        $actualFileName = $extractedFileName ?? $fileName;
        try {
            $manifest = $this->readManifest($server);

            // Remove old entry for this mod if exists (update scenario)
            $oldFileName = null;
            $manifest = array_filter($manifest, function ($entry) use ($modId, &$oldFileName) {
                if ((string) ($entry['mod_id'] ?? '') === (string) $modId) {
                    $oldFileName = $entry['file_name'] ?? null;
                    return false;
                }
                return true;
            });

            // If updating and old file differs, delete old file
            if ($oldFileName && $oldFileName !== $actualFileName) {
                try {
                    $this->daemonFileRepository->setServer($server)->deleteFiles('/mods', [$oldFileName]);
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete old mod file during update', ['file' => $oldFileName, 'error' => $e->getMessage()]);
                }
            }

            $manifest[] = [
                'mod_id' => $modId,
                'version_id' => $versionId,
                'mod_name' => $validated['mod_name'] ?? '',
                'mod_icon' => $validated['mod_icon'] ?? '',
                'mod_author' => $validated['mod_author'] ?? '',
                'file_name' => $actualFileName,
                'installed_at' => now()->toIso8601String(),
            ];

            $this->writeManifest($server, $manifest);
        } catch (\Exception $e) {
            logger()->warning('Failed to update installed mods manifest', ['error' => $e->getMessage()]);
        }

        return response()->noContent();
    }

    /**
     * Get list of installed mods from manifest.
     */
    public function getInstalledMods(Request $request, Server $server): array
    {
        if (!$request->user()->can(Permission::ACTION_FILE_READ, $server)) {
            throw new AuthorizationException();
        }

        $manifest = $this->readManifest($server);

        // Verify file existence — auto-remove entries whose files were manually deleted
        try {
            $files = $this->daemonFileRepository->setServer($server)->getDirectory('/mods');
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
                    logger()->warning('Failed to auto-clean installed mods manifest', ['error' => $e->getMessage()]);
                }
            }
        } catch (\Exception $e) {
            logger()->warning('Failed to list /mods directory for file verification', ['error' => $e->getMessage()]);
        }

        // Enrich with latest version info from CurseForge
        $service = app(HytaleModService::class);
        $enriched = [];
        foreach ($manifest as $entry) {
            $modId = $entry['mod_id'] ?? '';
            $latestVersion = null;
            $latestVersionId = null;
            try {
                $versions = $service->versions($modId);
                if (!empty($versions)) {
                    $latestVersion = $versions[0]['name'] ?? null;
                    $latestVersionId = $versions[0]['id'] ?? null;
                }
            } catch (\Exception $e) {
                // ignore
            }

            $enriched[] = [
                'mod_id' => $modId,
                'version_id' => $entry['version_id'] ?? '',
                'mod_name' => $entry['mod_name'] ?? '',
                'mod_icon' => $entry['mod_icon'] ?? '',
                'mod_author' => $entry['mod_author'] ?? '',
                'file_name' => $entry['file_name'] ?? '',
                'installed_at' => $entry['installed_at'] ?? '',
                'latest_version_id' => $latestVersionId,
                'latest_version_name' => $latestVersion,
                'has_update' => $latestVersionId && (string) $latestVersionId !== (string) ($entry['version_id'] ?? ''),
            ];
        }

        return ['data' => $enriched];
    }

    /**
     * Remove an installed mod.
     */
    public function removeMod(Request $request, Server $server, string $modId)
    {
        if (!$request->user()->can(Permission::ACTION_FILE_DELETE, $server)) {
            throw new AuthorizationException();
        }

        $manifest = $this->readManifest($server);
        $fileToDelete = null;

        $manifest = array_filter($manifest, function ($entry) use ($modId, &$fileToDelete) {
            if ((string) ($entry['mod_id'] ?? '') === (string) $modId) {
                $fileToDelete = $entry['file_name'] ?? null;
                return false;
            }
            return true;
        });

        // Delete the actual mod file
        if ($fileToDelete) {
            try {
                $this->daemonFileRepository->setServer($server)->deleteFiles('/mods', [$fileToDelete]);
            } catch (\Exception $e) {
                logger()->warning('Failed to delete mod file', ['file' => $fileToDelete, 'error' => $e->getMessage()]);
            }
        }

        // Update manifest
        try {
            $this->writeManifest($server, $manifest);
        } catch (\Exception $e) {
            throw new DisplayException('Failed to update installed mods manifest.');
        }

        return response()->noContent();
    }

    /**
     * Returns normalized mod versions from `mods/` hashes.
     *
     * @return array{identified: array<array{id: string, project_id: string, name: string}>, other: array<string>}
     */
    public function getInstalledModsVersions(Server $server): array
    {
        return $this->getInstalledProjectsVersions($server, 'mods');
    }
    /**
     * Get Hytale versions for filtering.
     */
    public function getHytaleVersions(Request $request, Server $server): array
    {
        $service = app(HytaleModService::class);
        return $service->getHytaleVersions();
    }
    /**
     * Returns normalized mod versions from `mods/` hashes.
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
