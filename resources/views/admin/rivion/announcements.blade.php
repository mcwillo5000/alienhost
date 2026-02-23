@extends('layouts.rivion', ['navbar' => 'announcements', 'sideEditor' => true])

@section('title')
    Rivion Theme - Announcements
@endsection

@section('content')
    <form action="{{ route('admin.rivion.announcements.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Announcement Settings</h1>
            <p>Configure the announcement banner displayed on the dashboard</p>
        </div>


        <div class="rivion-theme-group">
            <h3>Announcement banner</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Banner configuration</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Title</label>
                    <input type="text" name="announcement_title" 
                           value="{{ old('announcement_title', $settings['announcement_title'] ?? '') }}" 
                           placeholder="Announcement Title">
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Description</label>
                    <textarea name="announcement_description" rows="3" 
                              placeholder="Enter announcement description">{{ old('announcement_description', $settings['announcement_description'] ?? '') }}</textarea>
                </div>

                <div class="card-input-group">
                    <label>Icon</label>
                    <div class="rivion-icon-bubble" data-icon="{{ old('announcement_icon', $settings['announcement_icon'] ?? 'fa-info-circle') }}" data-target="announcement_icon">
                        <span class="rivion-icon-name">Click to choose</span>
                        <div class="rivion-icon-dot">
                            <i class="fas {{ old('announcement_icon', $settings['announcement_icon'] ?? 'fa-info-circle') }}"></i>
                        </div>
                        <input type="hidden" name="announcement_icon" value="{{ old('announcement_icon', $settings['announcement_icon'] ?? 'fa-info-circle') }}">
                    </div>
                </div>
            </div>
        </div>


        <div class="rivion-theme-group">
            <h3>Node-Specific Announcements</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Manage Node Announcements</h4>


                <div id="node-announcements-list" style="margin-bottom: 20px;">
                    @php
                        $nodeAnnouncementsJson = $settings['node_announcements'] ?? '[]';
                        $nodeAnnouncements = json_decode($nodeAnnouncementsJson, true) ?: [];
                    @endphp
                    
                    @if(count($nodeAnnouncements) > 0)
                        @foreach($nodeAnnouncements as $index => $announcement)
                            <div class="node-announcement-item" data-index="{{ $index }}" style="background: var(--rivion-background); border: 1px solid var(--rivion-border); border-radius: 8px; padding: 15px; margin-bottom: 10px; position: relative;">
                                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                                    <div style="width: 24px; height: 24px; border-radius: 4px; background: {{ $announcement['color'] ?? '#3B82F6' }};"></div>
                                    <div style="flex: 1; min-width: 200px;">
                                        <strong style="color: var(--rivion-text-primary);">{{ $announcement['node_name'] ?? 'Unknown Node' }}</strong>
                                        <p style="color: var(--rivion-text-secondary); font-size: 13px; margin: 5px 0 0;">{{ $announcement['title'] ?? 'No Title' }}</p>
                                    </div>
                                    <button type="button" class="btn btn-danger btn-sm delete-node-announcement" data-index="{{ $index }}" style="padding: 5px 12px; font-size: 12px;">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        @endforeach
                    @endif
                </div>


                <input type="hidden" name="node_announcements" id="node_announcements_input" value="{{ $nodeAnnouncementsJson }}">


                <div style="border: 1px dashed var(--rivion-border); border-radius: 8px; padding: 20px; background: rgba(0,0,0,0.1);">
                    <h5 style="margin-bottom: 15px; color: var(--rivion-text-primary);">Add New Node Announcement</h5>

                    <div class="card-input-group" style="margin-bottom: 15px;">
                        <label>Select Node</label>
                        <select id="new_node_id" style="width: 100%; padding: 10px; border: 1px solid var(--rivion-border); border-radius: 6px; background: var(--rivion-background); color: var(--rivion-text-primary);">
                            <option value="">-- Select a node --</option>
                            @foreach($nodes as $node)
                                <option value="{{ $node->id }}" data-name="{{ $node->name }}">{{ $node->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="card-input-group" style="margin-bottom: 15px;">
                        <label>Title</label>
                        <input type="text" id="new_node_title" placeholder="Announcement Title">
                    </div>

                    <div class="card-input-group" style="margin-bottom: 15px;">
                        <label>Description</label>
                        <textarea id="new_node_description" rows="2" placeholder="Enter announcement description"></textarea>
                    </div>

                    <div class="card-input-group" style="margin-bottom: 15px;">
                        <label>Icon</label>
                        <div class="rivion-icon-bubble" data-icon="fa-info-circle" data-target="new_node_icon" id="new-node-icon-bubble">
                            <span class="rivion-icon-name">Click to choose</span>
                            <div class="rivion-icon-dot">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <input type="hidden" id="new_node_icon" value="fa-info-circle">
                        </div>
                    </div>

                    <div class="card-input-group" style="margin-bottom: 20px;">
                        <label>Announcement Color</label>
                        <div class="rivion-color-bubble" data-color="#3B82F6" data-target="new_node_color" id="new-node-color-bubble">
                            <span class="rivion-color-name">#3B82F6</span>
                            <div class="rivion-color-dot" style="background-color: #3B82F6;"></div>
                            <input type="hidden" id="new_node_color" value="#3B82F6">
                        </div>
                    </div>

                    <button type="button" id="add-node-announcement-btn" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-plus"></i> Add Node Announcement
                    </button>
                </div>
            </div>
        </div>


        <div class="rivion-theme-group">
            <h3>Server-Specific Notifications</h3>
            
            <div class="card-form-section">

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="margin-bottom: 0;">Enable Server-Specific Notifications</label>
                        <label class="rivion-toggle-switch">
                            <input type="checkbox" name="enable_server_notifications" id="enable_server_notifications" value="1" {{ ($settings['enable_server_notifications'] ?? '0') === '1' ? 'checked' : '' }}>
                            <span class="rivion-toggle-slider"></span>
                        </label>
                    </div>
                </div>


                <div id="server-notifications-options" style="display: {{ ($settings['enable_server_notifications'] ?? '0') === '1' ? 'block' : 'none' }};">
                    

                    <div class="card-input-group" style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <label style="margin-bottom: 0;">Server Overload Notifications</label>
                            <label class="rivion-toggle-switch">
                                <input type="checkbox" name="enable_overload_notifications" id="enable_overload_notifications" value="1" {{ ($settings['enable_overload_notifications'] ?? '0') === '1' ? 'checked' : '' }}>
                                <span class="rivion-toggle-slider"></span>
                            </label>
                        </div>
                    </div>


                    <div id="overload-notification-settings" style="display: {{ ($settings['enable_overload_notifications'] ?? '0') === '1' ? 'block' : 'none' }};">
                        
                        <div class="card-input-group" style="margin-bottom: 20px;">
                            <label>Notification Text</label>
                            <textarea name="overload_notification_text" rows="2" placeholder="Your server is reaching its resource limits. Consider upgrading your plan for better performance.">{{ old('overload_notification_text', $settings['overload_notification_text'] ?? 'Your server is reaching its resource limits. Consider upgrading your plan for better performance.') }}</textarea>
                        </div>

                        <div class="card-input-group" style="margin-bottom: 20px;">
                            <label>Button Text</label>
                            <input type="text" name="overload_button_text" 
                                   value="{{ old('overload_button_text', $settings['overload_button_text'] ?? 'Upgrade Plan') }}" 
                                   placeholder="Upgrade Plan">
                        </div>

                        <div class="card-input-group" style="margin-bottom: 20px;">
                            <label>Button Link</label>
                            <input type="text" name="overload_button_link" 
                                   value="{{ old('overload_button_link', $settings['overload_button_link'] ?? '') }}" 
                                   placeholder="https://billing.example.com/upgrade">
                        </div>

                        <div class="card-input-group">
                            <label>Resource Threshold (%)</label>
                            <input type="number" name="overload_threshold" 
                                   value="{{ old('overload_threshold', $settings['overload_threshold'] ?? '90') }}" 
                                   min="50" max="100" step="5"
                                   placeholder="90">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Announcement Settings
            </button>
        </div>
    </form>

@endsection

@section('scripts')
    @parent
    <script>

        document.addEventListener('DOMContentLoaded', function() {

            const enableServerNotifications = document.getElementById('enable_server_notifications');
            const serverNotificationsOptions = document.getElementById('server-notifications-options');
            
            if (enableServerNotifications && serverNotificationsOptions) {
                enableServerNotifications.addEventListener('change', function() {
                    serverNotificationsOptions.style.display = this.checked ? 'block' : 'none';
                    

                    if (!this.checked) {
                        const childToggles = serverNotificationsOptions.querySelectorAll('input[type="checkbox"]');
                        childToggles.forEach(toggle => {
                            toggle.checked = false;

                            toggle.dispatchEvent(new Event('change'));
                        });
                    }
                });
            }
            

            const enableOverloadNotifications = document.getElementById('enable_overload_notifications');
            const overloadNotificationSettings = document.getElementById('overload-notification-settings');
            
            if (enableOverloadNotifications && overloadNotificationSettings) {
                enableOverloadNotifications.addEventListener('change', function() {
                    overloadNotificationSettings.style.display = this.checked ? 'block' : 'none';
                });
            }
        });
        

        document.addEventListener('DOMContentLoaded', function() {
            const iconBubbles = document.querySelectorAll('.rivion-icon-bubble');
            
            iconBubbles.forEach(bubble => {
                bubble.addEventListener('click', function() {
                    const currentIcon = this.dataset.icon;
                    const targetInput = this.dataset.target;
                    

                    const modal = document.createElement('div');
                    modal.className = 'icon-picker-modal';
                    modal.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--rivion-background-secondary);
                        border: 1px solid var(--rivion-border);
                        border-radius: 12px;
                        padding: 20px;
                        z-index: 10000;
                        max-height: 80vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    `;
                    

                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        z-index: 9999;
                    `;
                    

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
                    
                    let iconGrid = '<div class="icon-swatches-full" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px;">';
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
                        
                        iconGrid += `
                            <button type="button" class="icon-swatch" data-icon="${icon}" style="
                                width: 50px;
                                height: 50px;
                                border: 2px solid ${currentIcon === icon ? 'var(--rivion-primary)' : 'var(--rivion-border)'};
                                background: ${currentIcon === icon ? 'rgba(56, 90, 241, 0.1)' : 'transparent'};
                                border-radius: 8px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s ease;
                            ">
                                ${iconHTML}
                            </button>
                        `;
                    });
                    iconGrid += '</div>';
                    
                    modal.innerHTML = iconGrid;
                    
                    document.body.appendChild(overlay);
                    document.body.appendChild(modal);
                    

                    modal.querySelectorAll('.icon-swatch').forEach(swatch => {
                        swatch.addEventListener('click', function() {
                            const selectedIcon = this.dataset.icon;
                            

                            bubble.dataset.icon = selectedIcon;
                            bubble.querySelector('.rivion-icon-dot i').className = `fas ${selectedIcon}`;
                            bubble.querySelector('input[type="hidden"]').value = selectedIcon;
                            

                            document.body.removeChild(modal);
                            document.body.removeChild(overlay);
                        });
                    });
                    

                    overlay.addEventListener('click', function() {
                        document.body.removeChild(modal);
                        document.body.removeChild(overlay);
                    });
                });
            });
        });


        document.addEventListener('DOMContentLoaded', function() {
            const nodeAnnouncementsInput = document.getElementById('node_announcements_input');
            const nodeAnnouncementsList = document.getElementById('node-announcements-list');
            const addBtn = document.getElementById('add-node-announcement-btn');
            const noAnnouncementsMsg = document.getElementById('no-announcements-msg');


            let nodeAnnouncements = [];
            try {
                nodeAnnouncements = JSON.parse(nodeAnnouncementsInput.value) || [];
            } catch(e) {
                nodeAnnouncements = [];
            }

            function renderAnnouncementsList() {

                const items = nodeAnnouncementsList.querySelectorAll('.node-announcement-item');
                items.forEach(item => item.remove());

                if (nodeAnnouncements.length === 0) {

            } else {
                    nodeAnnouncements.forEach((announcement, index) => {
                        const item = document.createElement('div');
                        item.className = 'node-announcement-item';
                        item.dataset.index = index;
                        item.style.cssText = 'background: var(--rivion-background); border: 1px solid var(--rivion-border); border-radius: 8px; padding: 15px; margin-bottom: 10px; position: relative;';
                        
                        item.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                                <div style="width: 24px; height: 24px; border-radius: 4px; background: ${announcement.color || '#3B82F6'};"></div>
                                <div style="flex: 1; min-width: 200px;">
                                    <strong style="color: var(--rivion-text-primary);">${announcement.node_name || 'Unknown Node'}</strong>
                                    <p style="color: var(--rivion-text-secondary); font-size: 13px; margin: 5px 0 0;">${announcement.title || 'No Title'}</p>
                                </div>
                                <button type="button" class="btn btn-danger btn-sm delete-node-announcement" data-index="${index}" style="padding: 5px 12px; font-size: 12px;">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        `;
                        
                        nodeAnnouncementsList.appendChild(item);
                    });
                }

                nodeAnnouncementsInput.value = JSON.stringify(nodeAnnouncements);


                document.querySelectorAll('.delete-node-announcement').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const idx = parseInt(this.dataset.index);
                        nodeAnnouncements.splice(idx, 1);
                        renderAnnouncementsList();
                    });
                });
            }


            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    const nodeSelect = document.getElementById('new_node_id');
                    const titleInput = document.getElementById('new_node_title');
                    const descInput = document.getElementById('new_node_description');
                    const iconInput = document.getElementById('new_node_icon');
                    const colorInput = document.getElementById('new_node_color');

                    const nodeId = nodeSelect.value;
                    const nodeName = nodeSelect.options[nodeSelect.selectedIndex]?.dataset?.name || '';
                    const title = titleInput.value.trim();
                    const description = descInput.value.trim();
                    const icon = iconInput.value;
                    const color = colorInput.value;

                    if (!nodeId) {
                        alert('Please select a node.');
                        return;
                    }

                    if (!title) {
                        alert('Please enter a title.');
                        return;
                    }


                    nodeAnnouncements.push({
                        node_id: parseInt(nodeId),
                        node_name: nodeName,
                        title: title,
                        description: description,
                        icon: icon,
                        color: color
                    });


                    renderAnnouncementsList();


                    nodeSelect.value = '';
                    titleInput.value = '';
                    descInput.value = '';
                    iconInput.value = 'fa-info-circle';
                    colorInput.value = '#3B82F6';
                    

                    const iconBubble = document.getElementById('new-node-icon-bubble');
                    if (iconBubble) {
                        iconBubble.dataset.icon = 'fa-info-circle';
                        iconBubble.querySelector('.rivion-icon-dot i').className = 'fas fa-info-circle';
                    }
                    

                    const colorBubble = document.getElementById('new-node-color-bubble');
                    if (colorBubble) {
                        colorBubble.dataset.color = '#3B82F6';
                        colorBubble.querySelector('.rivion-color-name').textContent = '#3B82F6';
                        colorBubble.querySelector('.rivion-color-dot').style.backgroundColor = '#3B82F6';
                    }
                });
            }


            document.querySelectorAll('.delete-node-announcement').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    nodeAnnouncements.splice(idx, 1);
                    renderAnnouncementsList();
                });
            });


            const colorBubble = document.getElementById('new-node-color-bubble');
            if (colorBubble) {
                colorBubble.addEventListener('click', function() {
                    const currentColor = this.dataset.color;
                    const targetInput = document.getElementById('new_node_color');
                    

                    const modal = document.createElement('div');
                    modal.className = 'color-picker-modal';
                    modal.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--rivion-background-secondary);
                        border: 1px solid var(--rivion-border);
                        border-radius: 12px;
                        padding: 20px;
                        z-index: 10000;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    `;
                    
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        z-index: 9999;
                    `;
                    

                    const colors = [
                        '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
                        '#F43F5E', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
                        '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#0284C7',
                        '#6B7280', '#374151', '#1F2937', '#111827'
                    ];
                    
                    let colorGrid = '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 15px;">';
                    colors.forEach(color => {
                        colorGrid += `
                            <button type="button" class="color-swatch" data-color="${color}" style="
                                width: 40px;
                                height: 40px;
                                border: 2px solid ${currentColor === color ? 'white' : 'transparent'};
                                background: ${color};
                                border-radius: 8px;
                                cursor: pointer;
                            "></button>
                        `;
                    });
                    colorGrid += '</div>';
                    

                    colorGrid += `
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" id="custom-node-color" value="${currentColor}" style="width: 50px; height: 40px; border: none; cursor: pointer;">
                            <input type="text" id="custom-node-color-text" value="${currentColor}" placeholder="#FFFFFF" style="flex: 1; padding: 10px; border: 1px solid var(--rivion-border); border-radius: 6px; background: var(--rivion-background); color: var(--rivion-text-primary);">
                            <button type="button" id="apply-custom-node-color" class="btn btn-primary" style="padding: 10px 15px;">Apply</button>
                        </div>
                    `;
                    
                    modal.innerHTML = colorGrid;
                    
                    document.body.appendChild(overlay);
                    document.body.appendChild(modal);
                    

                    modal.querySelectorAll('.color-swatch').forEach(swatch => {
                        swatch.addEventListener('click', function() {
                            const selectedColor = this.dataset.color;
                            applyColor(selectedColor);
                        });
                    });
                    

                    const customColorInput = modal.querySelector('#custom-node-color');
                    const customColorText = modal.querySelector('#custom-node-color-text');
                    
                    customColorInput.addEventListener('input', function() {
                        customColorText.value = this.value.toUpperCase();
                    });
                    
                    customColorText.addEventListener('input', function() {
                        if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                            customColorInput.value = this.value;
                        }
                    });
                    
                    modal.querySelector('#apply-custom-node-color').addEventListener('click', function() {
                        applyColor(customColorText.value);
                    });
                    
                    function applyColor(color) {
                        colorBubble.dataset.color = color;
                        colorBubble.querySelector('.rivion-color-name').textContent = color;
                        colorBubble.querySelector('.rivion-color-dot').style.backgroundColor = color;
                        targetInput.value = color;
                        
                        document.body.removeChild(modal);
                        document.body.removeChild(overlay);
                    }
                    
                    overlay.addEventListener('click', function() {
                        document.body.removeChild(modal);
                        document.body.removeChild(overlay);
                    });
                });
            }
        });
    </script>
@endsection

@section('preview')
    <iframe src="{{ route('index') }}" style="width: 1400px; height: 800px; border: none; transform: scale(0.714); transform-origin: 0 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);"></iframe>
@endsection
