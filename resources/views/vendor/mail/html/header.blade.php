<tr>
<td class="header" style="padding: 25px 0; text-align: center;">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
@if (trim($slot) === 'Laravel')
<img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
@else
<span style="font-family: 'Orbitron', 'Segoe UI', sans-serif; font-size: 22px; font-weight: 700; color: #5bbef4; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 10px rgba(91, 190, 244, 0.5);">{{ $slot }}</span>
@endif
</a>
</td>
</tr>
