<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', config('app.name'))</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .email-header {
            background-color: #2563eb;
            padding: 32px 40px;
            text-align: center;
        }
        .email-logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
        }
        .email-body {
            padding: 40px;
        }
        .email-heading {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 24px 0;
            line-height: 1.3;
        }
        .email-content {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin: 0 0 32px 0;
        }
        .email-content p {
            margin: 0 0 16px 0;
        }
        .email-content ul {
            margin: 16px 0;
            padding-left: 24px;
        }
        .email-content li {
            margin: 8px 0;
        }
        .email-content strong {
            color: #1f2937;
            font-weight: 600;
        }
        .email-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
        }
        .email-button:hover {
            background-color: #1d4ed8;
        }
        .email-footer {
            background-color: #f9fafb;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .email-footer-text {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 8px 0;
        }
        .email-footer-links {
            font-size: 13px;
            color: #9ca3af;
            margin: 16px 0 0 0;
        }
        .email-footer-links a {
            color: #6b7280;
            text-decoration: none;
            margin: 0 8px;
        }
        .email-footer-links a:hover {
            color: #2563eb;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                width: 100% !important;
            }
            .email-header,
            .email-body,
            .email-footer {
                padding: 24px 20px !important;
            }
            .email-heading {
                font-size: 24px !important;
            }
            .email-content {
                font-size: 15px !important;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-wrapper">
                    <!-- Header -->
                    <tr>
                        <td class="email-header">
                            <a href="{{ config('app.url') }}" class="email-logo">
                                {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td class="email-body">
                            @hasSection('heading')
                                <h1 class="email-heading">@yield('heading')</h1>
                            @endif
                            
                            <div class="email-content">
                                @yield('content')
                            </div>
                            
                            @hasSection('cta_url')
                                <div style="text-align: center;">
                                    <a href="@yield('cta_url')" target="_blank" class="email-button">@yield('cta_text', 'Get Started')</a>
                                </div>
                            @endif
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <p class="email-footer-text">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                            <p class="email-footer-links">
                                <a href="{{ config('app.url') }}/privacy">Privacy</a>
                                <span>•</span>
                                <a href="{{ config('app.url') }}/terms">Terms</a>
                                <span>•</span>
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}">Support</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
