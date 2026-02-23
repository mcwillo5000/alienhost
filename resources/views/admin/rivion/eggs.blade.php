@extends('layouts.rivion', ['navbar' => 'eggs', 'sideEditor' => true])

@section('title')
    Rivion Theme - Eggs
@endsection

@section('content')
    <form action="{{ route('admin.rivion.eggs.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Server Eggs</h1>
            <p>Configure background images for different server types. Eggs are organized by their Nests.</p>
        </div>


        <div class="rivion-theme-group">
            <h3><i class="fas fa-egg"></i> Egg Configurations</h3>
            
            <div class="egg-input-group" style="margin-bottom: 1.5rem;">
                <label><i class="fas fa-search" style="margin-right: 6px;"></i>Search Eggs</label>
                <input 
                    type="text" 
                    id="egg-search" 
                    placeholder="Type to search for eggs..."
                    autocomplete="off"
                >
                <p id="egg-search-results" style="margin-top: 8px; font-size: 12px; color: var(--rivion-text-muted); display: none;"></p>
            </div>
            
            <div id="nests-container">
            @if($nests && count($nests) > 0)
                @foreach($nests as $nest)
                    <div class="nest-accordion" data-nest-id="{{ $nest->id }}">
                        <div class="nest-header" onclick="toggleNest({{ $nest->id }})">
                            <div class="nest-header-left">
                                <i class="fas fa-chevron-right nest-chevron" id="chevron-{{ $nest->id }}"></i>
                                <i class="fas fa-folder nest-icon"></i>
                                <span class="nest-name">{{ $nest->name }}</span>
                                <span class="nest-id-badge">ID: {{ $nest->id }}</span>
                            </div>
                            <div class="nest-header-right">
                                <span class="nest-egg-count">{{ count($nest->eggs) }} {{ count($nest->eggs) === 1 ? 'egg' : 'eggs' }}</span>
                            </div>
                        </div>
                        <div class="nest-content" id="nest-content-{{ $nest->id }}" style="display: none;">
                            @if(count($nest->eggs) > 0)
                                @foreach($nest->eggs as $egg)
                                    <div class="egg-form-row" data-egg-name="{{ strtolower($egg->name) }}">
                                        <div class="egg-details-column">
                                            <div class="egg-name-title">
                                                <h4>{{ $egg->name }}</h4>
                                                <span class="egg-id-badge">ID: {{ $egg->id }}</span>
                                            </div>
                                            <div class="egg-input-group egg-url-group">
                                                <label>Image URL</label>
                                                <input type="url" name="egg_images[{{ $egg->id }}]" value="{{ $egg->image }}" placeholder="https://example.com/image.jpg">
                                            </div>
                                        </div>
                                        <div class="egg-preview">
                                            @if($egg->image)
                                                <img src="{{ $egg->image }}" alt="{{ $egg->name }}">
                                            @else
                                                <div class="egg-preview-placeholder">
                                                    <i class="fas fa-image"></i>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            @else
                                <div class="empty-nest-state">
                                    <p><i class="fas fa-info-circle"></i> No eggs in this nest.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            @else
                <div class="empty-state">
                    <i class="fas fa-egg fa-3x text-muted"></i>
                    <h4>No Nests Found</h4>
                    <p>No nests or eggs are available in the database. Please create some nests and eggs first.</p>
                </div>
            @endif
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Egg Settings
            </button>
        </div>
    </form>
@endsection

