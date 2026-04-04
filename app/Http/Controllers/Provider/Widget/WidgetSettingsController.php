<?php

namespace App\Http\Controllers\Provider\Widget;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WidgetSettingsController extends Controller
{
    /**
     * Update widget settings immediately (for auto-save)
     */
    public function update(Request $request)
    {
        $provider = auth_user();
        $profile = $provider?->businessProfile;

        if (!$profile) {
            return response()->json(['error' => 'Business profile not found.'], 404);
        }

        $request->validate([
            'widget_enabled' => 'nullable|boolean',
            'widget_settings' => 'nullable|array',
        ]);

        try {
            $profile->update([
                'widget_enabled' => $request->has('widget_enabled') 
                    ? (bool)$request->widget_enabled 
                    : $profile->widget_enabled,
                'widget_settings' => $request->widget_settings ?? $profile->widget_settings,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Widget settings updated successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update widget settings: ' . $e->getMessage()
            ], 500);
        }
    }
}
