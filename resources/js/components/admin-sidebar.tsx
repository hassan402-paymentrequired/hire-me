import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavSection } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    DollarSign,
    Shield,
    FileText,
    CheckCircle,
    LogOut,
} from 'lucide-react';
import AppLogo from './app-logo';
import { router } from '@inertiajs/react';

const adminNavItems: NavSection[] = [
    {
        name: 'Dashboard',
        links: [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        name: 'Management',
        links: [
            {
                title: 'Users',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Verifications',
                href: '/admin/verifications',
                icon: CheckCircle,
            },
        ],
    },
    {
        name: 'Financial',
        links: [
            {
                title: 'Financial Reports',
                href: '/admin/financial',
                icon: DollarSign,
            },
        ],
    },
    {
        name: 'Moderation',
        links: [
            {
                title: 'Reports',
                href: '/admin/moderation/reports',
                icon: FileText,
            },
            {
                title: 'Reviews',
                href: '/admin/moderation/reviews',
                icon: Shield,
            },
        ],
    },
];

const footerNavItems = [
    {
        title: 'Logout',
        href: '#',
        icon: LogOut,
        onClick: () => {
            router.post('/admin/logout');
        },
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
