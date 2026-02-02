# Embeddable Booking Widget Implementation

## Overview
This document describes the embeddable booking widget feature that allows providers to embed their booking interface directly into their own websites, similar to how Calendly works.

## Features Implemented

### 1. Database Schema
- Added `widget_enabled` (boolean) to `business_profiles` table
- Added `widget_settings` (JSON) for customization (colors, size, etc.)
- Added `widget_domains` (JSON) for domain whitelisting (optional, for future use)

### 2. API Endpoints

#### Public Endpoints (No Authentication Required)
- `GET /api/widget/{slug}/info` - Get provider info, services, and widget settings
- `GET /api/widget/{slug}/availability` - Get available time slots for selected services and date

#### Authenticated Endpoint
- `POST /api/widget/{slug}/book` - Create appointment booking (requires authentication)

### 3. Widget Components

#### BookingWidget Component
Location: `resources/js/widgets/booking-widget.tsx`

A standalone React component that handles the complete booking flow:
- Service selection
- Date picker
- Time slot selection
- Notes input
- Booking submission

#### Widget Embed Page
Location: `resources/js/pages/widget/embed.tsx`

A full-page component that renders the booking widget and handles iframe resizing for embedded scenarios.

#### Widget Loader Script
Location: `public/js/widget.js`

A vanilla JavaScript loader that can be embedded in any website. It:
- Creates an iframe pointing to the widget embed page
- Handles responsive sizing
- Supports customization via data attributes

### 4. Provider Dashboard Integration

Added a new "Booking Widget" tab in the provider settings page (`resources/js/pages/provider/business/settings.tsx`) that allows providers to:
- Enable/disable the widget
- Customize widget appearance (primary color, size)
- Copy embed code
- Preview the widget

## Usage

### For Providers

1. **Enable Widget**
   - Go to Business Settings → Booking Widget tab
   - Toggle "Enable Widget"
   - Customize appearance (color, size)
   - Copy the embed code

2. **Embed Code Format**
   ```html
   <script src="https://yourdomain.com/js/widget.js" 
           data-slug="your-provider-slug" 
           data-color="#3B82F6" 
           data-size="medium"></script>
   ```

3. **Optional Attributes**
   - `data-color`: Primary color (hex code)
   - `data-size`: Widget size (small, medium, large)
   - `data-width`: Container width (default: 100%)
   - `data-height`: Container height (default: auto)

### For Website Owners

Simply paste the embed code into your HTML where you want the booking widget to appear:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Book an Appointment</h1>
    
    <!-- Widget embed code -->
    <script src="https://yourdomain.com/js/widget.js" 
            data-slug="provider-slug" 
            data-color="#3B82F6" 
            data-size="medium"></script>
</body>
</html>
```

## Technical Details

### Authentication Flow
Currently, the widget requires users to be authenticated to complete bookings. When a user clicks "Book Appointment" without being logged in, they are redirected to the login page. After logging in, they can complete the booking.

**Future Enhancement**: Guest booking with email/phone collection could be added.

### Widget Styling
The widget uses CSS variables and can be customized via:
- Primary color (affects buttons and highlights)
- Size (small, medium, large - affects max-width)
- Inherits some styles from the parent page (if embedded)

### Security Considerations
1. **Widget Enabled Check**: Widget endpoints verify that `widget_enabled` is true
2. **Provider Verification**: Only verified providers can have active widgets
3. **Domain Whitelisting**: `widget_domains` field is available for future domain restriction
4. **CSRF Protection**: Booking endpoint uses Laravel's session-based CSRF protection

## File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── WidgetController.php       # Widget API endpoints
│   │   └── Widget/
│   │       └── WidgetEmbedController.php   # Widget embed page controller
│   └── ...
├── Models/
│   └── BusinessProfile.php                # Updated with widget fields
└── ...

database/
└── migrations/
    └── 2026_02_02_092732_add_widget_fields_to_business_profiles_table.php

public/
└── js/
    └── widget.js                           # Widget loader script

resources/
└── js/
    ├── pages/
    │   ├── provider/
    │   │   └── business/
    │   │       └── settings.tsx            # Updated with widget tab
    │   └── widget/
    │       └── embed.tsx                   # Widget embed page
    └── widgets/
        └── booking-widget.tsx              # Main widget component

routes/
└── web.php                                 # Updated with widget routes
```

## Routes Added

```php
// Widget API (public endpoints)
Route::prefix('api/widget')->name('api.widget.')->group(function () {
    Route::get('/{slug}/info', [WidgetController::class, 'info']);
    Route::get('/{slug}/availability', [WidgetController::class, 'availability']);
    Route::post('/{slug}/book', [WidgetController::class, 'book']);
});

// Widget embed page (public)
Route::get('/widget/{slug}', [WidgetEmbedController::class, 'embed'])->name('widget.embed');
```

## Testing

### Manual Testing Steps

1. **Enable Widget**
   - Login as provider
   - Go to Business Settings → Booking Widget
   - Enable widget and customize settings
   - Copy embed code

2. **Test Embed**
   - Create a simple HTML file with the embed code
   - Open in browser
   - Verify widget loads and displays correctly
   - Test booking flow (requires login)

3. **Test API Endpoints**
   - `GET /api/widget/{slug}/info` - Should return provider data
   - `GET /api/widget/{slug}/availability` - Should return available slots
   - `POST /api/widget/{slug}/book` - Should create appointment (when authenticated)

## Future Enhancements

1. **Guest Booking**: Allow bookings without account creation
2. **Domain Whitelisting**: Restrict widget to specific domains
3. **Custom CSS**: Allow providers to inject custom CSS
4. **Analytics**: Track widget usage and conversion rates
5. **Multi-language**: Support multiple languages in widget
6. **Payment Integration**: Handle payments directly in widget (if guest booking enabled)
7. **Widget Themes**: Pre-built themes for different industries

## Migration

Run the migration to add widget fields:

```bash
php artisan migrate
```

## Notes

- The widget currently requires authentication for booking completion
- Widget styling is responsive and works on mobile devices
- The iframe approach ensures widget isolation from parent page styles
- Widget can be customized via data attributes or provider settings
