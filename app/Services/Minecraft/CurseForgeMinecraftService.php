<?php

namespace Pterodactyl\Services\Minecraft;

use GuzzleHttp\Client;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class CurseForgeMinecraftService extends AbstractMinecraftService {

    public const CURSEFORGE_MINECRAFT_GAME_ID = 432;
    protected Client $client;

    public function __construct(protected DaemonFileRepository $daemonFileRepository)
    {
        parent::__construct($daemonFileRepository);

        $this->client = new Client([
            'headers' => [
                'User-Agent' => $this->userAgent,
                'X-API-Key' => config('services.curseforge_api_key'),
            ],
            'base_uri' => 'https://api.curseforge.com/v1/',
        ]);
    }

    /**
     * Returns normalized mod versions from $paths hashes.
     *
     * @param  array<string>  $paths
     */
    public function getModsVersions(Server $server, array $paths, ?array $serverBuildInfo = null): array
    {
        $hashes = array_filter($this->getCurseForgeFingerprints($server, $paths));
        $hashesToPaths = array_flip($hashes);
        
        $normalizedVersions = [];

        if (count($hashes) > 0) {
            $response = $this->client
                ->post('https://api.curseforge.com/v1/fingerprints/' . self::CURSEFORGE_MINECRAFT_GAME_ID,
                    [
                        'json' => [
                            'fingerprints' => array_values($hashes),
                        ],
                    ]);

            $statusCode = $response->getStatusCode();

            $data = ($statusCode >= 200 && $statusCode < 300) ? json_decode($response->getBody(), true)['data'] : [];

            foreach ($data['exactMatches'] as $curseForgeVersion) {
                $normalizedVersions[$curseForgeVersion['file']['modId']] = [
                    'path' => $hashesToPaths[(string) $curseForgeVersion['file']['fileFingerprint']],
                    'provider' => 'curseforge',
                    'project_id' => (string) $curseForgeVersion['id'],
                    'project_name' => null,
                    'version_id' => (string) $curseForgeVersion['file']['id'],
                    'version_name' => $curseForgeVersion['file']['displayName'],
                    'icon_url' => null,
                ];
            }
        }

        $mods = [];
        if (count($normalizedVersions) > 0) {
            $modsResponse = $this->client->post('mods',
            [
                'json' => [
                    'modIds' => array_keys($normalizedVersions),    
                ],
            ]);
            $mods = json_decode($modsResponse->getBody(), true)['data'];
        }
        foreach ($mods as $mod) {
            if (!isset($normalizedVersions[$mod['id']])) continue;
            $normalizedVersions[$mod['id']]['project_name'] = $mod['name'];
            $normalizedVersions[$mod['id']]['icon_url'] = $mod['logo']['url'] ?? null;
        }

        // Array of file paths for which no mod version could be found.
        $other = [];

        foreach ($hashes as $filePath => $hash) {
            if (! in_array((int) $hash, $data['exactFingerprints'])) {
                $other[] = $filePath;
            }
        }

        return ['identified' => array_values($normalizedVersions), 'other' => $other];
    }

    /**
     * Get CurseForge fingerprints for $paths.
     *
     * @param  array<string>  $paths
     * @return array<string, string>
     */
    protected function getCurseForgeFingerprints(Server $server, array $paths): array
    {
        $fileRepository = $this->daemonFileRepository->setServer($server);

        $hashes = $fileRepository->getFingerprints($paths, 'curseforge');

        return $hashes;
    }
}