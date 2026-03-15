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
                    $serverSubPermissions = $role->server_sub_permissions;


                    if (empty($serverPermissions)) {
                        return ['*'];
                    }


                    $perms = [
                        'websocket.connect',
                        'role.server_access',
                    ];

                    $pageMap = AdvancedRole::getPagePermissionMap();
                    $actionPermissionKeys = array_flip(AdvancedRole::getValidActionPermissionKeys());

                    foreach ($serverPermissions as $pageKey) {
                        // Page visibility marker for sidebar
                        $perms[] = 'page.' . $pageKey;

                        // Auto-grant only permissions that are NOT in the action permissions pool.
                        // Permissions that ARE in the action pool must be explicitly checked.
                        foreach ($pageMap[$pageKey]['permissions'] ?? [] as $p) {
                            if (!isset($actionPermissionKeys[$p])) {
                                $perms[] = $p;
                            }
                        }
                    }

                    // Add explicitly granted action permissions
                    foreach ($serverSubPermissions ?? [] as $p) {
                        $perms[] = $p;
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
