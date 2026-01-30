import { useState, useEffect, useCallback, useRef } from 'react'

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable'

export interface LocationState {
    status: LocationPermissionStatus
    position: GeolocationPosition | null
    error: GeolocationPositionError | null
    lastChecked: Date | null
}

export interface UseLocationPermissionOptions {
    /** Interval in milliseconds to check/remind about location (default: 10 minutes) */
    reminderInterval?: number
    /** Whether to automatically request location on mount */
    autoRequest?: boolean
    /** Callback when location is granted */
    onGranted?: (position: GeolocationPosition) => void
    /** Callback when location is denied */
    onDenied?: (error: GeolocationPositionError) => void
}

/**
 * Hook to manage location permissions with automatic reminders
 * 
 * @example
 * ```tsx
 * const {
 *   status,
 *   position,
 *   requestLocation,
 *   checkPermission,
 *   hasPermission
 * } = useLocationPermission({
 *   reminderInterval: 10 * 60 * 1000, // 10 minutes
 *   onGranted: (pos) => console.log('Location granted', pos),
 *   onDenied: (err) => console.log('Location denied', err),
 * })
 * ```
 */
export function useLocationPermission(options: UseLocationPermissionOptions = {}) {
    const {
        reminderInterval = 10 * 60 * 1000, // 10 minutes default
        autoRequest = false,
        onGranted,
        onDenied,
    } = options

    const [state, setState] = useState<LocationState>({
        status: 'prompt',
        position: null,
        error: null,
        lastChecked: null,
    })
    const [hasCheckedPermission, setHasCheckedPermission] = useState(false)

    const reminderTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastReminderTimeRef = useRef<Date | null>(null)

    /**
     * Check if geolocation is available
     */
    const isGeolocationAvailable = useCallback(() => {
        return 'geolocation' in navigator
    }, [])

    /**
     * Query browser for actual permission status (async)
     */
    const queryPermissionStatus = useCallback((): Promise<LocationPermissionStatus> => {
        if (!isGeolocationAvailable()) {
            return Promise.resolve('unavailable')
        }

        try {
            if ('permissions' in navigator) {
                return navigator.permissions
                    .query({ name: 'geolocation' as PermissionName })
                    .then((result) => {
                        if (result.state === 'granted') return 'granted'
                        if (result.state === 'denied') return 'denied'
                        return 'prompt'
                    })
                    .catch(() => 'prompt')
            }
        } catch {
            // Permissions API not available
        }

        return Promise.resolve('prompt')
    }, [isGeolocationAvailable])

    /**
     * Get current permission status from state (sync)
     */
    const checkPermission = useCallback((): LocationPermissionStatus => {
        return state.status
    }, [state.status])

    /**
     * Request location permission and get position
     */
    const requestLocation = useCallback((): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!isGeolocationAvailable()) {
                const error = {
                    code: 0,
                    message: 'Geolocation is not available in this browser',
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 2,
                    TIMEOUT: 3,
                } as GeolocationPositionError

                setState(prev => ({
                    ...prev,
                    status: 'unavailable',
                    error,
                }))
                onDenied?.(error)
                reject(error)
                return
            }

            const options: PositionOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setState({
                        status: 'granted',
                        position,
                        error: null,
                        lastChecked: new Date(),
                    })
                    lastReminderTimeRef.current = new Date()
                    onGranted?.(position)
                    resolve(position)
                },
                (error) => {
                    const status: LocationPermissionStatus = 
                        error.code === error.PERMISSION_DENIED ? 'denied' : 'prompt'
                    
                    setState(prev => ({
                        ...prev,
                        status,
                        error,
                        lastChecked: new Date(),
                    }))
                    onDenied?.(error)
                    reject(error)
                },
                options
            )
        })
    }, [isGeolocationAvailable, onGranted, onDenied])

    /**
     * Check if user has granted location permission
     */
    const hasPermission = useCallback((): boolean => {
        return state.status === 'granted'
    }, [state.status])

    /**
     * Check if we should show a reminder
     */
    const shouldShowReminder = useCallback((): boolean => {
        // Don't show until we've completed initial permission check
        if (!hasCheckedPermission) {
            return false
        }

        // Don't show if already granted
        if (state.status === 'granted') {
            return false
        }

        // Don't show if unavailable
        if (state.status === 'unavailable') {
            return false
        }

        // Don't show if user denied
        if (state.status === 'denied') {
            return false
        }

        // Show if we haven't checked recently or never checked
        if (!lastReminderTimeRef.current) {
            return true
        }

        const now = new Date()
        const timeSinceLastReminder = now.getTime() - lastReminderTimeRef.current.getTime()

        return timeSinceLastReminder >= reminderInterval
    }, [hasCheckedPermission, state.status, reminderInterval])

    /**
     * Start reminder interval
     */
    const startReminderInterval = useCallback(() => {
        // Clear existing timer
        if (reminderTimerRef.current) {
            clearInterval(reminderTimerRef.current)
        }

        // Only start if permission is not granted
        if (state.status !== 'granted') {
            reminderTimerRef.current = setInterval(() => {
                if (shouldShowReminder()) {
                    // Trigger reminder (this will be handled by the component using this hook)
                    lastReminderTimeRef.current = new Date()
                }
            }, reminderInterval)
        }
    }, [state.status, reminderInterval, shouldShowReminder])

    /**
     * Stop reminder interval
     */
    const stopReminderInterval = useCallback(() => {
        if (reminderTimerRef.current) {
            clearInterval(reminderTimerRef.current)
            reminderTimerRef.current = null
        }
    }, [])

    // Initialize on mount - async check for existing permission
    useEffect(() => {
        if (!isGeolocationAvailable()) {
            setState(prev => ({
                ...prev,
                status: 'unavailable',
            }))
            setHasCheckedPermission(true)
            return
        }

        let cancelled = false

        queryPermissionStatus().then((initialStatus) => {
            if (cancelled) return
            setState(prev => ({
                ...prev,
                status: initialStatus,
            }))
            setHasCheckedPermission(true)

            // Auto request if enabled and permission not yet granted
            if (autoRequest && initialStatus === 'prompt') {
                requestLocation().catch(() => {
                    // Silently handle error, user will be prompted
                })
            }
        })

        // Start reminder interval (will be updated when status resolves)
        startReminderInterval()

        // Cleanup
        return () => {
            cancelled = true
            stopReminderInterval()
        }
    }, []) // Only run on mount

    // Restart interval when status changes
    useEffect(() => {
        if (state.status === 'granted') {
            stopReminderInterval()
        } else {
            startReminderInterval()
        }
    }, [state.status, startReminderInterval, stopReminderInterval])

    return {
        status: state.status,
        position: state.position,
        error: state.error,
        lastChecked: state.lastChecked,
        hasPermission: hasPermission(),
        shouldShowReminder: shouldShowReminder(),
        requestLocation,
        checkPermission,
        isGeolocationAvailable: isGeolocationAvailable(),
    }
}
