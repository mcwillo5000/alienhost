<?php
namespace Pterodactyl\Services\Servers;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
class HytaleConfigService
{
    public function __construct(
        private DaemonFileRepository $fileRepository
    ) {
    }
    /**
     * Get Hytale config.json contents and parse it.
     *
     * @throws DaemonConnectionException
     */
    public function getConfig(Server $server): array
    {
        try {
            $content = $this->fileRepository
                ->setServer($server)
                ->getContent('config.json', 1024 * 1024);
            $config = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON in config.json');
            }
            return [
                'serverName' => $config['ServerName'] ?? '',
                'motd' => $config['MOTD'] ?? '',
                'serverPassword' => $config['Password'] ?? '',
                'maxPlayers' => $config['MaxPlayers'] ?? 100,
                'gamemode' => $config['Defaults']['GameMode'] ?? 'Adventure',
                'worldName' => $config['Defaults']['World'] ?? 'default',
                'viewDistanceRadius' => $config['MaxViewRadius'] ?? 13,
            ];
        } catch (\Exception $e) {
            throw new DaemonConnectionException($e);
        }
    }
    /**
     * Update Hytale config.json with new settings.
     *
     * @throws DaemonConnectionException
     */
    public function updateConfig(Server $server, array $settings): void
    {
        try {
            $content = $this->fileRepository
                ->setServer($server)
                ->getContent('config.json', 1024 * 1024);
            $configObj = json_decode($content, false);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON in config.json');
            }
            $config = json_decode($content, true);
            if (isset($settings['serverName'])) {
                $config['ServerName'] = $settings['serverName'];
            }
            if (isset($settings['motd'])) {
                $config['MOTD'] = $settings['motd'];
            }
            if (isset($settings['serverPassword'])) {
                $config['Password'] = $settings['serverPassword'];
            }
            if (isset($settings['maxPlayers'])) {
                $config['MaxPlayers'] = (int) $settings['maxPlayers'];
            }
            if (isset($settings['gamemode'])) {
                if (!isset($config['Defaults'])) {
                    $config['Defaults'] = new \stdClass();
                }
                $config['Defaults']['GameMode'] = $settings['gamemode'];
            }
            if (isset($settings['worldName'])) {
                if (!isset($config['Defaults'])) {
                    $config['Defaults'] = new \stdClass();
                }
                $config['Defaults']['World'] = $settings['worldName'];
            }
            if (isset($settings['viewDistanceRadius'])) {
                $config['MaxViewRadius'] = (int) $settings['viewDistanceRadius'];
            }
            $configObj->ServerName = $config['ServerName'] ?? $configObj->ServerName;
            $configObj->MOTD = $config['MOTD'] ?? $configObj->MOTD;
            $configObj->Password = $config['Password'] ?? $configObj->Password;
            $configObj->MaxPlayers = $config['MaxPlayers'] ?? $configObj->MaxPlayers;
            $configObj->MaxViewRadius = $config['MaxViewRadius'] ?? $configObj->MaxViewRadius;
            if (isset($config['Defaults'])) {
                if (!isset($configObj->Defaults)) {
                    $configObj->Defaults = new \stdClass();
                }
                if (isset($config['Defaults']['GameMode'])) {
                    $configObj->Defaults->GameMode = $config['Defaults']['GameMode'];
                }
                if (isset($config['Defaults']['World'])) {
                    $configObj->Defaults->World = $config['Defaults']['World'];
                }
            }
            $content = json_encode($configObj, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            $this->fileRepository
                ->setServer($server)
                ->putContent('config.json', $content);
        } catch (\Exception $e) {
            throw new DaemonConnectionException($e);
        }
    }
}
