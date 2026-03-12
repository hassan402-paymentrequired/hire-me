/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import business, { dashboard } from '@/routes/business';
import schedule from '@/routes/schedule';
import {
    ArchiveBoxIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    FireIcon,
    PuzzlePieceIcon,
    RectangleStackIcon,
    UserGroupIcon,
    WalletIcon,
} from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { ChartArea, Folder, Images } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: any[] = [
    {
        name: 'Dashboard',
        links: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: ChartBarIcon,
            },
        ],
    },
    {
        name: 'Schedule',
        links: [
            {
                title: 'Calender',
                href: schedule.calender.index(),
                icon: CalendarDaysIcon,
            },
            {
                title: 'Appointments',
                href: schedule.appointments.index(),
                icon: ArchiveBoxIcon,
            },
        ],
    },
    {
        name: 'Business',
        links: [
            {
                title: 'Business hours',
                href: business.hours(),
                icon: FireIcon,
            },
            {
                title: 'Analytics',
                href: business.analytics(),
                icon: ChartArea,
                isLocked: false,
            },
            {
                title: 'Services',
                href: business.services(),
                icon: RectangleStackIcon,
            },
            {
                title: 'Gallery',
                href: business.gallery.index(),
                icon: Images,
                isLocked: false,
            },
            {
                title: 'Team Members',
                href: business.team.index(),
                icon: UserGroupIcon,
                isLocked: false,
            },
            {
                title: 'Wallet',
                href: '/wallet/withdraw',
                icon: WalletIcon,
            },
            {
                title: 'Settings',
                href: business.settings(),
                icon: Cog6ToothIcon,
            },
        ],
    },
    {
        name: 'Integration',
        links: [
            {
                title: 'Booking Widget',
                href: business.integration.index(),
                icon: PuzzlePieceIcon,
                isLocked: true,
            },
            {
                title: 'Google Calendar',
                href: business.integration.index(),
                icon: PuzzlePieceIcon,
                isLocked: true,
            },
        ],
    },
];

const footerNavItems: any[] = [
    {
        title: 'Go to marketplace',
        href: '/',
        icon: Folder,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
