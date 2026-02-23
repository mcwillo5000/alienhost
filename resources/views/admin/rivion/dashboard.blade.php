@extends('layouts.rivion', ['navbar' => 'dashboard', 'sideEditor' => true])

@section('title')
    Rivion Theme - Dashboard Cards
@endsection

@section('content')
    <form action="{{ route('admin.rivion.dashboard.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Dashboard Cards</h1>
            <p>Configure the BentoBox cards displayed on the dashboard page</p>
        </div>


        <div class="rivion-theme-group">
            <h3>Cards visibility</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">Control which sections of the cards are displayed on the dashboard</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;" class="visibility-toggle">
                    <input type="checkbox" name="show_top_row" value="1" 
                           {{ old('show_top_row', $settings['show_top_row'] ?? '1') === '1' ? 'checked' : '' }}
                           style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="color: var(--rivion-text-secondary); font-size: 13px;">Display the three horizontal cards in the top row</span>
                </label>
                
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;" class="visibility-toggle">
                    <input type="checkbox" name="show_bottom_row" value="1" 
                           {{ old('show_bottom_row', $settings['show_bottom_row'] ?? '1') === '1' ? 'checked' : '' }}
                           style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="color: var(--rivion-text-secondary); font-size: 13px;">Display the welcome message and two square cards in the bottom row</span>
                </label>
            </div>
        </div>

        <div style="border-top: 1px solid rgba(55, 65, 81, 0.3); margin: 40px 0;"></div>


        <div class="rivion-theme-group">
            <h3>Welcome message</h3>
            
            <div class="card-input-group card-title-group" style="margin-bottom: 20px;">
                <label>Welcome Title</label>
                <input type="text" name="welcome_title" value="{{ old('welcome_title', $settings['welcome_title'] ?? 'Welcome back!') }}" 
                       placeholder="Welcome back!">
            </div>
            <div class="card-input-group card-description-group">
                <label>Welcome Message</label>
                <textarea name="welcome_message" rows="2" 
                          placeholder="Manage your servers, monitor performance...">{{ old('welcome_message', $settings['welcome_message'] ?? 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.') }}</textarea>
            </div>
        </div>

        <div style="border-top: 1px solid rgba(55, 65, 81, 0.3); margin: 40px 0;"></div>


        <div class="rivion-theme-group">
            <h3>Sidebar Quick Links</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">Configure the quick action links shown in the sidebar navigation. Leave URL empty to hide a link.</p>
            

            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;"><i class="fas fa-plus" style="margin-right: 8px;"></i>New Server</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>URL</label>
                    <input type="url" name="sidebar_newserver_link" 
                           value="{{ old('sidebar_newserver_link', $settings['sidebar_newserver_link'] ?? '') }}" 
                           placeholder="https://billing.example.com/order">
                </div>
            </div>


            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;"><i class="fas fa-file-invoice-dollar" style="margin-right: 8px;"></i>Billing Area</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>URL</label>
                    <input type="url" name="sidebar_billing_link" 
                           value="{{ old('sidebar_billing_link', $settings['sidebar_billing_link'] ?? '') }}" 
                           placeholder="https://billing.example.com">
                </div>
            </div>


            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;"><i class="fas fa-headset" style="margin-right: 8px;"></i>Support</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>URL</label>
                    <input type="url" name="sidebar_support_link" 
                           value="{{ old('sidebar_support_link', $settings['sidebar_support_link'] ?? '') }}" 
                           placeholder="https://support.example.com">
                </div>
            </div>
        </div>

        <div style="border-top: 1px solid rgba(55, 65, 81, 0.3); margin: 40px 0;"></div>


        <div class="rivion-theme-group">
            <h3>Bottom square cards</h3>
            
            @for($i = 4; $i <= 5; $i++)
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Square card {{ $i - 3 }}</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Link</label>
                    <input type="url" name="card_{{ $i }}_link" 
                           value="{{ old('card_'.$i.'_link', $settings['card_'.$i.'_link'] ?? '') }}" 
                           placeholder="https://discord.com">
                </div>

                <div class="card-input-group">
                    <label>Icon</label>
                    <div class="rivion-icon-bubble" data-icon="{{ old('card_'.$i.'_icon', $settings['card_'.$i.'_icon'] ?? 'fa-comments') }}" data-target="card_{{ $i }}_icon">
                        <span class="rivion-icon-name">Click to choose</span>
                        <div class="rivion-icon-dot">
                            <i class="fas {{ old('card_'.$i.'_icon', $settings['card_'.$i.'_icon'] ?? 'fa-comments') }}"></i>
                        </div>
                        <input type="hidden" name="card_{{ $i }}_icon" value="{{ old('card_'.$i.'_icon', $settings['card_'.$i.'_icon'] ?? 'fa-comments') }}">
                    </div>
                </div>
            </div>
            @endfor
        </div>

        <div style="border-top: 1px solid rgba(55, 65, 81, 0.3); margin: 40px 0;"></div>

        <div class="rivion-theme-group">
            <h3>Additional buttons</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">
                Both icon and text are required for a button to appear. Leave both empty to hide the button completely.
            </p>
            
            @for($i = 1; $i <= 2; $i++)
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Button {{ $i }}</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Text</label>
                    <input type="text" name="button_{{ $i }}_text" 
                           value="{{ old('button_'.$i.'_text', $settings['button_'.$i.'_text'] ?? '') }}" 
                           placeholder="Button Text">
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Link</label>
                    <input type="url" name="button_{{ $i }}_link" 
                           value="{{ old('button_'.$i.'_link', $settings['button_'.$i.'_link'] ?? '') }}" 
                           placeholder="https://example.com">
                </div>

                <div class="card-input-group">
                    <label>Icon</label>
                    <div class="rivion-icon-bubble" data-icon="{{ old('button_'.$i.'_icon', $settings['button_'.$i.'_icon'] ?? 'fa-star') }}" data-target="button_{{ $i }}_icon">
                        <span class="rivion-icon-name">Click to choose</span>
                        <div class="rivion-icon-dot">
                            <i class="fas {{ old('button_'.$i.'_icon', $settings['button_'.$i.'_icon'] ?? 'fa-star') }}"></i>
                        </div>
                        <input type="hidden" name="button_{{ $i }}_icon" value="{{ old('button_'.$i.'_icon', $settings['button_'.$i.'_icon'] ?? 'fa-star') }}">
                    </div>
                </div>
            </div>
            @endfor
        </div>

        <div style="border-top: 1px solid rgba(55, 65, 81, 0.3); margin: 40px 0;"></div>

        <div class="rivion-theme-group">
            <h3>Server Info Page</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">Control the appearance of the server info page</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;" class="visibility-toggle">
                    <input type="checkbox" name="hide_serverinfo_image" value="1" 
                           {{ old('hide_serverinfo_image', $settings['hide_serverinfo_image'] ?? '0') === '1' ? 'checked' : '' }}
                           style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="color: var(--rivion-text-secondary); font-size: 13px;">Hide the server image banner card on server info page</span>
                </label>
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Dashboard Settings
            </button>
        </div>
    </form>

@endsection

@section('scripts')
    @parent
    <script>
        let currentIconInput = null;
        
        document.addEventListener('click', function(e) {
            if (e.target.closest('.rivion-icon-bubble')) {
                const bubble = e.target.closest('.rivion-icon-bubble');
                const input = bubble.querySelector('input[type="hidden"]');
                currentIconInput = input;
                showCustomIconPicker(input, bubble);
            }
        });

        function showCustomIconPicker(input, bubble) {

            const existingPicker = document.querySelector('.clr-picker');
            if (existingPicker) existingPicker.remove();
            

            const picker = document.createElement('div');
            picker.className = 'clr-picker clr-dark clr-open icon-picker-modal';
            

            const icons = [

                'fa-server', 'fa-headset', 'fa-plus', 'fa-credit-card', 'fa-comments', 'fa-book', 
                'fa-users', 'fa-cog', 'fa-chart-bar', 'fa-shield-alt', 'fa-tools', 'fa-gift',
                'fa-home', 'fa-cloud', 'fa-database', 'fa-network-wired', 'fa-bell', 'fa-lock', 
                'fa-search', 'fa-download', 'fa-upload', 'fa-cogs', 'fa-user-shield', 'fa-clipboard',
                'fa-file-alt', 'fa-key', 'fa-wifi', 'fa-desktop', 'fa-mobile', 'fa-tablet', 
                'fa-gamepad', 'fa-heartbeat', 'fa-rocket', 'fa-star', 'fa-thumbs-up', 'fa-envelope',
                'fa-phone', 'fa-map-marker-alt', 'fa-calendar', 'fa-clock', 'fa-eye', 'fa-edit',
                

                'fa-globe', 'fa-check', 'fa-heart', 'fa-bolt', 'fa-feather', 'fa-store', 'fa-wallet',
                'fa-award', 'fa-cube', 'fa-coins', 'fa-puzzle-piece', 'fa-skull', 'fa-paw', 'fa-gifts',
                'fa-box', 'fa-at', 'fa-shopping-cart',
                

                'fa-times', 'fa-ticket-alt', 'fa-terminal', 'fa-tag', 'fa-sync-alt', 'fa-sticky-note',
                'fa-rss', 'fa-robot', 'fa-quote-left', 'fa-question', 'fa-paperclip',
                

                'fi-brands-discord'
            ];
            
            let swatchesHTML = '';
            icons.forEach(icon => {
                let iconHTML = '';
                
                if (icon === 'fi-brands-discord') {

                    iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;">
                        <path d="M20.317,4.37c-1.53-0.702-3.17-1.219-4.885-1.515c-0.031-0.006-0.062,0.009-0.079,0.037c-0.211,0.375-0.445,0.865-0.608,1.249c-1.845-0.276-3.68-0.276-5.487,0C9.095,3.748,8.852,3.267,8.641,2.892C8.624,2.864,8.593,2.85,8.562,2.855C6.848,3.15,5.208,3.667,3.677,4.37C3.664,4.375,3.652,4.385,3.645,4.397c-3.111,4.648-3.964,9.182-3.546,13.66c0.002,0.022,0.014,0.043,0.031,0.056c2.053,1.508,4.041,2.423,5.993,3.029c0.031,0.01,0.064-0.002,0.084-0.028c0.462-0.63,0.873-1.295,1.226-1.994c0.021-0.041,0.001-0.09-0.042-0.106c-0.653-0.248-1.274-0.55-1.872-0.892c-0.047-0.028-0.051-0.095-0.008-0.128c0.126-0.094,0.252-0.192,0.372-0.291c0.022-0.018,0.052-0.022,0.078-0.01c3.928,1.793,8.18,1.793,12.061,0c0.026-0.012,0.056-0.009,0.079,0.01c0.12,0.099,0.246,0.198,0.373,0.292c0.044,0.032,0.041,0.1-0.007,0.128c-0.598,0.349-1.219,0.645-1.873,0.891c-0.043,0.016-0.061,0.066-0.041,0.107c0.36,0.698,0.772,1.363,1.225,1.993c0.019,0.027,0.053,0.038,0.084,0.029c1.961-0.607,3.95-1.522,6.002-3.029c0.018-0.013,0.029-0.033,0.031-0.055c0.5-5.177-0.838-9.674-3.548-13.66C20.342,4.385,20.33,4.375,20.317,4.37z M8.02,15.331c-1.183,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C10.177,14.246,9.221,15.331,8.02,15.331z M15.995,15.331c-1.182,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C18.152,14.246,17.206,15.331,15.995,15.331z"/>
                    </svg>`;
                } else {

                    let iconClass = '';
                    let iconName = icon;
                    
                    if (icon.startsWith('far-')) {
                        iconClass = 'far';
                        iconName = icon.replace('far-', 'fa-');
                    } else if (icon.startsWith('fab-')) {
                        iconClass = 'fab';
                        iconName = icon.replace('fab-', 'fa-');
                    } else {
                        iconClass = 'fas';
                    }
                    
                    iconHTML = `<i class="${iconClass} ${iconName}"></i>`;
                }
                
                swatchesHTML += `<button type="button" class="icon-swatch" data-icon="${icon}">${iconHTML}</button>`;
            });
            
            picker.innerHTML = `
                <div class="icon-swatches-full">
                    ${swatchesHTML}
                </div>
            `;
            

            const rect = bubble.getBoundingClientRect();
            const pickerWidth = 560; 
            const pickerHeight = 500; 
            const margin = 8; 
            
            let left = rect.left;
            let top = rect.bottom + margin;
            

            if (left + pickerWidth > window.innerWidth) {
                left = window.innerWidth - pickerWidth - 10;
            }
            

            if (left < 10) {
                left = 10;
            }
            

            if (top + pickerHeight > window.innerHeight) {
                top = rect.top - pickerHeight - margin;
                
                if (top < 10) {

                    top = Math.max(10, (window.innerHeight - pickerHeight) / 2);
                }
            }
            

            if (top < 10) {
                top = 10;
            }
            
            picker.style.position = 'absolute';
            picker.style.left = left + 'px';
            picker.style.top = top + 'px';
            picker.style.zIndex = '9999';
            
            document.body.appendChild(picker);
            

            const iconSwatches = picker.querySelectorAll('.icon-swatch');
            

            function updateIcon(iconClass) {
                input.value = iconClass;
                

                const iconDot = bubble.querySelector('.rivion-icon-dot i');
                
                let cssClass = '';
                let iconName = iconClass;
                
                if (iconClass.startsWith('far-')) {
                    cssClass = 'far';
                    iconName = iconClass.replace('far-', 'fa-');
                } else if (iconClass.startsWith('fab-')) {
                    cssClass = 'fab';
                    iconName = iconClass.replace('fab-', 'fa-');
                } else {
                    cssClass = 'fas';
                }
                
                iconDot.className = `${cssClass} ${iconName}`;
                

                bubble.dataset.icon = iconClass;
                

                input.dispatchEvent(new Event('change'));
                

                picker.remove();
            }
            

            iconSwatches.forEach(swatch => {
                swatch.addEventListener('click', function(e) {
                    e.preventDefault();
                    const iconClass = this.dataset.icon;
                    updateIcon(iconClass);
                });
            });
            

            function handleOutsideClick(e) {
                if (!picker.contains(e.target) && !bubble.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', handleOutsideClick);
                }
            }
            
            setTimeout(() => {
                document.addEventListener('click', handleOutsideClick);
            }, 100);
            

            function handleEscape(e) {
                if (e.key === 'Escape') {
                    picker.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            }
            
            document.addEventListener('keydown', handleEscape);
        }
        

        document.querySelector('form').addEventListener('submit', function(e) {
            let hasData = false;
            const inputs = document.querySelectorAll('input[type="text"], textarea, input[type="url"], input[type="hidden"]');
            
            inputs.forEach(input => {
                if (input.value.trim()) {
                    hasData = true;
                }
            });
            
            if (!hasData) {
                e.preventDefault();
                alert('Please fill in at least one field before saving.');
                return false;
            }
        });
    </script>
@endsection