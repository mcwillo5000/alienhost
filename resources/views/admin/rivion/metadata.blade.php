@extends('layouts.rivion', ['navbar' => 'metadata', 'sideEditor' => true])

@section('title')
    Rivion Theme - Meta Data
@endsection

@section('content')
    <form action="{{ route('admin.rivion.metadata.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Meta Data Settings</h1>
            <p>Configure SEO meta tags, Open Graph, and social media previews for your panel</p>
        </div>


        <div class="rivion-theme-group">
            <h3>Basic SEO</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 20px;">Site Information</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Site Title</label>
                    <input type="text" name="meta_site_title" 
                           value="{{ old('meta_site_title', $settings['meta_site_title'] ?? config('app.name', 'Pterodactyl')) }}" 
                           placeholder="My Gaming Panel">
                    <small class="form-text text-muted">The main title that appears in browser tabs and search results</small>
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Site Description</label>
                    <textarea name="meta_description" rows="3" 
                              placeholder="Professional game server hosting panel with powerful management tools">{{ old('meta_description', $settings['meta_description'] ?? '') }}</textarea>
                    <small class="form-text text-muted">A brief description of your panel (recommended: 150-160 characters)</small>
                </div>

                <div class="card-input-group">
                    <label>Keywords</label>
                    <input type="text" name="meta_keywords" 
                           value="{{ old('meta_keywords', $settings['meta_keywords'] ?? '') }}" 
                           placeholder="game server, hosting, minecraft, pterodactyl">
                    <small class="form-text text-muted">Comma-separated keywords relevant to your service</small>
                </div>
            </div>
        </div>


        <div class="rivion-theme-group" style="margin-top: 40px;">
            <h3>Open Graph (Social Media)</h3>
            <p style="color: #9CA3AF; margin-bottom: 24px; font-size: 14px;">
                Open Graph tags control how your panel appears when shared on social media platforms like Facebook, Discord, and LinkedIn.
            </p>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 20px;">Social Preview</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>OG Title</label>
                    <input type="text" name="meta_og_title" 
                           value="{{ old('meta_og_title', $settings['meta_og_title'] ?? '') }}" 
                           placeholder="Leave empty to use Site Title">
                    <small class="form-text text-muted">Title shown when shared on social media (defaults to Site Title if empty)</small>
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>OG Description</label>
                    <textarea name="meta_og_description" rows="3" 
                              placeholder="Leave empty to use Site Description">{{ old('meta_og_description', $settings['meta_og_description'] ?? '') }}</textarea>
                    <small class="form-text text-muted">Description shown on social media (defaults to Site Description if empty)</small>
                </div>

                <div class="card-input-group card-url-group" style="margin-bottom: 20px;">
                    <label>OG Image URL</label>
                    <input type="url" name="meta_og_image" 
                           value="{{ old('meta_og_image', $settings['meta_og_image'] ?? '') }}" 
                           placeholder="https://example.com/og-image.jpg"
                           oninput="updateOGPreview(this.value)">
                    <small class="form-text text-muted">Image displayed when shared (recommended: 1200x630px)</small>
                </div>

                <div class="card-input-group">
                    <label>Site Type</label>
                    <select name="meta_og_type">
                        <option value="website" {{ old('meta_og_type', $settings['meta_og_type'] ?? 'website') === 'website' ? 'selected' : '' }}>Website</option>
                        <option value="article" {{ old('meta_og_type', $settings['meta_og_type'] ?? 'website') === 'article' ? 'selected' : '' }}>Article</option>
                        <option value="product" {{ old('meta_og_type', $settings['meta_og_type'] ?? 'website') === 'product' ? 'selected' : '' }}>Product</option>
                    </select>
                    <small class="form-text text-muted">The type of content your site represents</small>
                </div>
            </div>
        </div>


        <div class="rivion-theme-group" style="margin-top: 40px;">
            <h3>Twitter Card</h3>
            <p style="color: #9CA3AF; margin-bottom: 24px; font-size: 14px;">
                Twitter Cards control how your panel appears when shared on Twitter/X.
            </p>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 20px;">Twitter Preview</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Twitter Card Type</label>
                    <select name="meta_twitter_card">
                        <option value="summary" {{ old('meta_twitter_card', $settings['meta_twitter_card'] ?? 'summary_large_image') === 'summary' ? 'selected' : '' }}>Summary (small image)</option>
                        <option value="summary_large_image" {{ old('meta_twitter_card', $settings['meta_twitter_card'] ?? 'summary_large_image') === 'summary_large_image' ? 'selected' : '' }}>Summary Large Image</option>
                    </select>
                    <small class="form-text text-muted">Choose how the card appears on Twitter</small>
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Twitter Title</label>
                    <input type="text" name="meta_twitter_title" 
                           value="{{ old('meta_twitter_title', $settings['meta_twitter_title'] ?? '') }}" 
                           placeholder="Leave empty to use Site Title">
                    <small class="form-text text-muted">Title for Twitter card (defaults to Site Title if empty)</small>
                </div>

                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Twitter Description</label>
                    <textarea name="meta_twitter_description" rows="3" 
                              placeholder="Leave empty to use Site Description">{{ old('meta_twitter_description', $settings['meta_twitter_description'] ?? '') }}</textarea>
                    <small class="form-text text-muted">Description for Twitter card (defaults to Site Description if empty)</small>
                </div>

                <div class="card-input-group card-url-group" style="margin-bottom: 20px;">
                    <label>Twitter Image URL</label>
                    <input type="url" name="meta_twitter_image" 
                           value="{{ old('meta_twitter_image', $settings['meta_twitter_image'] ?? '') }}" 
                           placeholder="https://example.com/twitter-card.jpg"
                           oninput="updateTwitterPreview(this.value)">
                    <small class="form-text text-muted">Image for Twitter card (defaults to OG Image if empty, recommended: 1200x675px)</small>
                </div>

                <div class="card-input-group">
                    <label>Twitter Handle</label>
                    <input type="text" name="meta_twitter_site" 
                           value="{{ old('meta_twitter_site', $settings['meta_twitter_site'] ?? '') }}" 
                           placeholder="@yourhandle">
                    <small class="form-text text-muted">Your Twitter/X username (optional)</small>
                </div>
            </div>
        </div>


        <div class="rivion-theme-group" style="margin-top: 40px;">
            <h3>Additional Settings</h3>
            
            <div class="card-form-section">
                <h4 style="font-size: 1.5rem; margin-bottom: 20px;">Advanced</h4>
                
                <div class="card-input-group" style="margin-bottom: 20px;">
                    <label>Theme Color</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="color" name="meta_theme_color" 
                               value="{{ old('meta_theme_color', $settings['meta_theme_color'] ?? '#385af1') }}" 
                               style="width: 60px; height: 40px; border-radius: 8px; border: 2px solid var(--rivion-border); background: var(--rivion-background-secondary); cursor: pointer;">
                        <input type="text" name="meta_theme_color_hex" 
                               value="{{ old('meta_theme_color', $settings['meta_theme_color'] ?? '#385af1') }}" 
                               placeholder="#385af1"
                               style="flex: 1;"
                               oninput="document.querySelector('input[name=meta_theme_color]').value = this.value">
                    </div>
                    <small class="form-text text-muted">Browser theme color for mobile devices</small>
                </div>

                <div class="card-input-group">
                    <label>Robots</label>
                    <select name="meta_robots">
                        <option value="index, follow" {{ old('meta_robots', $settings['meta_robots'] ?? 'noindex') === 'index, follow' ? 'selected' : '' }}>Index and Follow (allow search engines)</option>
                        <option value="noindex, nofollow" {{ old('meta_robots', $settings['meta_robots'] ?? 'noindex') === 'noindex, nofollow' ? 'selected' : '' }}>No Index, No Follow (block search engines)</option>
                        <option value="noindex" {{ old('meta_robots', $settings['meta_robots'] ?? 'noindex') === 'noindex' ? 'selected' : '' }}>No Index (default)</option>
                    </select>
                    <small class="form-text text-muted">Control how search engines index your panel</small>
                </div>
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Meta Data Settings
            </button>
        </div>
    </form>
