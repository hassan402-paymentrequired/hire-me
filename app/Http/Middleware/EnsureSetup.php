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

        // Allow guests - they can access all public routes
        if (!$user) {
            return $next($request);
        }

        // Allow onboarding routes always
        if ($request->routeIs('onboarding.*')) {
            return $next($request);
        }

        // Allow public provider viewing routes (anyone can view provider profiles)
        if ($request->routeIs('provider.show', 'marketplace.booking', 'slots')) {
            return $next($request);
        }

        // Allow client wallet routes for all authenticated users (clients and providers)
        // Client routes: wallet.index, wallet.top-up.*, wallet.client.withdraw.*
        // Provider routes: wallet.withdraw.* - protected by 'provider' middleware
        if ($request->routeIs('wallet.index', 'wallet.top-up.*', 'wallet.client.withdraw.*')) {
            return $next($request);
        }

        // Allow client routes (bookings, appointments) for all authenticated users
        if ($request->routeIs('client.bookings.*', 'appointments.*', 'jobs.*', 'reviews.*', 'favourite.*')) {
            return $next($request);
        }

        // If user has started provider setup but hasn't completed it
        // Only redirect if they're trying to access provider management routes
        if ($request->routeIs('business.*', 'provider.appointments.*', 'schedule.*')) {
            if ($user->canAccessProviderWorkspace()) {
                return $next($request);
            }
            
            // Check if they're trying to access provider management routes without setup
            return redirect()->route('onboarding.index')
                ->with('error-toast', 'Please complete your provider profile before continuing.');
        }

        return $next($request);
    }
}
