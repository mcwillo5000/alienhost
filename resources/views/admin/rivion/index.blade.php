@extends('layouts.rivion', ['navbar' => 'general', 'sideEditor' => true])

@section('title')
    Rivion Theme
@endsection

@section('content')
    <form action="{{ route('admin.rivion.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Theme Colors</h1>
            <p>Configure colors for both light and dark modes</p>
        </div>
    

        <div class="rivion-theme-group">
            <h3>Light theme</h3>
            
            <div class="rivion-color-grid">
                <div class="rivion-color-bubble" data-color="light_primary" data-default="#3B82F6">
                    <span class="rivion-color-name">Primary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_primary ?? '#3B82F6' }};"></div>
                    <input type="color" name="light_primary" value="{{ $light_primary ?? '#3B82F6' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_secondary" data-default="#1E40AF">
                    <span class="rivion-color-name">Secondary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_secondary ?? '#1E40AF' }};"></div>
                    <input type="color" name="light_secondary" value="{{ $light_secondary ?? '#1E40AF' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_border" data-default="#E5E7EB">
                    <span class="rivion-color-name">Border</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_border ?? '#E5E7EB' }};"></div>
                    <input type="color" name="light_border" value="{{ $light_border ?? '#E5E7EB' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_text_base" data-default="#111827">
                    <span class="rivion-color-name">Text Base</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_text_base ?? '#111827' }};"></div>
                    <input type="color" name="light_text_base" value="{{ $light_text_base ?? '#111827' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_text_muted" data-default="#6B7280">
                    <span class="rivion-color-name">Text Muted</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_text_muted ?? '#6B7280' }};"></div>
                    <input type="color" name="light_text_muted" value="{{ $light_text_muted ?? '#6B7280' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_text_inverted" data-default="#FFFFFF">
                    <span class="rivion-color-name">Text Inverted</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_text_inverted ?? '#FFFFFF' }};"></div>
                    <input type="color" name="light_text_inverted" value="{{ $light_text_inverted ?? '#FFFFFF' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_background" data-default="#FFFFFF">
                    <span class="rivion-color-name">Background</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_background ?? '#FFFFFF' }};"></div>
                    <input type="color" name="light_background" value="{{ $light_background ?? '#FFFFFF' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="light_background_secondary" data-default="#F9FAFB">
                    <span class="rivion-color-name">Background Secondary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $light_background_secondary ?? '#F9FAFB' }};"></div>
                    <input type="color" name="light_background_secondary" value="{{ $light_background_secondary ?? '#F9FAFB' }}">
                </div>
            </div>
        </div>


        <div class="rivion-theme-group">
            <h3>Dark theme</h3>
            
            <div class="rivion-color-grid">
                <div class="rivion-color-bubble" data-color="dark_primary" data-default="#3B82F6">
                    <span class="rivion-color-name">Primary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_primary ?? '#3B82F6' }};"></div>
                    <input type="color" name="dark_primary" value="{{ $dark_primary ?? '#3B82F6' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_secondary" data-default="#1E40AF">
                    <span class="rivion-color-name">Secondary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_secondary ?? '#1E40AF' }};"></div>
                    <input type="color" name="dark_secondary" value="{{ $dark_secondary ?? '#1E40AF' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_border" data-default="#374151">
                    <span class="rivion-color-name">Border</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_border ?? '#374151' }};"></div>
                    <input type="color" name="dark_border" value="{{ $dark_border ?? '#374151' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_text_base" data-default="#F9FAFB">
                    <span class="rivion-color-name">Text Base</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_text_base ?? '#F9FAFB' }};"></div>
                    <input type="color" name="dark_text_base" value="{{ $dark_text_base ?? '#F9FAFB' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_text_muted" data-default="#9CA3AF">
                    <span class="rivion-color-name">Text Muted</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_text_muted ?? '#9CA3AF' }};"></div>
                    <input type="color" name="dark_text_muted" value="{{ $dark_text_muted ?? '#9CA3AF' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_text_inverted" data-default="#111827">
                    <span class="rivion-color-name">Text Inverted</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_text_inverted ?? '#111827' }};"></div>
                    <input type="color" name="dark_text_inverted" value="{{ $dark_text_inverted ?? '#111827' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_background" data-default="#111827">
                    <span class="rivion-color-name">Background</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_background ?? '#111827' }};"></div>
                    <input type="color" name="dark_background" value="{{ $dark_background ?? '#111827' }}">
                </div>
                
                <div class="rivion-color-bubble" data-color="dark_background_secondary" data-default="#1F2937">
                    <span class="rivion-color-name">Background Secondary</span>
                    <div class="rivion-color-dot" style="background-color: {{ $dark_background_secondary ?? '#1F2937' }};"></div>
                    <input type="color" name="dark_background_secondary" value="{{ $dark_background_secondary ?? '#1F2937' }}">
                </div>
            </div>
        </div>


        <div class="rivion-theme-group">
            <h3>Theme Settings</h3>
            
            <div class="card-form-section">
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Default Theme</label>
                    <select name="default_theme">
                        <option value="dark" {{ ($default_theme ?? 'dark') === 'dark' ? 'selected' : '' }}>Dark Theme</option>
                        <option value="light" {{ ($default_theme ?? 'dark') === 'light' ? 'selected' : '' }}>Light Theme</option>
                        <option value="system" {{ ($default_theme ?? 'dark') === 'system' ? 'selected' : '' }}>System Preference</option>
                    </select>
                </div>

                <div class="card-input-group">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="margin-bottom: 0;">Disable Theme Switcher</label>
                        <label class="rivion-toggle-switch">
                            <input type="checkbox" name="disable_theme_toggle" value="1" {{ ($disable_theme_toggle ?? '0') === '1' ? 'checked' : '' }}>
                            <span class="rivion-toggle-slider"></span>
                        </label>
                    </div>
                </div>
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

