import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import LoadingScreen from '@/components/loading';
import ToastNotification from '@/components/ui/toast-notification';

interface AdminLayoutProps {
    children: PropsWithChildren['children'];
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({
    children,
    breadcrumbs = [],
}: AdminLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AdminSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AdminHeader breadcrumbs={breadcrumbs} />
                {children}
                <LoadingScreen />
                <ToastNotification />
            </AppContent>
        </AppShell>
    );
}
