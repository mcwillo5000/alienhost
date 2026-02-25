<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Illuminate\Encryption\Encrypter;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Wings\DaemonGitRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Files\GitRequest;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;

class GitController extends ClientApiController
{
    /**
     * @param DaemonGitRepository $daemonGitRepository
     * @param Encrypter $encrypter
     */
    public function __construct(private DaemonGitRepository $daemonGitRepository, private Encrypter $encrypter)
    {
        parent::__construct();
    }

    /**
     * @param GitRequest $request
     * @param Server $server
     * @return Response
     * @throws DisplayException
     */
    public function clone(GitRequest $request, Server $server)
    {
        $this->validate($request, [
            'root' => ['nullable', 'string'],
            'url' => ['required', 'url'],
        ]);

        if ((bool) $request->input('saveToken', false)) {
            $server->git_token = $this->encrypter->encrypt(trim($request->input('token')));
            $server->save();
        }

        // Resolve token server-side: use submitted token, or fall back to the saved one.
        // The decrypted PAT is never sent to the browser.
        $token = trim((string) $request->input('token', ''));
        if (empty($token) && !empty($server->git_token)) {
            $token = $this->encrypter->decrypt($server->git_token);
        }

        try {
            $this->daemonGitRepository->setServer($server)->clone([
                'path' => $request->input('root', '/'),
                'url' => $request->input('url'),
                'branch' => $request->input('branch'),
                'token' => $token,
            ]);
        } catch (GuzzleException|DaemonConnectionException $e) {
            throw new DisplayException('Failed to clone the repository. Please check your repository URL and access token.');
        }

        return response()->noContent();
    }

    /**
     * @param GitRequest $request
     * @param Server $server
     * @return Response
     * @throws DisplayException
     */
    public function pull(GitRequest $request, Server $server)
    {
        $this->validate($request, [
            'root' => ['nullable', 'string'],
        ]);

        if ((bool) $request->input('saveToken', false)) {
            $server->git_token = $this->encrypter->encrypt(trim($request->input('token')));
            $server->save();
        }

        // Resolve token server-side: use submitted token, or fall back to the saved one.
        $token = trim((string) $request->input('token', ''));
        if (empty($token) && !empty($server->git_token)) {
            $token = $this->encrypter->decrypt($server->git_token);
        }

        try {
            $this->daemonGitRepository->setServer($server)->pull([
                'path' => $request->input('root', '/'),
                'token' => $token,
                'reset' => (bool) $request->input('hardReset', false),
            ]);
        } catch (GuzzleException|DaemonConnectionException $e) {
            throw new DisplayException('Failed to pull the repository. Please check your access token.');
        }

        return response()->noContent();
    }
}
