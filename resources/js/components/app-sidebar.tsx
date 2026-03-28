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
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import KeenIcon from './keen-icon';

const DashboardIcon = () => <KeenIcon  name="abstract-26" className="text-base" />;
const CalendarIcon = () => <KeenIcon name="electronic-clock" className="text-base" />;
const AppointmentIcon = () => <KeenIcon name="archive" className="text-base" />;
const BusinessHoursIcon = () => <KeenIcon name="night-day" className="text-base" />;
const AnalyticsIcon = () => <KeenIcon name="ranking" className="text-base" />;
const ServicesIcon = () => <KeenIcon name="menu" className="text-base" />;
const GalleryIcon = () => <KeenIcon name="picture" className="text-base" />;
const TeamIcon = () => <KeenIcon name="people" className="text-base" />;
const WalletIcon = () => <KeenIcon name="receipt-square" className="text-base" />;
const SettingsIcon = () => <KeenIcon name="slider" className="text-base" />;
const IntegrationIcon = () => <KeenIcon name="technology-2" className="text-base" />;
const MarketplaceIcon = () => <KeenIcon name="compass" className="text-base" />;

const mainNavItems: any[] = [
    {
        name: 'Dashboard',
        links: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: DashboardIcon,
            },
        ],
    },
    {
        name: 'Schedule',
        links: [
            {
                title: 'Calender',
                href: schedule.calender.index(),
                icon: CalendarIcon,
            },
            {
                title: 'Appointments',
                href: schedule.appointments.index(),
                icon: AppointmentIcon,
            },
        ],
    },
    {
        name: 'Business',
        links: [
            {
                title: 'Business hours',
                href: business.hours(),
                icon: BusinessHoursIcon,
            },
            {
                title: 'Analytics',
                href: business.analytics(),
                icon: AnalyticsIcon,
                isLocked: false,
            },
            {
                title: 'Services',
                href: business.services(),
                icon: ServicesIcon,
            },
            {
                title: 'Gallery',
                href: business.gallery.index(),
                icon: GalleryIcon,
                isLocked: false,
            },
            {
                title: 'Team Members',
                href: business.team.index(),
                icon: TeamIcon,
                isLocked: false,
            },
            {
                title: 'Wallet',
                href: '/wallet/withdraw',
                icon: WalletIcon,
            },
            {
                title: 'Business Settings',
                href: business.settings(),
                icon: SettingsIcon,
            },
        ],
    },
    {
        name: 'Integration',
        links: [
            {
                title: 'Booking Widget',
                href: business.integration.index(),
                icon: IntegrationIcon,
                isLocked: true,
            },
        ],
    },
];

const footerNavItems: any[] = [
    {
        title: 'Go to marketplace',
        href: '/',
        icon: MarketplaceIcon,
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
