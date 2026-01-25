# Location Permission System

## Overview

This document describes the custom location permission popup system that reminds users to enable location services at configurable intervals.

## Features

- ✅ **Reusable Custom Alert Dialog** - Beautiful popup component matching your design
- ✅ **Automatic Reminders** - Shows popup every 10 minutes (configurable) if location not allowed
- ✅ **Global Context** - Works across the entire application
- ✅ **Callback Support** - Accept/reject callbacks for custom handling
- ✅ **Smart Timing** - Only shows when appropriate, respects user dismissals

## Components

### 1. CustomAlertDialog

A reusable alert dialog component that can be used anywhere in the application.

**Location:** `resources/js/components/ui/custom-alert-dialog.tsx`

**Props:**
- `open` - Whether dialog is open
- `onOpenChange` - Callback when open state changes
- `icon` - ReactNode for icon (optional)
- `title` - Title text
- `description` - Description text
- `acceptLabel` - Label for accept button
- `rejectLabel` - Label for reject button (optional, default: "Cancel")
- `onAccept` - Callback when accept is clicked
- `onReject` - Callback when reject is clicked (optional)
- `acceptVariant` - Button variant for accept (default: "default")
- `rejectVariant` - Button variant for reject (default: "outline")
- `showReject` - Whether to show reject button (default: true)

**Example Usage:**
```tsx
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog'
import { MapPin } from 'lucide-react'

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <CustomAlertDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      icon={<MapPin className="size-12 text-green-500" />}
      title="Enable Location Services"
      description="We need your location to show you nearby service providers."
      acceptLabel="Allow Location"
      rejectLabel="Not Now"
      onAccept={() => {
        // Handle accept
        navigator.geolocation.getCurrentPosition(...)
      }}
      onReject={() => {
        // Handle reject
        console.log('User declined')
      }}
    />
  )
}
```

### 2. useLocationPermission Hook

A hook to manage location permissions with automatic reminders.

**Location:** `resources/js/hooks/use-location-permission.tsx`

**Options:**
- `reminderInterval` - Interval in milliseconds (default: 10 minutes)
- `autoRequest` - Auto request on mount (default: false)
- `onGranted` - Callback when location granted
- `onDenied` - Callback when location denied

**Returns:**
- `status` - Current permission status ('prompt' | 'granted' | 'denied' | 'unavailable')
- `position` - Current geolocation position
- `error` - Any error that occurred
- `hasPermission` - Boolean if permission granted
- `shouldShowReminder` - Boolean if reminder should be shown
- `requestLocation()` - Function to request location
- `checkPermission()` - Function to check current permission
- `isGeolocationAvailable` - Boolean if geolocation is available

**Example Usage:**
```tsx
import { useLocationPermission } from '@/hooks/use-location-permission'

function MyComponent() {
  const {
    status,
    position,
    hasPermission,
    requestLocation,
    shouldShowReminder,
  } = useLocationPermission({
    reminderInterval: 10 * 60 * 1000, // 10 minutes
    onGranted: (pos) => {
      console.log('Location granted:', pos.coords)
    },
    onDenied: (err) => {
      console.log('Location denied:', err.message)
    },
  })

  return (
    <div>
      {hasPermission ? (
        <p>Location: {position?.coords.latitude}, {position?.coords.longitude}</p>
      ) : (
        <button onClick={requestLocation}>Request Location</button>
      )}
    </div>
  )
}
```

### 3. LocationPermissionProvider

A context provider that manages location permissions globally across the app.

**Location:** `resources/js/contexts/location-permission-context.tsx`

**Props:**
- `reminderInterval` - Interval in milliseconds (default: 10 minutes)
- `icon` - Custom icon (optional)
- `title` - Custom title (optional)
- `description` - Custom description (optional)
- `acceptLabel` - Custom accept label (optional)
- `rejectLabel` - Custom reject label (optional)

**Usage:**

The provider is already integrated in `app.tsx`. To use it in components:

```tsx
import { useLocationPermissionContext } from '@/contexts/location-permission-context'

function MyComponent() {
  const {
    hasPermission,
    position,
    requestLocation,
    showReminder,
    dismissReminder,
  } = useLocationPermissionContext()

  return (
    <div>
      {hasPermission ? (
        <p>Location enabled!</p>
      ) : (
        <button onClick={showReminder}>Show Location Prompt</button>
      )}
    </div>
  )
}
```

## How It Works

1. **Initial Check**: On app load, the system checks if location permission is granted
2. **Automatic Reminders**: If not granted, it shows a popup every 10 minutes (configurable)
3. **User Interaction**: 
   - **Accept**: Requests location permission, popup closes if granted
   - **Reject**: Dismisses popup, will show again after interval
4. **Smart Timing**: Respects user dismissals and only shows when appropriate

## Configuration

### Change Reminder Interval

Edit `resources/js/app.tsx`:

```tsx
<LocationPermissionProvider reminderInterval={5 * 60 * 1000}> // 5 minutes
  <App {...props} />
</LocationPermissionProvider>
```

### Customize Dialog Content

Edit `resources/js/app.tsx`:

```tsx
<LocationPermissionProvider
  reminderInterval={10 * 60 * 1000}
  title="We Need Your Location"
  description="Custom description here..."
  acceptLabel="Enable"
  rejectLabel="Maybe Later"
  icon={<YourCustomIcon />}
>
  <App {...props} />
</LocationPermissionProvider>
```

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Some browsers may have different permission APIs. The system handles this gracefully.

## Testing

1. **Test Permission Grant**:
   - Open app
   - Click "Allow Location" in popup
   - Verify location is granted
   - Popup should not appear again

2. **Test Permission Deny**:
   - Open app
   - Click "Not Now" in popup
   - Wait 10 minutes (or change interval for testing)
   - Verify popup appears again

3. **Test Manual Trigger**:
   ```tsx
   const { showReminder } = useLocationPermissionContext()
   // Call showReminder() to manually trigger popup
   ```

## Troubleshooting

### Popup not showing?
- Check browser console for errors
- Verify geolocation is available: `'geolocation' in navigator`
- Check if permission was already granted (check browser settings)

### Reminder not working?
- Verify `reminderInterval` is set correctly
- Check if user dismissed recently (won't show until interval passes)
- Ensure provider is mounted in app

### Location not updating?
- Check browser permissions in settings
- Verify HTTPS (required for geolocation in most browsers)
- Check browser console for permission errors

## Future Enhancements

- [ ] Persist permission state in localStorage
- [ ] Add analytics tracking for permission acceptance rate
- [ ] Support for different reminder strategies (exponential backoff, etc.)
- [ ] Customizable reminder intervals per user preference
