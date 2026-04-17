<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only apply to users who have started provider setup
        if (!$user || !$user->hasProviderSetup()) {
            return $next($request);
        }

        // Check current step and redirect if trying to access completed steps
        $hasBusinessProfile = $user->businessProfile !== null;
        $hasWorkHours = \App\Models\WorkHour::where('provider_id', $user->id)->exists();
        $hasServices = \App\Models\Service::where('provider_id', $user->id)->exists();

        // Only redirect if the user has FULLY completed onboarding
        if ($user->businessProfile?->has_onboarded) {
            if ($request->routeIs('onboarding.success', 'onboarding.verification')) {
                return $next($request);
            }
            return redirect()->route('business.dashboard')->with('error-toast', 'You have already completed onboarding.');
        }

        return $next($request);
    }
}
