import { AppHeader } from '@/components/admin-app-header';
import { type BreadcrumbItem } from '@/types';

interface AdminHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AdminHeader({ breadcrumbs = [] }: AdminHeaderProps) {
    const adminBreadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/dashboard',
        },
        ...breadcrumbs,
    ];

    return <AppHeader breadcrumbs={adminBreadcrumbs} />;
}
