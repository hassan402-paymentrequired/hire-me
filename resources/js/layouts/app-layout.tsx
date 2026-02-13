import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import LoadingScreen from '@/components/loading';
import ToastNotification from '@/components/ui/toast-notification';
import { PushNotificationSetup } from '@/components/push-notification-setup';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <PushNotificationSetup />
        {children}
        <LoadingScreen />
        <ToastNotification />
    </AppLayoutTemplate>
);
