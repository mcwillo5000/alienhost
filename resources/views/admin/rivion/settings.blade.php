@extends('layouts.rivion', ['navbar' => 'settings', 'sideEditor' => true])

@section('title')
    Rivion Theme - Settings
@endsection

@section('content')
    <form action="{{ route('admin.rivion.settings.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Site Settings</h1>
            <p>Configure site assets and branding elements</p>
        </div>


        <div class="rivion-theme-group">
            <h3>Site assets</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Site icon</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Site Icon URL</label>
                    <input type="url" name="site_icon" 
                           value="{{ old('site_icon', $settings['site_icon'] ?? '') }}" 
                           placeholder="https://example.com/site-icon.png"
                           onchange="updatePreview('site_icon', this.value)">
                </div>
                
                <div class="card-input-group">
                    <small class="form-text text-muted">Logo or icon displayed in the site header and branding</small>
                </div>
                
                @if(!empty($settings['site_icon']))
                    <div class="egg-preview" id="site_icon_preview">
                        <img src="{{ $settings['site_icon'] }}" alt="Site Icon">
                    </div>
                @else
                    <div class="egg-preview" id="site_icon_preview" style="display: none;">
                        <img src="" alt="Site Icon">
                    </div>
                @endif
            </div>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Favicon</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Favicon URL</label>
                    <input type="url" name="favicon" 
                           value="{{ old('favicon', $settings['favicon'] ?? '') }}" 
                           placeholder="https://example.com/favicon.ico"
                           onchange="updatePreview('favicon', this.value)">
                </div>
                
                <div class="card-input-group">
                    <small class="form-text text-muted">Small icon displayed in browser tabs and bookmarks (16x16 or 32x32 pixels)</small>
                </div>
                
                @if(!empty($settings['favicon']))
                    <div class="egg-preview" id="favicon_preview">
                        <img src="{{ $settings['favicon'] }}" alt="Favicon">
                    </div>
                @else
                    <div class="egg-preview" id="favicon_preview" style="display: none;">
                        <img src="" alt="Favicon">
                    </div>
                @endif
            </div>
        </div>


        <div class="rivion-theme-group">
            <h3>Console Settings</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">
                Customize the text displayed in the server console. These settings will replace the default Pterodactyl text patterns in all console output.
            </p>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Container Prompt Text</h4>
                <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">Replaces "container@pterodactyl~" in console output with your custom text.</p>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <input type="text" name="console_container_text" 
                           value="{{ old('console_container_text', $settings['console_container_text'] ?? 'container@pterodactyl~') }}" 
                           placeholder="container@pterodactyl~">
                </div>
            </div>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 15px;">Daemon Message Text</h4>
                <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">Replaces "[Pterodactyl Daemon]:" in console output with your custom text.</p>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <input type="text" name="console_daemon_text" 
                           value="{{ old('console_daemon_text', $settings['console_daemon_text'] ?? '[Pterodactyl Daemon]:') }}" 
                           placeholder="[Pterodactyl Daemon]:">
                </div>
            </div>
            
            <div class="card-form-section" style="padding-bottom: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h4 style="font-size: 1.25rem; margin-bottom: 4px;">Enable Text Replacement</h4>
                        <p style="color: var(--rivion-text-secondary); font-size: 13px; margin: 0;">Automatically replace default Pterodactyl text patterns with your custom text.</p>
                    </div>
                    <label class="rivion-toggle-switch" style="flex-shrink: 0; margin-left: 20px;">
                        <input type="checkbox" name="console_enable_replacement" value="1" 
                               {{ old('console_enable_replacement', $settings['console_enable_replacement'] ?? '1') === '1' ? 'checked' : '' }}>
                        <span class="rivion-toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="rivion-theme-group">
            <h3><i class="fas fa-server"></i> Per-Node Console Text Overrides</h3>
            <p style="color: var(--rivion-text-secondary); margin-bottom: 20px; font-size: 14px;">
                Override the Container Prompt Text and Daemon Message Text for specific nodes. If a node has a custom value set, it will be used instead of the global setting above.
            </p>
            
            <div class="egg-input-group" style="margin-bottom: 1.5rem;">
                <label><i class="fas fa-search" style="margin-right: 6px;"></i>Search Nodes</label>
                <input 
                    type="text" 
                    id="node-search" 
                    placeholder="Type to search for nodes..."
                    autocomplete="off"
                >
                <p id="node-search-results" style="margin-top: 8px; font-size: 12px; color: var(--rivion-text-secondary); display: none;"></p>
            </div>
            
            <div id="nodes-container">
            @if($nodes->count() > 0)
                @foreach($nodes as $node)
                    <div class="node-card" data-node-name="{{ strtolower($node->name) }}" data-node-id="{{ $node->id }}">
                        <div class="node-card-header" onclick="toggleNode({{ $node->id }})">
                            <div class="node-card-header-left">
                                <i class="fas fa-chevron-right node-chevron" id="node-chevron-{{ $node->id }}"></i>
                                <i class="fas fa-server node-card-icon"></i>
                                <span class="node-card-name">{{ $node->name }}</span>
                                <span class="node-id-badge">ID: {{ $node->id }}</span>
                            </div>
                            <div class="node-card-header-right">
                                @if($node->container_text || $node->daemon_text)
                                    <span class="node-status-badge node-status-custom">
                                        <i class="fas fa-check-circle"></i> Custom
                                    </span>
                                @else
                                    <span class="node-status-badge node-status-global">
                                        <i class="fas fa-globe"></i> Global
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div class="node-card-content" id="node-content-{{ $node->id }}" style="display: none;">
                            <div class="node-card-field">
                                <label>Container Prompt Text</label>
                                <input type="text" name="node_container_text[{{ $node->id }}]" 
                                       value="{{ old('node_container_text.'.$node->id, $node->container_text ?? '') }}" 
                                       placeholder="Leave empty to use global setting">
                                @if($node->container_text)
                                    <span class="node-field-status node-field-custom">
                                        <i class="fas fa-check-circle"></i> Custom value set
                                    </span>
                                @else
                                    <span class="node-field-status node-field-global">
                                        <i class="fas fa-info-circle"></i> Using global setting
                                    </span>
                                @endif
                            </div>
                            <div class="node-card-field">
                                <label>Daemon Message Text</label>
                                <input type="text" name="node_daemon_text[{{ $node->id }}]" 
                                       value="{{ old('node_daemon_text.'.$node->id, $node->daemon_text ?? '') }}" 
                                       placeholder="Leave empty to use global setting">
                                @if($node->daemon_text)
                                    <span class="node-field-status node-field-custom">
                                        <i class="fas fa-check-circle"></i> Custom value set
                                    </span>
                                @else
                                    <span class="node-field-status node-field-global">
                                        <i class="fas fa-info-circle"></i> Using global setting
                                    </span>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            @else
                <div style="background: var(--rivion-background-secondary); border: 1px solid var(--rivion-border); border-radius: var(--rivion-radius); padding: 20px; text-align: center;">
                    <p style="color: var(--rivion-text-secondary); font-size: 13px; margin: 0;">
                        <i class="fas fa-info-circle" style="color: var(--rivion-primary); margin-right: 8px;"></i>
                        No nodes found. Add nodes in the Nodes section to configure per-node settings.
                    </p>
                </div>
            @endif
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Settings
            </button>
        </div>
    </form>
