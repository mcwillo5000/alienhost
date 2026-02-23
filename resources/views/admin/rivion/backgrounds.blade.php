@extends('layouts.rivion', ['navbar' => 'backgrounds', 'sideEditor' => true])

@section('title')
    Rivion Theme - Backgrounds
@endsection

@section('content')
    <form action="{{ route('admin.rivion.backgrounds.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Background Settings</h1>
            <p>Configure background images and effects for different page sections</p>
        </div>


        <div class="rivion-theme-group">
            <h3>Authentication Pages</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 20px;">Background Configuration</h4>
                
                <div class="card-input-group card-url-group" style="margin-bottom: 20px;">
                    <label>Background Image URL</label>
                    <input type="url" name="auth_background_image" 
                           value="{{ old('auth_background_image', $settings['auth_background_image'] ?? '') }}" 
                           placeholder="https://example.com/auth-background.jpg">
                    <small class="form-text text-muted">Background image for login, register, and password reset pages</small>
                </div>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Background Effect</label>
                    <select name="auth_background_effect">
                        <option value="none" {{ old('auth_background_effect', $settings['auth_background_effect'] ?? 'none') === 'none' ? 'selected' : '' }}>
                            No Effect
                        </option>
                        <option value="blur" {{ old('auth_background_effect', $settings['auth_background_effect'] ?? 'none') === 'blur' ? 'selected' : '' }}>
                            Blur Effect
                        </option>
                        <option value="heavy-blur" {{ old('auth_background_effect', $settings['auth_background_effect'] ?? 'none') === 'heavy-blur' ? 'selected' : '' }}>
                            Heavy Blur
                        </option>
                        <option value="overlay" {{ old('auth_background_effect', $settings['auth_background_effect'] ?? 'none') === 'overlay' ? 'selected' : '' }}>
                            Dark Overlay
                        </option>
                        <option value="heavy-overlay" {{ old('auth_background_effect', $settings['auth_background_effect'] ?? 'none') === 'heavy-overlay' ? 'selected' : '' }}>
                            Heavy Overlay
                        </option>
                    </select>
                    <small class="form-text text-muted">Visual effect applied to background</small>
                </div>
                
                <div class="card-input-group">
                    <label>Authentication Layout</label>
                    <select name="auth_layout">
                        <option value="base" {{ old('auth_layout', $settings['auth_layout'] ?? 'base') === 'base' ? 'selected' : '' }}>
                            Base Layout - Full background with centered form
                        </option>
                        <option value="side" {{ old('auth_layout', $settings['auth_layout'] ?? 'base') === 'side' ? 'selected' : '' }}>
                            Side Layout - Split design with form and background
                        </option>
                    </select>
                    <small class="form-text text-muted">Choose the authentication page layout style</small>
                </div>
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Background Settings
            </button>
        </div>
    </form>

@endsection

@section('scripts')
    @parent
    <script>

        document.querySelector('form').addEventListener('submit', function(e) {
            const imageUrl = document.querySelector('input[name="auth_background_image"]').value.trim();
            const effect = document.querySelector('select[name="auth_background_effect"]').value;
            
            if (effect !== 'none' && !imageUrl) {
                const proceed = confirm('You have selected a background effect but no image URL is provided. The effect will not be visible without an image. Continue anyway?');
                if (!proceed) {
                    e.preventDefault();
                    return false;
                }
            }
        });


        document.addEventListener('input', function(e) {
            if (e.target.name === 'auth_background_image') {
                const imageUrl = e.target.value.trim();
                let preview = document.querySelector('.auth-bg-preview');
                
                if (imageUrl) {
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'auth-bg-preview';
                        preview.style.cssText = `
                            margin-top: 10px;
                            border: 2px solid var(--rivion-dark-600);
                            border-radius: var(--rivion-radius);
                            overflow: hidden;
                            max-width: 300px;
                            background: var(--rivion-dark-700);
                        `;
                        e.target.closest('.card-input-group').appendChild(preview);
                    }
                    
                    preview.innerHTML = `
                        <div style="position: relative;">
                            <img src="${imageUrl}" alt="Background Preview" 
                                 style="width: 100%; height: 150px; object-fit: cover;" 
                                 onerror="this.parentElement.innerHTML='<div style=\\'padding: 20px; text-align: center; color: var(--rivion-dark-300);\\'>Failed to load image</div>';" 
                                 onload="this.style.display='block';">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; font-size: 12px;">
                                Preview
                            </div>
                        </div>
                    `;
                } else if (preview) {
                    preview.remove();
                }
            }
        });

        document.addEventListener('change', function(e) {
            if (e.target.name === 'auth_background_effect') {
                const preview = document.querySelector('.auth-bg-preview img');
                if (preview) {
                    const effect = e.target.value;
                    preview.style.filter = effect === 'blur' ? 'blur(5px)' : 'none';
                    preview.style.opacity = effect === 'overlay' ? '0.6' : '1';
                }
            }
        });
    </script>

    <style>

        .auth-bg-preview {
            margin-top: 10px;
            border: 2px solid var(--rivion-dark-600);
            border-radius: var(--rivion-radius);
            overflow: hidden;
            max-width: 300px;
            background: var(--rivion-dark-700);
        }

        .auth-bg-preview img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            transition: filter 0.3s ease, opacity 0.3s ease;
        }

        .form-text {
            margin-top: 6px;
            font-size: 12px;
            color: var(--rivion-dark-300);
            line-height: 1.4;
        }
    </style>
@endsection