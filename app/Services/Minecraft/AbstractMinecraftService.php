<?php

namespace Pterodactyl\Services\Minecraft;

use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

abstract class AbstractMinecraftService
{
    protected string $userAgent;

    public function __construct(protected DaemonFileRepository $daemonFileRepository)
    {
        $this->userAgent = config('app.name') . '/' . config('app.version') . ' (' . url('/') . ')';
    }

    /**
     * Returns normalized mod versions from $paths hashes.
     *
     * @param  string[]  $paths
     */
    abstract public function getModsVersions(Server $server, array $paths, ?array $serverBuildInfo = null): array;
}
