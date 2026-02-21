<?php

namespace Pterodactyl\Http\Controllers\Api\Remote\Servers;

use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Facades\Activity;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class CrashLogController extends Controller
{
    private ServerRepository $repository;

    private DaemonServerRepository $daemonRepository;

    public function __construct(ServerRepository $repository, DaemonServerRepository $daemonRepository)
    {
        $this->repository = $repository;
        $this->daemonRepository = $daemonRepository;
    }

    public function humanFileSize($size, $unit = '')
    {
        if ((!$unit && $size >= 1 << 30) || $unit == 'GB') {
            return number_format($size / (1 << 30), 2) . 'GB';
        }
        if ((!$unit && $size >= 1 << 20) || $unit == 'MB') {
            return number_format($size / (1 << 20), 2) . 'MB';
        }
        if ((!$unit && $size >= 1 << 10) || $unit == 'KB') {
            return number_format($size / (1 << 10), 2) . 'KB';
        }

        return number_format($size) . ' bytes';
    }

    public function stripAnsii(string $ansii)
    {
        return preg_replace('/\x1b[[][^A-Za-z]*[A-Za-z]/', '', $ansii);
    }

    public function index(Request $request, string $uuid): array
    {
        $server = $this->repository->getByUuid($uuid);
        $data = $request->input('data');
        $serverDetails = $this->daemonRepository->setServer($server)->getDetails();

        $data = '--------------------------------------------------------------------
Uploaded on: ' . Carbon::now()->toDateTimeString() . '
Server name: ' . $server->name . '
Server ID: ' . $server->uuid . '
Server node: ' . $server->node->name . '(' . $server->node_id . ')
Server Disk: ' . $this->humanFileSize(Arr::get($serverDetails, 'utilization.disk_bytes', 0)) . '
Server docker image: ' . $server->image . '
Server egg: ' . $server->egg->name . '
Server owner: ' . $server->user->username . ' (' . $server->user->id . ')
--------------------------------------------------------------------


' . $this->stripAnsii($data);
        $response = Http::withBody($data, 'text/plain')->post(env('CrashHastebin', 'https://haste.minerpl.xyz'). '/documents')->json();

        $crashlog_url = env('CrashHastebin', 'https://haste.minerpl.xyz') . '/' . $response['key'];

        Activity::event('server:crashlog')
            ->subject($server, $server)
            ->property('crashlog', $crashlog_url)
            ->log();

        $this->sendWebhook($server, $crashlog_url);

        return $response;
    }

    private function sendWebhook(Server $server, string $crashlog)
    {
        $webhooks = $server->crash_webhook;

        if (empty($webhooks)) {
            return;
        }

        if (str_contains($webhooks, 'discord')) {
            $data = $this->discordPayload($server, $crashlog);
        } else {
            $data['server'] = $server;
            unset($data['server']['node']);
            unset($data['server']['user']);
            unset($data['server']['nest']);
            unset($data['server']['egg']);

            $data['crashlog'] = $crashlog;
            $data = json_encode($data);
        }

        Http::withBody($data, 'application/json')->post($webhooks);
    }

    private function discordPayload(Server $server, string $crashlog): string
    {
        return json_encode([
            "embeds" => [
                [
                    "title" => "Crash Detected",
                    "type" => "rich",
                    "description" => "New crash detected on server `" . $server->name . "` (" . $server->uuidShort . "). Click [here](" . $crashlog . ") to view crash log.",
                    "color" => hexdec( "FF0000" ),
                    "timestamp" => Carbon::now()->toDateTimeString(),
                ]
            ]

        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
    }
}
