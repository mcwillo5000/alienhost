<?php

namespace Pterodactyl\BlueprintFramework\Extensions\databaseimportexport;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Database;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Facades\Activity;
use Illuminate\Contracts\Encryption\Encrypter;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\BlueprintFramework\Libraries\ExtensionLibrary\Client\BlueprintClientLibrary;
use Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Requests\DatabaseExportRequest;
use Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Requests\DatabaseImportRequest;
use Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Requests\DatabaseImportRemoteRequest;
use Pterodactyl\BlueprintFramework\Extensions\databaseimportexport\Dependencies\Ifsnop\Mysqldump\Mysqldump;

class DatabaseController extends ClientApiController
{
    public function __construct(
        private Encrypter $encrypter,
        private BlueprintClientLibrary $blueprint,
    ) {
        parent::__construct();
    }

    private function wipe(Database $database)
    {
        $conn = new Mysqldump(
            sprintf(
                'mysql:host=%s;port=%s;dbname=%s',
                $database->host->host,
                $database->host->port,
                $database->database,
            ),
            $database->username,
            $this->encrypter->decrypt($database->password),
            [
                'add-drop-table' => true,
                'if-not-exists' => true,
                'add-locks' => true,
                'complete-insert' => true,
                'disable-keys' => true,
                'extended-insert' => true,
                'lock-tables' => true,
                'skip-comments' => true,
                'skip-tz-utc' => false,
                'routines' => true,
                'events' => true,
            ]
        );

        $conn->wipe();
    }

    public function index(Request $request, Server $server, Database $database)
    {
        return [
            'disableRemoteImport' => $this->blueprint->dbGet('databaseimportexport', 'allow_remote_import') === '0',
        ];
    }

    public function export(DatabaseExportRequest $request, Server $server, Database $database)
    {
        set_time_limit(300);

        $maxExportSize = (int) $this->blueprint->dbGet('databaseimportexport', 'max_export_size') ?: 50;

        try {
            $dump = new Mysqldump(
                sprintf(
                    'mysql:host=%s;port=%s;dbname=%s',
                    $database->host->host,
                    $database->host->port,
                    $database->database,
                ),
                $database->username,
                $this->encrypter->decrypt($database->password),
                [
                    'add-drop-table' => true,
                    'if-not-exists' => true,
                    'add-locks' => true,
                    'complete-insert' => true,
                    'disable-keys' => true,
                    'extended-insert' => true,
                    'lock-tables' => true,
                    'skip-comments' => true,
                    'skip-tz-utc' => false,
                    'routines' => true,
                    'events' => true,
                ],
            );

            if ($dump->dbSize() > ($maxExportSize * 1024 * 1024)) {
                new JsonResponse([
                    'error' => 'The database you are trying to export exceeds the maximum allowed size of ' . $maxExportSize . 'MB.',
                ], 400);
            }

            $tmpDir = storage_path('extensions/databaseimportexport');
            $tmpFile = sprintf('%s/%s-%s.sql', $tmpDir, $database->database, time());
            $dump->start($tmpFile);

            Activity::event('server:database.export')
                ->subject($database)
                ->property('name', $database->database)
                ->log();

            return response()->file($tmpFile)->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            return new JsonResponse([
                'error' => $exception->getMessage(),
            ], 400);
        }
    }

