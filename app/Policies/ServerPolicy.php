<?php

namespace Pterodactyl\Policies;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;

class ServerPolicy
{
    /**
     * Checks if the user has the given permission on/for the server.
     */
    protected function checkPermission(User $user, Server $server, string $permission): bool
    {
        $subuser = $server->subusers->where('user_id', $user->id)->first();
        if (!$subuser || empty($permission)) {
            return false;
        }

        return in_array($permission, $subuser->permissions);
    }

    /**
     * Runs before any of the functions are called. Used to determine if user is root admin,
     * the server owner, or has the "server_access" advanced role permission — in which case,
     * ignore subuser permission checks entirely.
     */
    public function before(User $user, string $ability, Server $server): bool
    {
        if ($user->root_admin || $server->owner_id === $user->id) {
            return true;
        }

        // Users with the "server_access" advanced role permission get full access,
        // subject to an optional server group filter.
        if ($user->adv_role_id) {
            $role = AdvancedRole::find($user->adv_role_id);
            if ($role && in_array('special.server_access', $role->admin_routes ?? [])) {
                // No group filter → full access.
                if (!$role->server_group_id || !$role->server_group_mode) {
                    return true;
                }
                // Apply group filter.
                $groupServerIds = ServerGroup::find($role->server_group_id)
                    ?->servers()->pluck('servers.id')->all() ?? [];
                $inGroup = in_array($server->id, $groupServerIds);
                if ($role->server_group_mode === 'allow' && $inGroup) {
                    return true;
                }
                if ($role->server_group_mode === 'deny' && !$inGroup) {
                    return true;
                }
                // Filtered out — fall through to checkPermission (subuser check).
            }
        }

        return $this->checkPermission($user, $server, $ability);
    }

    /**
     * This is a horrendous hack to avoid Laravel's "smart" behavior that does
     * not call the before() function if there isn't a function matching the
     * policy permission.
     */
    public function __call(string $name, mixed $arguments)
    {
        // do nothing
    }
}