@section('scripts')
    @parent
    <script>

        let currentColorInput = null;
        
        document.addEventListener('click', function(e) {
            if (e.target.closest('.rivion-color-bubble')) {
                const bubble = e.target.closest('.rivion-color-bubble');
                const input = bubble.querySelector('input[type="color"]');
                currentColorInput = input;
                showCustomColorPicker(input, bubble);
            }
        });

        function showCustomColorPicker(input, bubble) {

            const existingPicker = document.querySelector('.clr-picker');
            if (existingPicker) existingPicker.remove();

            const picker = document.createElement('div');
            picker.className = 'clr-picker clr-dark clr-open';
            picker.innerHTML = `
                <input class="clr-color" type="text" value="${input.value}" spellcheck="false">
                <div class="clr-gradient">
                    <div class="clr-marker"></div>
                </div>
                <div class="clr-hue">
                    <input type="range" min="0" max="360" step="1" value="0" class="hue-slider">
                    <div class="clr-hue-marker"></div>
                </div>
                <div class="clr-swatches">
                    <button type="button" style="background-color: #ff6666;" data-color="#ff6666"></button>
                    <button type="button" style="background-color: #ffc466;" data-color="#ffc466"></button>
                    <button type="button" style="background-color: #ccff66;" data-color="#ccff66"></button>
                    <button type="button" style="background-color: #69ff66;" data-color="#69ff66"></button>
                    <button type="button" style="background-color: #66ffa1;" data-color="#66ffa1"></button>
                    <button type="button" style="background-color: #66ffd6;" data-color="#66ffd6"></button>
                    <button type="button" style="background-color: #66e6ff;" data-color="#66e6ff"></button>
                    <button type="button" style="background-color: #66b0ff;" data-color="#66b0ff"></button>
                    <button type="button" style="background-color: #6678ff;" data-color="#6678ff"></button>
                    <button type="button" style="background-color: #9466ff;" data-color="#9466ff"></button>
                    <button type="button" style="background-color: #cc66ff;" data-color="#cc66ff"></button>
                    <button type="button" style="background-color: #ff66d9;" data-color="#ff66d9"></button>
                </div>
            `;
            

            const rect = bubble.getBoundingClientRect();
            const pickerWidth = 240; 
            const pickerHeight = 280; 
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
                    top = window.innerHeight - pickerHeight - 10;
                }
            }
            

            if (top < 10) {
                top = 10;
            }
            
            picker.style.left = left + 'px';
            picker.style.top = top + 'px';
            
            document.body.appendChild(picker);
            

            const hexInput = picker.querySelector('.clr-color');
            const gradient = picker.querySelector('.clr-gradient');
            const marker = picker.querySelector('.clr-marker');
            const hueSlider = picker.querySelector('.hue-slider');
            const hueMarker = picker.querySelector('.clr-hue-marker');
            const swatches = picker.querySelectorAll('.clr-swatches button');
            
            let currentHue = 0;
            let currentSaturation = 100;
            let currentLightness = 50;
            

            function updateColor(hex) {
                hexInput.value = hex;
                currentColorInput.value = hex;
                

                const dot = bubble.querySelector('.rivion-color-dot');
                dot.style.backgroundColor = hex;
                

                const colorName = bubble.dataset.color;
                

                updateCSSVariable(colorName, hex);
                

                currentColorInput.dispatchEvent(new Event('change'));
            }
            

            hexInput.addEventListener('input', function() {
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    updateColor(this.value);
                }
            });
            

            let isDragging = false;
            
            gradient.addEventListener('mousedown', function(e) {
                isDragging = true;
                updateGradientColor(e);
            });
            
            gradient.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    updateGradientColor(e);
                }
            });
            
            document.addEventListener('mouseup', function() {
                isDragging = false;
            });
            
            function updateGradientColor(e) {
                const rect = gradient.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
                
                const saturation = (x / rect.width) * 100;
                const lightness = ((rect.height - y) / rect.height) * 100;
                
                currentSaturation = saturation;
                currentLightness = lightness;
                

                const hex = hslToHex(currentHue, saturation, lightness);
                updateColor(hex);
                

                marker.style.left = x + 'px';
                marker.style.top = y + 'px';
            }
            

            hueSlider.addEventListener('input', function() {
                currentHue = parseInt(this.value);
                

                gradient.style.background = `
                    linear-gradient(to right, white, transparent),
                    linear-gradient(to top, black, transparent),
                    hsl(${currentHue}, 100%, 50%)
                `;
                

                hueMarker.style.left = (currentHue / 360) * 100 + '%';
                

                const hex = hslToHex(currentHue, currentSaturation, currentLightness);
                updateColor(hex);
            });
            

            swatches.forEach(swatch => {
                swatch.addEventListener('click', function() {
                    const color = this.dataset.color;
                    updateColor(color);
                });
            });
            

            setTimeout(() => {
                document.addEventListener('click', function closeHandler(e) {
                    if (!picker.contains(e.target)) {
                        picker.remove();
                        document.removeEventListener('click', closeHandler);
                    }
                });
            }, 100);
        }
        

        function hslToHex(h, s, l) {
            s /= 100;
            l /= 100;
            
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l - c / 2;
            
            let r = 0, g = 0, b = 0;
            
            if (0 <= h && h < 60) {
                r = c; g = x; b = 0;
            } else if (60 <= h && h < 120) {
                r = x; g = c; b = 0;
            } else if (120 <= h && h < 180) {
                r = 0; g = c; b = x;
            } else if (180 <= h && h < 240) {
                r = 0; g = x; b = c;
            } else if (240 <= h && h < 300) {
                r = x; g = 0; b = c;
            } else if (300 <= h && h < 360) {
                r = c; g = 0; b = x;
            }
            
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        document.addEventListener('change', function(e) {
            if (e.target.type === 'color') {
                const bubble = e.target.closest('.rivion-color-bubble');
                const dot = bubble.querySelector('.rivion-color-dot');
                const colorName = bubble.dataset.color;
                const colorValue = e.target.value;
                
                console.log('Color changed:', colorName, colorValue); 
                

                dot.style.backgroundColor = colorValue;
                

                updateCSSVariable(colorName, colorValue);
                

                updateThemeBasedColors();
            }
        });

        function updateThemeBasedColors() {

            const isDarkMode = document.documentElement.hasAttribute('data-theme') && 
                             document.documentElement.getAttribute('data-theme') === 'dark';
            

            document.querySelectorAll('.rivion-color-bubble').forEach(bubble => {
                const colorName = bubble.dataset.color;
                const input = bubble.querySelector('input[type="color"]');
                const isLightColor = colorName.startsWith('light_');
                const isDarkColor = colorName.startsWith('dark_');
                
                if (input && input.value && 
                    ((isDarkMode && isDarkColor) || (!isDarkMode && isLightColor))) {
                    updateCSSVariable(colorName, input.value);
                }
            });
        }

        function updateCSSVariable(colorName, colorValue) {
            const root = document.documentElement;
            
            console.log('Updating CSS variable for:', colorName, colorValue); 
            

            const colorMap = {
                'light_primary': '--theme-primary',
                'light_secondary': '--theme-secondary',
                'light_border': '--theme-border',
                'light_text_base': '--theme-text-base',
                'light_text_muted': '--theme-text-muted',
                'light_text_inverted': '--theme-text-inverted',
                'light_background': '--theme-background',
                'light_background_secondary': '--theme-background-secondary',
                'dark_primary': '--theme-primary',
                'dark_secondary': '--theme-secondary',
                'dark_border': '--theme-border',
                'dark_text_base': '--theme-text-base',
                'dark_text_muted': '--theme-text-muted',
                'dark_text_inverted': '--theme-text-inverted',
                'dark_background': '--theme-background',
                'dark_background_secondary': '--theme-background-secondary'
            };
            
            const cssVar = colorMap[colorName];
            if (cssVar) {
                console.log('Setting CSS variable:', cssVar, colorValue); 
                

                const isDarkMode = document.documentElement.hasAttribute('data-theme') && 
                                  document.documentElement.getAttribute('data-theme') === 'dark';
                
                console.log('Dark mode:', isDarkMode, 'Color name starts with dark:', colorName.startsWith('dark_')); 
                

                root.style.setProperty(cssVar, colorValue);

                console.log('CSS variable updated. Current value:', root.style.getPropertyValue(cssVar)); 
            } else {
                console.log('No CSS variable mapping found for:', colorName);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {

            updateThemeBasedColors();
            

            document.querySelectorAll('.rivion-color-dot').forEach(dot => {
                dot.addEventListener('mouseenter', function() {
                    const bubble = this.closest('.rivion-color-bubble');
                    const input = bubble.querySelector('input[type="color"]');
                    const colorValue = input.value.toUpperCase();
                    

                    const tooltip = document.createElement('div');
                    tooltip.className = 'color-tooltip';
                    tooltip.textContent = colorValue;
                    tooltip.style.cssText = `
                        position: absolute;
                        background: #1a1a1a;
                        color: #f8f9fa;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        z-index: 1000;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                        border: 1px solid #374151;
                        pointer-events: none;
                        top: -35px;
                        left: 50%;
                        transform: translateX(-50%);
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    `;
                    
                    bubble.style.position = 'relative';
                    bubble.appendChild(tooltip);
                    

                    setTimeout(() => tooltip.style.opacity = '1', 10);
                });
                
                dot.addEventListener('mouseleave', function() {
                    const tooltip = this.closest('.rivion-color-bubble').querySelector('.color-tooltip');
                    if (tooltip) {
                        tooltip.style.opacity = '0';
                        setTimeout(() => tooltip.remove(), 200);
                    }
                });
            });
            

            console.log('🎨 Rivion Theme Editor loaded!');
            console.log('- Change any color to see the live preview update instantly below');
            console.log('- Hover over color dots to see hex values');
        });
    </script>
    
    <style>

        .rivion-color-bubble input[type="color"] {
            display: none !important;
        }
        

        .clr-picker {
            position: fixed;
            background: #1a1a1a;
            border: 1px solid #374151;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            padding: 16px;
            width: 240px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .clr-color {
            width: 100%;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 6px;
            padding: 8px 12px;
            color: #f8f9fa;
            font-size: 14px;
            font-family: monospace;
            margin-bottom: 12px;
        }
        
        .clr-color:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        .clr-gradient {
            width: 100%;
            height: 120px;
            background: linear-gradient(to top, #000, transparent),
                        linear-gradient(to right, #fff, hsl(0, 100%, 50%));
            border-radius: 6px;
            position: relative;
            cursor: crosshair;
            margin-bottom: 12px;
        }
        
        .clr-marker {
            position: absolute;
            width: 12px;
            height: 12px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
        }
        
        .clr-hue {
            width: 100%;
            height: 12px;
            background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
            border-radius: 6px;
            position: relative;
            margin-bottom: 12px;
        }
        
        .clr-hue input {
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .clr-hue-marker {
            position: absolute;
            width: 4px;
            height: 16px;
            background: #ffffff;
            border: 1px solid #000000;
            border-radius: 2px;
            top: -2px;
            transform: translateX(-50%);
            pointer-events: none;
        }
        
        .clr-swatches {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 6px;
            margin-bottom: 12px;
        }
        
        .clr-swatches button {
            width: 24px;
            height: 24px;
            border: 1px solid #374151;
            border-radius: 4px;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .clr-swatches button:hover {
            transform: scale(1.1);
            border-color: #3b82f6;
        }
        

        .rivion-color-bubble:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #3b82f6 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }
        
        .rivion-color-bubble:hover .rivion-color-dot {
            transform: scale(1.1) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important;
        }
        
        .rivion-color-bubble:hover .rivion-color-name {
            color: #ffffff !important;
        }
        

        .rivion-color-bubble,
        .rivion-color-dot,
        .rivion-color-name {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

    </style>
@endsection
