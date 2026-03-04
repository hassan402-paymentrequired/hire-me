<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', config('app.name'))</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Hedvig+Letters+San&Figtree:ital,wght@0,300..900;1,300..900s&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Sekuya&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Roboto+Flex:opsz,wght,XOPQ,XTRA,YOPQ,YTDE,YTFI,YTLC,YTUC@8..144,100..1000,96,468,79,-203,738,514,712&display=swap');

        body {
            margin: 0;
            padding: 0;
            font-family: Roboto, 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f2f4f1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        table { border-collapse: collapse; }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }

        a { text-decoration: none; }

        ul {
            line-height: 1.8;
            background: #f3f4f6;
            border-radius: 2px;
            padding: 10px;
        }

        li, p {
            font-family: 'Roboto Flex', sans-serif;
        }

        p {
            font-size: 14px;
            line-height: 1.5;
        }

        .email-main-wrapper {
            padding: 20px;
            margin-top: 20px;
        }

        /* Container */
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 3px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        /* Header */
        .email-header {
            display: flex;
            align-items: center;
            font-family: 'Sekuya';
            padding: 20px 10px 10px 15px;
        }

        .email-logo-container {
            display: flex;
            align-items: center;
        }

        .email-logo {
            height: 48px;
            width: auto;
        }

        .email-logo-text {
            color: black;
            font-size: 28px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            font-family: 'Sekuya', sans-serif;
            letter-spacing: 2px;
        }

        /* Body */
        .email-body {
            background-color: #ffffff;
            padding: 0px 20px 5px 20px;
        }

        .email-heading {
            font-size: 22px;
            font-weight: 700;
            color: #1a1d16;
            line-height: 1.3;
            font-family: 'Roboto Flex', sans-serif;
        }

        /* Content */
        .email-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
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

        /* Info box */
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
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 36px 0 24px;
        }

        .email-button {
            display: flex;
            align-items: center;
            height: 2.5em;
            width: auto;
            justify-content: center;
            background-color: #100C08;
            border-radius: 3px;
            letter-spacing: 1px;
            transition: all 0.2s linear;
            cursor: pointer;
            border: none;
            color: white;
            text-align: center;
            font-family: 'Roboto Flex', sans-serif;
            padding-inline: 12px;
        }

        /* Divider */
        .email-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #ccd2c6 50%, transparent 100%);
            margin: 32px 0;
        }

        .help-text {
            font-family: 'Roboto Flex', sans-serif;
            text-align: center;
            font-size: 14px;
        }

        .help-text .help-text-link {
            text-decoration: underline;
            color: #100C08;
        }

        /* Footer */
        .email-footer {
            background: #f3f4f6;
            padding: 32px 40px;
            text-align: center;
            font-family: 'Roboto Flex', sans-serif;
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

        /* Mobile */
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

        @yield('styles')
    </style>
</head>

<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-main-wrapper">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-wrapper">

                    <!-- Header -->
                    <tr>
                        <td class="email-header">
                            <div class="email-logo-container">
                                <img src="{{ asset('logo.png') }}" alt="{{ config('app.name') }}" class="email-logo" />
                                <a href="{{ config('app.url') }}" class="email-logo-text">
                                    {{ config('app.name') }}
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="email-body">

                            <h1 class="email-heading">@yield('heading')</h1>

                            @yield('body')

                            @hasSection('cta_label')
                                <div class="email-button-container">
                                    <a href="@yield('cta_url')" target="_blank" class="email-button">
                                        @yield('cta_label')
                                    </a>
                                </div>
                            @endif

                            <div class="email-divider"></div>

                            <p class="help-text">
                                Need help? Our support team is available 24/7 at
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}" class="help-text-link">
                                    support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}
                                </a>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <div class="email-footer-branding">
                                {{ config('app.name') }}
                            </div>

                            <p class="email-footer-text">
                                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>

                            <div class="email-footer-links">
                                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
                                <span>&bull;</span>
                                <a href="{{ config('app.url') }}/terms">Terms of Service</a>
                                <span>&bull;</span>
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}">Contact Support</a>
                                <span>&bull;</span>
                                <a href="@yield('unsubscribe_url', '#')">Unsubscribe</a>
                            </div>

                            <p class="email-footer-disclaimer">
                                You're receiving this email because you created an account on {{ config('app.name') }}.<br>
                                @yield('footer_note', 'If you have questions, please don\'t hesitate to reach out.')
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>