import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import ToastNotification from '@/components/ui/toast-notification';
import FavoriteSheet from '@/pages/client/favorite';
import Footer from '@/layouts/footer';
import { PushNotificationSetup } from '@/components/push-notification-setup';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <FavoriteSheet />
        <ToastNotification />
         <PushNotificationSetup />
        <Footer />
    </AppLayoutTemplate>
);
