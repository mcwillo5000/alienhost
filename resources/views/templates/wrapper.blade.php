@include("blueprint.dashboard.dashboard")
@yield("blueprint.lib")

@php
    $settingsRepository = app('Pterodactyl\Contracts\Repository\SettingsRepositoryInterface');
    
    $dashboardCards = [
        'welcome' => [
            'title' => $settingsRepository->get('rivion:welcome_title', 'Welcome back!'),
            'description' => $settingsRepository->get('rivion:welcome_message', 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.')
        ],
        'cards' => [],
        'sidebarLinks' => [
            'newServer' => $settingsRepository->get('rivion:sidebar_newserver_link', ''),
            'billing' => $settingsRepository->get('rivion:sidebar_billing_link', ''),
            'support' => $settingsRepository->get('rivion:sidebar_support_link', ''),
        ]
    ];
    
    for ($i = 1; $i <= 5; $i++) {
        $dashboardCards['cards'][] = [
            'id' => $i,
            'title' => $settingsRepository->get("rivion:card_{$i}_title", ''),
            'description' => $settingsRepository->get("rivion:card_{$i}_description", ''),
            'icon' => $settingsRepository->get("rivion:card_{$i}_icon", ''),
            'link' => $settingsRepository->get("rivion:card_{$i}_link", '')
        ];
    }
    
    $additionalButtons = [];
    for ($i = 1; $i <= 2; $i++) {
        $icon = $settingsRepository->get("rivion:button_{$i}_icon", '');
        $text = $settingsRepository->get("rivion:button_{$i}_text", '');
        $link = $settingsRepository->get("rivion:button_{$i}_link", '');
        
        if (!empty($icon) && !empty($text)) {
            $additionalButtons[] = [
                'id' => $i,
                'icon' => $icon,
                'text' => $text,
                'link' => $link
            ];
        }
    }
    
    $siteConfiguration = [
        'name' => config('app.name', 'Pterodactyl'),
        'locale' => config('app.locale', 'en'),
        'recaptcha' => [
            'enabled' => config('recaptcha.enabled', false),
            'siteKey' => config('recaptcha.website_key', ''),
        ],
        'dashboardCards' => $dashboardCards, 
        'additionalButtons' => $additionalButtons, 
        'bentoBoxVisibility' => [
            'showTopRow' => $settingsRepository->get('rivion:show_top_row', '1') === '1',
            'showBottomRow' => $settingsRepository->get('rivion:show_bottom_row', '1') === '1',
        ],
        'serverInfoSettings' => [
            'hideImage' => $settingsRepository->get('rivion:hide_serverinfo_image', '0') === '1',
        ],
        'announcement' => [
            'icon' => $settingsRepository->get('rivion:announcement_icon', ''),
            'title' => $settingsRepository->get('rivion:announcement_title', ''),
            'description' => $settingsRepository->get('rivion:announcement_description', '')
        ],
        'nodeAnnouncements' => json_decode($settingsRepository->get('rivion:node_announcements', '[]'), true) ?: [],
        'consoleSettings' => [
            'containerText' => $settingsRepository->get('rivion:console_container_text', 'container@pterodactyl~'),
            'daemonText' => $settingsRepository->get('rivion:console_daemon_text', '[Pterodactyl Daemon]:'),
            'enableReplacement' => $settingsRepository->get('rivion:console_enable_replacement', '1') === '1',
        ],
        'serverNotifications' => [
            'enabled' => $settingsRepository->get('rivion:enable_server_notifications', '0') === '1',
            'overload' => [
                'enabled' => $settingsRepository->get('rivion:enable_overload_notifications', '0') === '1',
                'text' => $settingsRepository->get('rivion:overload_notification_text', 'Your server is reaching its resource limits. Consider upgrading your plan for better performance.'),
                'buttonText' => $settingsRepository->get('rivion:overload_button_text', 'Upgrade Plan'),
                'buttonLink' => $settingsRepository->get('rivion:overload_button_link', ''),
                'threshold' => (int) $settingsRepository->get('rivion:overload_threshold', '90'),
            ],
        ],
        'siteAssets' => [
            'siteIcon' => $settingsRepository->get('rivion:site_icon', ''),
            'favicon' => $settingsRepository->get('rivion:favicon', '')
        ],
        'backgrounds' => [
            'authBackgroundImage' => $settingsRepository->get('rivion:auth_background_image', ''),
            'authBackgroundEffect' => $settingsRepository->get('rivion:auth_background_effect', 'none'),
            'authLayout' => $settingsRepository->get('rivion:auth_layout', 'base')
        ],
        'metadata' => [
            'site_title' => $settingsRepository->get('rivion:meta_site_title', config('app.name', 'Pterodactyl')),
            'description' => $settingsRepository->get('rivion:meta_description', ''),
            'keywords' => $settingsRepository->get('rivion:meta_keywords', ''),
            'og_title' => $settingsRepository->get('rivion:meta_og_title', ''),
            'og_description' => $settingsRepository->get('rivion:meta_og_description', ''),
            'og_image' => $settingsRepository->get('rivion:meta_og_image', ''),
            'og_type' => $settingsRepository->get('rivion:meta_og_type', 'website'),
            'twitter_card' => $settingsRepository->get('rivion:meta_twitter_card', 'summary_large_image'),
            'twitter_title' => $settingsRepository->get('rivion:meta_twitter_title', ''),
            'twitter_description' => $settingsRepository->get('rivion:meta_twitter_description', ''),
            'twitter_image' => $settingsRepository->get('rivion:meta_twitter_image', ''),
            'twitter_site' => $settingsRepository->get('rivion:meta_twitter_site', ''),
            'theme_color' => $settingsRepository->get('rivion:meta_theme_color', '#385af1'),
            'robots' => $settingsRepository->get('rivion:meta_robots', 'noindex'),
        ],
        'theme' => [
            
            'light_primary' => $settingsRepository->get('rivion:light_primary', '#3b82f6'),
            'light_secondary' => $settingsRepository->get('rivion:light_secondary', '#6366f1'),
            'light_border' => $settingsRepository->get('rivion:light_border', '#e5e7eb'),
            'light_text_base' => $settingsRepository->get('rivion:light_text_base', '#111827'),
            'light_text_muted' => $settingsRepository->get('rivion:light_text_muted', '#6b7280'),
            'light_text_inverted' => $settingsRepository->get('rivion:light_text_inverted', '#ffffff'),
            'light_background' => $settingsRepository->get('rivion:light_background', '#ffffff'),
            'light_background_secondary' => $settingsRepository->get('rivion:light_background_secondary', '#f9fafb'),
            
            
            'dark_primary' => $settingsRepository->get('rivion:dark_primary', '#3b82f6'),
            'dark_secondary' => $settingsRepository->get('rivion:dark_secondary', '#6366f1'),
            'dark_border' => $settingsRepository->get('rivion:dark_border', '#374151'),
            'dark_text_base' => $settingsRepository->get('rivion:dark_text_base', '#f9fafb'),
            'dark_text_muted' => $settingsRepository->get('rivion:dark_text_muted', '#9ca3af'),
            'dark_text_inverted' => $settingsRepository->get('rivion:dark_text_inverted', '#111827'),
            'dark_background' => $settingsRepository->get('rivion:dark_background', '#111827'),
            'dark_background_secondary' => $settingsRepository->get('rivion:dark_background_secondary', '#1f2937'),
            
            
            'defaultTheme' => $settingsRepository->get('rivion:default_theme', 'dark'),
            'disableThemeToggle' => $settingsRepository->get('rivion:disable_theme_toggle', '0') === '1',
        ]
    ];
@endphp
<!DOCTYPE html>
<html>
    <head>
        <title>{{ $siteConfiguration['metadata']['site_title'] ?? config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="{{ $siteConfiguration['metadata']['robots'] ?? 'noindex' }}">
            
            @if(!empty($siteConfiguration['metadata']['description']))
                <meta name="description" content="{{ $siteConfiguration['metadata']['description'] }}">
            @endif
            
            @if(!empty($siteConfiguration['metadata']['keywords']))
                <meta name="keywords" content="{{ $siteConfiguration['metadata']['keywords'] }}">
            @endif
            
            
            <meta property="og:title" content="{{ $siteConfiguration['metadata']['og_title'] ?: ($siteConfiguration['metadata']['site_title'] ?? config('app.name', 'Pterodactyl')) }}">
            @if(!empty($siteConfiguration['metadata']['og_description']) || !empty($siteConfiguration['metadata']['description']))
                <meta property="og:description" content="{{ $siteConfiguration['metadata']['og_description'] ?: $siteConfiguration['metadata']['description'] }}">
            @endif
            @if(!empty($siteConfiguration['metadata']['og_image']))
                <meta property="og:image" content="{{ $siteConfiguration['metadata']['og_image'] }}">
            @endif
            <meta property="og:type" content="{{ $siteConfiguration['metadata']['og_type'] ?? 'website' }}">
            <meta property="og:url" content="{{ url()->current() }}">
            
            
            <meta name="twitter:card" content="{{ $siteConfiguration['metadata']['twitter_card'] ?? 'summary_large_image' }}">
            <meta name="twitter:title" content="{{ $siteConfiguration['metadata']['twitter_title'] ?: ($siteConfiguration['metadata']['site_title'] ?? config('app.name', 'Pterodactyl')) }}">
            @if(!empty($siteConfiguration['metadata']['twitter_description']) || !empty($siteConfiguration['metadata']['description']))
                <meta name="twitter:description" content="{{ $siteConfiguration['metadata']['twitter_description'] ?: $siteConfiguration['metadata']['description'] }}">
            @endif
            @if(!empty($siteConfiguration['metadata']['twitter_image']) || !empty($siteConfiguration['metadata']['og_image']))
                <meta name="twitter:image" content="{{ $siteConfiguration['metadata']['twitter_image'] ?: $siteConfiguration['metadata']['og_image'] }}">
            @endif
            @if(!empty($siteConfiguration['metadata']['twitter_site']))
                <meta name="twitter:site" content="{{ $siteConfiguration['metadata']['twitter_site'] }}">
            @endif
            <meta name="default-language" content="{{ $settingsRepository->get('rivion:default_language', 'en') }}">
            @php
                $favicon = $settingsRepository->get('rivion:favicon', '');
            @endphp
            @if(!empty($favicon))
                
                <link rel="icon" type="image/x-icon" href="{{ $favicon }}">
                <link rel="shortcut icon" href="{{ $favicon }}">
                <link rel="apple-touch-icon" href="{{ $favicon }}">
            @else
                
                <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
                <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
                <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
                <link rel="manifest" href="/favicons/manifest.json">
                <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
                <link rel="shortcut icon" href="/favicons/favicon.ico">
            @endif
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            <meta name="theme-color" content="{{ $siteConfiguration['metadata']['theme_color'] ?? '#385af1' }}">
            <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css'>
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                    @if(!Auth::user()->root_admin && Auth::user()->adv_role_id)
                        @php
                            $__advRole = \Pterodactyl\Models\AdvancedRole::find(Auth::user()->adv_role_id);
                            $__canViewAllServers = $__advRole && in_array('special.server_access', $__advRole->admin_routes ?? []);
                        @endphp
                        window.PterodactylUser.can_view_all_servers = {{ $__canViewAllServers ? 'true' : 'false' }};
                        window.PterodactylUser.has_adv_role = true;
                    @else
                        window.PterodactylUser.can_view_all_servers = false;
                        window.PterodactylUser.has_adv_role = false;
                    @endif
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Electrolize&family=Orbitron:wght@400..900&display=swap');
            @import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css');

            
            :root {
                --theme-primary: {{ $siteConfiguration['theme']['light_primary'] }};
                --theme-secondary: {{ $siteConfiguration['theme']['light_secondary'] }};
                --theme-border: {{ $siteConfiguration['theme']['light_border'] }};
                --theme-text-base: {{ $siteConfiguration['theme']['light_text_base'] }};
                --theme-text-muted: {{ $siteConfiguration['theme']['light_text_muted'] }};
                --theme-text-inverted: {{ $siteConfiguration['theme']['light_text_inverted'] }};
                --theme-background: {{ $siteConfiguration['theme']['light_background'] }};
                --theme-background-secondary: {{ $siteConfiguration['theme']['light_background_secondary'] }};
                --theme-background-rgb: 249, 250, 251;
                --rivion-bg-image: url('/assets/rivion/bg.webp');
            }

            [data-theme="dark"] {
                --theme-primary: {{ $siteConfiguration['theme']['dark_primary'] }};
                --theme-secondary: {{ $siteConfiguration['theme']['dark_secondary'] }};
                --theme-border: {{ $siteConfiguration['theme']['dark_border'] }};
                --theme-text-base: {{ $siteConfiguration['theme']['dark_text_base'] }};
                --theme-text-muted: {{ $siteConfiguration['theme']['dark_text_muted'] }};
                --theme-text-inverted: {{ $siteConfiguration['theme']['dark_text_inverted'] }};
                --theme-background: {{ $siteConfiguration['theme']['dark_background'] }};
                --theme-background-secondary: {{ $siteConfiguration['theme']['dark_background_secondary'] }};
                --theme-background-rgb: 17, 24, 39;
                --rivion-bg-image: url('/assets/rivion/bg.webp');
            }

            body::before {
                content: '' !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: -3 !important;
                background-image: url('/assets/rivion/bg.webp') !important;
                background-size: cover !important;
                background-position: center center !important;
                background-repeat: no-repeat !important;
                filter: brightness(0.4) !important;
                pointer-events: none !important;
            }

            body::after {
                content: '' !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: -2 !important;
                background: linear-gradient(
                    to top,
                    var(--theme-background) 0%,
                    rgba(var(--theme-background-rgb, 17, 24, 39), 0.7) 100%
                ) !important;
                pointer-events: none !important;
            }

            body {
                background-color: transparent !important;
                background: transparent !important;
            }
        </style>
        
        
        <script>
            
            (function() {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                
                if (shouldBeDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
                
                
                const siteConfig = @json($siteConfiguration['theme']);
                if (siteConfig) {
                    const prefix = shouldBeDark ? 'dark' : 'light';
                    const root = document.documentElement.style;
                    root.setProperty('--theme-primary', siteConfig[prefix + '_primary']);
                    root.setProperty('--theme-secondary', siteConfig[prefix + '_secondary']);
                    root.setProperty('--theme-border', siteConfig[prefix + '_border']);
                    root.setProperty('--theme-text-base', siteConfig[prefix + '_text_base']);
                    root.setProperty('--theme-text-muted', siteConfig[prefix + '_text_muted']);
                    root.setProperty('--theme-text-inverted', siteConfig[prefix + '_text_inverted']);
                    root.setProperty('--theme-background', siteConfig[prefix + '_background']);
                    root.setProperty('--theme-background-secondary', siteConfig[prefix + '_background_secondary']);
                }
            })();
        </script>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? '' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
            @yield('blueprint.wrappers')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
    </body>
</html>