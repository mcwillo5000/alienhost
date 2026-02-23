<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Node;
use Pterodactyl\Http\Requests\Admin\RivionSettingsFormRequest;

class RivionController extends Controller
{
    public function __construct(
        protected AlertsMessageBag $alert,
        protected ViewFactory $view,
        protected SettingsRepositoryInterface $settings,
    ) {
    }

    public function index(): View
    {
        return $this->view->make('admin.rivion.index', [
            
            'light_primary' => $this->settings->get('rivion:light_primary', '#3B82F6'),
            'light_secondary' => $this->settings->get('rivion:light_secondary', '#1E40AF'),
            'light_border' => $this->settings->get('rivion:light_border', '#E5E7EB'),
            'light_text_base' => $this->settings->get('rivion:light_text_base', '#111827'),
            'light_text_muted' => $this->settings->get('rivion:light_text_muted', '#6B7280'),
            'light_text_inverted' => $this->settings->get('rivion:light_text_inverted', '#FFFFFF'),
            'light_background' => $this->settings->get('rivion:light_background', '#FFFFFF'),
            'light_background_secondary' => $this->settings->get('rivion:light_background_secondary', '#F9FAFB'),
            
            
            'dark_primary' => $this->settings->get('rivion:dark_primary', '#3B82F6'),
            'dark_secondary' => $this->settings->get('rivion:dark_secondary', '#1E40AF'),
            'dark_border' => $this->settings->get('rivion:dark_border', '#374151'),
            'dark_text_base' => $this->settings->get('rivion:dark_text_base', '#F9FAFB'),
            'dark_text_muted' => $this->settings->get('rivion:dark_text_muted', '#9CA3AF'),
            'dark_text_inverted' => $this->settings->get('rivion:dark_text_inverted', '#111827'),
            'dark_background' => $this->settings->get('rivion:dark_background', '#111827'),
            'dark_background_secondary' => $this->settings->get('rivion:dark_background_secondary', '#1F2937'),
            
            
            'default_theme' => $this->settings->get('rivion:default_theme', 'dark'),
            'disable_theme_toggle' => $this->settings->get('rivion:disable_theme_toggle', '0'),
        ]);
    }


    public function update(RivionSettingsFormRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('rivion:' . $key, $value);
        }
        
        if (!$request->has('disable_theme_toggle')) {
            $this->settings->set('rivion:disable_theme_toggle', '0');
        } else {
            $this->settings->set('rivion:disable_theme_toggle', '1');
        }

        $this->alert->success('Rivion theme settings have been updated successfully.')->flash();

