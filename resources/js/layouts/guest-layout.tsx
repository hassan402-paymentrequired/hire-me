import { SiteFooter } from '@/components/site/site-footer';
import { SiteNav } from '@/components/site/site-nav';
import ToastNotification from '@/components/ui/toast-notification';
import FavoriteSheet from '@/pages/client/favorite';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
    /** Kept for older pages; the new site navbar has no breadcrumbs. */
    breadcrumbs?: BreadcrumbItem[];
    /** Use "none" when the page renders its own dark navbar inside a hero. */
    nav?: 'light' | 'none';
}

export default function GuestLayout({ children, nav = 'light' }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-white font-heading text-ink">
            {nav === 'light' && <SiteNav />}
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <FavoriteSheet />
            <ToastNotification />
        </div>
    );
}
