<?php
namespace Pterodactyl\Services\Servers;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
class HytaleWorldService
{
    public function __construct(
        private DaemonFileRepository $fileRepository
    ) {
    }
    /**
     * Get list of worlds from universe/worlds directory.
     *
     * @throws DaemonConnectionException
     */
    public function getWorldsList(Server $server): array
    {
        $contents = $this->fileRepository
            ->setServer($server)
            ->getDirectory('/universe/worlds');
        $worlds = [];
        foreach ($contents as $item) {
            if (isset($item['file']) && $item['file'] === false && $item['name'] !== '.' && $item['name'] !== '..') {
                $worlds[] = [
                    'name' => $item['name'],
                    'size' => $item['size'] ?? 0,
                    'modified' => $item['modified'] ?? null,
                ];
            }
        }
        return $worlds;
    }
    /**
     * Get world config.json contents.
     *
     * @throws DaemonConnectionException
     */
    public function getWorldConfig(Server $server, string $worldName): array
    {
        $content = $this->fileRepository
            ->setServer($server)
            ->getContent("/universe/worlds/{$worldName}/config.json", 1024 * 1024);
        $config = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Invalid JSON in world config.json');
        }
        if (!isset($config['Death'])) {
            $config['Death'] = [
                'RespawnController' => [
                    'Type' => 'HomeOrSpawnPoint',
                ],
                'ItemsLossMode' => 'Configured',
                'ItemsAmountLossPercentage' => 10,
                'ItemsDurabilityLossPercentage' => 10,
            ];
        }
        if (!isset($config['DaytimeDurationSeconds'])) {
            $config['DaytimeDurationSeconds'] = 600;
        }
        if (!isset($config['NighttimeDurationSeconds'])) {
            $config['NighttimeDurationSeconds'] = 300;
        }
        return $config;
    }
    /**
     * Update world config.json.
     *
     * @throws DaemonConnectionException
     */
    public function updateWorldConfig(Server $server, string $worldName, array $settings): void
    {
        $config = $this->getWorldConfig($server, $worldName);
        if (isset($settings['IsPvpEnabled'])) {
            $config['IsPvpEnabled'] = (bool) $settings['IsPvpEnabled'];
        }
        if (isset($settings['IsFallDamageEnabled'])) {
            $config['IsFallDamageEnabled'] = (bool) $settings['IsFallDamageEnabled'];
        }
        if (isset($settings['GameTime'])) {
            $config['GameTime'] = $settings['GameTime'];
        }
        if (isset($settings['IsGameTimePaused'])) {
            $config['IsGameTimePaused'] = (bool) $settings['IsGameTimePaused'];
        }
        if (isset($settings['ItemsLossMode'])) {
            $config['Death']['ItemsLossMode'] = $settings['ItemsLossMode'];
        }
        if (isset($settings['ItemsAmountLossPercentage'])) {
            $config['Death']['ItemsAmountLossPercentage'] = (int) $settings['ItemsAmountLossPercentage'];
        }
        if (isset($settings['ItemsDurabilityLossPercentage'])) {
            $config['Death']['ItemsDurabilityLossPercentage'] = (int) $settings['ItemsDurabilityLossPercentage'];
        }
        if (isset($settings['DaytimeDurationSeconds'])) {
            $config['DaytimeDurationSeconds'] = (int) $settings['DaytimeDurationSeconds'];
        }
        if (isset($settings['NighttimeDurationSeconds'])) {
            $config['NighttimeDurationSeconds'] = (int) $settings['NighttimeDurationSeconds'];
        }
        if (isset($settings['IsTicking'])) {
            $config['IsTicking'] = (bool) $settings['IsTicking'];
        }
        if (isset($settings['IsSpawningNPC'])) {
            $config['IsSpawningNPC'] = (bool) $settings['IsSpawningNPC'];
        }
        if (isset($settings['IsSpawnMarkersEnabled'])) {
            $config['IsSpawnMarkersEnabled'] = (bool) $settings['IsSpawnMarkersEnabled'];
        }
        if (isset($settings['IsBlockTicking'])) {
            $config['IsBlockTicking'] = (bool) $settings['IsBlockTicking'];
        }
        if (isset($settings['IsAllNPCFrozen'])) {
            $config['IsAllNPCFrozen'] = (bool) $settings['IsAllNPCFrozen'];
        }
        if (isset($settings['PregenerateRadius'])) {
            $config['PregenerateRadius'] = (int) $settings['PregenerateRadius'];
        }
        $content = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $this->fileRepository
            ->setServer($server)
            ->putContent("/universe/worlds/{$worldName}/config.json", $content);
    }
}
