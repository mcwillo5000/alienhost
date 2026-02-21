<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Repositories\Wings\DaemonCommandRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\HytalePlayerManager\GetHytaleDataRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\HytalePlayerManager\UpdateHytaleDataRequest;
class HytalePlayerManagerController extends ClientApiController
{
    private const PERMISSIONS_FILE = '/permissions.json';
    private const WHITELIST_FILE = '/whitelist.json';
    private const BANS_FILE = '/bans.json';
    private const PLAYERS_DIR = '/universe/players';
    public function __construct(
        private DaemonFileRepository $fileRepository,
        private DaemonCommandRepository $commandRepository,
    ) {
        parent::__construct();
    }
    /**
     * Get permissions data from permissions.json
     */
    public function getPermissions(GetHytaleDataRequest $request, Server $server): JsonResponse
    {
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
            return new JsonResponse([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => true,
                'data' => ['users' => [], 'groups' => []],
            ]);
        }
    }
    /**
     * Update permissions data
     */
    public function updatePermissions(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $data = $request->input('data');
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.update')->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Create a new permission group
     */
    public function createGroup(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $groupName = $request->input('name');
        $permissions = $request->input('permissions', []);
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
            $data = ['users' => [], 'groups' => []];
        }
        $data['groups'][$groupName] = $permissions;
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.group.create')
            ->property('group', $groupName)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Update a permission group
     */
    public function updateGroup(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $groupName = $request->input('name');
        $permissions = $request->input('permissions', []);
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
            $data = ['users' => [], 'groups' => []];
        }
        $data['groups'][$groupName] = $permissions;
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.group.update')
            ->property('group', $groupName)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Delete a permission group
     */
    public function deleteGroup(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $groupName = $request->input('name');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
            $data = ['users' => [], 'groups' => []];
        }
        unset($data['groups'][$groupName]);
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.group.delete')
            ->property('group', $groupName)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Add player to a permission group
     */
    public function addPlayerToGroup(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        $groupName = $request->input('group');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
            $data = ['users' => [], 'groups' => []];
        }
        if (!isset($data['users'][$playerUuid])) {
            $data['users'][$playerUuid] = ['groups' => []];
        }
        if (!isset($data['users'][$playerUuid]['groups'])) {
            $data['users'][$playerUuid]['groups'] = [];
        }
        if (!in_array($groupName, $data['users'][$playerUuid]['groups'])) {
            $data['users'][$playerUuid]['groups'][] = $groupName;
        }
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.player.add')
            ->property('player', $playerUuid)
            ->property('group', $groupName)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Remove player from a permission group
     */
    public function removePlayerFromGroup(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        $groupName = $request->input('group');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $data = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
            $data = ['users' => [], 'groups' => []];
        }
        if (isset($data['users'][$playerUuid])) {
            if (!isset($data['users'][$playerUuid]['groups'])) {
                $data['users'][$playerUuid]['groups'] = [];
            }
            $data['users'][$playerUuid]['groups'] = array_values(array_filter(
                $data['users'][$playerUuid]['groups'],
                fn($g) => $g !== $groupName
            ));
            if (empty($data['users'][$playerUuid]['groups'])) {
                unset($data['users'][$playerUuid]);
            }
        }
        $this->fileRepository->setServer($server)->putContent(
            self::PERMISSIONS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.permissions.player.remove')
            ->property('player', $playerUuid)
            ->property('group', $groupName)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Get whitelist data from whitelist.json
     */
    public function getWhitelist(GetHytaleDataRequest $request, Server $server): JsonResponse
    {
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::WHITELIST_FILE);
            $data = json_decode($content, true) ?? ['enabled' => false, 'list' => []];
            return new JsonResponse([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => true,
                'data' => ['enabled' => false, 'list' => []],
            ]);
        }
    }
    /**
     * Toggle whitelist enabled/disabled
     */
    public function toggleWhitelist(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $enabled = $request->input('enabled', false);
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::WHITELIST_FILE);
            $data = json_decode($content, true) ?? ['enabled' => false, 'list' => []];
        } catch (\Exception $e) {
            $data = ['enabled' => false, 'list' => []];
        }
        $data['enabled'] = $enabled;
        $this->fileRepository->setServer($server)->putContent(
            self::WHITELIST_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.whitelist.toggle')
            ->property('enabled', $enabled)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Add player to whitelist
     */
    public function addToWhitelist(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::WHITELIST_FILE);
            $data = json_decode($content, true) ?? ['enabled' => false, 'list' => []];
        } catch (\Exception $e) {
            $data = ['enabled' => false, 'list' => []];
        }
        if (!in_array($playerUuid, $data['list'])) {
            $data['list'][] = $playerUuid;
        }
        $this->fileRepository->setServer($server)->putContent(
            self::WHITELIST_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.whitelist.add')
            ->property('player', $playerUuid)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Remove player from whitelist
     */
    public function removeFromWhitelist(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::WHITELIST_FILE);
            $data = json_decode($content, true) ?? ['enabled' => false, 'list' => []];
        } catch (\Exception $e) {
            $data = ['enabled' => false, 'list' => []];
        }
        $data['list'] = array_values(array_filter($data['list'], fn($uuid) => $uuid !== $playerUuid));
        $this->fileRepository->setServer($server)->putContent(
            self::WHITELIST_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.whitelist.remove')
            ->property('player', $playerUuid)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Get bans data from bans.json
     */
    public function getBans(GetHytaleDataRequest $request, Server $server): JsonResponse
    {
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::BANS_FILE);
            $data = json_decode($content, true) ?? [];
            return new JsonResponse([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => true,
                'data' => [],
            ]);
        }
    }
    /**
     * Add player to ban list
     */
    public function addBan(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        $reason = $request->input('reason', 'No reason provided');
        $bannedBy = $request->input('banned_by', '00000000-0000-0000-0000-000000000000');
        $type = $request->input('type', 'infinite');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::BANS_FILE);
            $data = json_decode($content, true) ?? [];
        } catch (\Exception $e) {
            $data = [];
        }
        $data = array_values(array_filter($data, fn($ban) => $ban['target'] !== $playerUuid));
        $data[] = [
            'type' => $type,
            'target' => $playerUuid,
            'by' => $bannedBy,
            'timestamp' => (int)(microtime(true) * 1000),
            'reason' => $reason,
        ];
        $this->fileRepository->setServer($server)->putContent(
            self::BANS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.ban.add')
            ->property('player', $playerUuid)
            ->property('reason', $reason)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Remove player from ban list
     */
    public function removeBan(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::BANS_FILE);
            $data = json_decode($content, true) ?? [];
        } catch (\Exception $e) {
            $data = [];
        }
        $data = array_values(array_filter($data, fn($ban) => $ban['target'] !== $playerUuid));
        $this->fileRepository->setServer($server)->putContent(
            self::BANS_FILE,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        Activity::event('server:hytale.ban.remove')
            ->property('player', $playerUuid)
            ->log();
        return new JsonResponse([
            'success' => true,
            'data' => $data,
        ]);
    }
    /**
     * Get all Hytale player manager data at once
     */
    public function getAllData(GetHytaleDataRequest $request, Server $server): JsonResponse
    {
        $permissions = ['users' => [], 'groups' => []];
        $whitelist = ['enabled' => false, 'list' => []];
        $bans = [];
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::PERMISSIONS_FILE);
            $permissions = json_decode($content, true) ?? ['users' => [], 'groups' => []];
        } catch (\Exception $e) {
        }
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::WHITELIST_FILE);
            $whitelist = json_decode($content, true) ?? ['enabled' => false, 'list' => []];
        } catch (\Exception $e) {
        }
        try {
            $content = $this->fileRepository->setServer($server)->getContent(self::BANS_FILE);
            $bans = json_decode($content, true) ?? [];
        } catch (\Exception $e) {
        }
        return new JsonResponse([
            'success' => true,
            'data' => [
                'permissions' => $permissions,
                'whitelist' => $whitelist,
                'bans' => $bans,
            ],
        ]);
    }
    /**
     * Get all registered players from universe/players directory
     */
    public function getPlayers(GetHytaleDataRequest $request, Server $server): JsonResponse
    {
        $players = [];
        try {
            $directory = $this->fileRepository->setServer($server)->getDirectory(self::PLAYERS_DIR);
            foreach ($directory as $file) {
                if (str_ends_with($file['name'], '.json')) {
                    $uuid = str_replace('.json', '', $file['name']);
                    try {
                        $content = $this->fileRepository->setServer($server)->getContent(self::PLAYERS_DIR . '/' . $file['name']);
                        $playerData = json_decode($content, true);
                        if ($playerData && isset($playerData['Components'])) {
                            $components = $playerData['Components'];
                            $username = $components['Nameplate']['Text'] ?? $components['DisplayName']['DisplayName']['RawText'] ?? $uuid;
                            $position = null;
                            if (isset($components['Transform']['Position'])) {
                                $pos = $components['Transform']['Position'];
                                $position = [
                                    'x' => round($pos['X'] ?? 0, 2),
                                    'y' => round($pos['Y'] ?? 0, 2),
                                    'z' => round($pos['Z'] ?? 0, 2),
                                ];
                            }
                            $world = $components['Player']['PlayerData']['World'] ?? 'unknown';
                            $gamemode = $components['Player']['GameMode'] ?? 'unknown';
                            $stats = [
                                'oxygen' => 100,
                                'health' => 100,
                                'mana' => 0,
                                'stamina' => 10,
                            ];
                            if (isset($components['EntityStats']['Stats'])) {
                                $entityStats = $components['EntityStats']['Stats'];
                                $stats['oxygen'] = $entityStats['Oxygen']['Value'] ?? 100;
                                $stats['health'] = $entityStats['Health']['Value'] ?? 100;
                                $stats['mana'] = $entityStats['Mana']['Value'] ?? 0;
                                $stats['stamina'] = $entityStats['Stamina']['Value'] ?? 10;
                            }
                            $players[] = [
                                'uuid' => $uuid,
                                'username' => $username,
                                'position' => $position,
                                'world' => $world,
                                'gamemode' => $gamemode,
                                'stats' => $stats,
                                'modified_at' => $file['modified_at'] ?? null,
                            ];
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }
        } catch (\Exception $e) {
        }
        return new JsonResponse([
            'success' => true,
            'data' => $players,
        ]);
    }
    /**
     * Delete a player file
     */
    public function deletePlayer(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        $filePath = self::PLAYERS_DIR . '/' . $playerUuid . '.json';
        try {
            $this->fileRepository->setServer($server)->deleteFiles(self::PLAYERS_DIR, [$playerUuid . '.json']);
            Activity::event('server:hytale.player.delete')
                ->property('player', $playerUuid)
                ->log();
            return new JsonResponse([
                'success' => true,
                'message' => 'Player deleted successfully',
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Failed to delete player: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Change player gamemode
     */
    public function changePlayerGamemode(UpdateHytaleDataRequest $request, Server $server): JsonResponse
    {
        $playerUuid = $request->input('player_uuid');
        $gamemode = $request->input('gamemode');
        $playerName = $request->input('player_name');
        $filePath = self::PLAYERS_DIR . '/' . $playerUuid . '.json';
        try {
            $content = $this->fileRepository->setServer($server)->getContent($filePath);
            $data = json_decode($content, true);
            if (!$data) {
                return new JsonResponse([
                    'success' => false,
                    'error' => 'Failed to parse player data',
                ], 400);
            }
            if (isset($data['Components']['Player'])) {
                $data['Components']['Player']['GameMode'] = $gamemode;
            }
            $this->fileRepository->setServer($server)->putContent(
                $filePath,
                json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            );
            $commandSent = false;
            try {
                $command = 'gamemode ' . strtolower($gamemode) . ' ' . $playerName;
                $this->commandRepository->setServer($server)->send($command);
                $commandSent = true;
            } catch (\Exception $e) {
            }
            Activity::event('server:hytale.player.gamemode')
                ->property('player', $playerUuid)
                ->property('gamemode', $gamemode)
                ->log();
            return new JsonResponse([
                'success' => true,
                'message' => 'Gamemode updated successfully',
                'command_sent' => $commandSent,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Failed to update gamemode: ' . $e->getMessage(),
            ], 500);
        }
    }
}