        return redirect()->route('admin.rivion');
    }

    public function eggs(): View
    {

        $nests = Nest::with(['eggs' => function ($query) {
            $query->select('id', 'nest_id', 'name', 'image')->orderBy('name');
        }])->orderBy('name')->get();
        
        return $this->view->make('admin.rivion.eggs', [
            'nests' => $nests,
        ]);
    }


    public function updateEggs(RivionSettingsFormRequest $request): RedirectResponse
    {
        $settings = $request->normalize();
        

        if (isset($settings['egg_images']) && is_array($settings['egg_images'])) {
            foreach ($settings['egg_images'] as $eggId => $imageUrl) {

                Egg::where('id', $eggId)
                   ->whereNotNull('config_files') 
                   ->update(['image' => $imageUrl ?: null]);
            }
        }
        
        $this->alert->success('Rivion egg settings have been updated successfully.')->flash();
        
        return redirect()->route('admin.rivion.eggs');
    }


    public function dashboard(): View
    {
        $settings = [
            'welcome_title' => $this->settings->get('rivion:welcome_title', 'Welcome back!'),
            'welcome_message' => $this->settings->get('rivion:welcome_message', 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.'),
        ];
        

        $settings['sidebar_newserver_link'] = $this->settings->get('rivion:sidebar_newserver_link', '');
        $settings['sidebar_billing_link'] = $this->settings->get('rivion:sidebar_billing_link', '');
        $settings['sidebar_support_link'] = $this->settings->get('rivion:sidebar_support_link', '');
        
        for ($i = 1; $i <= 5; $i++) {
            $settings["card_{$i}_title"] = $this->settings->get("rivion:card_{$i}_title", '');
            $settings["card_{$i}_description"] = $this->settings->get("rivion:card_{$i}_description", '');
            $settings["card_{$i}_icon"] = $this->settings->get("rivion:card_{$i}_icon", '');
            $settings["card_{$i}_link"] = $this->settings->get("rivion:card_{$i}_link", '');
        }
        
        for ($i = 1; $i <= 2; $i++) {
            $settings["button_{$i}_icon"] = $this->settings->get("rivion:button_{$i}_icon", '');
            $settings["button_{$i}_text"] = $this->settings->get("rivion:button_{$i}_text", '');
            $settings["button_{$i}_link"] = $this->settings->get("rivion:button_{$i}_link", '');
        }
        
        $settings['show_top_row'] = $this->settings->get('rivion:show_top_row', '1');
        $settings['show_bottom_row'] = $this->settings->get('rivion:show_bottom_row', '1');
        $settings['hide_serverinfo_image'] = $this->settings->get('rivion:hide_serverinfo_image', '0');
        
        return $this->view->make('admin.rivion.dashboard', [
            'settings' => $settings,
        ]);
    }

    public function updateDashboard(Request $request): RedirectResponse
    {
        $request->validate([
            'welcome_title' => 'nullable|string|max:255',
            'welcome_message' => 'nullable|string|max:1000',
            'card_1_title' => 'nullable|string|max:255',
            'card_1_description' => 'nullable|string|max:255',
            'card_1_icon' => 'nullable|string|max:50',
            'card_1_link' => 'nullable|url|max:255',
            'card_2_title' => 'nullable|string|max:255',
            'card_2_description' => 'nullable|string|max:255',
            'card_2_icon' => 'nullable|string|max:50',
            'card_2_link' => 'nullable|url|max:255',
            'card_3_title' => 'nullable|string|max:255',
            'card_3_description' => 'nullable|string|max:255',
            'card_3_icon' => 'nullable|string|max:50',
            'card_3_link' => 'nullable|url|max:255',
            'card_4_title' => 'nullable|string|max:255',
            'card_4_description' => 'nullable|string|max:255',
            'card_4_icon' => 'nullable|string|max:50',
            'card_4_link' => 'nullable|url|max:255',
            'card_5_title' => 'nullable|string|max:255',
            'card_5_description' => 'nullable|string|max:255',
            'card_5_icon' => 'nullable|string|max:50',
            'card_5_link' => 'nullable|url|max:255',
            'button_1_icon' => 'nullable|string|max:50',
            'button_1_text' => 'nullable|string|max:255',
            'button_1_link' => 'nullable|url|max:255',
            'button_2_icon' => 'nullable|string|max:50',
            'button_2_text' => 'nullable|string|max:255',
            'button_2_link' => 'nullable|url|max:255',
            
            'sidebar_newserver_link' => 'nullable|url|max:255',
            'sidebar_billing_link' => 'nullable|url|max:255',
            'sidebar_support_link' => 'nullable|url|max:255',
            
            'show_top_row' => 'nullable|in:0,1',
            'show_bottom_row' => 'nullable|in:0,1',
            'hide_serverinfo_image' => 'nullable|in:0,1',
        ]);
        
        $data = $request->all();
        
        $this->settings->set('rivion:welcome_title', $data['welcome_title'] ?? 'Welcome back!');
        $this->settings->set('rivion:welcome_message', $data['welcome_message'] ?? 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.');
        

        $this->settings->set('rivion:sidebar_newserver_link', $data['sidebar_newserver_link'] ?? '');
        $this->settings->set('rivion:sidebar_billing_link', $data['sidebar_billing_link'] ?? '');
        $this->settings->set('rivion:sidebar_support_link', $data['sidebar_support_link'] ?? '');
        
        for ($i = 1; $i <= 5; $i++) {
            $this->settings->set("rivion:card_{$i}_title", $data["card_{$i}_title"] ?? '');
            $this->settings->set("rivion:card_{$i}_description", $data["card_{$i}_description"] ?? '');
            $this->settings->set("rivion:card_{$i}_icon", $data["card_{$i}_icon"] ?? '');
            $this->settings->set("rivion:card_{$i}_link", $data["card_{$i}_link"] ?? '');
        }
        
        for ($i = 1; $i <= 2; $i++) {
            $this->settings->set("rivion:button_{$i}_icon", $data["button_{$i}_icon"] ?? '');
            $this->settings->set("rivion:button_{$i}_text", $data["button_{$i}_text"] ?? '');
            $this->settings->set("rivion:button_{$i}_link", $data["button_{$i}_link"] ?? '');
        }
        
        $this->settings->set('rivion:show_top_row', isset($data['show_top_row']) ? '1' : '0');
        $this->settings->set('rivion:show_bottom_row', isset($data['show_bottom_row']) ? '1' : '0');
        $this->settings->set('rivion:hide_serverinfo_image', isset($data['hide_serverinfo_image']) ? '1' : '0');
        
        $this->alert->success('Dashboard cards have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.dashboard');
    }

    public function backgrounds(): View
    {
        
        $settings = [
            'auth_background_image' => $this->settings->get('rivion:auth_background_image', ''),
            'auth_background_effect' => $this->settings->get('rivion:auth_background_effect', 'none'),
        ];
        
        return $this->view->make('admin.rivion.backgrounds', [
            'settings' => $settings,
        ]);
    }


    public function updateBackgrounds(Request $request): RedirectResponse
    {
        
        $request->validate([
            'auth_background_image' => 'nullable|url|max:500',
            'auth_background_effect' => 'required|in:none,blur,heavy-blur,overlay,heavy-overlay',
            'auth_layout' => 'required|in:base,side',
        ]);
        
        $data = $request->all();
        
        
        $this->settings->set('rivion:auth_background_image', $data['auth_background_image'] ?? '');
        $this->settings->set('rivion:auth_background_effect', $data['auth_background_effect'] ?? 'none');
        $this->settings->set('rivion:auth_layout', $data['auth_layout'] ?? 'base');
        
        $this->alert->success('Background settings have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.backgrounds');
    }

    public function language(): View
    {
        return $this->view->make('admin.rivion.language', [
            'default_language' => $this->settings->get('rivion:default_language', 'en'),
        ]);
    }

    public function updateLanguage(RivionSettingsFormRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        
        $this->settings->set('rivion:default_language', $validated['default_language'] ?? 'en');
        
        $this->alert->success('Language settings have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.language');
    }

    public function settings(): View
    {
        $nodes = Node::orderBy('name')->get();
       
        $settings = [
            'site_icon' => $this->settings->get('rivion:site_icon', ''),
            'favicon' => $this->settings->get('rivion:favicon', ''),
            'console_container_text' => $this->settings->get('rivion:console_container_text', 'container@pterodactyl~'),
            'console_daemon_text' => $this->settings->get('rivion:console_daemon_text', '[Pterodactyl Daemon]:'),
            'console_enable_replacement' => $this->settings->get('rivion:console_enable_replacement', '1'),
        ];
        
        return $this->view->make('admin.rivion.settings', [
            'settings' => $settings,
            'nodes' => $nodes,
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        
        $request->validate([
            'site_icon' => 'nullable|url|max:255',
            'favicon' => 'nullable|url|max:255',
            'console_container_text' => 'nullable|string|max:100',
            'console_daemon_text' => 'nullable|string|max:100',
            'console_enable_replacement' => 'nullable|in:0,1',
            'node_daemon_text' => 'nullable|array',
            'node_daemon_text.*' => 'nullable|string|max:100',
            'node_container_text' => 'nullable|array',
            'node_container_text.*' => 'nullable|string|max:100',
        ]);
        
        $data = $request->all();
        
        $this->settings->set('rivion:site_icon', $data['site_icon'] ?? '');
        $this->settings->set('rivion:favicon', $data['favicon'] ?? '');
        $this->settings->set('rivion:console_container_text', $data['console_container_text'] ?? 'container@pterodactyl~');
        $this->settings->set('rivion:console_daemon_text', $data['console_daemon_text'] ?? '[Pterodactyl Daemon]:');
        $this->settings->set('rivion:console_enable_replacement', isset($data['console_enable_replacement']) ? '1' : '0');
        

        if (isset($data['node_daemon_text']) && is_array($data['node_daemon_text'])) {
            foreach ($data['node_daemon_text'] as $nodeId => $daemonText) {
                Node::where('id', $nodeId)->update(['daemon_text' => $daemonText ?: null]);
            }
        }
        

        if (isset($data['node_container_text']) && is_array($data['node_container_text'])) {
            foreach ($data['node_container_text'] as $nodeId => $containerText) {
                Node::where('id', $nodeId)->update(['container_text' => $containerText ?: null]);
            }
        }
        
        $this->alert->success('Site settings have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.settings');
    }

    public function announcements(): View
    {
        $nodes = Node::orderBy('name')->get();
        
        $settings = [
            'announcement_icon' => $this->settings->get('rivion:announcement_icon', ''),
            'announcement_title' => $this->settings->get('rivion:announcement_title', ''),
            'announcement_description' => $this->settings->get('rivion:announcement_description', ''),
            
            'node_announcements' => $this->settings->get('rivion:node_announcements', '[]'),
            
            'enable_server_notifications' => $this->settings->get('rivion:enable_server_notifications', '0'),
            'enable_overload_notifications' => $this->settings->get('rivion:enable_overload_notifications', '0'),
            'overload_notification_text' => $this->settings->get('rivion:overload_notification_text', 'Your server is reaching its resource limits. Consider upgrading your plan for better performance.'),
            'overload_button_text' => $this->settings->get('rivion:overload_button_text', 'Upgrade Plan'),
            'overload_button_link' => $this->settings->get('rivion:overload_button_link', ''),
            'overload_threshold' => $this->settings->get('rivion:overload_threshold', '90'),
        ];
        
        return $this->view->make('admin.rivion.announcements', [
            'settings' => $settings,
            'nodes' => $nodes,
        ]);
    }

    public function updateAnnouncements(Request $request): RedirectResponse
    {
        $request->validate([
            'announcement_icon' => 'nullable|string|max:50',
            'announcement_title' => 'nullable|string|max:255',
            'announcement_description' => 'nullable|string|max:1000',
            
            'node_announcements' => 'nullable|string|max:10000',
            
            'enable_server_notifications' => 'nullable|in:0,1',
            'enable_overload_notifications' => 'nullable|in:0,1',
            'overload_notification_text' => 'nullable|string|max:500',
            'overload_button_text' => 'nullable|string|max:100',
            'overload_button_link' => 'nullable|string|max:500',
            'overload_threshold' => 'nullable|integer|min:50|max:100',
        ]);
        
        $data = $request->all();
        
        $this->settings->set('rivion:announcement_icon', $data['announcement_icon'] ?? '');
        $this->settings->set('rivion:announcement_title', $data['announcement_title'] ?? '');
        $this->settings->set('rivion:announcement_description', $data['announcement_description'] ?? '');
        
        $nodeAnnouncements = $data['node_announcements'] ?? '[]';
        if (json_decode($nodeAnnouncements) !== null) {
            $this->settings->set('rivion:node_announcements', $nodeAnnouncements);
        }
        
        $this->settings->set('rivion:enable_server_notifications', isset($data['enable_server_notifications']) ? '1' : '0');
        $this->settings->set('rivion:enable_overload_notifications', isset($data['enable_overload_notifications']) ? '1' : '0');
        $this->settings->set('rivion:overload_notification_text', $data['overload_notification_text'] ?? 'Your server is reaching its resource limits. Consider upgrading your plan for better performance.');
        $this->settings->set('rivion:overload_button_text', $data['overload_button_text'] ?? 'Upgrade Plan');
        $this->settings->set('rivion:overload_button_link', $data['overload_button_link'] ?? '');
        $this->settings->set('rivion:overload_threshold', $data['overload_threshold'] ?? '90');
        
        $this->alert->success('Announcement settings have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.announcements');
    }

    public function metadata(): View
    {
        $settings = [
            'meta_site_title' => $this->settings->get('rivion:meta_site_title', config('app.name', 'Pterodactyl')),
            'meta_description' => $this->settings->get('rivion:meta_description', ''),
            'meta_keywords' => $this->settings->get('rivion:meta_keywords', ''),
            'meta_og_title' => $this->settings->get('rivion:meta_og_title', ''),
            'meta_og_description' => $this->settings->get('rivion:meta_og_description', ''),
            'meta_og_image' => $this->settings->get('rivion:meta_og_image', ''),
            'meta_og_type' => $this->settings->get('rivion:meta_og_type', 'website'),
            'meta_twitter_card' => $this->settings->get('rivion:meta_twitter_card', 'summary_large_image'),
            'meta_twitter_title' => $this->settings->get('rivion:meta_twitter_title', ''),
            'meta_twitter_description' => $this->settings->get('rivion:meta_twitter_description', ''),
            'meta_twitter_image' => $this->settings->get('rivion:meta_twitter_image', ''),
            'meta_twitter_site' => $this->settings->get('rivion:meta_twitter_site', ''),
            'meta_theme_color' => $this->settings->get('rivion:meta_theme_color', '#385af1'),
            'meta_robots' => $this->settings->get('rivion:meta_robots', 'noindex'),
        ];
        
        return $this->view->make('admin.rivion.metadata', [
            'settings' => $settings,
        ]);
    }

    public function updateMetadata(Request $request): RedirectResponse
    {
        $request->validate([
            'meta_site_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'meta_og_title' => 'nullable|string|max:255',
            'meta_og_description' => 'nullable|string|max:500',
            'meta_og_image' => 'nullable|url|max:500',
            'meta_og_type' => 'nullable|string|in:website,article,product',
            'meta_twitter_card' => 'nullable|string|in:summary,summary_large_image',
            'meta_twitter_title' => 'nullable|string|max:255',
            'meta_twitter_description' => 'nullable|string|max:500',
            'meta_twitter_image' => 'nullable|url|max:500',
            'meta_twitter_site' => 'nullable|string|max:50',
            'meta_theme_color' => 'nullable|string|max:20',
            'meta_robots' => 'nullable|string|max:100',
        ]);
        
        $data = $request->all();
        
        $this->settings->set('rivion:meta_site_title', $data['meta_site_title'] ?? '');
        $this->settings->set('rivion:meta_description', $data['meta_description'] ?? '');
        $this->settings->set('rivion:meta_keywords', $data['meta_keywords'] ?? '');
        $this->settings->set('rivion:meta_og_title', $data['meta_og_title'] ?? '');
        $this->settings->set('rivion:meta_og_description', $data['meta_og_description'] ?? '');
        $this->settings->set('rivion:meta_og_image', $data['meta_og_image'] ?? '');
        $this->settings->set('rivion:meta_og_type', $data['meta_og_type'] ?? 'website');
        $this->settings->set('rivion:meta_twitter_card', $data['meta_twitter_card'] ?? 'summary_large_image');
        $this->settings->set('rivion:meta_twitter_title', $data['meta_twitter_title'] ?? '');
        $this->settings->set('rivion:meta_twitter_description', $data['meta_twitter_description'] ?? '');
        $this->settings->set('rivion:meta_twitter_image', $data['meta_twitter_image'] ?? '');
        $this->settings->set('rivion:meta_twitter_site', $data['meta_twitter_site'] ?? '');
        $this->settings->set('rivion:meta_theme_color', $data['meta_theme_color'] ?? '#385af1');
        $this->settings->set('rivion:meta_robots', $data['meta_robots'] ?? 'noindex');
        
        $this->alert->success('Meta data settings have been updated successfully!')->flash();
        
        return redirect()->route('admin.rivion.metadata');
    }
}
