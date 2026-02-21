<?php

namespace Pterodactyl\Services\Minecraft\Plugins;

abstract class AbstractPluginService
{
    protected string $userAgent;

    public function __construct()
    {
        $this->userAgent = config('app.name') . '/' . config('app.version') . ' (' . url('/') . ')';
    }

    abstract public function search(array $filters): array;

    abstract public function versions(string $pluginId, ?string $pluginLoader = null, ?string $minecraftVersion = null): array;

    /**
     * @return array{downloadUrl: string, fileName?: string}
     */
    abstract public function getDownloadDetails(string $pluginId, string $versionId): array;

    protected function getRedirectUrl(string $url): ?string
    {
        stream_context_set_default([
            'http' => [
                'method' => 'HEAD',
            ],
        ]);
        $headers = get_headers($url, 1);
        if ($headers !== false && isset($headers['Location'])) {
            return is_array($headers['Location']) ? array_pop($headers['Location']) : $headers['Location'];
        }

        return null;
    }
}
