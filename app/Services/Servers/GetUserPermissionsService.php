<?php

namespace Pterodactyl\Services\Servers;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;

class GetUserPermissionsService
{
    public function handle(Server $server, User $user): array
    {
        if ($user->root_admin || $user->id === $server->owner_id) {
            $permissions = ['*'];

            if ($user->root_admin) {
                $permissions[] = 'admin.websocket.errors';
                $permissions[] = 'admin.websocket.install';
                $permissions[] = 'admin.websocket.transfer';
            }

            return $permissions;
        }


        if ($user->adv_role_id) {
            $role = AdvancedRole::find($user->adv_role_id);
            if ($role && in_array('special.server_access', $role->admin_routes ?? [])) {
                $hasAccess = true;
                if ($role->server_group_id && $role->server_group_mode) {
                    $groupServerIds = ServerGroup::find($role->server_group_id)
                        ?->servers()->pluck('servers.id')->all() ?? [];
                    $inGroup = in_array($server->id, $groupServerIds);
                    $hasAccess = $role->server_group_mode === 'allow' ? $inGroup : !$inGroup;
                }
                if ($hasAccess) {
                    $serverPermissions = $role->server_permissions;


                    if (empty($serverPermissions)) {
                        return ['*'];
                    }


                    $perms = [

                        'websocket.connect',
                        'control.console',
                        'control.start',
                        'control.stop',
                        'control.restart',
                        'role.server_access',
                    ];

                    $pageMap = AdvancedRole::getPagePermissionMap();

                    foreach ($serverPermissions as $pageKey) {
                        foreach ($pageMap[$pageKey]['permissions'] ?? [] as $p) {
                            $perms[] = $p;
                        }
                        $perms[] = 'page.' . $pageKey;
                    }

                    return array_values(array_unique($perms));
                }
            }
        }

        /** @var \Pterodactyl\Models\Subuser|null $subuserPermissions */
        $subuserPermissions = $server->subusers()->where('user_id', $user->id)->first();

        return $subuserPermissions ? $subuserPermissions->permissions : [];
    }
}
