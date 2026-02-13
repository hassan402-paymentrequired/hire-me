import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import ToastNotification from '@/components/ui/toast-notification';
import FavoriteSheet from '@/pages/client/favorite';
import { PushNotificationSetup } from '@/components/push-notification-setup';

interface ClientLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: ClientLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <PushNotificationSetup />
        {children}
        <FavoriteSheet />
        <ToastNotification />
    </AppLayoutTemplate>
);
