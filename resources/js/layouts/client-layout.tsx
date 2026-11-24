import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface ClientLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/** Signed-in client pages share the public site shell (navbar adapts to auth). */
export default function ClientLayout({ children }: ClientLayoutProps) {
    return <GuestLayout>{children}</GuestLayout>;
}
