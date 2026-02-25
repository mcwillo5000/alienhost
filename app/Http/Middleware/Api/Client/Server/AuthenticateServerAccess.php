<?php

namespace Pterodactyl\Http\Middleware\Api\Client\Server;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Pterodactyl\Exceptions\Http\Server\ServerStateConflictException;

class AuthenticateServerAccess
{
    /**
     * Routes that this middleware should not apply to if the user is an admin.
     */
    protected array $except = [
        'api:client:server.ws',
    ];

    /**
     * AuthenticateServerAccess constructor.
     */
    public function __construct()
    {
    }

    /**
     * Authenticate that this server exists and is not suspended or marked as installing.
     */
    public function handle(Request $request, \Closure $next): mixed
    {
        /** @var \Pterodactyl\Models\User $user */
        $user = $request->user();
        $server = $request->route()->parameter('server');

        if (!$server instanceof Server) {
            throw new NotFoundHttpException(trans('exceptions.api.resource_not_found'));
        }

        $hasServerAccess = false;
        if (!$user->root_admin && $user->adv_role_id) {
            $advRole = AdvancedRole::find($user->adv_role_id);
            if ($advRole && in_array('special.server_access', $advRole->admin_routes ?? [])) {
                $hasServerAccess = true;
                if ($advRole->server_group_id && $advRole->server_group_mode) {
                    $groupServerIds = ServerGroup::find($advRole->server_group_id)
                        ?->servers()->pluck('servers.id')->all() ?? [];
                    $inGroup = in_array($server->id, $groupServerIds);
                    if ($advRole->server_group_mode === 'allow' && !$inGroup) {
                        $hasServerAccess = false;
                    } elseif ($advRole->server_group_mode === 'deny' && $inGroup) {
                        $hasServerAccess = false;
                    }
                }
            }
        }
        if ($user->id !== $server->owner_id && !$user->root_admin && !$hasServerAccess) {
            // Check for subuser status.
            if (!$server->subusers->contains('user_id', $user->id)) {
                throw new NotFoundHttpException(trans('exceptions.api.resource_not_found'));
            }
        }

        try {
            $server->validateCurrentState();
        } catch (ServerStateConflictException $exception) {
            // Still allow users to get information about their server if it is installing or
            // being transferred.
            if (!$request->routeIs('api:client:server.view')) {
                if (($server->isSuspended() || $server->node->isUnderMaintenance()) && !$request->routeIs('api:client:server.resources')) {
                    throw $exception;
                }
                if (!$user->root_admin || !$request->routeIs($this->except)) {
                    throw $exception;
                }
            }
        }

        $request->attributes->set('server', $server);

        return $next($request);
    }
}
