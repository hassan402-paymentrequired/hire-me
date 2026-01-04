<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- SEO Meta Tags --}}
        <meta name="description" content="{{ $metaDescription ?? 'Simple, powerful booking management for service professionals. Manage appointments, reduce no-shows, and grow your business with our all-in-one scheduling platform.' }}">
        <meta name="keywords" content="{{ $metaKeywords ?? 'booking software, appointment scheduling, salon booking, barbershop appointments, Nigeria booking system, online scheduling, service booking' }}">
        <meta name="author" content="{{ config('app.name') }}">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Open Graph / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $ogTitle ?? config('app.name') . ' - Smart Booking Management for Service Professionals' }}">
        <meta property="og:description" content="{{ $ogDescription ?? 'Manage appointments effortlessly. Accept bookings 24/7, reduce no-shows, and grow your business.' }}">
        <meta property="og:image" content="{{ $ogImage ?? asset('images/og-image.jpg') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:site_name" content="{{ config('app.name') }}">
        <meta property="og:locale" content="en_NG">

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ $twitterTitle ?? config('app.name') . ' - Smart Booking Management' }}">
        <meta name="twitter:description" content="{{ $twitterDescription ?? 'The easiest way to manage appointments and grow your service business.' }}">
        <meta name="twitter:image" content="{{ $twitterImage ?? asset('images/twitter-card.jpg') }}">
        <meta name="twitter:site" content="@{{ config('app.twitter_handle', 'bookflow') }}">
        <meta name="twitter:creator" content="@{{ config('app.twitter_handle', 'bookflow') }}">

        {{-- Additional SEO --}}
        <meta name="theme-color" content="#3b82f6">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name') }}">
        <meta name="application-name" content="{{ config('app.name') }}">
        <meta name="msapplication-TileColor" content="#3b82f6">
        <meta name="msapplication-config" content="/browserconfig.xml">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ $pageTitle ?? config('app.name') . ' - Smart Booking Management for Service Professionals' }}</title>

        {{-- Favicons (multiple sizes for all devices) --}}
        <link rel="icon" href="/logo/favicon.ico" sizes="48x48">
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" sizes="180x180" href="/logo/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/logo/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/logo/favicon-16x16.png">
        <link rel="manifest" href="/logo/site.webmanifest">
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6">

        {{-- Preconnect for performance --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://fonts.bunny.net">

        {{-- Fonts with display swap for performance --}}
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
