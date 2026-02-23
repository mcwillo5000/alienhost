<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>{{ config('app.name') }}</title>

    <style type="text/css" rel="stylesheet" media="all">

        
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Electrolize&display=swap');
        
        :root {
            color-scheme: dark;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            background-color: #0c1221 !important;
            color: #ffffff;
            font-family: 'Electrolize', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
        }
        
        .wrapper {
            background-color: #0c1221;
            margin: 0;
            padding: 35px 0;
            width: 100%;
        }
        
        .content-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
        }
        

        .header {
            padding: 25px 0;
            text-align: center;
        }
        
        .header a {
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #5bbef4 !important;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 0 0 10px rgba(91, 190, 244, 0.5);
        }
        

        .email-body {
            width: 100%;
            margin: 0;
            padding: 0;
            border-top: none;
            border-bottom: none;
            background-color: transparent;
        }
        
        .inner-body {
            background-color: #111827;
            border: 1px solid #374151;
            margin: 0 auto;
            padding: 0;
            width: 570px;
            max-width: 100%;
            box-shadow: 0 0 30px rgba(91, 190, 244, 0.15);
            position: relative;
        }
        
        .content-cell {
            padding: 35px;
        }
        

        .top-accent {
            height: 2px;
            background: linear-gradient(90deg, #5bbef4, transparent);
            margin-bottom: 20px;
        }
        
        .bottom-accent {
            height: 2px;
            background: linear-gradient(90deg, transparent, #5bbef4);
            margin-top: 20px;
        }
        

        .corner-accent-tl {
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            border-top: 2px solid #5bbef4;
            border-left: 2px solid #5bbef4;
        }
        
        .corner-accent-br {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            border-bottom: 2px solid #5bbef4;
            border-right: 2px solid #5bbef4;
        }
        

        h1 {
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            margin-top: 0;
            color: #ffffff;
            font-size: 20px;
            font-weight: 600;
            text-align: left;
        }
        
        p {
            font-family: 'Electrolize', 'Segoe UI', sans-serif;
            margin-top: 0;
            color: #d1d5db;
            font-size: 14px;
            line-height: 1.7;
            text-align: left;
        }
        
        a {
            color: #5bbef4;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        

        .button {
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            display: inline-block;
            width: 200px;
            min-height: 20px;
            padding: 12px 24px;
            background-color: #5bbef4;
            border: 2px solid #5bbef4;
            color: #0c1221 !important;
            font-size: 11px;
            font-weight: 600;
            line-height: 25px;
            text-align: center;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 2px;
            -webkit-text-size-adjust: none;
            box-shadow: 0 0 20px rgba(91, 190, 244, 0.4);
        }
        
        .button:hover {
            background-color: #7dcbf7;
            border-color: #7dcbf7;
        }
        
        .button-blue {
            background-color: #5bbef4;
            border-color: #5bbef4;
            color: #0c1221 !important;
        }
        
        .button-green {
            background-color: #10b981;
            border-color: #10b981;
            color: #ffffff !important;
        }
        
        .button-red {
            background-color: #ef4444;
            border-color: #ef4444;
            color: #ffffff !important;
        }
        

        .panel {
            background-color: rgba(91, 190, 244, 0.05);
            border-left: 3px solid #5bbef4;
            margin: 20px 0;
            padding: 15px;
        }
        
        .panel p {
            color: #d1d5db;
            margin: 0;
        }
        

        .subcopy {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #374151;
        }
        
        .subcopy p {
            font-size: 12px;
            color: #6b7280 !important;
            line-height: 1.5;
        }
        
        .subcopy a {
            color: #5bbef4;
            word-break: break-all;
        }
        

        .footer {
            margin: 0 auto;
            padding: 0;
            text-align: center;
            width: 570px;
            max-width: 100%;
        }
        
        .footer p {
            font-family: 'Electrolize', 'Segoe UI', sans-serif;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
            line-height: 1.5;
        }
        
        .footer a {
            color: #5bbef4;
        }
        
        .footer .rivion-badge {
            color: #5bbef4;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 10px;
        }
        

        .salutation {
            color: #d1d5db;
            font-size: 14px;
            line-height: 1.5;
        }
        

        @media only screen and (max-width: 600px) {
            .inner-body,
            .footer {
                width: 100% !important;
            }
            
            .content-cell {
                padding: 25px !important;
            }
        }
        
        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
        }
    </style>
</head>

<body style="background-color: #0c1221; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" class="wrapper" style="background-color: #0c1221; padding: 35px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" class="content-wrapper">

                    <tr>
                        <td class="header" style="padding: 25px 0; text-align: center;">
                            <a href="{{ config('app.url') }}" target="_blank" style="font-family: 'Orbitron', 'Segoe UI', sans-serif; font-size: 22px; font-weight: 700; color: #5bbef4; text-decoration: none; text-transform: uppercase; letter-spacing: 4px;">
                                {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>


                    <tr>
                        <td class="email-body" width="100%" style="background-color: transparent;">
                            <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" style="background-color: #111827; border: 1px solid #374151; box-shadow: 0 0 30px rgba(91, 190, 244, 0.15); position: relative;">

                                <tr>
                                    <td style="padding: 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="20" height="20" style="border-top: 2px solid #5bbef4; border-left: 2px solid #5bbef4;"></td>
                                                <td style="border-top: 1px solid transparent;"></td>
                                                <td width="20" height="20" style=""></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                

                                <tr>
                                    <td class="content-cell" style="padding: 35px;">

                                        <div style="height: 2px; background: linear-gradient(90deg, #5bbef4, transparent); margin-bottom: 20px;"></div>
                                        

                                        @if (! empty($greeting))
                                            <h1 style="font-family: 'Orbitron', 'Segoe UI', sans-serif; margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 600;">{{ $greeting }}</h1>
                                        @else
                                            @if ($level === 'error')
                                                <h1 style="font-family: 'Orbitron', 'Segoe UI', sans-serif; margin-top: 0; color: #ef4444; font-size: 20px; font-weight: 600;">@lang('Whoops!')</h1>
                                            @else
                                                <h1 style="font-family: 'Orbitron', 'Segoe UI', sans-serif; margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 600;">@lang('Hello!')</h1>
                                            @endif
                                        @endif


                                        @foreach ($introLines as $line)
                                            <p style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 0; color: #d1d5db; font-size: 14px; line-height: 1.7;">{{ $line }}</p>
                                        @endforeach


                                        @isset($actionText)
                                            <?php
                                                $color = match ($level) {
                                                    'success', 'green' => '#10b981',
                                                    'error', 'red' => '#ef4444',
                                                    default => '#5bbef4',
                                                };
                                                $textColor = $level === 'primary' || $level === '' || $level === 'blue' ? '#0c1221' : '#ffffff';
                                            ?>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px auto; text-align: center;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="{{ $actionUrl }}"
                                                            class="button"
                                                            target="_blank"
                                                            style="font-family: 'Orbitron', 'Segoe UI', sans-serif; display: inline-block; min-height: 20px; padding: 14px 28px; background-color: {{ $color }}; border: 2px solid {{ $color }}; color: {{ $textColor }}; font-size: 11px; font-weight: 600; line-height: 25px; text-align: center; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 0 20px {{ $color }}66;">
                                                            {{ $actionText }}
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endisset


                                        @foreach ($outroLines as $line)
                                            <p style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 0; color: #d1d5db; font-size: 14px; line-height: 1.7;">{{ $line }}</p>
                                        @endforeach


                                        @if (! empty($salutation))
                                            <p class="salutation" style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 0; color: #d1d5db; font-size: 14px; line-height: 1.7;">{{ $salutation }}</p>
                                        @else
                                            <p class="salutation" style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 0; color: #d1d5db; font-size: 14px; line-height: 1.7;">
                                                @lang('Regards'),<br>{{ config('app.name') }}
                                            </p>
                                        @endif


                                        <div style="height: 2px; background: linear-gradient(90deg, transparent, #5bbef4); margin-top: 20px;"></div>


                                        @isset($actionText)
                                            <table class="subcopy" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #374151;">
                                                <tr>
                                                    <td>
                                                        <p style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                                                            @lang(
                                                                "If you're having trouble clicking the \":actionText\" button, copy and paste the URL below\n".
                                                                'into your web browser:',
                                                                [
                                                                    'actionText' => $actionText,
                                                                ]
                                                            )
                                                        </p>
                                                        <p style="font-family: 'Electrolize', 'Segoe UI', sans-serif; margin-top: 10px; color: #5bbef4; font-size: 12px; line-height: 1.5; word-break: break-all;">
                                                            <a href="{{ $actionUrl }}" target="_blank" style="color: #5bbef4;">{{ $displayableActionUrl }}</a>
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endisset
                                    </td>
                                </tr>
                                

                                <tr>
                                    <td style="padding: 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="20" height="20" style=""></td>
                                                <td style=""></td>
                                                <td width="20" height="20" style="border-bottom: 2px solid #5bbef4; border-right: 2px solid #5bbef4;"></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>


                    <tr>
                        <td style="padding: 35px 0;">
                            <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" style="text-align: center;">
                                <tr>
                                    <td style="padding: 0;">
                                        <p style="font-family: 'Electrolize', 'Segoe UI', sans-serif; color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0;">
                                            © {{ date('Y') }} <a href="{{ config('app.url') }}" target="_blank" style="color: #5bbef4; text-decoration: none;">{{ config('app.name') }}</a>. @lang('All rights reserved.')
                                        </p>
                                        <p style="margin: 10px 0 0 0;">
                                            <span style="color: #5bbef4; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">⬡ Rivion Theme ⬡</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
