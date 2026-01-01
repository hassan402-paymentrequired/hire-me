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

        // Allow guests, non-providers
        if (!$user || $user->role !== UserRoleEnum::PROVIDER) {
            return $next($request);
        }

        // Allow onboarding routes always
        if ($request->routeIs('onboarding.*')) {
            return $next($request);
        }

        // Single, authoritative check
        if (!$user->businessProfile) {
            return redirect()->route('onboarding.index');
        }


        return $next($request);
    }
}
