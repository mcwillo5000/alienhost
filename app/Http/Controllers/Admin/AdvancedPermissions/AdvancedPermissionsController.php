<?php

namespace Pterodactyl\Http\Controllers\Admin\AdvancedPermissions;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class AdvancedPermissionsController extends Controller
{
    public function __construct(private AlertsMessageBag $alert)
    {
    }

    /**
     * Display the roles index page.
     */
    public function index(): View
    {
        $roles = AdvancedRole::withCount('users')->latest()->paginate(20);

        return view('admin.advanced-permissions.index', compact('roles'));
    }

    /**
     * Display the create role form.
     */
    public function create(): View
    {
        return view('admin.advanced-permissions.create', [
            'sections'      => AdvancedRole::$availableSections,
            'serverGroups'  => ServerGroup::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string|max:1000',
            'admin_routes'      => 'nullable|array',
            'admin_routes.*'    => 'string',
            'server_group_id'   => 'nullable|integer|exists:server_groups,id',
            'server_group_mode' => 'nullable|in:allow,deny',
        ]);

        $adminRoutes = $request->input('admin_routes', []);

        // Only store a group filter if Server Access is enabled.
        $groupId   = in_array('special.server_access', $adminRoutes)
            ? $request->input('server_group_id')
            : null;
        $groupMode = ($groupId && $request->filled('server_group_mode'))
            ? $request->input('server_group_mode')
            : null;

        $role = AdvancedRole::create([
            'name'              => $request->input('name'),
            'description'       => $request->input('description'),
            'admin_routes'      => $adminRoutes,
            'server_group_id'   => $groupId,
            'server_group_mode' => $groupMode,
        ]);

        $this->alert->success('Role "' . $role->name . '" was created successfully.')->flash();

        return redirect()->route('admin.advanced-permissions.edit', $role->id);
    }

    /**
     * Display the edit role form.
     */
    public function edit(int $id): View
    {
        $role          = AdvancedRole::findOrFail($id);
        $assignedUsers = $role->users()->select(['id', 'username', 'email', 'name_first', 'name_last'])->get();
        $serverGroups  = ServerGroup::orderBy('name')->get(['id', 'name']);

        return view('admin.advanced-permissions.edit', [
            'role'          => $role,
            'sections'      => AdvancedRole::$availableSections,
            'assignedUsers' => $assignedUsers,
            'serverGroups'  => $serverGroups,
        ]);
    }

    /**
     * Update an existing role.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $role = AdvancedRole::findOrFail($id);

        $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string|max:1000',
            'admin_routes'      => 'nullable|array',
            'admin_routes.*'    => 'string',
            'server_group_id'   => 'nullable|integer|exists:server_groups,id',
            'server_group_mode' => 'nullable|in:allow,deny',
        ]);

        $adminRoutes = $request->input('admin_routes', []);

        // Only persist a group filter when Server Access is enabled.
        $groupId   = in_array('special.server_access', $adminRoutes)
            ? $request->input('server_group_id')
            : null;
        $groupMode = ($groupId && $request->filled('server_group_mode'))
            ? $request->input('server_group_mode')
            : null;

        $role->update([
            'name'              => $request->input('name'),
            'description'       => $request->input('description'),
            'admin_routes'      => $adminRoutes,
            'server_group_id'   => $groupId,
            'server_group_mode' => $groupMode,
        ]);

        $this->alert->success('Role "' . $role->name . '" was updated successfully.')->flash();

        return redirect()->route('admin.advanced-permissions.edit', $role->id);
    }

    /**
     * Delete a role. Will unset adv_role_id on all assigned users first.
     */
    public function destroy(int $id): RedirectResponse
    {
        $role = AdvancedRole::findOrFail($id);

        // Detach all users before deleting (foreign key is set to nullOnDelete,
        // but we do it explicitly so the flash message count is accurate).
        $userCount = $role->users()->count();
        User::where('adv_role_id', $role->id)->update(['adv_role_id' => null]);

        $role->delete();

        $this->alert->success("Role was deleted. {$userCount} user(s) had their role removed.")->flash();

        return redirect()->route('admin.advanced-permissions');
    }

    /**
     * Search users by username or email (AJAX).
     * Returns JSON for the live-search in the edit view.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $query  = trim($request->input('q', ''));
        $roleId = (int) $request->input('role_id', 0);

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::where(function ($q) use ($query) {
            $q->where('username', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%");
        })
        ->select(['id', 'username', 'email', 'name_first', 'name_last', 'adv_role_id', 'root_admin'])
        ->limit(10)
        ->get()
        ->map(fn (User $u) => [
            'id'            => $u->id,
            'username'      => $u->username,
            'email'         => $u->email,
            'name'          => trim($u->name_first . ' ' . $u->name_last),
            'md5'           => md5(strtolower($u->email)),
            'root_admin'    => (bool) $u->root_admin,
            'assigned_here' => $roleId > 0 && (int) $u->adv_role_id === $roleId,
            'has_role'      => !is_null($u->adv_role_id),
        ]);

        return response()->json($users);
    }

    /**
     * Assign a user to a role.
     */
    public function assignUser(Request $request, int $id): JsonResponse
    {
        $role = AdvancedRole::findOrFail($id);

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = User::findOrFail($request->input('user_id'));

        // Prevent assigning root admins a role (they bypass everything anyway)
        if ($user->root_admin) {
            return response()->json(['message' => 'Root admins cannot be assigned a role — they already have full access.'], 422);
        }

        $user->update(['adv_role_id' => $role->id]);

        return response()->json([
            'success'  => true,
            'message'  => "User \"{$user->username}\" was assigned to this role.",
            'user'     => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'name'     => trim($user->name_first . ' ' . $user->name_last),
            ],
        ]);
    }

    /**
     * Remove a user from a role (clears adv_role_id).
     */
    public function removeUser(int $id, int $userId): JsonResponse
    {
        $role = AdvancedRole::findOrFail($id);

        $user = User::where('id', $userId)
            ->where('adv_role_id', $role->id)
            ->firstOrFail();

        $user->update(['adv_role_id' => null]);

        return response()->json([
            'success' => true,
            'message' => "User \"{$user->username}\" was removed from this role.",
        ]);
    }
}
