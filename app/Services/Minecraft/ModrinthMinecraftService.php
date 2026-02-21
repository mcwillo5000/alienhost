<?php

namespace Pterodactyl\Services\Minecraft;

use GuzzleHttp\Client;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class ModrinthMinecraftService extends AbstractMinecraftService {
    
    protected Client $client;

    public function __construct(protected DaemonFileRepository $daemonFileRepository)
    {
        parent::__construct($daemonFileRepository);

        $this->client = new Client([
            'headers' => [
                'User-Agent' => $this->userAgent,
            ],
            'base_uri' => 'https://api.modrinth.com/v2/',
        ]);
    }

    /**
     * Returns normalized Modrinth mod versions from SHA512 $hashes or `mods/` SHA512 hashes
     * as well as of the last version if not up-to-date.
     */
    public function getModsVersions(Server $server, array $paths, ?array $serverBuildInfo = null): array
    {
        $algorithm = 'sha512';
        $hashes = $this->daemonFileRepository->setServer($server)->getFingerprints($paths, $algorithm);
        $hashesToPaths = array_flip($hashes);

        $versionsResponse = $this->client->post('version_files',
            [
                'json' => [
                    'hashes' => array_values($hashes),
                    'algorithm' => $algorithm,    
                ],
            ]);

        $versions = $versionsResponse->getStatusCode() === 200 ? json_decode($versionsResponse->getBody(), true) : [];

        $normalizedVersions = [];

        foreach ($versions as $hash => $modrinthVersion) {
            $normalizedVersions[$modrinthVersion['project_id']] = [
                'path' => $hashesToPaths[$hash],
                'provider' => 'modrinth',
                'project_id' => $modrinthVersion['project_id'],
                'project_name' => null,
                'version_id' => $modrinthVersion['id'],
                'version_name' => $modrinthVersion['version_number'],
                'icon_url' => null,
            ];
        }

        if ($serverBuildInfo['buildType'] !== 'UNKNOWN') {
            $latestVersionsResponse = $this->client->post('version_files/update',
            [
                'json' => [
                    'hashes' => array_values($hashes),
                    'algorithm' => $algorithm,
                    'loaders' => [strtolower($serverBuildInfo['buildType'])],
                    'game_versions' => [$serverBuildInfo['versionName']],
                ],
            ]);
    
            $latestVersions = $latestVersionsResponse->getStatusCode() === 200 ? json_decode($latestVersionsResponse->getBody(), true) : [];
            foreach ($latestVersions as $hash => $latestVersion) {
                // Seems like Modrinth can return unpublished projects???
                if (!isset($normalizedVersions[$latestVersion['project_id']])) {
                    continue;
                }
                if ($normalizedVersions[$latestVersion['project_id']]['version_id'] !== $latestVersion['id']) {
                    $normalizedVersions[$latestVersion['project_id']]['update']['id'] = $latestVersion['id'];
                    $normalizedVersions[$latestVersion['project_id']]['update']['name'] = $latestVersion['version_number'];    
                }
            }    
        }

        $projectsResponse = $this->client->get('projects',
            [
                'query' => [
                    'ids' => $this->modrinthQueryArray(array_keys($normalizedVersions)),    
                ],
            ]);
        $projects = json_decode($projectsResponse->getBody(), true);
        foreach ($projects as $project) {
            $normalizedVersions[$project['id']]['project_name'] = $project['title'];
            $normalizedVersions[$project['id']]['icon_url'] = $project['icon_url'];
        }

        // Array of file paths for which no mod version could be found.
        $other = [];

        foreach ($hashes as $filePath => $hash) {
            if (! isset($versions[$hash])) {
                $other[] = $filePath;
            }
        }

        return ['identified' => array_values($normalizedVersions), 'other' => $other];
    }

    /**
     * @param  array<string>  $array
     */
    public static function modrinthQueryArray(array $array): string
    {
        return '['.implode(',', array_map(fn (string $s): string => '"'.$s.'"', $array)).']';
    }
}