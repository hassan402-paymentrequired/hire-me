import { usePushNotifications } from '@/hooks/use-push-notifications';

interface PushNotificationSetupProps {
    auth?: {
        user?: unknown;
        vapid_public_key?: string;
    };
}

/**
 * Renders nothing. When mounted with an authenticated user and VAPID key,
 * registers for Web Push and sends the subscription to the backend so the user
 * receives notifications when not in the app.
 */
export function PushNotificationSetup({ auth }: PushNotificationSetupProps) {
    usePushNotifications(auth);
    return null;
}
