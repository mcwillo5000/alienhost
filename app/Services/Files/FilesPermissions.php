<?php

namespace Pterodactyl\Services\Files;

use AllowDynamicProperties;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Eloquent\SettingsRepository;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class FilesPermissions
{
    private SettingsRepository $settingsRepository;
    private DaemonFileRepository $fileRepository;

    public function __construct(
        SettingsRepository $settingsRepository,
        DaemonFileRepository $fileRepository
    ) {
        $this->settingsRepository = $settingsRepository;
        $this->fileRepository = $fileRepository;
    }

    public function getAdminDeny($admin = false): array
    {
        if ($admin) {
            return [];
        }
        return [
            "files" => json_decode($this->settingsRepository->get('settings::denyfiles', "[]"), true),
            "hide" => $this->settingsRepository->get('settings::hidefiles', "false") === "true"
        ];
    }

    public function getEggDeny(Egg $egg): array
    {
        return [
            "files" => $egg->denyfiles,
            "hide" => $egg->hidefiles
        ];
    }

    public function getSubuserDeny($user, $server): array
    {
        $subuser = $server->subusers()->where('user_id', $user->id)->first();
        if($subuser) {
            // If $subuser->denyfiles is string json_decode, if it's already an array, just return it
            $files = is_array($subuser->denyfiles) ? $subuser->denyfiles : json_decode($subuser->denyfiles, true);

            return [
                "files" => $files,
                "hide" => $subuser->hidefiles,
            ];
        } else {
            return [
                "files" => [],
                "hide" => "false",
            ];
        }
    }

    public function getPermissionsObject(User $user, Server $server)
    {
        if ($user->root_admin) {
            return [
                "User" => [],
                "Admin" => [],
                "Egg" => [],
                "HideFiles" => [
                    "User" => false,
                    "Admin" => false,
                    "Egg" => false
                ]
            ];
        }

        $userDeny = $this->getSubuserDeny($user, $server);
        $adminDeny = $this->getAdminDeny($user->root_admin);
        $eggDeny = $this->getEggDeny($server->egg()->first());

        return [
            "User" => $userDeny["files"],
            "Admin" => $adminDeny["files"],
            "Egg" => $eggDeny["files"],
            "HideFiles" => [
                "User" => (bool)$userDeny["hide"],
                "Admin" => (bool)$adminDeny["hide"],
                "Egg" => (bool)$eggDeny["hide"]
            ]
        ];
    }

    public function listDirectoryContent(array $contents, string $directory, User $user, Server $server) {
        if ($user->root_admin) {
            return $contents;
        }

        $obj = $this->getPermissionsObject($user, $server)["HideFiles"];

        if(($obj["User"] || $obj["Admin"] || $obj["Egg"]) && count($contents) != 0) {
            $directory = preg_replace('/\/+/', '/', $directory . '/');

            $files = array_map(function ($item) use ($directory) {
                if($item['directory']) return $directory . $item['name'] . '/';
                return $directory . $item['name'];
            }, $contents);

            $requestResult = $this->fileRepository->setServer($server)->verifyAccess(null, $files, $this->getPermissionsObject($user, $server));

            foreach ($requestResult['hidden'] as $denyFile) {
                if (($key = array_search($denyFile, $files)) !== false) {
                    unset($files[$key]);
                }
            }

            if (count($files) == 0) {
                return [];
            }

            $files = array_map(function ($item) use ($directory) {
                if (ends_with($item, '/')) $item = substr($item, 0, -1);
                if (starts_with($item, $directory)) $item = substr($item, strlen($directory));
                if (starts_with($item, '//')) $item = substr($item, 2);
                if (starts_with($item, '/')) $item = substr($item, 1);
                return $item;
            }, $files);

            $contents = array_filter($contents, function ($item) use ($files) {
                return in_array($item['name'], $files);
            });
        }

        return $contents;
    }

    public function deleteFiles(array $files, string $root, User $user, Server $server): array
    {
        if ($user->root_admin) {
            return $files;
        }
        $root = preg_replace('/\/+/', '/', $root . '/');

        $newFiles = array_map(function ($item) use ($root) {
            return array_flatten([
                $root . $item,
                $root . $item . '/'
            ]);
        }, $files);

        $newFiles = array_flatten($newFiles);
        $newFiles = $this->fileRepository->setServer($server)->verifyAccess(null, $newFiles, $this->getPermissionsObject($user, $server))['allowed'];
        $endFiles = [];

        foreach($files as $file) {
            if (in_array($root . $file, $newFiles) && in_array($root . $file . '/', $newFiles)) {
                $endFiles[] = $file;
            }
        }

        return $endFiles;
    }
}
