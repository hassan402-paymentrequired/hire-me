import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useLocationPermission, LocationPermissionStatus, GeolocationPosition } from '@/hooks/use-location-permission'
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog'
import { MapPin } from 'lucide-react'

interface LocationPermissionContextType {
    status: LocationPermissionStatus
    position: GeolocationPosition | null
    hasPermission: boolean
    shouldShowReminder: boolean
    requestLocation: () => Promise<GeolocationPosition>
    checkPermission: () => LocationPermissionStatus
    isGeolocationAvailable: boolean
    /** Manually trigger the reminder dialog */
    showReminder: () => void
    /** Dismiss the reminder (will show again after interval) */
    dismissReminder: () => void
}

const LocationPermissionContext = createContext<LocationPermissionContextType | undefined>(undefined)

interface LocationPermissionProviderProps {
    children: ReactNode
    /** Interval in milliseconds to remind about location (default: 10 minutes) */
    reminderInterval?: number
    /** Custom icon for the dialog */
    icon?: React.ReactNode
    /** Custom title for the dialog */
    title?: string
    /** Custom description for the dialog */
    description?: string
    /** Custom accept button label */
    acceptLabel?: string
    /** Custom reject button label */
    rejectLabel?: string
}

/**
 * Location Permission Provider
 * 
 * Provides location permission management with automatic reminders
 * across the entire application.
 * 
 * @example
 * ```tsx
 * <LocationPermissionProvider reminderInterval={10 * 60 * 1000}>
 *   <App />
 * </LocationPermissionProvider>
 * ```
 */
export function LocationPermissionProvider({
    children,
    reminderInterval = 10 * 60 * 1000, // 10 minutes
    icon,
    title = "Enable Location Services",
    description = "We need your location to show you nearby service providers and give you the best experience. You can change this in your browser settings anytime.",
    acceptLabel = "Allow Location",
    rejectLabel = "Not Now",
}: LocationPermissionProviderProps) {
    const [showDialog, setShowDialog] = useState(false)
    const [lastDismissed, setLastDismissed] = useState<Date | null>(null)

    const {
        status,
        position,
        hasPermission,
        shouldShowReminder: hookShouldShowReminder,
        requestLocation,
        checkPermission,
        isGeolocationAvailable,
    } = useLocationPermission({
        reminderInterval,
        autoRequest: false,
        onGranted: () => {
            setShowDialog(false)
            setLastDismissed(null)
        },
        onDenied: () => {
            // Keep dialog open if denied, user might want to try again
        },
    })

    /**
     * Check if we should show the dialog
     */
    const shouldShowDialog = useCallback((): boolean => {
        // Don't show if already granted
        if (hasPermission) {
            return false
        }

        // Don't show if unavailable
        if (!isGeolocationAvailable) {
            return false
        }

        // Show if manually triggered
        if (showDialog) {
            return true
        }

        // Show if hook says we should remind and enough time has passed since last dismiss
        if (hookShouldShowReminder) {
            if (!lastDismissed) {
                return true
            }
            const timeSinceDismiss = Date.now() - lastDismissed.getTime()
            return timeSinceDismiss >= reminderInterval
        }

        return false
    }, [hasPermission, isGeolocationAvailable, showDialog, hookShouldShowReminder, lastDismissed, reminderInterval])

    /**
     * Show the reminder dialog
     */
    const showReminder = useCallback(() => {
        if (!hasPermission && isGeolocationAvailable) {
            setShowDialog(true)
        }
    }, [hasPermission, isGeolocationAvailable])

    /**
     * Dismiss the reminder (will show again after interval)
     */
    const dismissReminder = useCallback(() => {
        setShowDialog(false)
        setLastDismissed(new Date())
    }, [])

    /**
     * Handle accept - request location
     */
    const handleAccept = useCallback(async () => {
        try {
            await requestLocation()
            setShowDialog(false)
            setLastDismissed(null)
        } catch (error) {
            // Error handled by hook's onDenied callback
            // Dialog stays open so user can try again or dismiss
        }
    }, [requestLocation])

    /**
     * Handle reject - dismiss reminder
     */
    const handleReject = useCallback(() => {
        dismissReminder()
    }, [dismissReminder])

    // Default icon if not provided
    const defaultIcon = (
        <img 
            src="/assets/gifs/location.gif" 
            alt="Location Permission" 
            className="size-16 object-contain" 
        />
    )

    const dialogIcon = icon || defaultIcon

    // Auto-show dialog when conditions are met
    React.useEffect(() => {
        if (shouldShowDialog() && !showDialog) {
            setShowDialog(true)
        }
    }, [shouldShowDialog, showDialog])

    const value: LocationPermissionContextType = {
        status,
        position,
        hasPermission,
        shouldShowReminder: shouldShowDialog(),
        requestLocation,
        checkPermission,
        isGeolocationAvailable,
        showReminder,
        dismissReminder,
    }

    return (
        <LocationPermissionContext.Provider value={value}>
            {children}
            <CustomAlertDialog
                open={showDialog && shouldShowDialog()}
                onOpenChange={setShowDialog}
                icon={dialogIcon}
                title={title}
                description={description}
                acceptLabel={acceptLabel}
                rejectLabel={rejectLabel}
                onAccept={handleAccept}
                onReject={handleReject}
            />
        </LocationPermissionContext.Provider>
    )
}

/**
 * Hook to use location permission context
 * 
 * @example
 * ```tsx
 * const { hasPermission, requestLocation, showReminder } = useLocationPermission()
 * ```
 */
export function useLocationPermissionContext() {
    const context = useContext(LocationPermissionContext)
    if (context === undefined) {
        throw new Error('useLocationPermissionContext must be used within a LocationPermissionProvider')
    }
    return context
}