@endsection

@section('scripts')
    @parent
    <script>

        document.querySelector('input[name="meta_theme_color"]').addEventListener('input', function(e) {
            document.querySelector('input[name="meta_theme_color_hex"]').value = e.target.value;
        });


        function updateOGPreview(imageUrl) {
            let preview = document.querySelector('.og-preview');
            const container = document.querySelector('input[name="meta_og_image"]').closest('.card-input-group');
            
            if (imageUrl.trim()) {
                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'og-preview';
                    preview.style.cssText = `
                        margin-top: 10px;
                        border: 2px solid var(--rivion-border);
                        border-radius: 8px;
                        overflow: hidden;
                        max-width: 400px;
                        background: var(--rivion-background-secondary);
                    `;
                    container.appendChild(preview);
                }
                
                preview.innerHTML = `
                    <img src="${imageUrl}" alt="OG Image Preview" 
                         style="width: 100%; height: 200px; object-fit: cover; display: block;" 
                         onerror="this.parentElement.innerHTML='<div style=\\'padding: 20px; text-align: center; color: var(--rivion-text-secondary);\\'>Failed to load image</div>';">
                    <div style="padding: 8px 12px; background: rgba(0,0,0,0.3); font-size: 11px; color: var(--rivion-text-secondary);">
                        Open Graph Preview (1200x630px recommended)
                    </div>
                `;
            } else if (preview) {
                preview.remove();
            }
        }


        function updateTwitterPreview(imageUrl) {
            let preview = document.querySelector('.twitter-preview');
            const container = document.querySelector('input[name="meta_twitter_image"]').closest('.card-input-group');
            
            if (imageUrl.trim()) {
                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'twitter-preview';
                    preview.style.cssText = `
                        margin-top: 10px;
                        border: 2px solid var(--rivion-border);
                        border-radius: 8px;
                        overflow: hidden;
                        max-width: 400px;
                        background: var(--rivion-background-secondary);
                    `;
                    container.appendChild(preview);
                }
                
                preview.innerHTML = `
                    <img src="${imageUrl}" alt="Twitter Image Preview" 
                         style="width: 100%; height: 200px; object-fit: cover; display: block;" 
                         onerror="this.parentElement.innerHTML='<div style=\\'padding: 20px; text-align: center; color: var(--rivion-text-secondary);\\'>Failed to load image</div>';">
                    <div style="padding: 8px 12px; background: rgba(0,0,0,0.3); font-size: 11px; color: var(--rivion-text-secondary);">
                        Twitter Card Preview (1200x675px recommended)
                    </div>
                `;
            } else if (preview) {
                preview.remove();
            }
        }


        document.addEventListener('DOMContentLoaded', function() {
            const ogImage = document.querySelector('input[name="meta_og_image"]').value;
            const twitterImage = document.querySelector('input[name="meta_twitter_image"]').value;
            
            if (ogImage) updateOGPreview(ogImage);
            if (twitterImage) updateTwitterPreview(twitterImage);
        });
    </script>

    <style>
        .form-text {
            margin-top: 6px;
            font-size: 12px;
            color: var(--rivion-text-secondary);
            line-height: 1.4;
        }

        input[type="color"]::-webkit-color-swatch-wrapper {
            padding: 0;
        }

        input[type="color"]::-webkit-color-swatch {
            border: none;
            border-radius: 6px;
        }
    </style>
@endsection
