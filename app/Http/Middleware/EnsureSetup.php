<?php

namespace App\Http\Middleware;

use App\Enum\UserRoleEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSetup
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Allow guests
        if (!$user) {
            return $next($request);
        }

        // Allow onboarding routes always
        if ($request->routeIs('onboarding.*')) {
            return $next($request);
        }

        // If user has started provider setup but hasn't completed it
        // Only redirect if they're trying to access provider routes
        if ($request->routeIs('business.*', 'provider.*', 'schedule.*', 'onboarding.*')) {
            if ($user->hasProviderSetup()) {
                return $next($request);
            }
            
            // Check if they're trying to access provider routes without setup
            if ($request->routeIs('business.*', 'provider.*', 'schedule.*')) {
                return redirect()->route('onboarding.index')
                    ->with('error-toast', 'Please complete your provider profile before continuing.');
            }
        }

        return $next($request);
    }
}
