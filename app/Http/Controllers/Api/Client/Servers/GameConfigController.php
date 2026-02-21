<?php
namespace Pterodactyl\Http\Controllers\Api\Client\Servers;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\GameConfigDefinition;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Requests\Api\Client\Servers\Files\GetFileContentsRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Files\WriteFileContentRequest;
class GameConfigController extends ClientApiController
{
    /**
     * GameConfigController constructor.
     */
    public function __construct(
        private DaemonFileRepository $fileRepository
    ) {
        parent::__construct();
    }
    /**
     * Detect the game type based on existing configuration files in the server.
     */
    public function detectGameType(Server $server): JsonResponse
    {
        $gameType = 'unknown';
        $configFiles = [];
        $gameDefinitions = $this->getAllGameDefinitions();
        $detectionResults = [];
        foreach ($gameDefinitions as $type => $files) {
            $foundFiles = $this->checkFilesExist($server, $files);
            if (count($foundFiles) > 0) {
                $detectionResults[$type] = $foundFiles;
            }
        }
        if (!empty($detectionResults)) {
            $gameType = array_key_first($detectionResults);
            $maxFiles = count($detectionResults[$gameType]);
            foreach ($detectionResults as $type => $files) {
                if (count($files) > $maxFiles) {
                    $gameType = $type;
                    $maxFiles = count($files);
                }
            }
            $configFiles = $detectionResults[$gameType];
        }
        return new JsonResponse([
            'gameType' => $gameType,
            'configFiles' => $configFiles,
            'debug' => [
                'detectionResults' => array_map(fn($files) => count($files), $detectionResults),
            ],
        ]);
    }
    /**
     * Get available config files for the detected game type.
     */
    public function getConfigFiles(GetFileContentsRequest $request, Server $server): JsonResponse
    {
        $gameType = $request->get('gameType', 'unknown');
        $gameDefinitions = $this->getAllGameDefinitions();
        $configFiles = $gameDefinitions[$gameType] ?? [];
        $availableFiles = $this->checkFilesExist($server, $configFiles);
        return new JsonResponse([
            'files' => $availableFiles,
        ]);
    }
    /**
     * Check which files exist on the server.
     */
    private function checkFilesExist(Server $server, array $files): array
    {
        $foundFiles = [];
        foreach ($files as $config) {
            try {
                $this->fileRepository->setServer($server)->getContent($config['path'], 1024);
                $foundFiles[] = $config;
            } catch (\Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException $e) {
                continue;
            } catch (\Pterodactyl\Exceptions\Http\Server\FileSizeTooLargeException $e) {
                $foundFiles[] = $config;
            } catch (\Exception $e) {
                continue;
            }
        }
        return $foundFiles;
    }
    /**
     * Get all game definitions from database.
     */
    private function getAllGameDefinitions(): array
    {
        $definitions = GameConfigDefinition::with('configFiles')->get();
        $result = [];
        foreach ($definitions as $definition) {
            $files = [];
            foreach ($definition->configFiles as $file) {
                $files[] = [
                    'path' => $file->path,
                    'name' => $file->name,
                    'type' => $file->type,
                ];
            }
            $result[$definition->game_type] = $files;
        }
        return $result;
    }
    /**
     * Get parsed config content.
     */
    public function getConfig(GetFileContentsRequest $request, Server $server): JsonResponse
    {
        $filePath = $request->get('file');
        $fileType = $request->get('type', 'properties');
        try {
            $content = $this->fileRepository->setServer($server)->getContent(
                $filePath,
                config('pterodactyl.files.max_edit_size')
            );
            $parsed = $this->parseConfig($content, $fileType);
            if (empty($parsed) && !empty($content)) {
                $parsed = ['_raw_content' => $content];
            }
            Activity::event('server:gameconfig.read')
                ->property('file', $filePath)
                ->log();
            return new JsonResponse([
                'content' => $content,
                'parsed' => $parsed,
                'type' => $fileType,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to read config file: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Update config file.
     */
    public function updateConfig(WriteFileContentRequest $request, Server $server): JsonResponse
    {
        $filePath = $request->get('file');
        $content = $request->get('content');
        try {
            $this->fileRepository->setServer($server)->putContent($filePath, $content);
            Activity::event('server:gameconfig.write')
                ->property('file', $filePath)
                ->log();
            return new JsonResponse([
                'success' => true,
                'message' => 'Config file updated successfully',
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to update config file: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Parse config content based on file type.
     */
    private function parseConfig(string $content, string $type): array
    {
        return match (strtolower($type)) {
            'properties' => $this->parseProperties($content),
            'yaml', 'yml' => $this->parseYaml($content),
            'ini' => $this->parseIni($content),
            'cfg', 'conf', 'config' => $this->parseCfg($content),
            'json' => $this->parseJson($content),
            'env' => $this->parseEnv($content),
            default => ['raw' => $content],
        };
    }
    /**
     * Parse .properties file (Minecraft).
     */
    private function parseProperties(string $content): array
    {
        $lines = explode("\n", $content);
        $config = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $config[trim($key)] = trim($value);
            }
        }
        return $config;
    }
    /**
     * Parse YAML file.
     */
    private function parseYaml(string $content): array
    {
        try {
            $parsed = \Symfony\Component\Yaml\Yaml::parse($content);
            if (!is_array($parsed)) {
                return ['value' => $parsed];
            }
            $lines = explode("\n", $content);
            $quotedValues = [];
            $currentPath = [];
            $arrayIndex = [];
            foreach ($lines as $lineNum => $line) {
                $trimmed = trim($line);
                if (empty($trimmed) || str_starts_with($trimmed, '#')) {
                    continue;
                }
                $indent = strlen($line) - strlen(ltrim($line));
                $level = $indent / 2; 
                $currentPath = array_slice($currentPath, 0, $level);
                if (preg_match('/^([^:]+):\s*(.*)$/', $trimmed, $matches)) {
                    $key = trim($matches[1]);
                    $value = $matches[2];
                    if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                        (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                        $quotedValues[implode('.', array_merge($currentPath, [$key]))] = true;
                    }
                    $currentPath[] = $key;
                    $arrayIndex[$level] = 0;
                } elseif (preg_match('/^\s*-\s*(.+)$/', $trimmed, $matches)) {
                    $value = $matches[1];
                    $parentKey = end($currentPath);
                    $currentIndex = $arrayIndex[$level] ?? 0;
                    if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                        (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                        $path = implode('.', $currentPath) . '.' . $currentIndex;
                        $quotedValues[$path] = true;
                    }
                    $arrayIndex[$level] = $currentIndex + 1;
                }
            }
            $parsed['_quoted_values'] = $quotedValues;
            return $parsed;
        } catch (\Exception $e) {
            return ['error' => 'Failed to parse YAML: ' . $e->getMessage()];
        }
    }
    /**
     * Parse INI file (Ark).
     */
    private function parseIni(string $content): array
    {
        $lines = explode("\n", $content);
        $config = [];
        $currentSection = 'general';
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, ';') || str_starts_with($line, '#')) {
                continue;
            }
            if (preg_match('/^\[(.+)\]$/', $line, $matches)) {
                $currentSection = $matches[1];
                $config[$currentSection] = [];
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                if (!isset($config[$currentSection])) {
                    $config[$currentSection] = [];
                }
                $config[$currentSection][trim($key)] = trim($value);
            }
        }
        return $config;
    }
    /**
     * Parse CFG file (Rust/FiveM/General).
     */
    private function parseCfg(string $content): array
    {
        $lines = explode("\n", $content);
        $config = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#') || str_starts_with($line, '//')) {
                continue;
            }
            if (preg_match('/^set\s+(\S+)\s+(.+)$/', $line, $matches)) {
                $config[$matches[1]] = trim($matches[2]);
                continue;
            }
            if (preg_match('/^sets\s+(\S+)\s+(.+)$/', $line, $matches)) {
                $value = trim($matches[2]);
                $isQuoted = false;
                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $isQuoted = true;
                    $value = substr($value, 1, -1);
                }
                $config['sets_' . $matches[1]] = $value;
                $config['sets_' . $matches[1] . '_quoted'] = $isQuoted;
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $cleanKey = trim($key);
                $cleanValue = trim($value);
                $isQuoted = false;
                if ((str_starts_with($cleanValue, '"') && str_ends_with($cleanValue, '"')) ||
                    (str_starts_with($cleanValue, "'") && str_ends_with($cleanValue, "'"))) {
                    $isQuoted = true;
                    $cleanValue = substr($cleanValue, 1, -1);
                }
                if (strtolower($cleanValue) === 'true') {
                    $cleanValue = true;
                } elseif (strtolower($cleanValue) === 'false') {
                    $cleanValue = false;
                }
                if (str_starts_with($cleanKey, 'sets_')) {
                    $config[$cleanKey . '_quoted'] = $isQuoted;
                }
                $config[$cleanKey] = $cleanValue;
                continue;
            }
            if (preg_match('/^([a-zA-Z0-9\._-]+)\s+"(.*)"$/', $line, $matches)) {
                $key = $matches[1];
                $value = $matches[2];
                if (strtolower($value) === 'true') {
                    $value = true;
                } elseif (strtolower($value) === 'false') {
                    $value = false;
                }
                $config[$key] = $value;
                continue;
            }
            $parts = preg_split('/\s+/', $line, 2);
            if (count($parts) >= 2) {
                $command = $parts[0];
                $args = trim($parts[1]);
                if (in_array($command, ['start', 'ensure', 'add_ace', 'add_principal', 'endpoint_add_tcp', 'endpoint_add_udp'])) {
                    if (!isset($config[$command])) {
                        $config[$command] = [];
                    }
                    $config[$command][] = $args;
                } else {
                    $config[$command] = $args;
                }
            } elseif (count($parts) === 1) {
                $config[$parts[0]] = true;
            }
        }
        return $config;
    }
    /**
     * Parse JSON file.
     */
    private function parseJson(string $content): array
    {
        try {
            $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
            return is_array($decoded) ? $decoded : ['value' => $decoded];
        } catch (\JsonException $e) {
            return ['error' => 'Failed to parse JSON: ' . $e->getMessage()];
        }
    }
    /**
     * Parse .env file.
     */
    private function parseEnv(string $content): array
    {
        $lines = explode("\n", $content);
        $config = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $value = substr($value, 1, -1);
                }
                $config[$key] = $value;
            }
        }
        return $config;
    }
}
