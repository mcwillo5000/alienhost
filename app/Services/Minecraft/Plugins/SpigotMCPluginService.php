<?php

namespace Pterodactyl\Services\Minecraft\Plugins;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\TransferException;
use GuzzleHttp\Exception\BadResponseException;

class SpigotMCPluginService extends AbstractPluginService
{
    protected Client $client;

    public function __construct()
    {
        parent::__construct();

        $this->client = new Client([
            'headers' => [
                'User-Agent' => $this->userAgent,
            ],
            'base_uri' => 'https://api.spiget.org/v2/',
        ]);
    }

    public function search(array $filters): array
    {
        $query = $filters['searchQuery'];
        $pageSize = $filters['pageSize'];
        $page = $filters['page'];

        try {
            $response = json_decode($this->client->get(empty($query) ? 'resources/free' : ('search/resources/' . $query), [
                'query' => [
                    'size' => $pageSize,
                    'page' => $page,
                    'sort' => '-downloads', // descending downloads
                ],
            ])->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching SpigotMC plugins.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }

            return [
                'data' => [],
                'total' => 0,
            ];
        }

        $plugins = [];

        foreach ($response as $spigotPlugin) {
            $iconUrl = empty($spigotPlugin['icon']['url']) ? null : ('https://spigotmc.org/' . $spigotPlugin['icon']['url']);

            if ($iconUrl === null && !empty($spigotPlugin['icon']['data'])) {
                $iconUrl = $spigotPlugin['icon']['data'];
            }
            if ($iconUrl === null) {
                $iconUrl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
            }

            // Required because SpigotMC does not set CORS headers...
            $iconUrl = 'https://corsproxy.io/?url=' . urlencode($iconUrl);

            $plugins[] = [
                'id' => (string) $spigotPlugin['id'],
                'name' => $spigotPlugin['name'],
                'short_description' => $spigotPlugin['tag'],
                'url' => 'https://www.spigotmc.org/resources/' . $spigotPlugin['id'],
                'icon_url' => $iconUrl,
                'external_url' => $this->getExternalUrl($spigotPlugin),
            ];
        }

        return [
            'data' => $plugins,
            'total' => count($plugins),
        ];
    }

    public function versions(string $pluginId, ?string $pluginLoader = null, ?string $minecraftVersion = null): array
    {
        try {
            $versionResponse = json_decode($this->client->get('resources/' . $pluginId . '/versions/latest')->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching SpigotMC plugin files.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }

            throw $e;
        }

        return [
            [
                'id' => (string) $versionResponse['id'],
                'name' => $versionResponse['name'],
                // 'download_url' => $this->getDownloadUrl($pluginId),
            ],
        ];
    }

    /**
     * @return ?string external URL to which the user needs to go to download the plugin, if necessary
     */
    protected function getExternalUrl(array $plugin): ?string
    {
        // Spiget API does not have a fixed structure so we have to provide default values.

        // If the plugin is premium/paid, redirect to product page to facilitate
        // the purchase and download of the plugin
        if ($plugin['premium'] ?? false) {
            return 'https://www.spigotmc.org/resources/'.$plugin['id'];
        }

        // If the external URL likely references an HTML document
        // or an Hangar (https://hangar.papermc.io/) page,
        // give a direct download link so users
        // can download it manually.
        if (str_ends_with($plugin['file']['externalUrl'] ?? '', 'html')
            || str_contains($plugin['file']['externalUrl'] ?? '', 'hangar')) {
            return 'https://www.spigotmc.org/'.$plugin['file']['url'];
        }

        // If the plugin is not premium and is likely to be downloadable
        // automatically, don't present an external URL and try to download
        // it automatically with `getDownloadDetails`.
        return null;
    }

    /**
     * @return array{downloadUrl: string, fileName?: string}
     */
    public function getDownloadDetails(string $pluginId, string $versionId): array
    {
        // We ignore $versionId: Spigot only allows for download of latest version.
        try {
            $detailsResponse = json_decode($this->client->get('resources/' . $pluginId)->getBody(), true);
        } catch (TransferException $e) {
            if ($e instanceof BadResponseException) {
                logger()->error('Received bad response when fetching SpigotMC resource details.', ['response' => \GuzzleHttp\Psr7\Message::toString($e->getResponse())]);
            }

            throw $e;
        }

        $downloadUrl = $detailsResponse['file']['externalUrl'] ?? ('https://api.spiget.org/v2/resources/' . $pluginId . '/download');

        $downloadUrl = $this->getRedirectUrl($downloadUrl) ?? $downloadUrl;
        $fileName = $detailsResponse['name'].'.jar';

        return compact('downloadUrl', 'fileName');
    }
}
