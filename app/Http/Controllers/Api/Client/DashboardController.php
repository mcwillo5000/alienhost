<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class DashboardController extends Controller
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function getCards(): JsonResponse
    {
        $cards = [];
        
        $welcome = [
            'title' => $this->settings->get('rivion:welcome_title', 'Welcome back!'),
            'message' => $this->settings->get('rivion:welcome_message', 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.')
        ];
        
        for ($i = 1; $i <= 5; $i++) {
            $cards[] = [
                'id' => $i,
                'title' => $this->settings->get("rivion:card_{$i}_title", ''),
                'description' => $this->settings->get("rivion:card_{$i}_description", ''),
                'icon' => $this->settings->get("rivion:card_{$i}_icon", ''),
                'link' => $this->settings->get("rivion:card_{$i}_link", '')
            ];
        }
        
        return response()->json([
            'welcome' => $welcome,
            'cards' => $cards
        ]);
    }
}