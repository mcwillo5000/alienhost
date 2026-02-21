<?php

namespace Pterodactyl\Services\Minecraft\Plugins;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Exception\TransferException;
use GuzzleHttp\Exception\BadResponseException;
use Pterodactyl\Services\Minecraft\ModrinthMinecraftService;

class ModrinthPluginService extends AbstractPluginService
{
    protected Client $client;

    public function __construct()
    {
        parent::__construct();

        $this->client = new Client([
            'headers' => [
                'User-Agent' => $this->userAgent,
            ],
            'base_uri' => 'https://api.modrinth.com/v2/',
        ]);
    }

    public function search(array $filters): array
    {
        $query = $filters['searchQuery'];
        $pageSize = $filters['pageSize'];
        $page = $filters['page'];
        $minecraftVersion = $filters['minecraftVersion'];
        $pluginLoader = $filters['pluginLoader'];
        $facets = '["project_type:plugin"],["server_side!=unsupported"]';

        if (!empty($minecraftVersion)) {
            $facets .= ',["versions:' . $minecraftVersion . '"]';
        }

        if (! empty($pluginLoader)) {
            $facets .= ',["categories:' . $pluginLoader . '"]';
        }

        try {
            $response = json_decode($this->client->get('search', [
                'query' => [
                    'offset' => ($page - 1) * $pageSize,
                    'facets' => '[ ' . $facets . ' ]',
                    'limit' => $pageSize,
                    'query' => $query,
                    'index' => 'relevance',
                ],
            ])->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching Modrinth plugins.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }

            return [
                'data' => [],
                'total' => 0,
            ];
        }

        $plugins = [];

        foreach ($response['hits'] as $modrinthPlugin) {
            $plugins[] = [
                'id' => $modrinthPlugin['project_id'],
                'name' => $modrinthPlugin['title'],
                'short_description' => $modrinthPlugin['description'],
                'url' => 'https://modrinth.com/plugin/' . $modrinthPlugin['slug'],
                'icon_url' => empty($modrinthPlugin['icon_url']) ? null : $modrinthPlugin['icon_url'],
            ];
        }

        return [
            'data' => $plugins,
            'total' => $response['total_hits'],
        ];
    }

    public function versions(string $pluginId, ?string $pluginLoader = null, ?string $minecraftVersion = null): array
    {
        $loaders = empty($pluginLoader) ? $this->getPluginLoaders() : [$pluginLoader];

        try {
            $response = json_decode($this->client->get('project/' . $pluginId . '/version', [
                'query' => [
                    'loaders' => ModrinthMinecraftService::modrinthQueryArray($loaders),
                    'game_versions' => empty($minecraftVersion) ? null : ModrinthMinecraftService::modrinthQueryArray([$minecraftVersion]),
                ],
            ])->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching Modrinth plugin files.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }
        }

        $versions = [];

        foreach ($response as $version) {
            $versions[] = [
                'id' => $version['id'],
                'name' => $version['name'],
                'game_versions' => $version['game_versions'],
                'download_url' => $version['files'][0]['url'],
            ];
        }

        return $versions;
    }

    /**
     * @return array{downloadUrl: string, fileName?: string}
     */
    public function getDownloadDetails(string $pluginId, string $versionId): array
    {
        try {
            $response = json_decode($this->client->get('project/' . $pluginId . '/version/' . $versionId)->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching Modrinth plugin files.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }
        }

        $file = $response['files'][0];
        $downloadUrl = $file['url'];

        return ['downloadUrl' => $downloadUrl];
    }

    public function getPluginLoaders(): array
    {
        return Cache::remember('modrinth-plugin-loaders', 3600 * 24, function () {
            $response = json_decode($this->client->get('tag/loader')->getBody(), true);
            $pluginLoaders = [];

            foreach ($response as $loader) {
                if (in_array('plugin', $loader['supported_project_types'])) {
                    $pluginLoaders[] = $loader['name'];
                }
            }

            return $pluginLoaders;
        });
    }
}
