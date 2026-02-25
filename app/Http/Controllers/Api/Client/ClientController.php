<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Pterodactyl\Models\AdvancedRole;
use Pterodactyl\Models\ServerGroup;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Transformers\Api\Client\ServerTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;

class ClientController extends ClientApiController
{
    /**
     * ClientController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Return all the servers available to the client making the API
     * request, including servers the user has access to as a subuser.
     */
    public function index(GetServersRequest $request): array
    {
        $user = $request->user();
        $transformer = $this->getTransformer(ServerTransformer::class);

        // Start the query builder and ensure we eager load any requested relationships from the request.
        $builder = QueryBuilder::for(
            Server::query()->with($this->getIncludesForTransformer($transformer, ['node']))
        )->allowedFilters([
            'uuid',
            'name',
            'description',
            'external_id',
            AllowedFilter::custom('*', new MultiFieldServerFilter()),
        ]);

        $type = $request->input('type');

        // Load advanced role once and check server_access + optional group filter.
        $hasServerAccess = false;
        $serverGroupIds  = null;
        $serverGroupMode = null;
        if (!$user->root_admin && $user->adv_role_id) {
            $advRole = AdvancedRole::find($user->adv_role_id);
            if ($advRole && in_array('special.server_access', $advRole->admin_routes ?? [])) {
                $hasServerAccess = true;
                if ($advRole->server_group_id && $advRole->server_group_mode) {
                    $serverGroupIds  = ServerGroup::find($advRole->server_group_id)
                        ?->servers()->pluck('servers.id')->all() ?? [];
                    $serverGroupMode = $advRole->server_group_mode;
                }
            }
        }

        if (in_array($type, ['admin', 'admin-all'])) {
            if (!$user->root_admin && !$hasServerAccess) {
                $builder->whereRaw('1 = 2');
            } else {
                $ownServerIds = $user->accessibleServers()->pluck('id')->all();
                if ($hasServerAccess && $serverGroupIds !== null) {
                    if ($serverGroupMode === 'allow') {
                        $builder->whereIn('servers.id', $serverGroupIds)
                                ->whereNotIn('servers.id', $ownServerIds);
                    } else {
                        $builder->whereNotIn('servers.id', $serverGroupIds)
                                ->whereNotIn('servers.id', $ownServerIds);
                    }
                } else {
                    $builder = $type === 'admin-all'
                        ? $builder
                        : $builder->whereNotIn('servers.id', $ownServerIds);
                }
            }
        } elseif ($type === 'owner') {
            $builder = $builder->where('servers.owner_id', $user->id);
        } else {
            $builder = $builder->whereIn('servers.id', $user->accessibleServers()->pluck('id')->all());
        }

        $servers = $builder->paginate(min($request->query('per_page', 50), 100))->appends($request->query());

        return $this->fractal->transformWith($transformer)->collection($servers)->toArray();
    }

    /**
     * Returns all the subuser permissions available on the system.
     */
    public function permissions(): array
    {
        return [
            'object' => 'system_permissions',
            'attributes' => [
                'permissions' => Permission::permissions(),
            ],
        ];
    }
}
