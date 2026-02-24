<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
use Pterodactyl\Http\Requests\Api\Client\Servers\Files\FolderSizeRequest;

class FolderSizeController extends ClientApiController
{
    /**
     * @param DaemonFileRepository $fileRepository
     */
    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    /**
     * @param FolderSizeRequest $request
     * @param Server $server
     * @return JsonResponse
     * @throws DisplayException
     */
    public function getFolderSize(FolderSizeRequest $request, Server $server): JsonResponse
    {
        $this->validate($request, [
            'folder' => ['required', 'string'],
        ]);

        try {
            $response = $this->fileRepository->setServer($server)->getFolderSize($request->input('folder'));
        } catch (GuzzleException|DaemonConnectionException $e) {
            throw new DisplayException('Failed to get folder size. Please try again later...');
        }

        $size = json_decode($response->getBody(), true)['size'] ?? 0;

        return response()->json([
            'success' => true,
            'size' => $size,
        ]);
    }
}