    public function import(DatabaseImportRequest $request, Server $server, Database $database): JsonResponse
    {
        set_time_limit(300);

        $maxImportSize = (int) $this->blueprint->dbGet('databaseimportexport', 'max_import_size') ?: 20;
        $wipe = $request->query('wipe', 'false') === 'true';

        $tmpDir = storage_path('extensions/databaseimportexport');
        $tmpFile = sprintf('%s/%s-%s.sql', $tmpDir, $database->database, time());

        file_put_contents($tmpFile, '');

        try {
            $writeStream = fopen($tmpFile, 'wb');
            $readStream = fopen('php://input', 'rb');

            $strlen = 0;
            $exceeded = false;
            while (!feof($readStream)) {
                $data = fread($readStream, 1024);
                $strlen += strlen($data);
                fwrite($writeStream, $data);

                if ($strlen > ($maxImportSize * 1024 * 1024)) {
                    $exceeded = true;
                    break;
                }
            }

            fclose($readStream);
            fclose($writeStream);

            if ($exceeded) {
                return new JsonResponse([
                    'error' => 'The database you are trying to import exceeds the maximum allowed size of ' . $maxImportSize . 'MB.',
                ], 400);
            }

            if ($wipe) {
                $this->wipe($database);
            }

            $restore = new Mysqldump(
                sprintf(
                    'mysql:host=%s;port=%s;dbname=%s',
                    $database->host->host,
                    $database->host->port,
                    $database->database,
                ),
                $database->username,
                $this->encrypter->decrypt($database->password),
                [
                    'skip-comments' => true,
                ]
            );

            $restore->restore($tmpFile);
        } catch (\Throwable $exception) {
            return new JsonResponse([
                'error' => $exception->getMessage(),
            ], 400);
        } finally {
            try {
                unlink($tmpFile);
            } catch (\Throwable $e) {}
        }

        Activity::event('server:database.import')
            ->subject($database)
            ->property('name', $database->database)
            ->property('wipe', $wipe)
            ->property('characters', $strlen)
            ->log();

        return new JsonResponse([], 204);
    }

    public function importRemote(DatabaseImportRemoteRequest $request, Server $server, Database $database): JsonResponse
    {
        set_time_limit(300);

        $data = $request->validated();

        if ($this->blueprint->dbGet('databaseimportexport', 'allow_remote_import') === '0') {
            return response()->json([
                'error' => 'Remote database imports are currently disabled.',
            ], 400);
        }

        $maxImportSize = (int) $this->blueprint->dbGet('databaseimportexport', 'max_import_size') ?: 20;

        $tmpDir = storage_path('extensions/databaseimportexport');
        $tmpFile = sprintf('%s/%s-%s.sql', $tmpDir, $database->database, time());

        try {
            $dump = new Mysqldump(
                sprintf(
                    'mysql:host=%s;port=%s;dbname=%s',
                    $data['host'],
                    $data['port'],
                    $data['database'],
                ),
                $data['username'],
                $data['password'],
                [
                    'add-drop-table' => true,
                    'if-not-exists' => true,
                    'add-locks' => true,
                    'complete-insert' => true,
                    'disable-keys' => true,
                    'extended-insert' => true,
                    'lock-tables' => true,
                    'skip-comments' => true,
                    'skip-tz-utc' => false,
                    'routines' => true,
                    'events' => true,
                ]
            );

            if ($dump->dbSize() > ($maxImportSize * 1024 * 1024)) {
                return new JsonResponse([
                    'error' => 'The database you are trying to import exceeds the maximum allowed size of ' . $maxImportSize . 'MB.',
                ], 400);
            }

            $dump->start($tmpFile);
            if ($data['wipe']) {
                $this->wipe($database);
            }

            $restore = new Mysqldump(
                sprintf(
                    'mysql:host=%s;port=%s;dbname=%s',
                    $database->host->host,
                    $database->host->port,
                    $database->database,
                ),
                $database->username,
                $this->encrypter->decrypt($database->password),
                [
                    'skip-comments' => true,
                ]
            );

            $restore->restore($tmpFile);
        } catch (\Throwable $exception) {
            return new JsonResponse([
                'error' => $exception->getMessage(),
            ], 400);
        } finally {
            try {
                unlink($tmpFile);
            } catch (\Throwable $e) {}
        }

        Activity::event('server:database.import-remote')
            ->subject($database)
            ->property('name', $database->database)
            ->property('wipe', $data['wipe'])
            ->property('host', $data['host'])
            ->property('port', $data['port'])
            ->property('database', $data['database'])
            ->property('username', $data['username'])
            ->log();

        return new JsonResponse([], 204);
    }
}
