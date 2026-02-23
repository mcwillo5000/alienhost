@extends('layouts.rivion', ['navbar' => 'language', 'sideEditor' => true])

@section('title')
    Rivion Language Settings
@endsection

@section('content')
    <form action="{{ route('admin.rivion.language.update') }}" method="POST">
        <div class="rivion-settings-header">
            <h1>Language Settings</h1>
            <p>Configure the default language for your panel</p>
        </div>
    
        <div class="rivion-theme-group">
            <h3>Default Panel Language</h3>
            <p style="color: #9CA3AF; margin-bottom: 24px;">
                Select the default language that will be used for new users and guests. 
                Users can still change their preferred language at any time using the language selector.
            </p>
            
            <div style="max-width: 500px;">
                <label for="default_language" style="display: block; margin-bottom: 10px; color: #F9FAFB; font-weight: 500; font-size: 14px;">
                    Select Default Language
                </label>
                <select name="default_language" id="default_language" class="language-select" required>
                    <option value="en" {{ ($default_language ?? 'en') === 'en' ? 'selected' : '' }}>🇬🇧 English</option>
                    <option value="fr" {{ ($default_language ?? 'en') === 'fr' ? 'selected' : '' }}>🇫🇷 Français (French)</option>
                    <option value="de" {{ ($default_language ?? 'en') === 'de' ? 'selected' : '' }}>🇩🇪 Deutsch (German)</option>
                    <option value="es" {{ ($default_language ?? 'en') === 'es' ? 'selected' : '' }}>🇪🇸 Español (Spanish)</option>
                    <option value="da" {{ ($default_language ?? 'en') === 'da' ? 'selected' : '' }}>🇩🇰 Dansk (Danish)</option>
                    <option value="ko" {{ ($default_language ?? 'en') === 'ko' ? 'selected' : '' }}>🇰🇷 한국어 (Korean)</option>
                    <option value="it" {{ ($default_language ?? 'en') === 'it' ? 'selected' : '' }}>🇮🇹 Italiano (Italian)</option>
                    <option value="hu" {{ ($default_language ?? 'en') === 'hu' ? 'selected' : '' }}>🇭🇺 Magyar (Hungarian)</option>
                </select>
            </div>
        </div>

        <div class="floating-button">
            {{ csrf_field() }}
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Language Settings
            </button>
        </div>
    </form>
@endsection

@section('scripts')
    @parent
    <style>
        .language-select {
            width: 100%;
            padding: 12px 16px;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 8px;
            color: #F9FAFB;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;
            padding-right: 48px;
        }
        
        .language-select:hover {
            border-color: #4B5563;
            background-color: #1F2937;
        }
        
        .language-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background-color: #1F2937;
        }
        
        .language-select option {
            padding: 10px;
            background: #111827;
            color: #F9FAFB;
        }
        
        .language-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .language-card:hover {
            background: #1F2937;
            border-color: #4B5563;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .language-flag {
            font-size: 24px;
            line-height: 1;
        }
        
        .language-name {
            color: #F9FAFB;
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 2px;
        }
        
        .language-code {
            color: #6B7280;
            font-size: 12px;
            text-transform: uppercase;
            font-family: monospace;
        }
    </style>
@endsection