@section('scripts')
    @parent
    <style>

        #nests-container .nest-accordion {
            background: var(--rivion-background-secondary);
            border: 1px solid var(--rivion-border);
            border-radius: var(--rivion-radius);
            margin-bottom: 8px;
            overflow: hidden;
            transition: var(--rivion-transition);
        }
        
        #nests-container .nest-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            background: var(--rivion-background);
            transition: var(--rivion-transition);
            user-select: none;
        }
        
        #nests-container .nest-header:hover {
            background: var(--rivion-border);
        }
        
        #nests-container .nest-header-left {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            flex-direction: row !important;
        }
        
        #nests-container .nest-chevron {
            color: var(--rivion-text-secondary);
            font-size: 11px;
            transition: var(--rivion-transition);
            width: 11px;
        }
        
        #nests-container .nest-chevron.open {
            transform: rotate(90deg);
        }
        
        #nests-container .nest-icon {
            color: var(--rivion-primary);
            font-size: 14px;
        }
        
        #nests-container .nest-name {
            font-weight: 600;
            font-size: 14px;
            color: var(--rivion-text);
        }
        
        #nests-container .nest-id-badge {
            background: var(--rivion-border);
            color: var(--rivion-text-secondary);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-family: monospace;
        }
        
        #nests-container .nest-header-right {
            display: flex;
            align-items: center;
        }
        
        #nests-container .nest-egg-count {
            background: rgba(56, 90, 241, 0.2);
            color: var(--rivion-primary);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        
        #nests-container .nest-content {
            padding: 0;
            border-top: 1px solid var(--rivion-border);
            animation: slideDown 0.3s ease;
        }
        
        #nests-container .nest-content .egg-form-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 20px !important;
            margin: 0 !important;
            padding: 14px 16px !important;
            border-bottom: 1px solid var(--rivion-border, rgba(255, 255, 255, 0.05));
            background: transparent !important;
            border-radius: 0 !important;
        }
        
        #nests-container .nest-content .egg-form-row:last-child {
            border-bottom: none;
        }
        
        #nests-container .nest-content .egg-form-row .egg-details-column {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            flex: 1 1 auto !important;
            min-width: 200px !important;
            max-width: calc(100% - 150px) !important;
            overflow: hidden !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-name-title {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 10px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-name-title h4 {
            margin: 0 !important;
            padding: 0 !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1.4 !important;
            color: var(--rivion-text) !important;
        }
        
        #nests-container .egg-id-badge {
            background: rgba(56, 90, 241, 0.15) !important;
            color: var(--rivion-primary) !important;
            padding: 3px 8px !important;
            border-radius: 4px !important;
            font-size: 11px !important;
            font-family: monospace !important;
            white-space: nowrap !important;
            display: inline-block !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-input-group {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            width: 100% !important;
            flex: 1 1 100% !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-input-group label {
            display: none !important;
        }
        

        #nests-container .nest-content .egg-form-row .egg-input-group input,
        #nests-container .nest-content .egg-form-row .egg-input-group input[type="url"],
        #nests-container .nest-content .egg-form-row .egg-url-group input,
        #nests-container .nest-content .egg-form-row .egg-url-group input[type="url"] {
            padding: 10px 14px !important;
            font-size: 13px !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            background: var(--rivion-background) !important;
            border: 1px solid var(--rivion-border) !important;
            border-radius: var(--rivion-radius) !important;
            color: var(--rivion-text) !important;
            box-sizing: border-box !important;
            display: block !important;
            text-overflow: ellipsis !important;
            overflow: hidden !important;
            flex: none !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-input-group input:focus,
        #nests-container .nest-content .egg-form-row .egg-input-group input[type="url"]:focus {
            outline: none !important;
            border-color: var(--rivion-primary) !important;
            box-shadow: 0 0 0 2px rgba(56, 90, 241, 0.2) !important;
        }
        

        #nests-container .nest-content .egg-form-row .egg-preview {
            margin: 0 !important;
            margin-left: auto !important;
            margin-right: 8px !important;
            padding: 0 !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 120px !important;
            width: 120px !important;
            min-width: 120px !important;
            max-width: 120px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-preview img {
            width: 120px !important;
            height: 68px !important;
            max-height: 68px !important;
            object-fit: cover !important;
            border-radius: var(--rivion-radius) !important;
            border: 1px solid var(--rivion-border) !important;
            display: block !important;
        }
        
        #nests-container .nest-content .egg-form-row .egg-preview-placeholder {
            width: 120px !important;
            height: 68px !important;
            background: var(--rivion-background) !important;
            border: 1px dashed var(--rivion-border) !important;
            border-radius: var(--rivion-radius) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: var(--rivion-text-secondary) !important;
            font-size: 24px !important;
        }
        
        #nests-container .empty-nest-state {
            padding: 16px;
            text-align: center;
            color: var(--rivion-text-secondary);
            font-size: 13px;
        }
        
        #nests-container .empty-nest-state i {
            margin-right: 6px;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 2000px;
            }
        }
        

        #nests-container .nest-accordion.search-hidden {
            display: none;
        }
        
        #nests-container .egg-form-row.search-hidden {
            display: none !important;
        }
        
        #nests-container .nest-accordion.search-active .nest-content {
            display: block !important;
        }
    </style>
    
    <script>

        let currentOpenNest = null;
        
        function toggleNest(nestId) {
            const content = document.getElementById('nest-content-' + nestId);
            const chevron = document.getElementById('chevron-' + nestId);
            
            if (currentOpenNest === nestId) {
                content.style.display = 'none';
                chevron.classList.remove('open');
                currentOpenNest = null;
                return;
            }
            
            if (currentOpenNest !== null) {
                const currentContent = document.getElementById('nest-content-' + currentOpenNest);
                const currentChevron = document.getElementById('chevron-' + currentOpenNest);
                if (currentContent) {
                    currentContent.style.display = 'none';
                }
                if (currentChevron) {
                    currentChevron.classList.remove('open');
                }
            }
            
            content.style.display = 'block';
            chevron.classList.add('open');
            currentOpenNest = nestId;
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            const eggSearchInput = document.getElementById('egg-search');
            const eggSearchResults = document.getElementById('egg-search-results');
            const nestsContainer = document.getElementById('nests-container');
            
            if (eggSearchInput && nestsContainer) {
                eggSearchInput.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase().trim();
                    const nestAccordions = nestsContainer.querySelectorAll('.nest-accordion');
                    let totalVisibleEggs = 0;
                    let totalEggs = 0;
                    
                    nestAccordions.forEach(function(nest) {
                        const eggRows = nest.querySelectorAll('.egg-form-row');
                        let nestHasVisibleEggs = false;
                        
                        eggRows.forEach(function(row) {
                            const eggName = row.getAttribute('data-egg-name') || '';
                            totalEggs++;
                            
                            if (searchTerm === '' || eggName.includes(searchTerm)) {
                                row.classList.remove('search-hidden');
                                nestHasVisibleEggs = true;
                                totalVisibleEggs++;
                            } else {
                                row.classList.add('search-hidden');
                            }
                        });
                        
                        if (searchTerm === '') {
                            nest.classList.remove('search-hidden', 'search-active');
                        } else if (nestHasVisibleEggs) {
                            nest.classList.remove('search-hidden');
                            nest.classList.add('search-active');
                        } else {
                            nest.classList.add('search-hidden');
                            nest.classList.remove('search-active');
                        }
                    });
                    
                    if (searchTerm !== '' && eggSearchResults) {
                        eggSearchResults.style.display = 'block';
                        eggSearchResults.textContent = 'Showing ' + totalVisibleEggs + ' of ' + totalEggs + ' eggs';
                    } else if (eggSearchResults) {
                        eggSearchResults.style.display = 'none';
                    }
                });
            }
        });

        document.querySelector('form').addEventListener('submit', function(e) {
            let hasData = false;
            const urlInputs = document.querySelectorAll('input[type="url"]');
            
            urlInputs.forEach(input => {
                if (input.value.trim()) {
                    hasData = true;
                }
            });
            
            if (!hasData) {
                e.preventDefault();
                alert('Please add at least one image URL before saving.');
                return false;
            }
        });


        document.addEventListener('input', function(e) {
            if (e.target.type === 'url') {
                const row = e.target.closest('.egg-form-row');
                let preview = row.querySelector('.egg-preview');
                
                if (e.target.value.trim()) {
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'egg-preview';
                        row.appendChild(preview);
                    }
                    
                    preview.innerHTML = `<img src="${e.target.value}" alt="Preview" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" 
                                        onerror="this.style.display='none';" onload="this.style.display='block';">`;
                } else if (preview) {
                    preview.remove();
                }
            }
        });
    </script>
@endsection