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
        
        // Get customization from query params (for preview) or use saved settings
        $customization = [
            'primaryColor' => request()->query('color', $widgetSettings['primaryColor'] ?? '#3B82F6'),
            'size' => request()->query('size', $widgetSettings['size'] ?? 'medium'),
            'cardBackground' => request()->query('cardBg', $widgetSettings['cardBackground'] ?? '#FFFFFF'),
            'textColor' => request()->query('textColor', $widgetSettings['textColor'] ?? '#000000'),
            'borderRadius' => request()->query('borderRadius', $widgetSettings['borderRadius'] ?? '8'),
            'padding' => request()->query('padding', $widgetSettings['padding'] ?? '24'),
            'borderColor' => request()->query('borderColor', $widgetSettings['borderColor'] ?? null),
            'inputBackground' => request()->query('inputBg', $widgetSettings['inputBackground'] ?? null),
            'inputBorderColor' => request()->query('inputBorder', $widgetSettings['inputBorderColor'] ?? null),
            'inputTextColor' => request()->query('inputText', $widgetSettings['inputTextColor'] ?? null),
            'buttonBorderRadius' => request()->query('buttonRadius', $widgetSettings['buttonBorderRadius'] ?? null),
            'buttonFontSize' => request()->query('buttonFont', $widgetSettings['buttonFontSize'] ?? null),
            'labelFontSize' => request()->query('labelFont', $widgetSettings['labelFontSize'] ?? null),
            'labelFontWeight' => request()->query('labelWeight', $widgetSettings['labelFontWeight'] ?? null),
            'serviceCardHoverColor' => request()->query('serviceHover', $widgetSettings['serviceCardHoverColor'] ?? null),
            'summaryBackground' => request()->query('summaryBg', $widgetSettings['summaryBackground'] ?? null),
            'fontFamily' => request()->query('fontFamily', $widgetSettings['fontFamily'] ?? null),
            'boxShadow' => request()->query('boxShadow', $widgetSettings['boxShadow'] ?? null),
        ];
        
        return Inertia::render('widget/embed', [
            'slug' => $slug,
            'customization' => $customization,
        ]);
    }
}
