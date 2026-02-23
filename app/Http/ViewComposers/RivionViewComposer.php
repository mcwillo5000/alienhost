<?php

namespace Pterodactyl\Http\ViewComposers;

use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class RivionViewComposer
{
    public function __construct(
        protected SettingsRepositoryInterface $settings
    ) {
    }

    public function compose($view): void
    {
        $rivionConfigPath = base_path('config/rivion-theme.php');
        $rivionConfig = [];
        
        if (file_exists($rivionConfigPath)) {
            $rivionConfig = include $rivionConfigPath;
        }
        
        $dashboardData = [
            'showTopRow' => $this->settings->get('rivion:show_top_row', '1') === '1',
            'showBottomRow' => $this->settings->get('rivion:show_bottom_row', '1') === '1',
            'welcome' => [
                'title' => $this->settings->get('rivion:welcome_title', 'Welcome back!'),
                'description' => $this->settings->get('rivion:welcome_message', 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.')
            ],
            'cards' => [],
            'sidebarLinks' => [
                'newServer' => $this->settings->get('rivion:sidebar_newserver_link', ''),
                'billing' => $this->settings->get('rivion:sidebar_billing_link', ''),
                'support' => $this->settings->get('rivion:sidebar_support_link', ''),
            ]
        ];
        
        for ($i = 1; $i <= 5; $i++) {
            $dashboardData['cards'][] = [
                'id' => $i,
                'title' => $this->settings->get("rivion:card_{$i}_title", ''),
                'description' => $this->settings->get("rivion:card_{$i}_description", ''),
                'icon' => $this->settings->get("rivion:card_{$i}_icon", ''),
                'link' => $this->settings->get("rivion:card_{$i}_link", '')
            ];
        }
        
        $view->with('siteConfiguration', [
            'name' => env('APP_NAME', 'Pterodactyl'),
            'dashboardCards' => $dashboardData, 
            'theme' => [
                'light_primary' => $rivionConfig['light_primary'] ?? '#3b82f6',
                'light_secondary' => $rivionConfig['light_secondary'] ?? '#6366f1',
                'light_border' => $rivionConfig['light_border'] ?? '#e5e7eb',
                'light_text_base' => $rivionConfig['light_text_base'] ?? '#111827',
                'light_text_muted' => $rivionConfig['light_text_muted'] ?? '#6b7280',
                'light_text_inverted' => $rivionConfig['light_text_inverted'] ?? '#ffffff',
                'light_background' => $rivionConfig['light_background'] ?? '#ffffff',
                'light_background_secondary' => $rivionConfig['light_background_secondary'] ?? '#f9fafb',
                
                'dark_primary' => $rivionConfig['dark_primary'] ?? '#3b82f6',
                'dark_secondary' => $rivionConfig['dark_secondary'] ?? '#6366f1',
                'dark_border' => $rivionConfig['dark_border'] ?? '#374151',
                'dark_text_base' => $rivionConfig['dark_text_base'] ?? '#f9fafb',
                'dark_text_muted' => $rivionConfig['dark_text_muted'] ?? '#9ca3af',
                'dark_text_inverted' => $rivionConfig['dark_text_inverted'] ?? '#111827',
                'dark_background' => $rivionConfig['dark_background'] ?? '#111827',
                'dark_background_secondary' => $rivionConfig['dark_background_secondary'] ?? '#1f2937',
            ]
        ]);
    }
}