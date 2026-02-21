<?php
namespace Pterodactyl\Services\Hytale;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\TransferException;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Models\Server;
class HytaleWorldService
{
    public const CURSEFORGE_HYTALE_GAME_ID = 70216;
    public const CURSEFORGE_HYTALE_WORLDS_CLASS_ID = 9184;
    protected Client $client;
    protected string $userAgent;
    public function __construct()
    {
        $this->userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0';
        $this->client = new Client([
            'headers' => [
                'User-Agent' => $this->userAgent,
                'X-API-Key' => config('services.curseforge_api_key'),
                'Accept' => 'application/json',
            ],
            'base_uri' => 'https://api.curseforge.com/v1/',
        ]);
    }
    /**
     * Sort Hytale versions
     */
    protected function sortHytaleVersions(array $versions): array
    {
        $filteredVersions = array_filter($versions, function ($version) {
            return !str_contains($version, 'Snapshot') &&
                !str_contains($version, 'snapshot') &&
                !str_contains($version, 'Pre-Release') &&
                !str_contains($version, 'pre') &&
                !str_contains($version, 'rc');
        });
        usort($filteredVersions, function ($a, $b) {
            return version_compare($b, $a);
        });
        return array_values($filteredVersions);
    }
    /**
     * Get CurseForge sort field value
     */
    protected function getSortField(string $sort): int
    {
        return match ($sort) {
            'updated' => 3,
            'relevance' => 1,
            'downloads' => 6,
            default => 6,
        };
    }
    public function search(array $filters): array
    {
        $query = $filters['searchQuery'] ?? '';
        $pageSize = $filters['pageSize'] ?? 12;
        $page = $filters['page'] ?? 1;
        $hytaleVersion = $filters['hytale_version'] ?? '';
        $sort = $filters['sort'] ?? 'relevance';
        $sortField = $this->getSortField($sort);
        try {
            $queryParams = [
                'gameId' => self::CURSEFORGE_HYTALE_GAME_ID,
                'classId' => self::CURSEFORGE_HYTALE_WORLDS_CLASS_ID,
                'sortField' => $sortField,
                'sortOrder' => 'desc',
                'pageSize' => $pageSize,
                'index' => ($page - 1) * $pageSize,
            ];
            if (!empty($query)) {
                $queryParams['searchFilter'] = $query;
            }
            if (!empty($hytaleVersion)) {
                $queryParams['gameVersion'] = $hytaleVersion;
            }
            $response = json_decode($this->client->get('mods/search', [
                'query' => $queryParams,
            ])->getBody(), true);
            if (!is_array($response)) {
                logger()->error('Invalid response from CurseForge API', ['response' => $response]);
                return [
                    'data' => [],
                    'total' => 0,
                ];
            }
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching CurseForge Hytale worlds.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            } else {
                logger()->error('Transfer exception when fetching CurseForge Hytale worlds.', ['error' => $e->getMessage()]);
            }
            return [
                'data' => [],
                'total' => 0,
            ];
        }
        $worlds = [];
        $filteredWorlds = [];
        if (!isset($response['data']) || !is_array($response['data'])) {
            return [
                'data' => [],
                'total' => $response['pagination']['totalCount'] ?? 0,
            ];
        }
        if (!empty($query)) {
            $words = explode(' ', strtolower($query));
            foreach ($response['data'] as $curseforgeWorld) {
                $worldName = strtolower($curseforgeWorld['name'] ?? '');
                $matchesAllWords = true;
                foreach ($words as $word) {
                    if (strpos($worldName, $word) === false) {
                        $matchesAllWords = false;
                        break;
                    }
                }
                if ($matchesAllWords) {
                    $filteredWorlds[] = $curseforgeWorld;
                }
            }
        } else {
            $filteredWorlds = $response['data'];
        }
        foreach ($filteredWorlds as $curseforgeWorld) {
            $iconUrl = null;
            if (isset($curseforgeWorld['logo'])) {
                $iconUrl = $curseforgeWorld['logo']['thumbnailUrl'] ?? $curseforgeWorld['logo']['url'] ?? null;
            }
            $worlds[] = [
                'id' => (string) $curseforgeWorld['id'],
                'name' => $curseforgeWorld['name'] ?? '',
                'short_description' => $curseforgeWorld['summary'] ?? '',
                'url' => $curseforgeWorld['links']['websiteUrl'] ?? '',
                'icon_url' => $iconUrl,
                'downloads' => $curseforgeWorld['downloadCount'] ?? 0,
                'followers' => null,
                'categories' => array_map(function ($category) {
                    return $category['name'];
                }, $curseforgeWorld['categories'] ?? []),
                'author' => $curseforgeWorld['authors'][0]['name'] ?? '',
                'last_updated' => $curseforgeWorld['dateModified'] ?? '',
            ];
        }
        return [
            'data' => $worlds,
            'total' => $response['pagination']['totalCount'] ?? count($worlds),
        ];
    }
    public function versions(string $modId, ?string $hytaleVersion = null): array
    {
        try {
            $response = json_decode($this->client->get('mods/' . $modId . '/files', [
                'query' => [
                    'gameVersion' => $hytaleVersion,
                    'pageSize' => 50,
                ],
            ])->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching CurseForge Hytale world files.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }
            return [];
        }
        $versions = [];
        foreach ($response['data'] as $version) {
            $gameVersions = $version['gameVersions'] ?? [];
            if (!empty($hytaleVersion) && !in_array($hytaleVersion, $gameVersions)) {
                continue;
            }
            $versions[] = [
                'id' => (string) $version['id'],
                'name' => $version['displayName'],
                'game_versions' => $gameVersions,
            ];
        }
        return $versions;
    }
    /**
     * @return array{downloadUrl: string, fileName?: string}
     */
    public function getDownloadDetails(string $modId, string $versionId): array
    {
        try {
            $fileResponse = json_decode($this->client->get('mods/' . $modId . '/files/' . $versionId)->getBody(), true);
            $fileName = $fileResponse['data']['fileName'] ?? null;
            $response = json_decode($this->client->get('mods/' . $modId . '/files/' . $versionId . '/download-url')->getBody(), true);
            $downloadUrl = $response['data'];
            $downloadUrl = str_replace('edge', 'mediafiles', $downloadUrl);
            $redirectUrl = $this->getRedirectUrl($downloadUrl);
            if ($redirectUrl) {
                $downloadUrl = $redirectUrl;
            }
            return [
                'downloadUrl' => $downloadUrl,
                'fileName' => $fileName,
                'use_header' => true,
            ];
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching CurseForge Hytale world download details.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }
            throw new \Exception('You need to download this world manually at ');
        }
    }
    /**
     * Get the final URL after following redirects
     */
    protected function getRedirectUrl(string $url): ?string
    {
        try {
            stream_context_set_default([
                'http' => [
                    'method' => 'HEAD',
                ],
            ]);
            $headers = get_headers($url, 1);
            if ($headers !== false && isset($headers['Location'])) {
                return is_array($headers['Location']) ? array_pop($headers['Location']) : $headers['Location'];
            }
        } catch (\Exception $e) {
            logger()->error('Error following redirect for CurseForge Hytale world', ['error' => $e->getMessage()]);
        }
        return null;
    }
    /**
     * Get world details for a specific world.
     */
    public function getModDetails(string $modId): array
    {
        try {
            $response = json_decode($this->client->get('mods/' . $modId)->getBody(), true);
            $world = $response['data'];
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching CurseForge Hytale world details.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }
            return [];
        }
        return [
            'title' => $world['name'] ?? '',
            'description' => $world['summary'] ?? '',
            'icon_url' => $world['logo']['thumbnailUrl'] ?? null,
            'downloads' => $world['downloadCount'] ?? 0,
            'followers' => null,
            'updated_at' => $world['dateModified'] ?? '',
            'author' => $world['authors'][0]['name'] ?? '',
        ];
    }
    /**
     * Get available Hytale versions.
     */
    public function getHytaleVersions(): array
    {
        return Cache::remember('curseforge-hytale-versions-worlds', 3600 * 24, function () {
            try {
                $versions = [];
                $response = json_decode($this->client->get('mods/search', [
                    'query' => [
                        'gameId' => self::CURSEFORGE_HYTALE_GAME_ID,
                        'classId' => self::CURSEFORGE_HYTALE_WORLDS_CLASS_ID,
                        'pageSize' => 50,
                        'index' => 0,
                    ],
                ])->getBody(), true);
                $versionSet = [];
                if (isset($response['data']) && is_array($response['data'])) {
                    foreach ($response['data'] as $world) {
                        try {
                            $filesResponse = json_decode($this->client->get('mods/' . $world['id'] . '/files', [
                                'query' => ['pageSize' => 50],
                            ])->getBody(), true);
                            if (isset($filesResponse['data']) && is_array($filesResponse['data'])) {
                                foreach ($filesResponse['data'] as $file) {
                                    foreach ($file['gameVersions'] ?? [] as $version) {
                                        $versionSet[$version] = true;
                                    }
                                }
                            }
                        } catch (\Exception $e) {
                        }
                    }
                }
                $versions = array_keys($versionSet);
                if (empty($versions)) {
                    $versions = ['Early Access'];
                }
                return $this->sortHytaleVersions($versions);
            } catch (TransferException $e) {
                if ($e instanceof BadResponseException) {
                    logger()->error('Received bad response when fetching CurseForge Hytale game versions.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
                }
                return ['Early Access'];
            }
        });
    }
}
