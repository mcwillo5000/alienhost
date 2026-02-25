<?php

namespace Pterodactyl\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Files\FilesPermissions;
use Pterodactyl\Transformers\Api\Client\FileObjectTransformer;

class CheckFileAccess
{
    public function __construct(private FilesPermissions $filesPermissions, private DaemonFileRepository $fileRepository)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $server = $request->route()->parameter('server');

        if($user->root_admin) {
            return $next($request);
        }

        $fileRep = $this->fileRepository->setServer($server);
        $permissions = $this->filesPermissions->getPermissionsObject($user, $server);

        // Read, Download, Write File
        if($request->input('file')) {
            $response = $fileRep->verifyAccess($request->input('file'), null, $permissions);

            if(!$response['access']) {
                return new Response([
                    'error' => 'You do not have permission to access this file.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        // Create directory
        if($request->input('name') && $request->input('root')) {
            $file = preg_replace('/\/+/', '/', $request->input('root') . '/' . $request->input('name'));

            $response = $fileRep->verifyAccess($file, null, $permissions);

            if(!$response['access']) {
                return new Response([
                    'error' => 'You do not have permission to access this file.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        // Pull
        if($request->input('directory')) {
            $response = $fileRep->verifyAccess($request->input('directory'), null, $permissions);

            if(!$response['access']) {
                return new Response([
                    'error' => 'You do not have permission to access this file.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        // Move, chmod, rename
        if($request->input("files") && is_array($request->input("files")[0])) {
            $files = $request->input("files");
            $root = preg_replace('/\/+/', '/', $request->input('root') . '/');
            foreach($files as $items) {
                if(isset($items['from']) && isset($items['to'])) {
                    $from = $root . $items['from'];
                    $to = $root . $items['to'];

                    $fromAccess = $fileRep->verifyAccess($from, null, $permissions);
                    $toAccess = $fileRep->verifyAccess($to, null, $permissions);

                    if(!$fromAccess['access'] || !$toAccess['access']) {
                        return new Response([
                            'error' => 'You do not have permission to access this file.',
                        ], Response::HTTP_FORBIDDEN);
                    }
                } elseif (isset($items['file']) && isset($items['mode'])) {
                    $file = $root . $items['file'];

                    $fileAccess = $fileRep->verifyAccess($file, null, $permissions);

                    if(!$fileAccess['access']) {
                        return new Response([
                            'error' => 'You do not have permission to access this file.',
                        ], Response::HTTP_FORBIDDEN);
                    }
                }
            }
        }

        // Copy
        if($request->input("location")) {
            $response = $fileRep->verifyAccess($request->input('location'), null, $permissions);

            if(!$response['access']) {
                return new Response([
                    'error' => 'You do not have permission to access this file.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        return $next($request);
    }
}
