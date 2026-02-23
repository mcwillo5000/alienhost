@component('mail::layout')

@slot('header')
@component('mail::header', ['url' => config('app.url')])
<span style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 24px; font-weight: 700; color: #5bbef4; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 10px rgba(91, 190, 244, 0.5);">{{ config('app.name') }}</span>
@endcomponent
@endslot


{{ $slot }}


@isset($subcopy)
@slot('subcopy')
@component('mail::subcopy')
{{ $subcopy }}
@endcomponent
@endslot
@endisset


@slot('footer')
@component('mail::footer')
© {{ date('Y') }} {{ config('app.name') }}. @lang('All rights reserved.')
<br>
<span style="color: #5bbef4;">Powered by Rivion</span>
@endcomponent
@endslot
@endcomponent
