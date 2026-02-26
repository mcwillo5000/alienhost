<?php

namespace Pterodactyl\Policies;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;

class ServerPolicy
{

    protected function checkPermission(User $user, Server $server, string $permission): bool
    {
        $subuser = $server->subusers->where('user_id', $user->id)->first();
        if (!$subuser || empty($permission)) {
            return false;
        }

        return in_array($permission, $subuser->permissions);
    }


    public function before(User $user, string $ability, Server $server): bool
    {
        if ($user->root_admin || $server->owner_id === $user->id) {
            return true;
        }


        if ($user->adv_role_id) {
            $role = AdvancedRole::find($user->adv_role_id);
            if ($role && in_array('special.server_access', $role->admin_routes ?? [])) {

                if (!$role->server_group_id || !$role->server_group_mode) {
                    return true;
                }

                $groupServerIds = ServerGroup::find($role->server_group_id)
                    ?->servers()->pluck('servers.id')->all() ?? [];
                $inGroup = in_array($server->id, $groupServerIds);
                if ($role->server_group_mode === 'allow' && $inGroup) {
                    return true;
                }
                if ($role->server_group_mode === 'deny' && !$inGroup) {
                    return true;
                }

            }
        }

        return $this->checkPermission($user, $server, $ability);
    }


    public function __call(string $name, mixed $arguments)
    {

    }
}
