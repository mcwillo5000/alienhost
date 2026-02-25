<?php

namespace Pterodactyl\Http\Controllers\Admin\AdvancedPermissions;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\ServerGroup;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class ServerGroupController extends Controller
{
    public function __construct(private AlertsMessageBag $alert)
    {
    }

    /**
     * List all server groups.
     */
    public function index(): View
    {
        $groups = ServerGroup::withCount(['servers', 'roles'])->latest()->paginate(20);

        return view('admin.advanced-permissions.server-groups.index', compact('groups'));
    }

    /**
     * Show the create form.
     */
    public function create(): View
    {
        return view('admin.advanced-permissions.server-groups.create');
    }

    /**
     * Store a new server group.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $group = ServerGroup::create([
            'name'        => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        $this->alert->success("Server group \"{$group->name}\" was created.")->flash();

        return redirect()->route('admin.advanced-permissions.server-groups.edit', $group->id);
    }

    /**
     * Show the edit form for a server group (with server management).
     */
    public function edit(int $id): View
    {
        $group   = ServerGroup::findOrFail($id);
        $servers = $group->servers()->with('user:id,username,email')->get();
        $roles   = $group->roles()->select(['id', 'name'])->get();

        return view('admin.advanced-permissions.server-groups.edit', compact('group', 'servers', 'roles'));
    }

    /**
     * Update name / description of a server group.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $group = ServerGroup::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $group->update([
            'name'        => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        $this->alert->success("Server group \"{$group->name}\" was updated.")->flash();

        return redirect()->route('admin.advanced-permissions.server-groups.edit', $group->id);
    }

    /**
     * Delete a server group. Roles that referenced it will have server_group_id set to null
     * automatically via the foreign key onDelete('set null').
     */
    public function destroy(int $id): RedirectResponse
    {
        $group = ServerGroup::findOrFail($id);
        $name  = $group->name;
        $group->delete();

        $this->alert->success("Server group \"{$name}\" was deleted.")->flash();

        return redirect()->route('admin.advanced-permissions.server-groups');
    }

    /**
     * AJAX: Search for servers to add to a group.
     * Returns servers not yet in the group matching the search query.
     */
    public function searchServers(Request $request, int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);
        $query = trim($request->input('q', ''));

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $existingIds = $group->servers()->pluck('servers.id')->all();

        $servers = Server::where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('uuid', 'like', "%{$query}%")
                  ->orWhere('uuidShort', 'like', "%{$query}%");
                // Also match numeric ID directly
                if (is_numeric($query)) {
                    $q->orWhere('id', (int) $query);
                }
            })
            ->whereNotIn('id', $existingIds)
            ->with('user:id,username')
            ->select(['id', 'name', 'uuid', 'uuidShort', 'owner_id'])
            ->limit(10)
            ->get()
            ->map(fn (Server $s) => [
                'id'        => $s->id,
                'name'      => $s->name,
                'uuid'      => $s->uuidShort,
                'owner'     => $s->user?->username ?? '?',
            ]);

        return response()->json($servers);
    }

    /**
     * Add a server to this group.
     */
    public function addServer(Request $request, int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        $request->validate([
            'server_id' => 'required|integer|exists:servers,id',
        ]);

        $serverId = (int) $request->input('server_id');

        // Avoid duplicate pivot rows — only attach if not already present.
        if (!$group->servers()->where('server_id', $serverId)->exists()) {
            $group->servers()->attach($serverId);
        }

        $server = Server::findOrFail($serverId);

        return response()->json([
            'success' => true,
            'server'  => [
                'id'    => $server->id,
                'name'  => $server->name,
                'uuid'  => $server->uuidShort,
                'owner' => $server->user?->username ?? '?',
            ],
        ]);
    }

    /**
     * Remove a server from this group.
     */
    public function removeServer(int $id, int $serverId): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        $group->servers()->detach($serverId);

        return response()->json(['success' => true]);
    }
}
