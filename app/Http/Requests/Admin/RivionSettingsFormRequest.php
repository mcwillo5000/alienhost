<?php

namespace Pterodactyl\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RivionSettingsFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'light_primary' => 'nullable|string|max:7',
            'light_secondary' => 'nullable|string|max:7',
            'light_border' => 'nullable|string|max:7',
            'light_text_base' => 'nullable|string|max:7',
            'light_text_muted' => 'nullable|string|max:7',
            'light_text_inverted' => 'nullable|string|max:7',
            'light_background' => 'nullable|string|max:7',
            'light_background_secondary' => 'nullable|string|max:7',
            
            'dark_primary' => 'nullable|string|max:7',
            'dark_secondary' => 'nullable|string|max:7',
            'dark_border' => 'nullable|string|max:7',
            'dark_text_base' => 'nullable|string|max:7',
            'dark_text_muted' => 'nullable|string|max:7',
            'dark_text_inverted' => 'nullable|string|max:7',
            'dark_background' => 'nullable|string|max:7',
            'dark_background_secondary' => 'nullable|string|max:7',
            
            'default_theme' => 'nullable|string|in:dark,light,system',
            'disable_theme_toggle' => 'nullable|string|in:0,1',
            
            'egg_images' => 'nullable|array',
            'egg_images.*' => 'nullable|url',
            
            'default_language' => 'nullable|string|in:en,fr,de,es,da,ko,it,hu',
            
            'welcome_title' => 'nullable|string|max:255',
            'welcome_message' => 'nullable|string|max:1000',
            
            'card_1_title' => 'nullable|string|max:255',
            'card_1_description' => 'nullable|string|max:255',
            'card_1_icon' => 'nullable|string|max:50',
            'card_1_link' => 'nullable|url|max:255',
            
            'card_2_title' => 'nullable|string|max:255',
            'card_2_description' => 'nullable|string|max:255',
            'card_2_icon' => 'nullable|string|max:50',
            'card_2_link' => 'nullable|url|max:255',
            
            'card_3_title' => 'nullable|string|max:255',
            'card_3_description' => 'nullable|string|max:255',
            'card_3_icon' => 'nullable|string|max:50',
            'card_3_link' => 'nullable|url|max:255',
            
            'card_4_title' => 'nullable|string|max:255',
            'card_4_description' => 'nullable|string|max:255',
            'card_4_icon' => 'nullable|string|max:50',
            'card_4_link' => 'nullable|url|max:255',
            
            'card_5_title' => 'nullable|string|max:255',
            'card_5_description' => 'nullable|string|max:255',
            'card_5_icon' => 'nullable|string|max:50',
            'card_5_link' => 'nullable|url|max:255',
        ];
    }

    public function normalize(): array
    {
        return $this->validated();
    }
}
