<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function about()
    {
        return Inertia::render('guest/pages/about', [
            'title' => 'About Us',
        ]);
    }

    public function history()
    {
        return Inertia::render('guest/pages/history', [
            'title' => 'Our History',
        ]);
    }

    public function ourTeam()
    {
        return Inertia::render('guest/pages/our-team', [
            'title' => 'Our Team',
        ]);
    }

    public function faqs()
    {
        return Inertia::render('guest/pages/faqs', [
            'title' => 'Frequently Asked Questions',
        ]);
    }

    public function contact()
    {
        return Inertia::render('guest/pages/contact', [
            'title' => 'Contact Us',
        ]);
    }

    public function privacyPolicy()
    {
        return Inertia::render('guest/pages/privacy-policy', [
            'title' => 'Privacy Policy',
        ]);
    }

    public function termsAndConditions()
    {
        return Inertia::render('guest/pages/terms', [
            'title' => 'Terms and Conditions',
        ]);
    }
}
