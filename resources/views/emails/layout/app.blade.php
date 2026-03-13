<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /*
         * Email client note:
         * Many email clients strip @import / external fonts. Keep to system fonts.
         */

        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f2f4f1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        table {
            border-collapse: collapse;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }

        a {
            text-decoration: none;
        }

        a[x-apple-data-detectors],
        a[href^="tel"],
        a[href^="sms"] {
            color: inherit !important;
            text-decoration: none !important;
        }

        ul {
            line-height: 1.8;
            background: #f3f4f6;
            border-radius: 2px;
            padding: 10px;
        }

        li,
        p {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        p {
            font-size: 14px;
            line-height: 1.5;
        }


        .email-main-wrapper {
            padding: 20px 12px;
        }

        /* Container */
        .email-wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto !important;
            background-color: #ffffff;
            border-radius: 3px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        /* Header with gradient accent */
        .email-header {
            padding: 20px 10px 10px 15px;
            text-align: center;
        }


        /* Logo styling */
        .email-logo-container {
            width: 100%;
        }

        .email-logo {
            margin-bottom: 10px;
            height: 45px;
            width: auto;
            -webkit-user-select: none;
            user-select: none;
        }

        .email-logo-text {
            color: black;
            font-size: 28px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            letter-spacing: 2px;
        }

        /* Body */
        .email-body {
            background-color: #ffffff;
            padding: 0px 20px 5px 20px;
        }

        .email-heading {
            text-transform: capitalize;
            font-size: 22px;
            font-weight: 700;
            color: #1a1d16;
            line-height: 1.3;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Content */
        .email-content {
            display: block;
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
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-left: 4px solid #99a1af;
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
            background-color: #100C08;
            border-radius: 3px;
            letter-spacing: 1px;
            transition: all 0.2s linear;
            cursor: pointer;
            border: none;
            color: white;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 12px 18px;
            line-height: 1.2;
        }


        /* Divider */
        .email-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #ccd2c6 50%, transparent 100%);
            margin: 32px 0;

        }

        .help-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            text-align: center;
            font-size: 14px;
        }

        .help-text .help-text-link {
            text-decoration: underline;
            color: #100C08;

        }

        /* Footer */
        .email-footer {
            /*background-color: #f2f4f1;*/
            background: #f3f4f6;
            padding: 32px 40px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
        }

        .email-footer-branding {
            font-size: 20px;
            font-weight: 700;
            color: #1a1d16;
            margin: 0 0 16px 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
                padding: 24px 16px !important;
            }

            .email-heading {
                font-size: 22px !important;
            }

            .email-content {
                font-size: 15px !important;
            }

            .email-button {
                display: block !important;
                width: 100% !important;
                max-width: 420px !important;
                margin: 0 auto !important;
                padding: 14px 16px !important;
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
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-main-wrapper">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper" style="max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td class="email-header" align="center">
                            <a href="{{ config('app.url') }}" target="_blank">
                                <img src="{{ asset('logo.png') }}" alt="{{ config('app.name') }}" class="email-logo" />
                            </a>
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
                                <a href="mailto:support@proxideck" class="help-text-link">
                                    support@proxideck
                                </a>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                             <div class="email-footer-branding">
                                <img src="{{ asset('logo.png') }}" alt="{{ config('app.name') }}" class="email-logo" />
                            </div>

                            <p class="email-footer-text">
                                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>

                            <div class="email-footer-links">
                                <a href="{{ route('privacy-policy') }}">Privacy Policy</a>
                                <span>&bull;</span>
                                <a href="{{ route('terms') }}">Terms of Service</a>
                                <span>&bull;</span>
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}">Contact Support</a>
                                {{--  <span>&bull;</span>
                                <a href="#">Unsubscribe</a>  --}}
                            </div>

                            <p class="email-footer-disclaimer">
                                You're receiving this email because you created an account on
                                {{ config('app.name') }}.<br>
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
