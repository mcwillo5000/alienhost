<?php

namespace Pterodactyl\Http\Middleware;

use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @throws AccessDeniedHttpException
     */
    public function handle(Request $request, \Closure $next): mixed
    {
        $user = $request->user();

        if (!$user) {
            throw new AccessDeniedHttpException();
        }

        // Root admins always have full access.
        if ($user->root_admin) {
            return $next($request);
        }

        // Check if the user has an advanced role assigned.
        if (!$user->adv_role_id) {
            throw new AccessDeniedHttpException();
        }

        $role = \Pterodactyl\Models\AdvancedRole::find($user->adv_role_id);
        if (!$role) {
            throw new AccessDeniedHttpException();
        }

        $currentRoute = $request->route()?->getName() ?? '';

        // Only the overview is always accessible to role users as a landing page.
        if ($currentRoute === 'admin.index') {
            return $next($request);
        }

        // Check if the current route's prefix matches any allowed route in the role.
        foreach ($role->admin_routes ?? [] as $prefix) {
            if ($currentRoute === $prefix || str_starts_with($currentRoute, $prefix . '.')) {
                return $next($request);
            }
        }

        throw new AccessDeniedHttpException();
    }
}
