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
import { Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    CreditCard,
    DollarSign,
    FileText,
    LayoutGrid,
    LifeBuoy,
    LogOut,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

const baseAdminNavItems: NavSection[] = [
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
    {
        name: 'Support',
        links: [
            {
                title: 'Support Requests',
                href: '/admin/support',
                icon: LifeBuoy,
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
    const { features } = usePage<SharedData>().props;
    const adminNavItems: NavSection[] = features?.subscriptions
        ? baseAdminNavItems.map((section) =>
              section.name === 'Financial'
                  ? {
                        ...section,
                        links: [
                            ...section.links,
                            {
                                title: 'Subscription Plans',
                                href: '/admin/subscriptions',
                                icon: CreditCard,
                            },
                        ],
                    }
                  : section,
          )
        : baseAdminNavItems;

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
