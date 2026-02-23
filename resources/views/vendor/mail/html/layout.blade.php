<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>{{ config('app.name') }}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Electrolize&display=swap');


:root {
    color-scheme: dark;
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

.content {
    margin: 0;
    padding: 0;
    width: 100%;
}

.header {
    padding: 25px 0;
    text-align: center;
}

.header a {
    color: #5bbef4;
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
    font-size: 22px;
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 4px;
}


.body {
    background-color: #0c1221;
    border-bottom: none;
    border-top: none;
    margin: 0 auto;
    padding: 0;
    width: 100%;
}

.inner-body {
    background-color: #111827;
    border: 1px solid #374151;
    margin: 0 auto;
    padding: 0;
    width: 570px;
    box-shadow: 0 0 30px rgba(91, 190, 244, 0.15), inset 0 1px 0 rgba(91, 190, 244, 0.1);
    position: relative;
}


.inner-body::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    border-top: 2px solid #5bbef4;
    border-left: 2px solid #5bbef4;
}

.inner-body::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    border-bottom: 2px solid #5bbef4;
    border-right: 2px solid #5bbef4;
}

.content-cell {
    max-width: 100vw;
    padding: 35px;
}


h1, h2, h3 {
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
}

h1 {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-top: 0;
    text-align: left;
}

p {
    color: #d1d5db;
    font-size: 14px;
    line-height: 1.7;
    margin-top: 0;
    text-align: left;
}

a {
    color: #5bbef4;
}


.button {
    border-radius: 0;
    display: inline-block;
    overflow: hidden;
    text-decoration: none;
}

.button-primary,
.button-primary td {
    background-color: #5bbef4;
}

.button-primary a {
    background-color: #5bbef4;
    border: 2px solid #5bbef4;
    color: #0c1221;
    display: inline-block;
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 14px 28px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 2px;
    -webkit-text-size-adjust: none;
}

.button-success,
.button-success td {
    background-color: #10b981;
}

.button-success a {
    background-color: #10b981;
    border: 2px solid #10b981;
    color: #ffffff;
}

.button-error,
.button-error td {
    background-color: #ef4444;
}

.button-error a {
    background-color: #ef4444;
    border: 2px solid #ef4444;
    color: #ffffff;
}


.panel {
    background-color: rgba(91, 190, 244, 0.05);
    border-left: 3px solid #5bbef4;
    margin: 21px 0;
}

.panel-content {
    color: #d1d5db;
    font-size: 14px;
    padding: 16px;
}

.panel-content p {
    color: #d1d5db;
}


.table {
    margin: 30px auto;
    width: 100%;
}

.table th {
    border-bottom: 2px solid #5bbef4;
    color: #5bbef4;
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    padding-bottom: 8px;
    text-align: left;
    text-transform: uppercase;
}

.table td {
    color: #d1d5db;
    padding: 10px 0;
    font-size: 14px;
    border-bottom: 1px solid #374151;
}


.subcopy {
    border-top: 1px solid #374151;
    margin-top: 25px;
    padding-top: 25px;
}

.subcopy p {
    font-size: 12px;
    color: #6b7280 !important;
}


.footer {
    margin: 0 auto;
    padding: 0;
    text-align: center;
    width: 570px;
}

.footer p {
    color: #6b7280;
    font-size: 12px;
    text-align: center;
    line-height: 1.5;
}

.footer a {
    color: #5bbef4;
    text-decoration: none;
}


.hr {
    border: none;
    border-top: 1px solid #374151;
    margin: 25px 0;
}


code {
    background-color: rgba(91, 190, 244, 0.1);
    border: 1px solid #374151;
    color: #5bbef4;
    font-family: 'Courier New', Courier, monospace;
    font-size: 85%;
    padding: 0.2em 0.4em;
}


@media only screen and (max-width: 600px) {
    .inner-body,
    .footer {
        width: 100% !important;
    }
}

@media only screen and (max-width: 500px) {
    .button {
        width: 100% !important;
    }
    
    .button a {
        width: 100% !important;
    }
}
</style>
</head>
<body>

<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
{{ $header ?? '' }}


<tr>
<td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1221;">
<table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #111827; border: 1px solid #374151; box-shadow: 0 0 30px rgba(91, 190, 244, 0.15);">

<tr>
<td class="content-cell" style="padding: 35px;">

<div style="height: 2px; background: linear-gradient(90deg, #5bbef4, transparent); margin-bottom: 25px;"></div>

{{ $slot }}


<div style="height: 2px; background: linear-gradient(90deg, transparent, #5bbef4); margin-top: 25px;"></div>

{{ $subcopy ?? '' }}
</td>
</tr>
</table>
</td>
</tr>

{{ $footer ?? '' }}
</table>
</td>
</tr>
</table>
</body>
</html>
