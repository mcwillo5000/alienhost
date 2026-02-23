
document.addEventListener('DOMContentLoaded', function() {
    console.log('Rivion Admin JS loaded - checking for color bubbles...');
    
    initColorBubbles();

    initColorResetButtons();
    initLivePreview();

    function initColorBubbles() {
        const colorBubbles = document.querySelectorAll('.rivion-color-bubble');
        console.log('Found', colorBubbles.length, 'color bubbles');
        
        colorBubbles.forEach(bubble => {
            bubble.addEventListener('click', function() {
                console.log('Bubble clicked:', this.dataset.color);
                openColorPicker(this);
            });
        });
    }

    let currentColorBubble = null;
    let isDragging = false;
    let currentHue = 0;

    function openColorPicker(bubble) {
        currentColorBubble = bubble;
        const colorInput = bubble.querySelector('input[type="color"]');
        const currentValue = colorInput.value;
        
        const picker = document.getElementById('clr-picker');
        const rect = bubble.getBoundingClientRect();
        
        picker.style.display = 'block';
        picker.style.position = 'absolute';
        picker.style.left = (rect.left + window.scrollX) + 'px';
        picker.style.top = (rect.bottom + window.scrollY + 10) + 'px';
        picker.style.zIndex = '1000';
        
        document.querySelectorAll('.rivion-color-bubble').forEach(b => b.classList.remove('active'));
        bubble.classList.add('active');
        
        setColorFromHex(currentValue);
    }

    function setColorFromHex(hex) {
        const hsl = hexToHsl(hex);
        currentHue = hsl.h;
        
        document.getElementById('clr-hue-slider').value = hsl.h;
        
        updateColorGradient(hsl.h);
        
        updateGradientMarker(hsl.s, hsl.l);
    }

    function updateColorGradient(hue) {
        const gradient = document.getElementById('clr-color-area');
        gradient.style.background = `
            linear-gradient(to top, #000, transparent),
            linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `;
        currentHue = hue;
    }

    function updateGradientMarker(saturation, lightness) {
        const marker = document.getElementById('clr-color-marker');
        const area = document.getElementById('clr-color-area');
        
        const x = (saturation / 100) * area.offsetWidth;
        const y = ((100 - lightness) / 100) * area.offsetHeight;
        
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    }

    function getColorFromPosition(x, y) {
        const area = document.getElementById('clr-color-area');
        const rect = area.getBoundingClientRect();
        
        const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
        const relativeY = Math.max(0, Math.min(y - rect.top, rect.height));
        
        const saturation = (relativeX / rect.width) * 100;
        const lightness = 100 - (relativeY / rect.height) * 100;
        
        return hslToHex(currentHue, saturation, lightness);
    }

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function updateCurrentColor(hex) {
        if (!currentColorBubble) return;
        
        const colorDot = currentColorBubble.querySelector('.rivion-color-dot');
        colorDot.style.backgroundColor = hex;
        
        const hiddenInput = currentColorBubble.querySelector('input[type="color"]');
        hiddenInput.value = hex;
        
        updateLivePreview();
    }

    function hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; 
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function updateColorGradient(hue) {
        const gradient = document.getElementById('clr-color-area');
        gradient.style.background = `
            linear-gradient(to bottom, transparent, black),
            linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
        `;
        currentHue = hue;
    }

    function updateGradientMarker(saturation, lightness) {
        const marker = document.getElementById('clr-color-marker');
        const area = document.getElementById('clr-color-area');
        
        const x = (saturation / 100) * area.offsetWidth;
        const y = ((100 - lightness) / 100) * area.offsetHeight;
        
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    }

    window.closeColorPicker = function() {
        const picker = document.getElementById('clr-picker');
        picker.style.display = 'none';
        
        document.querySelectorAll('.rivion-color-bubble').forEach(b => b.classList.remove('active'));
        
        currentColorBubble = null;
    }
r
    function setupAdvancedColorPicker() {
        const picker = document.getElementById('clr-picker');
        const gradientArea = document.getElementById('clr-color-area');
        const hueSlider = document.getElementById('clr-hue-slider');
        
        gradientArea.addEventListener('mousedown', function(e) {
            isDragging = true;
            const hex = getColorFromPosition(e.clientX, e.clientY);
            updateGradientMarker(0, 0); 
            updateCurrentColor(hex);
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const hex = getColorFromPosition(e.clientX, e.clientY);
                updateCurrentColor(hex);
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        gradientArea.addEventListener('click', function(e) {
            const hex = getColorFromPosition(e.clientX, e.clientY);
            updateCurrentColor(hex);
        });
        
        hueSlider.addEventListener('input', function() {
            updateColorGradient(this.value);
            
            const marker = document.getElementById('clr-color-marker');
            const area = document.getElementById('clr-color-area');
            const rect = area.getBoundingClientRect();
            
            const markerX = parseInt(marker.style.left) || 0;
            const markerY = parseInt(marker.style.top) || 0;
            
            const saturation = (markerX / rect.width) * 100;
            const lightness = 100 - (markerY / rect.height) * 100;
            
            const hex = hslToHex(this.value, saturation, lightness);
            updateCurrentColor(hex);
        });
        
        document.querySelectorAll('.clr-swatch').forEach(button => {
            button.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                updateCurrentColor(color);
                setColorFromHex(color);
            });
        });
        
        document.addEventListener('click', function(e) {
            const isClickInside = picker.contains(e.target);
            const isClickOnBubble = e.target.closest('.rivion-color-bubble');
            
            if (!isClickInside && !isClickOnBubble && picker.style.display === 'block') {
                closeColorPicker();
            }
        });
    }

    function initColorResetButtons() {
        document.querySelectorAll('[data-name]').forEach(button => {
            button.addEventListener('click', function() {
                const inputName = this.getAttribute('data-name');
                const defaultValue = this.getAttribute('data-value');
                const input = document.getElementById(inputName) || document.querySelector(`input[name="${inputName}"]`);
                if (input) {
                    input.value = defaultValue;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    updateLivePreview();
                }
            });
        });
    }

    function initLivePreview() {
        document.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('change', updateLivePreview);
        });
        
        updateLivePreview();
    }

    function updateLivePreview() {
        const lightTheme = {
            primary: document.querySelector('input[name="light_primary"]')?.value || '#3B82F6',
            secondary: document.querySelector('input[name="light_secondary"]')?.value || '#1E40AF',
            border: document.querySelector('input[name="light_border"]')?.value || '#E5E7EB',
            textBase: document.querySelector('input[name="light_text_base"]')?.value || '#111827',
            textMuted: document.querySelector('input[name="light_text_muted"]')?.value || '#6B7280',
            textInverted: document.querySelector('input[name="light_text_inverted"]')?.value || '#FFFFFF',
            background: document.querySelector('input[name="light_background"]')?.value || '#FFFFFF',
            backgroundSecondary: document.querySelector('input[name="light_background_secondary"]')?.value || '#F9FAFB'
        };

        const darkTheme = {
            primary: document.querySelector('input[name="dark_primary"]')?.value || '#3B82F6',
            secondary: document.querySelector('input[name="dark_secondary"]')?.value || '#1E40AF',
            border: document.querySelector('input[name="dark_border"]')?.value || '#374151',
            textBase: document.querySelector('input[name="dark_text_base"]')?.value || '#F9FAFB',
            textMuted: document.querySelector('input[name="dark_text_muted"]')?.value || '#9CA3AF',
            textInverted: document.querySelector('input[name="dark_text_inverted"]')?.value || '#111827',
            background: document.querySelector('input[name="dark_background"]')?.value || '#111827',
            backgroundSecondary: document.querySelector('input[name="dark_background_secondary"]')?.value || '#1F2937'
        };

        updatePreviewCard('light', lightTheme);
        updatePreviewCard('dark', darkTheme);
        
        updateIframePreview(lightTheme, darkTheme);
    }

    function updateIframePreview(lightTheme, darkTheme) {
        const iframe = document.querySelector('.rivion-preview iframe');
        if (!iframe) return;

        showPreviewStatus('Updating preview...', 'updating');

        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc) {
                showPreviewStatus('Preview unavailable', 'error');
                return;
            }

            let styleElement = iframeDoc.getElementById('rivion-live-preview-styles');
            if (!styleElement) {
                styleElement = iframeDoc.createElement('style');
                styleElement.id = 'rivion-live-preview-styles';
                iframeDoc.head.appendChild(styleElement);
            }

            const lightPrimaryRgb = hexToRgb(lightTheme.primary);
            const darkPrimaryRgb = hexToRgb(darkTheme.primary);

            const css = `
                /* Live Preview Theme Variables - High Specificity Override */
                html:root, body:root, #app:root {
                    /* Light Theme */
                    --theme-primary: ${lightTheme.primary} !important;
                    --theme-primary-rgb: ${lightPrimaryRgb.r}, ${lightPrimaryRgb.g}, ${lightPrimaryRgb.b} !important;
                    --theme-secondary: ${lightTheme.secondary} !important;
                    --theme-border: ${lightTheme.border} !important;
                    --theme-text-base: ${lightTheme.textBase} !important;
                    --theme-text-muted: ${lightTheme.textMuted} !important;
                    --theme-text-inverted: ${lightTheme.textInverted} !important;
                    --theme-background: ${lightTheme.background} !important;
                    --theme-background-secondary: ${lightTheme.backgroundSecondary} !important;
                }

                /* Dark Theme - High Specificity Override */
                [data-theme="dark"]:root,
                html[data-theme="dark"],
                body[data-theme="dark"],
                [data-theme="dark"] {
                    --theme-primary: ${darkTheme.primary} !important;
                    --theme-primary-rgb: ${darkPrimaryRgb.r}, ${darkPrimaryRgb.g}, ${darkPrimaryRgb.b} !important;
                    --theme-secondary: ${darkTheme.secondary} !important;
                    --theme-border: ${darkTheme.border} !important;
                    --theme-text-base: ${darkTheme.textBase} !important;
                    --theme-text-muted: ${darkTheme.textMuted} !important;
                    --theme-text-inverted: ${darkTheme.textInverted} !important;
                    --theme-background: ${darkTheme.background} !important;
                    --theme-background-secondary: ${darkTheme.backgroundSecondary} !important;
                }

                /* Ensure changes are applied immediately */
                body, html, #app {
                    background-color: var(--theme-background) !important;
                    color: var(--theme-text-base) !important;
                    transition: all 0.3s ease !important;
                }

                /* Force re-render of common elements */
                .w-full.bg-neutral-900.shadow-md.overflow-x-auto,
                .GreyRowBox-sc-1xo9c6v-0,
                a.GreyRowBox-sc-1xo9c6v-0,
                .TitledGreyBox___StyledDiv-sc-gvsoy-0,
                .TitledGreyBox___StyledDiv2-sc-gvsoy-1,
                .TitledGreyBox___StyledDiv3-sc-gvsoy-4 {
                    background-color: var(--theme-background-secondary) !important;
                    border-color: var(--theme-border) !important;
                    transition: all 0.3s ease !important;
                }

                /* Update buttons */
                .btn-primary,
                button[type="submit"] {
                    background-color: var(--theme-primary) !important;
                    border-color: var(--theme-primary) !important;
                    color: var(--theme-text-inverted) !important;
                    transition: all 0.3s ease !important;
                }

                .btn-primary:hover,
                button[type="submit"]:hover {
                    background-color: var(--theme-secondary) !important;
                    border-color: var(--theme-secondary) !important;
                }

                /* Update text colors */
                h1, h2, h3, h4, h5, h6,
                .text-gray-100,
                .text-gray-200 {
                    color: var(--theme-text-base) !important;
                    transition: all 0.3s ease !important;
                }

                .text-muted,
                .text-gray-400,
                .text-gray-500 {
                    color: var(--theme-text-muted) !important;
                    transition: all 0.3s ease !important;
                }
            `;

            styleElement.textContent = css;

            if (iframeDoc.body) {
                iframeDoc.body.style.transition = 'all 0.3s ease';
                iframeDoc.body.classList.add('rivion-updating');
                setTimeout(() => {
                    if (iframeDoc.body) {
                        iframeDoc.body.classList.remove('rivion-updating');
                    }
                }, 300);
            }

            showPreviewStatus('Preview updated!', 'updated');

        } catch (error) {
            console.log('Preview update skipped:', error.message);
            showPreviewStatus('Preview loading...', 'loading');
            
            if (iframe && !iframe.dataset.retrySetup) {
                iframe.dataset.retrySetup = 'true';
                iframe.addEventListener('load', () => {
                    setTimeout(() => {
                        updateIframePreview(lightTheme, darkTheme);
                    }, 500);
                });
            }
        }
    }

    function showPreviewStatus(message, type) {
        let statusElement = document.querySelector('.rivion-preview-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'rivion-preview-status';
            const previewContainer = document.querySelector('.rivion-preview');
            if (previewContainer) {
                previewContainer.appendChild(statusElement);
            }
        }

        statusElement.textContent = message;
        statusElement.className = `rivion-preview-status show ${type}`;

        if (type !== 'loading') {
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, type === 'updated' ? 2000 : 3000);
        }
    }

    function updatePreviewCard(theme, colors) {
        const previewContent = document.querySelector(`.preview-content[data-theme="${theme}"]`);
        if (!previewContent) return;

        previewContent.classList.add('preview-updating');
        setTimeout(() => previewContent.classList.remove('preview-updating'), 500);

        previewContent.style.background = colors.background;
        previewContent.style.color = colors.textBase;

        const primaryElement = previewContent.querySelector('.preview-element.primary');
        if (primaryElement) {
            primaryElement.style.background = colors.primary;
            primaryElement.style.color = colors.textInverted;
        }

        const secondaryElement = previewContent.querySelector('.preview-element.secondary');
        if (secondaryElement) {
            secondaryElement.style.background = colors.secondary;
            secondaryElement.style.color = colors.textInverted;
        }

        const textBaseElement = previewContent.querySelector('.preview-element.text-base');
        if (textBaseElement) {
            const primaryRgb = hexToRgb(colors.primary);
            textBaseElement.style.background = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`;
            textBaseElement.style.color = colors.textBase;
            textBaseElement.style.borderColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`;
        }

        const textMutedElement = previewContent.querySelector('.preview-element.text-muted');
        if (textMutedElement) {
            const primaryRgb = hexToRgb(colors.primary);
            textMutedElement.style.background = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`;
            textMutedElement.style.color = colors.textMuted;
            textMutedElement.style.borderColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`;
        }

        const bgPrimary = previewContent.querySelector('.preview-bg-primary');
        if (bgPrimary) {
            bgPrimary.style.background = colors.background;
            bgPrimary.style.color = colors.textBase;
            bgPrimary.style.borderColor = colors.border;
        }

        const bgSecondary = previewContent.querySelector('.preview-bg-secondary');
        if (bgSecondary) {
            bgSecondary.style.background = colors.backgroundSecondary;
            bgSecondary.style.color = colors.textBase;
            bgSecondary.style.borderColor = colors.border;
        }
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 }; 
    }

    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('change', updateLivePreview);
        input.addEventListener('input', updateLivePreview); 
    });

    updateLivePreview();

    const addEggButton = document.getElementById('add-egg-image');
    const newEggId = document.getElementById('new-egg-id');
    const newEggUrl = document.getElementById('new-egg-url');
    const container = document.getElementById('egg-images-container');

    if (addEggButton) {
        addEggButton.addEventListener('click', function() {
            const eggId = newEggId.value.trim();
            const eggUrl = newEggUrl.value.trim();

            if (!eggId || !eggUrl) {
                alert('Please fill in both Egg ID and Image URL');
                return;
            }

            const existingRow = document.querySelector(`input[name="egg_images[${eggId}][id]"]`);
            if (existingRow) {
                alert('This Egg ID already exists. Please use a different ID.');
                return;
            }

            const newRow = document.createElement('div');
            newRow.className = 'row egg-image-row';
            newRow.style.marginBottom = '15px';
            newRow.innerHTML = `
                <div class="col-md-3">
                    <div class="input-field">
                        <label>Egg ID</label>
                        <input type="number" name="egg_images[${eggId}][id]" value="${eggId}" readonly>
                    </div>
                </div>
                <div class="col-md-7">
                    <div class="input-field">
                        <label>Background Image URL</label>
                        <input type="url" name="egg_images[${eggId}]" value="${eggUrl}" placeholder="https://example.com/image.jpg">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="input-field">
                        <label>&nbsp;</label>
                        <button type="button" class="btn btn-danger remove-egg-image" style="width: 100%;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;

            const newEggSection = document.getElementById('new-egg-section');
            container.insertBefore(newRow, newEggSection);

            newEggId.value = '';
            newEggUrl.value = '';

            const removeButton = newRow.querySelector('.remove-egg-image');
            removeButton.addEventListener('click', function() {
                newRow.remove();
            });
        });
    }

    document.querySelectorAll('.remove-egg-image').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.egg-image-row').remove();
        });
    });

    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('change', function() {
            console.log(`Color changed: ${this.name} = ${this.value}`);
        });
    });

    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('rivion-sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });

        const isCollapsed = localStorage.getItem('rivion-sidebar-collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const colorInputs = form.querySelectorAll('input[type="color"]');
            let isValid = true;

            colorInputs.forEach(input => {
                const value = input.value;
                if (!/^#[0-9A-F]{6}$/i.test(value)) {
                    isValid = false;
                    input.style.borderColor = '#dc3545';
                    setTimeout(() => {
                        input.style.borderColor = '';
                    }, 3000);
                }
            });

            const urlInputs = form.querySelectorAll('input[type="url"]');
            urlInputs.forEach(input => {
                if (input.value && !isValidUrl(input.value)) {
                    isValid = false;
                    input.style.borderColor = '#dc3545';
                    setTimeout(() => {
                        input.style.borderColor = '';
                    }, 3000);
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fix the highlighted errors before saving.', 'error');
            }
        });
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        notification.querySelector('.close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const themeForm = document.querySelector('form[action*="rivion"]');
    if (themeForm) {
        console.log('Form found:', themeForm.action);
        
        themeForm.addEventListener('submit', function(e) {
            console.log('=== FORM SUBMISSION STARTED ===');
            console.log('Form action:', themeForm.action);
            console.log('Form method:', themeForm.method);
            
            const formData = new FormData(themeForm);
            console.log('Form data being submitted:');
            const submissionData = {};
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
                submissionData[key] = value;
            }
            
            sessionStorage.setItem('rivion-last-submission', JSON.stringify(submissionData));
            console.log('Stored submission data in sessionStorage for comparison');
            
            localStorage.removeItem('rivion-theme-draft');
            console.log('Cleared localStorage draft on form submit');
            
            console.log('Form submitting to:', themeForm.action);
            console.log('=== FORM SUBMISSION PROCEEDING ===');
        });
        
        const lastSubmission = sessionStorage.getItem('rivion-last-submission');
        if (lastSubmission) {
            console.log('=== POST-SUBMISSION CHECK ===');
            const submittedData = JSON.parse(lastSubmission);
            console.log('Previously submitted data:', submittedData);
            
            console.log('Checking if submitted values are now loaded:');
            Object.keys(submittedData).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    const currentValue = input.value;
                    const submittedValue = submittedData[key];
                    if (currentValue === submittedValue) {
                        console.log(`✅ ${key}: ${currentValue} (matches submitted)`);
                    } else {
                        console.log(`❌ ${key}: current=${currentValue}, submitted=${submittedValue} (MISMATCH!)`);
                    }
                }
            });
            
            sessionStorage.removeItem('rivion-last-submission');
            console.log('=== END POST-SUBMISSION CHECK ===');
        }
    } else {
        console.error('Form not found! Looking for form with action containing "rivion"');
        const allForms = document.querySelectorAll('form');
        console.log('All forms found:', allForms.length);
        allForms.forEach((form, index) => {
            console.log(`Form ${index}:`, form.action || 'no action', form.method || 'no method');
        });
    }
    let autoSaveTimeout;
    const autoSaveInputs = document.querySelectorAll('input[type="color"], input[type="url"], input[type="text"]');
    
    autoSaveInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                const formData = new FormData(form);
                const draftData = {};
                for (let [key, value] of formData.entries()) {
                    draftData[key] = value;
                }
                localStorage.setItem('rivion-theme-draft', JSON.stringify(draftData));
                
                const saveIndicator = document.querySelector('.save-indicator') || createSaveIndicator();
                saveIndicator.textContent = 'Draft saved';
                saveIndicator.style.opacity = '1';
                setTimeout(() => {
                    saveIndicator.style.opacity = '0';
                }, 2000);
            }, 1000);
        });
    });

    function createSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
        return indicator;
    }

    const savedDraft = localStorage.getItem('rivion-theme-draft');
    console.log('Checking for saved draft...');
    if (savedDraft) {
        console.log('Found saved draft in localStorage:', savedDraft);
        console.log('WARNING: Draft detected - this may override saved settings!');
        
        const shouldRestore = confirm('Found unsaved changes in localStorage. Do you want to restore them? (Click Cancel to use saved settings)');
        
        if (shouldRestore) {
            try {
                const draftData = JSON.parse(savedDraft);
                console.log('User chose to restore draft data:', draftData);
                Object.keys(draftData).forEach(key => {
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input && input.value !== draftData[key]) {
                        console.log(`Restoring ${key}: ${input.value} -> ${draftData[key]}`);
                        input.value = draftData[key];
                        input.style.borderColor = '#ffc107'; 
                        setTimeout(() => {
                            input.style.borderColor = '';
                        }, 3000);
                    } else if (input) {
                        console.log(`Skipping ${key}: already matches (${input.value})`);
                    } else {
                        console.log(`Input not found for ${key}`);
                    }
                });
                console.log('Draft restoration complete');
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        } else {
            console.log('User chose to discard draft and use saved settings');
            localStorage.removeItem('rivion-theme-draft');
        }
    } else {
        console.log('No saved draft found in localStorage');
    }
    
    localStorage.removeItem('rivion-theme-draft');
    console.log('Manually cleared localStorage draft for testing');
    
    console.log('Initializing color functionality...');
    
    console.log('=== INITIAL FORM VALUES ===');
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        console.log(`${input.name}: ${input.value}`);
    });
    console.log('=== END INITIAL VALUES ===');
    
    initColorResetButtons(); 
    initLivePreview();
    setupAdvancedColorPicker();
    
    document.querySelectorAll('.clr-swatch').forEach(button => {
        const color = button.getAttribute('data-color');
        if (color) {
            button.style.backgroundColor = color;
        }
    });
    
    console.log('Color functionality initialized!');
});