<?php

namespace Pterodactyl\Repositories\Wings;

use Webmozart\Assert\Assert;
use Pterodactyl\Models\Server;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\TransferException;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;

class DaemonGitRepository extends DaemonRepository
{
    /**
     * @param array $data
     * @return ResponseInterface
     * @throws DaemonConnectionException
     * @throws GuzzleException
     */
    public function clone(array $data): ResponseInterface
    {
        Assert::isInstanceOf($this->server, Server::class);

        try {
            return $this->getHttpClient()->post(
                sprintf('/api/servers/%s/files/git/clone', $this->server->uuid),
                [
                    'json' => $data
                ]
            );
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }
    }

    /**
     * @param array $data
     * @return ResponseInterface
     * @throws DaemonConnectionException
     * @throws GuzzleException
     */
    public function pull(array $data): ResponseInterface
    {
        Assert::isInstanceOf($this->server, Server::class);

        try {
            return $this->getHttpClient()->post(
                sprintf('/api/servers/%s/files/git/pull', $this->server->uuid),
                [
                    'json' => $data
                ]
            );
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }
    }
}
