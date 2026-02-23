<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class LocalesController extends ClientApiController
{
    /**
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $localesPath = public_path('locales');
        $availableLocales = [];

        if (!is_dir($localesPath)) {
            return response()->json([
                'locales' => ['en'],
            ]);
        }

        $directories = scandir($localesPath);

        foreach ($directories as $dir) {
            if ($dir === '.' || $dir === '..' || strpos($dir, '.') === 0) {
                continue;
            }

            $dirPath = $localesPath . DIRECTORY_SEPARATOR . $dir;

            if (is_dir($dirPath) && file_exists($dirPath . DIRECTORY_SEPARATOR . 'common.json')) {
                if (preg_match('/^[a-z]{2,3}(-[a-z]{2,3})?$/i', $dir)) {
                    $availableLocales[] = strtolower($dir);
                }
            }
        }

        sort($availableLocales);

        if (empty($availableLocales)) {
            $availableLocales = ['en'];
        }

        return response()->json([
            'locales' => $availableLocales,
        ]);
    }
}
