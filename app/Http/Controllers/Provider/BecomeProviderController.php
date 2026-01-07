<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BecomeProviderController extends Controller
{
    /**
     * Show the become provider page
     */
    public function index()
    {
        $user = auth()->user();

        // If already a provider, redirect to dashboard
        if ($user->hasProviderSetup()) {
            return redirect()->route('business.dashboard')
                ->with('info-toast', 'You are already set up as a provider.');
        }

        return Inertia::render('provider/become-provider', [
            'hasStartedOnboarding' => false,
        ]);
    }

    /**
     * Start the provider setup process
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // If already a provider, redirect to dashboard
        if ($user->hasProviderSetup()) {
            return redirect()->route('business.dashboard');
        }

        // Redirect to onboarding
        return redirect()->route('onboarding.index')
            ->with('success-toast', 'Welcome! Let\'s set up your provider profile.');
    }
}
