import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import LoadingScreen from '@/components/loading';
import ToastNotification from '@/components/ui/toast-notification';
import BusinessPolicyModal from '@/components/business-policy-modal';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <LoadingScreen />
        <ToastNotification />
        <BusinessPolicyModal />
    </AppLayoutTemplate>
);
