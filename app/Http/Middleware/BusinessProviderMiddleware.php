<?php

namespace App\Http\Middleware;

use App\Enum\UserRoleEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BusinessProviderMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (! $user || ! $user->canAccessProviderWorkspace()) {
            return redirect()->route('home')
                ->with('error-toast', 'Please set up your provider profile first.');
        }

        // Ensure onboarding is complete before accessing the dashboard
        if ($user->businessProfile && !$user->businessProfile->has_onboarded) {
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
