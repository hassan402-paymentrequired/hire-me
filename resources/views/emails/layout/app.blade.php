<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>@yield('title', 'Clockra')</title>

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
            background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%) !important;
            box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3) !important;
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
                font-size: 26px !important;
                line-height: 34px !important;
            }
            .mobile-hide {
                display: none !important;
            }
            .social-icon {
                width: 32px !important;
                height: 32px !important;
                line-height: 32px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

<!-- Preheader (hidden) -->
<div style="display: none; max-height: 0px; overflow: hidden;">
    @yield('preheader', 'Welcome to Clockra - Your time management solution')
</div>

<!-- Wrapper -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F1F5F9;">
    <tr>
        <td align="center" style="padding: 40px 20px;">

            <!-- Main Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="wrapper" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);">

                <!-- Header with Pattern -->
                <tr>
                    <td style="background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); padding: 40px 40px 50px 40px; position: relative;" class="mobile-padding">
                        <!-- Decorative circles -->
                        <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="position: relative; z-index: 1;">
                            <tr>
                                <td>
                                    <!-- Logo -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="vertical-align: middle; padding-right: 12px;">
                                                <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                                   <img src="{{ config('app.url') }}/logo.png" alt="Clockra Logo" style="width: 32px; height: 32px; object-fit: contain; display: block;"/>
                                                </div>
                                            </td>
                                            <td style="vertical-align: middle;">
                                                <span style="font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">Clockra</span>
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
                    <td style="padding: 50px 40px 40px 40px;" class="mobile-padding">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            @hasSection('hero_image')
                                <!-- Hero Image with rounded corners and shadow -->
                                <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <img src="@yield('hero_image')" alt="" width="520" style="max-width: 100%; height: auto; display: block; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                    </td>
                                </tr>
                            @endif

                            <!-- Heading -->
                            <tr>
                                <td>
                                    <h1 style="margin: 0 0 16px 0; font-size: 32px; line-height: 42px; font-weight: 700; color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.02em;">
                                        @yield('heading')
                                    </h1>
                                </td>
                            </tr>

                            <!-- Accent Line -->
                            <tr>
                                <td style="padding-bottom: 24px;">
                                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #2563EB 0%, #60A5FA 100%); border-radius: 2px;"></div>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding-bottom: 35px;">
                                    <div style="font-size: 16px; line-height: 28px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        @yield('content')
                                    </div>
                                </td>
                            </tr>

                            @hasSection('cta_url')
                                <!-- CTA Button with enhanced styling -->
                                <tr>
                                    <td align="center" style="padding: 25px 0 10px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                                                    <a href="@yield('cta_url')" target="_blank" class="button" style="display: inline-block; padding: 18px 40px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.01em;">
                                                        @yield('cta_text', 'Get Started')
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

                <!-- Decorative Divider -->
                <tr>
                    <td style="padding: 0 40px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="padding: 10px 0;">
                                    <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #E2E8F0 20%, #E2E8F0 80%, transparent 100%);"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding: 45px 40px 40px 40px; background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);" class="mobile-padding">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            <!-- Questions Section -->
                            <tr>
                                <td align="center" style="padding-bottom: 25px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" >
                                        <tr>
                                            <td align="center">
                                                <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    Need Help?
                                                </h2>
                                                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    Our support team is ready to assist you
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Contact Links -->
                            <tr>
                                <td align="center" style="padding-bottom: 30px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="padding: 0 15px;">
                                                <a href="mailto:support@clockra.com" style="font-size: 14px; color: #2563EB; text-decoration: none; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    📧 support@clockra.com
                                                </a>
                                            </td>
                                            <td style="padding: 0 10px; color: #CBD5E1; font-weight: 300;">|</td>
                                            <td style="padding: 0 15px;">
                                                <a href="{{ config('app.url') }}/help" target="_blank" style="font-size: 14px; color: #2563EB; text-decoration: none; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                    📚 Help Center
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
                                            <td style="padding: 0 6px;">
                                                <a href="#" target="_blank" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none; transition: all 0.3s;">
                                                    <span style="color: #475569; font-size: 18px; font-weight: 600;">𝕏</span>
                                                </a>
                                            </td>
                                            <td style="padding: 0 6px;">
                                                <a href="#" target="_blank" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                                    <span style="color: #475569; font-size: 18px; font-weight: 600;">in</span>
                                                </a>
                                            </td>
                                            <td style="padding: 0 6px;">
                                                <a href="#" target="_blank" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                                    <span style="color: #475569; font-size: 18px; font-weight: 600;">f</span>
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
                                            <td style="vertical-align: middle; padding-right: 8px;">
                                                <div style="width: 32px; height: 32px; opacity: 0.7;">
                                                   <img src="{{ config('app.url') }}/logo.png" alt="Clockra" style="width: 100%; height: 100%; object-fit: contain; display: block;"/>
                                                </div>
                                            </td>
                                            <td style="vertical-align: middle;">
                                                <span style="font-size: 16px; font-weight: 700; color: #64748B; letter-spacing: 0.02em;">Clockra</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Copyright & Links -->
                            <tr>
                                <td align="center">
                                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 20px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        © 2026 Clockra. All rights reserved.
                                    </p>
                                    <p style="margin: 0; font-size: 12px; line-height: 20px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        <a href="{{ config('app.url') }}/privacy" target="_blank" style="color: #64748B; text-decoration: none; font-weight: 500;">Privacy Policy</a>
                                        <span style="margin: 0 8px; color: #CBD5E1;">•</span>
                                        <a href="{{ config('app.url') }}/terms" target="_blank" style="color: #64748B; text-decoration: none; font-weight: 500;">Terms of Service</a>
                                        <span style="margin: 0 8px; color: #CBD5E1;">•</span>
                                        <a href="{{ config('app.url') }}/unsubscribe" target="_blank" style="color: #64748B; text-decoration: none; font-weight: 500;">Unsubscribe</a>
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