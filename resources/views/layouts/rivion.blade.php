<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'Pterodactyl') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#0e4688">

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/rivion-admin.css?t=' . time()) !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
            <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet">

            @php
                
                $settingsRepository = app('Pterodactyl\Contracts\Repository\SettingsRepositoryInterface');
            @endphp

            <style>
                
                :root {
                    --theme-primary: {{ $settingsRepository->get('rivion:light_primary', '#3b82f6') }};
                    --theme-secondary: {{ $settingsRepository->get('rivion:light_secondary', '#6366f1') }};
                    --theme-border: {{ $settingsRepository->get('rivion:light_border', '#e5e7eb') }};
                    --theme-text-base: {{ $settingsRepository->get('rivion:light_text_base', '#111827') }};
                    --theme-text-muted: {{ $settingsRepository->get('rivion:light_text_muted', '#6b7280') }};
                    --theme-text-inverted: {{ $settingsRepository->get('rivion:light_text_inverted', '#ffffff') }};
                    --theme-background: {{ $settingsRepository->get('rivion:light_background', '#ffffff') }};
                    --theme-background-secondary: {{ $settingsRepository->get('rivion:light_background_secondary', '#f9fafb') }};
                }

                [data-theme="dark"] {
                    --theme-primary: {{ $settingsRepository->get('rivion:dark_primary', '#3b82f6') }};
                    --theme-secondary: {{ $settingsRepository->get('rivion:dark_secondary', '#6366f1') }};
                    --theme-border: {{ $settingsRepository->get('rivion:dark_border', '#374151') }};
                    --theme-text-base: {{ $settingsRepository->get('rivion:dark_text_base', '#f9fafb') }};
                    --theme-text-muted: {{ $settingsRepository->get('rivion:dark_text_muted', '#9ca3af') }};
                    --theme-text-inverted: {{ $settingsRepository->get('rivion:dark_text_inverted', '#111827') }};
                    --theme-background: {{ $settingsRepository->get('rivion:dark_background', '#111827') }};
                    --theme-background-secondary: {{ $settingsRepository->get('rivion:dark_background_secondary', '#1f2937') }};
                }


                
                .rivion-admin .rivion-color-bubble:hover {
                    border-color: var(--theme-primary);
                }
                
                .rivion-admin .btn-primary {
                    background-color: var(--theme-primary);
                    border-color: var(--theme-primary);
                }
            </style>

        @show
    </head>
    <body class="rivion-admin">

        <nav class="rivion-nav">
            <div class="logo">
                <img src="/assets/rivion/rivion.svg" alt="Rivion" style="height: 24px; width: auto;">
            </div>
            <div class="nav-end">
                <a href="https://discord.gg/ctk5JHt4jD" target="_blank" class="support-link">
                    <i class="fab fa-discord"></i> Contact for Support
                </a>
            </div>
        </nav>

        <div class="rivion-wrapper">
            <div class="rivion-sidebar">
                <ul>
                    <li @if($navbar === 'general')class="active"@endif>
                        <a href="{{ route('admin.rivion') }}">
                            <i class="ri-pantone-line"></i>
                        </a>
                        <span class="link-tooltip">Colors</span>
                    </li>
                    <li @if($navbar === 'eggs')class="active"@endif>
                        <a href="{{ route('admin.rivion.eggs') }}">
                            <i class="ri-image-add-line"></i>
                        </a>
                        <span class="link-tooltip">Eggs</span>
                    </li>
                    <li @if($navbar === 'dashboard')class="active"@endif>
                        <a href="{{ route('admin.rivion.dashboard') }}">
                            <i class="ri-function-line"></i>
                        </a>
                        <span class="link-tooltip">Dashboard Cards</span>
                    </li>
                    <li @if($navbar === 'announcements')class="active"@endif>
                        <a href="{{ route('admin.rivion.announcements') }}">
                            <i class="ri-megaphone-line"></i>
                        </a>
                        <span class="link-tooltip">Announcements</span>
                    </li>
                    <li @if($navbar === 'backgrounds')class="active"@endif>
                        <a href="{{ route('admin.rivion.backgrounds') }}">
                            <i class="ri-landscape-line"></i>
                        </a>
                        <span class="link-tooltip">Backgrounds</span>
                    </li>
                    <li @if($navbar === 'language')class="active"@endif>
                        <a href="{{ route('admin.rivion.language') }}">
                            <i class="ri-translate"></i>
                        </a>
                        <span class="link-tooltip">Language</span>
                    </li>
                    <li @if($navbar === 'settings')class="active"@endif>
                        <a href="{{ route('admin.rivion.settings') }}">
                            <i class="ri-settings-line"></i>
                        </a>
                        <span class="link-tooltip">Settings</span>
                    </li>
                    <li @if($navbar === 'metadata')class="active"@endif>
                        <a href="{{ route('admin.rivion.metadata') }}">
                            <i class="ri-seo-line"></i>
                        </a>
                        <span class="link-tooltip">Meta Data</span>
                    </li>
                </ul>
                <ul class="sidebar-bottom">
                    <li>
                        <a href="https://discord.gg/ctk5JHt4jD" target="_blank">
                            <i class="ri-lifebuoy-line"></i>
                        </a>
                        <span class="link-tooltip">Support</span>
                    </li>
                    <li class="back-button">
                        <a href="{{ route('admin.index') }}">
                            <i class="ri-corner-down-left-line"></i>
                        </a>
                        <span class="link-tooltip">Back to Admin</span>
                    </li>
                </ul>
            </div>
            <div class="rivion-content-container">
                <div class="rivion-content">
                    <div class="container">
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                There was an error validating the data provided.<br><br>
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        @foreach (Alert::getMessages() as $type => $messages)
                            @foreach ($messages as $message)
                                <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                    {!! $message !!}
                                </div>
                            @endforeach
                        @endforeach
                        @yield('content')
                    </div>
                </div>
            </div>
        </div>

        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            <script>
                function toggleInputType() {
                    const colorInputs = document.querySelectorAll('input[type="color"]');
                    const textInputs = document.querySelectorAll('input[type="text"]');
                    
                    colorInputs.forEach(input => {
                        if (input.type === 'color') {
                            input.type = 'text';
                        } else {
                            input.type = 'color';
                        }
                    });
                }

                function resetColor(button) {
                    const name = button.dataset.name;
                    const value = button.dataset.value;
                    const input = document.querySelector(`input[name="${name}"]`);
                    if (input) {
                        input.value = value;
                    }
                }


                document.querySelectorAll('.input-w-reset button').forEach(button => {
                    button.addEventListener('click', () => resetColor(button));
                });
            </script>
        @show
    </body>
</html>