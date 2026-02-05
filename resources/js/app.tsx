import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { LoadingProvider } from '@/contexts/loading-context';
import { LocationPermissionProvider } from '@/contexts/location-permission-context';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <LoadingProvider>
                    <LocationPermissionProvider reminderInterval={10 * 60 * 1000}>
                        <App {...props} />
                        <Toaster position="top-right" richColors closeButton />
                    </LocationPermissionProvider>
                </LoadingProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
// initializeTheme();
