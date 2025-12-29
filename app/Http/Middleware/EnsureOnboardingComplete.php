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

        // Only apply to providers
        if (!$user || $user->role !== \App\Enum\UserRoleEnum::PROVIDER) {
            return $next($request);
        }

        // Check current step and redirect if trying to access completed steps
        $hasBusinessProfile = $user->businessProfile !== null;
        $hasWorkHours = \App\Models\WorkHour::where('provider_id', $user->id)->exists();
        $hasServices = \App\Models\Service::where('provider_id', $user->id)->exists();

        // If trying to access business-profile but already completed
        if ($request->routeIs('onboarding.business-profile') && $hasBusinessProfile) {
            return redirect()->route('onboarding.index');
        }

        // If trying to access work-hours but already completed
        if ($request->routeIs('onboarding.work-hours') && $hasWorkHours) {
            return redirect()->route('onboarding.index');
        }

        // If trying to access services but already completed
        if ($request->routeIs('onboarding.services') && $hasServices) {
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