@endsection

@section('preview')
    <iframe src="{{ route('index') }}" style="width: 1400px; height: 800px; border: none; transform: scale(0.714); transform-origin: 0 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);"></iframe>
@endsection

@section('scripts')
    @parent
    <style>
        /* Node card accordion styles */
        #nodes-container .node-card {
            background: var(--rivion-background-secondary);
            border: 1px solid var(--rivion-border);
            border-radius: var(--rivion-radius);
            margin-bottom: 8px;
            overflow: hidden;
            transition: var(--rivion-transition);
        }
        
        #nodes-container .node-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            background: var(--rivion-background);
            transition: var(--rivion-transition);
            user-select: none;
        }
        
        #nodes-container .node-card-header:hover {
            background: var(--rivion-border);
        }
        
        #nodes-container .node-card-header-left {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            flex-direction: row !important;
        }
        
        #nodes-container .node-chevron {
            color: var(--rivion-text-secondary);
            font-size: 11px;
            transition: var(--rivion-transition);
            width: 11px;
        }
        
        #nodes-container .node-chevron.open {
            transform: rotate(90deg);
        }
        
        #nodes-container .node-card-icon {
            color: var(--rivion-primary);
            font-size: 14px;
        }
        
        #nodes-container .node-card-name {
            font-weight: 600;
            font-size: 14px;
            color: var(--rivion-text);
        }
        
        #nodes-container .node-id-badge {
            background: var(--rivion-border);
            color: var(--rivion-text-secondary);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-family: monospace;
        }
        
        #nodes-container .node-card-header-right {
            display: flex;
            align-items: center;
        }
        
        #nodes-container .node-status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        #nodes-container .node-status-custom {
            background: rgba(16, 185, 129, 0.15);
            color: var(--rivion-success);
        }
        
        #nodes-container .node-status-global {
            background: rgba(56, 90, 241, 0.15);
            color: var(--rivion-primary);
        }
        
        #nodes-container .node-card-content {
            padding: 16px;
            border-top: 1px solid var(--rivion-border);
            animation: nodeSlideDown 0.3s ease;
        }
        
        #nodes-container .node-card-field {
            margin-bottom: 16px;
        }
        
        #nodes-container .node-card-field:last-child {
            margin-bottom: 0;
        }
        
        #nodes-container .node-card-field label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: var(--rivion-text);
            margin-bottom: 6px;
        }
        
        #nodes-container .node-card-field input {
            padding: 10px 14px;
            font-size: 13px;
            width: 100%;
            background: var(--rivion-background);
            border: 1px solid var(--rivion-border);
            border-radius: var(--rivion-radius);
            color: var(--rivion-text);
            box-sizing: border-box;
            transition: var(--rivion-transition);
        }
        
        #nodes-container .node-card-field input:focus {
            outline: none;
            border-color: var(--rivion-primary);
            box-shadow: 0 0 0 2px rgba(56, 90, 241, 0.2);
        }
        
        #nodes-container .node-field-status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            margin-top: 6px;
        }
        
        #nodes-container .node-field-custom {
            color: var(--rivion-success);
        }
        
        #nodes-container .node-field-global {
            color: var(--rivion-text-secondary);
        }
        
        /* Node search filtering */
        #nodes-container .node-card.search-hidden {
            display: none;
        }
        
        #nodes-container .node-card.search-active .node-card-content {
            display: block !important;
        }
        
        @keyframes nodeSlideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 500px;
            }
        }
    </style>
    
    <script>
        function updatePreview(type, url) {
            const preview = document.getElementById(type + '_preview');
            const img = preview.querySelector('img');
            
            if (url && url.trim() !== '') {
                img.src = url;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }
        
        /* Node accordion */
        let currentOpenNode = null;
        
        function toggleNode(nodeId) {
            const content = document.getElementById('node-content-' + nodeId);
            const chevron = document.getElementById('node-chevron-' + nodeId);
            
            if (currentOpenNode === nodeId) {
                content.style.display = 'none';
                chevron.classList.remove('open');
                currentOpenNode = null;
                return;
            }
            
            if (currentOpenNode !== null) {
                const currentContent = document.getElementById('node-content-' + currentOpenNode);
                const currentChevron = document.getElementById('node-chevron-' + currentOpenNode);
                if (currentContent) currentContent.style.display = 'none';
                if (currentChevron) currentChevron.classList.remove('open');
            }
            
            content.style.display = 'block';
            chevron.classList.add('open');
            currentOpenNode = nodeId;
        }
        
        /* Node search */
        document.addEventListener('DOMContentLoaded', function() {
            const nodeSearchInput = document.getElementById('node-search');
            const nodeSearchResults = document.getElementById('node-search-results');
            const nodesContainer = document.getElementById('nodes-container');
            
            if (nodeSearchInput && nodesContainer) {
                nodeSearchInput.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase().trim();
                    const nodeCards = nodesContainer.querySelectorAll('.node-card');
                    let totalVisible = 0;
                    let total = nodeCards.length;
                    
                    nodeCards.forEach(function(card) {
                        const nodeName = card.getAttribute('data-node-name') || '';
                        
                        if (searchTerm === '' || nodeName.includes(searchTerm)) {
                            card.classList.remove('search-hidden');
                            if (searchTerm !== '') {
                                card.classList.add('search-active');
                            } else {
                                card.classList.remove('search-active');
                            }
                            totalVisible++;
                        } else {
                            card.classList.add('search-hidden');
                            card.classList.remove('search-active');
                        }
                    });
                    
                    if (searchTerm !== '' && nodeSearchResults) {
                        nodeSearchResults.style.display = 'block';
                        nodeSearchResults.textContent = 'Showing ' + totalVisible + ' of ' + total + ' nodes';
                    } else if (nodeSearchResults) {
                        nodeSearchResults.style.display = 'none';
                    }
                });
            }
        });
    </script>
@endsection
