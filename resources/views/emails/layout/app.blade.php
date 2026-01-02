<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>@yield('title', 'Clockra')</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, a { font-family: Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style type="text/css">
        /* Reset styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
            -webkit-font-smoothing: antialiased !important;
        }
        img {
            border: 0 !important;
            outline: none !important;
            text-decoration: none !important;
            -ms-interpolation-mode: bicubic !important;
        }
        table {
            border-collapse: collapse !important;
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
        td, a, span {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }
        .button:hover {
            background-color: #1D4ED8 !important;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .wrapper {
                width: 100% !important;
                min-width: 100% !important;
            }
            .responsive-td {
                width: 100% !important;
                display: block !important;
            }
            .mobile-padding {
                padding: 20px !important;
            }
            .mobile-center {
                text-align: center !important;
            }
            h1 {
                font-size: 28px !important;
                line-height: 36px !important;
            }
            .mobile-hide {
                display: none !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
<!-- Wrapper -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC;">
    <tr>
        <td align="center" style="padding: 40px 20px;">

            <!-- Main Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="wrapper" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

                <!-- Header -->
                <tr>
                    <td style="background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); padding: 30px 40px;" class="mobile-padding">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td>
                                    <!-- Logo -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="vertical-align: middle; padding-right: 8px;">
                                                <!-- Logo Icon Box -->
                                                <div style="width: 40px; height: 40px; background-color: rgba(255, 255, 255, 0.2); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                                                    <!-- SVG Logo Icon -->
                                                    <svg width="24" height="24" viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg" style="fill: #FFFFFF; display: block;">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z"/>
                                                    </svg>
                                                </div>
                                            </td>
                                            <td style="vertical-align: middle;">
                                                <span style="font-size: 22px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.05em; font-family: 'Sekuya', -apple-system, BlinkMacSystemFont, sans-serif;">Clockra</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 50px 40px;" class="mobile-padding">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            @hasSection('hero_image')
                                <!-- Hero Image -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <img src="@yield('hero_image')" alt="" width="520" style="max-width: 100%; height: auto; display: block; border-radius: 8px;">
                                    </td>
                                </tr>
                            @endif

                            <!-- Heading -->
                            <tr>
                                <td>
                                    <h1 style="margin: 0 0 20px 0; font-size: 32px; line-height: 40px; font-weight: 700; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        @yield('heading')
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding-bottom: 30px;">
                                    <div style="font-size: 16px; line-height: 26px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        @yield('content')
                                    </div>
                                </td>
                            </tr>

                            @hasSection('cta_url')
                                <!-- CTA Button -->
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);">
                                                    <a href="@yield('cta_url')" target="_blank" class="button" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                        @yield('cta_text', 'View Details')
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            @endif

                        </table>
                    </td>
                </tr>

                <!-- Divider -->
                <tr>
                    <td style="padding: 0 40px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="border-top: 1px solid #E2E8F0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding: 40px;" class="mobile-padding">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            <!-- Questions Section -->
                            <tr>
                                <td align="center" style="padding-bottom: 20px;">
                                    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        Questions?
                                    </h2>
                                    <p style="margin: 0; font-size: 14px; line-height: 22px; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        We're here to help. Reach out anytime!
                                    </p>
                                </td>
                            </tr>

                            <!-- Contact Links -->
                            <tr>
                                <td align="center" style="padding-bottom: 30px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="padding: 0 10px;">
                                                <a href="mailto:support@clockra.com" style="font-size: 14px; color: #2563EB; text-decoration: none; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    support@clockra.com
                                                </a>
                                            </td>
                                            <td style="padding: 0 10px; color: #CBD5E1;">|</td>
                                            <td style="padding: 0 10px;">
                                                <a href="{{ config('app.url') }}/help" target="_blank" style="font-size: 14px; color: #2563EB; text-decoration: none; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    Help Center
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Social Links -->
                            <tr>
                                <td align="center" style="padding-bottom: 30px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="padding: 0 8px;">
                                                <a href="#" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #F1F5F9; border-radius: 50%; text-align: center; line-height: 36px;">
                                                    <span style="color: #64748B; font-size: 16px;">𝕏</span>
                                                </a>
                                            </td>
                                            <td style="padding: 0 8px;">
                                                <a href="#" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #F1F5F9; border-radius: 50%; text-align: center; line-height: 36px;">
                                                    <span style="color: #64748B; font-size: 16px;">in</span>
                                                </a>
                                            </td>
                                            <td style="padding: 0 8px;">
                                                <a href="#" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #F1F5F9; border-radius: 50%; text-align: center; line-height: 36px;">
                                                    <span style="color: #64748B; font-size: 16px;">f</span>
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Small Logo -->
                            <tr>
                                <td align="center" style="padding-bottom: 20px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="vertical-align: middle; padding-right: 6px;">
                                                <div style="width: 28px; height: 28px; background-color: #2563EB; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
                                                    <svg width="16" height="16" viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg" style="fill: #FFFFFF; display: block;">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z"/>
                                                    </svg>
                                                </div>
                                            </td>
                                            <td style="vertical-align: middle;">
                                                <span style="font-size: 14px; font-weight: 600; color: #64748B; letter-spacing: 0.05em;">Clockra</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Copyright & Links -->
                            <tr>
                                <td align="center">
                                    <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        © 2026 Clockra. All rights reserved.
                                    </p>
                                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        <a href="{{ config('app.url') }}/privacy" target="_blank" style="color: #94A3B8; text-decoration: underline;">Privacy Policy</a> •
                                        <a href="{{ config('app.url') }}/terms" target="_blank" style="color: #94A3B8; text-decoration: underline;">Terms of Service</a> •
                                        <a href="{{ config('app.url') }}/unsubscribe" target="_blank" style="color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>

            </table>
            <!-- End Main Container -->

        </td>
    </tr>
</table>
<!-- End Wrapper -->
</body>
</html>
