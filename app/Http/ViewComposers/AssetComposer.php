<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
public function __construct(
    private AssetHashService $assetHashService,
    private SettingsRepositoryInterface $settings
) {
}

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'locale' => config('app.locale') ?? 'en',
            'theme' => [
    'light_primary' => $this->settings->get('rivion:light_primary', '#3B82F6'),
    'light_secondary' => $this->settings->get('rivion:light_secondary', '#1E40AF'),
    'light_border' => $this->settings->get('rivion:light_border', '#E5E7EB'),
    'light_text_base' => $this->settings->get('rivion:light_text_base', '#111827'),
    'light_text_muted' => $this->settings->get('rivion:light_text_muted', '#6B7280'),
    'light_text_inverted' => $this->settings->get('rivion:light_text_inverted', '#FFFFFF'),
    'light_background' => $this->settings->get('rivion:light_background', '#FFFFFF'),
    'light_background_secondary' => $this->settings->get('rivion:light_background_secondary', '#F9FAFB'),
    'dark_primary' => $this->settings->get('rivion:dark_primary', '#3B82F6'),
    'dark_secondary' => $this->settings->get('rivion:dark_secondary', '#1E40AF'),
    'dark_border' => $this->settings->get('rivion:dark_border', '#374151'),
    'dark_text_base' => $this->settings->get('rivion:dark_text_base', '#F9FAFB'),
    'dark_text_muted' => $this->settings->get('rivion:dark_text_muted', '#9CA3AF'),
    'dark_text_inverted' => $this->settings->get('rivion:dark_text_inverted', '#111827'),
    'dark_background' => $this->settings->get('rivion:dark_background', '#111827'),
    'dark_background_secondary' => $this->settings->get('rivion:dark_background_secondary', '#1F2937'),
],
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
