<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /* Reset */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f2f4f1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }

        /* Container */
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        /* Header with gradient accent */
        .email-header {
            background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%);
            padding: 40px 40px 32px;
            text-align: center;
            position: relative;
        }

        .email-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #808f70 0%, #99a58d 50%, #808f70 100%);
            background-size: 200% 100%;
        }

        /* Logo styling */
        .email-logo-container {
            display: inline-block;
        }

        .email-logo {
            height: 48px;
            width: auto;
            display: block;
            margin: 0 auto;
        }

        .email-logo-text {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            font-family: 'Sekuya', sans-serif;
            letter-spacing: 2px;
            margin-top: 8px;
        }

        /* Body */
        .email-body {
            padding: 48px 40px;
            background-color: #ffffff;
        }

        .email-heading {
            font-size: 28px;
            font-weight: 700;
            color: #1a1d16;
            margin: 0 0 24px 0;
            line-height: 1.3;
            font-family: 'Roboto Flex', sans-serif;
        }

        /* Content */
        .email-content {
            font-size: 16px;
            line-height: 1.7;
            color: #4d5643;
            margin: 0;
        }

        .email-content p {
            margin: 0 0 18px 0;
        }

        .email-content p:last-child {
            margin-bottom: 0;
        }

        .email-content ul {
            margin: 20px 0;
            padding-left: 24px;
            list-style-type: none;
        }

        .email-content li {
            margin: 12px 0;
            padding-left: 28px;
            position: relative;
            line-height: 1.6;
        }

        .email-content li::before {
            content: '✓';
            position: absolute;
            left: 0;
            top: 0;
            color: #808f70;
            font-weight: 700;
            font-size: 18px;
        }

        .email-content strong {
            color: #1a1d16;
            font-weight: 600;
        }

        /* Info box for important notices */
        .info-box {
            background: linear-gradient(135deg, #f2f4f1 0%, #e6e9e2 100%);
            border-left: 4px solid #808f70;
            padding: 20px 24px;
            margin: 24px 0;
            border-radius: 6px;
        }

        .info-box p {
            margin: 0;
            color: #33392d;
            font-size: 15px;
        }

        /* CTA Button */
        .email-button-container {
            text-align: center;
            margin: 36px 0 24px;
        }

        .email-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            font-family: 'Figtree', sans-serif;
            letter-spacing: 0.3px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(26, 29, 22, 0.2);
        }

        .email-button:hover {
            background: linear-gradient(135deg, #33392d 0%, #4d5643 100%);
            box-shadow: 0 6px 16px rgba(26, 29, 22, 0.3);
            transform: translateY(-2px);
        }

        /* Divider */
        .email-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #ccd2c6 50%, transparent 100%);
            margin: 32px 0;
        }

        /* Footer */
        .email-footer {
            background-color: #f2f4f1;
            padding: 32px 40px;
            text-align: center;
        }

        .email-footer-branding {
            font-size: 20px;
            font-weight: 700;
            color: #1a1d16;
            margin: 0 0 16px 0;
            font-family: 'Sekuya', sans-serif;
            letter-spacing: 2px;
        }

        .email-footer-text {
            font-size: 14px;
            color: #66725a;
            margin: 0 0 8px 0;
            line-height: 1.6;
        }

        .email-footer-links {
            font-size: 13px;
            color: #808f70;
            margin: 20px 0 0 0;
        }

        .email-footer-links a {
            color: #4d5643;
            text-decoration: none;
            margin: 0 12px;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .email-footer-links a:hover {
            color: #1a1d16;
        }

        .email-footer-links span {
            color: #b3bca9;
            margin: 0 4px;
        }

        .email-footer-disclaimer {
            font-size: 12px;
            color: #99a58d;
            margin: 20px 0 0 0;
            line-height: 1.5;
        }

        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                width: 100% !important;
                border-radius: 0 !important;
            }

            .email-header,
            .email-body,
            .email-footer {
                padding: 32px 24px !important;
            }

            .email-heading {
                font-size: 24px !important;
            }

            .email-content {
                font-size: 15px !important;
            }

            .email-button {
                padding: 14px 32px !important;
                font-size: 15px !important;
            }

            .email-footer-links a {
                display: block;
                margin: 8px 0 !important;
            }

            .email-footer-links span {
                display: none;
            }

            .info-box {
                padding: 16px 20px !important;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f2f4f1; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-wrapper" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td class="email-header" style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 40px 40px 32px; text-align: center; position: relative;">
                            <div class="email-logo-container">
                                @if(file_exists(public_path('logo/logo.png')))
                                    <img src="{{ asset('logo/logo.png') }}" alt="{{ config('app.name') }}" class="email-logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
                                @else
                                    <div style="text-align: center;">
                                        <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #808f70 0%, #99a58d 100%); border-radius: 8px; margin-bottom: 8px;"></div>
                                    </div>
                                @endif
                                <a href="{{ config('app.url') }}" class="email-logo-text" style="color: #ffffff; font-size: 28px; font-weight: 700; text-decoration: none; display: block; letter-spacing: 2px; margin-top: 8px;">
                                    {{ config('app.name') }}
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td class="email-body" style="padding: 48px 40px; background-color: #ffffff;">
                            @hasSection('heading')
                                <h1 class="email-heading" style="font-size: 28px; font-weight: 700; color: #1a1d16; margin: 0 0 24px 0; line-height: 1.3;">
                                    @yield('heading')
                                </h1>
                            @endif
                            
                            <div class="email-content" style="font-size: 16px; line-height: 1.7; color: #4d5643;">
                                @yield('content')
                            </div>
                            
                            @hasSection('cta_url')
                                <div class="email-button-container" style="text-align: center; margin: 36px 0 24px;">
                                    <a href="@yield('cta_url')" target="_blank" class="email-button" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">
                                        @yield('cta_text', 'Get Started')
                                    </a>
                                </div>
                            @endif

                            <div class="email-divider" style="height: 1px; background: linear-gradient(90deg, transparent 0%, #ccd2c6 50%, transparent 100%); margin: 32px 0;"></div>

                            <p style="font-size: 14px; color: #66725a; margin: 0; line-height: 1.6;">
                                Need help? Our support team is available 24/7 at 
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}" style="color: #1a1d16; text-decoration: none; font-weight: 600;">
                                    support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}
                                </a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="email-footer" style="background-color: #f2f4f1; padding: 32px 40px; text-align: center;">
                            <div class="email-footer-branding" style="font-size: 20px; font-weight: 700; color: #1a1d16; margin: 0 0 16px 0; letter-spacing: 2px;">
                                {{ config('app.name') }}
                            </div>

                            <p class="email-footer-text" style="font-size: 14px; color: #66725a; margin: 0 0 8px 0; line-height: 1.6;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>

                            <div class="email-footer-links" style="font-size: 13px; color: #808f70; margin: 20px 0 0 0;">
                                <a href="{{ config('app.url') }}/privacy" style="color: #4d5643; text-decoration: none; margin: 0 12px; font-weight: 500;">Privacy Policy</a>
                                <span style="color: #b3bca9; margin: 0 4px;">•</span>
                                <a href="{{ config('app.url') }}/terms" style="color: #4d5643; text-decoration: none; margin: 0 12px; font-weight: 500;">Terms of Service</a>
                                <span style="color: #b3bca9; margin: 0 4px;">•</span>
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}" style="color: #4d5643; text-decoration: none; margin: 0 12px; font-weight: 500;">Contact Support</a>
                            </div>

                            <p class="email-footer-disclaimer" style="font-size: 12px; color: #99a58d; margin: 20px 0 0 0; line-height: 1.5;">
                                You're receiving this email because you created an account on {{ config('app.name') }}.<br>
                                If you have questions, please don't hesitate to reach out.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>