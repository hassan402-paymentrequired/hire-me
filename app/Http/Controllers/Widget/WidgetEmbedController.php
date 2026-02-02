<?php

namespace App\Http\Controllers\Widget;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use Inertia\Inertia;

class WidgetEmbedController extends Controller
{
    public function embed($slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();

        // Get widget settings
        $widgetSettings = $businessProfile->widget_settings ?? [];
        
        // Get color and size from query params (for preview customization)
        $primaryColor = request()->query('color', $widgetSettings['primaryColor'] ?? '#3B82F6');
        $size = request()->query('size', $widgetSettings['size'] ?? 'medium');
        
        return Inertia::render('widget/embed', [
            'slug' => $slug,
            'primaryColor' => $primaryColor,
            'size' => $size,
        ]);
    }
}
