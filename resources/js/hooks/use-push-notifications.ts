import { useCallback, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Convert base64url VAPID key to Uint8Array for pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        output[i] = rawData.charCodeAt(i);
    }
    return output;
}

function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Register for Web Push and send subscription to backend so user gets notifications when not in the app.
 */
export function usePushNotifications() {
    const page = usePage();
    const attempted = useRef(false);
    const auth = (page.props as { auth?: { user?: unknown; vapid_public_key?: string } }).auth;
    const user = auth?.user;
    const vapidPublicKey = auth?.vapid_public_key;

    const subscribe = useCallback(async () => {
        if (!vapidPublicKey || !user || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            await reg.update();
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            const endpoint = subscription.endpoint;
            const p256dh = subscription.getKey('p256dh');
            const authKey = subscription.getKey('auth');
            const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

            if (!p256dh || !authKey) return;

            const payload = {
                endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh) as unknown as number[])),
                    auth: btoa(String.fromCharCode.apply(null, new Uint8Array(authKey) as unknown as number[])),
                },
                contentEncoding: contentEncoding,
            };

            const csrf = getCsrfToken();

            await fetch('/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
        } catch {
            // Permission denied, push not supported, or network error – fail silently
        }
    }, [user, vapidPublicKey]);

    useEffect(() => {
        if (!user || !vapidPublicKey || attempted.current) return;
        attempted.current = true;
        subscribe();
    }, [user, vapidPublicKey, subscribe]);
}

