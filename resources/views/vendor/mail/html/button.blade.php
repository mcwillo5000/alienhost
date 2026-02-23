@props([
    'url',
    'color' => 'primary',
])
<table class="action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 30px auto; text-align: center;">
<tr>
<td align="center">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td>
<a href="{{ $url }}" class="button button-{{ $color }}" target="_blank" rel="noopener" style="
    background-color: {{ $color === 'primary' ? '#5bbef4' : ($color === 'success' ? '#10b981' : '#ef4444') }};
    border: 2px solid {{ $color === 'primary' ? '#5bbef4' : ($color === 'success' ? '#10b981' : '#ef4444') }};
    color: {{ $color === 'primary' ? '#0c1221' : '#ffffff' }};
    display: inline-block;
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 14px 28px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 2px;
    box-shadow: 0 0 20px {{ $color === 'primary' ? 'rgba(91, 190, 244, 0.4)' : ($color === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)') }};
">{{ $slot }}</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
