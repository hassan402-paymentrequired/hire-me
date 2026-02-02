<?php

namespace App\Http\Controllers\Provider\Integration;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $profile = BusinessProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            abort(404, 'Business profile not found');
        }

        return Inertia::render('provider/integration/widget', [
            'profile' => [
                'id' => $profile->id,
                'slug' => $profile->slug,
                'widget_enabled' => $profile->widget_enabled ?? false,
                'widget_settings' => $profile->widget_settings ?? [],
            ],
        ]);
    }
}
