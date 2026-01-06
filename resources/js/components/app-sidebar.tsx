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
import { type NavSection } from '@/types'; // Changed NavItem to NavSection based on the new structure
import { Link, usePage } from '@inertiajs/react'; // Added usePage hook
import {
    BookOpen,
    Calendar,
    ChartArea,
    Clock,
    Folder,
    LayoutGrid,
    Notebook,
    Settings,
    Briefcase, // Imported Briefcase icon
    Home, // Imported Home icon
    Search, // Imported Search icon
    Bookmark, // Imported Bookmark icon
} from 'lucide-react';
import AppLogo from './app-logo';
import schedule from '@/routes/schedule';
import business, { dashboard } from '@/routes/business';

const mainNavItems: NavSection[] = [ // Changed type to NavSection[]
    {
        name: "Home",
        links: [
            {
                title: 'Home',
                href: '/',
                icon: Home,
            },
            {
                title: 'Explore',
                href: '/',
                icon: Search,
            },
            {
                title: 'Favorites',
                href: route('favourite.index'),
                icon: Bookmark,
            }
        ]
    },
    {
        name: "Dashboard",
        links: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            }
        ],
    },
    {
        name: "Schedule",
        links: [
            {
                title: 'Calender',
                href: schedule.calender.index(),
                icon: Calendar,
            },
            {
                title: 'Appointments',
                href: schedule.appointments.index(),
                icon: Notebook,
            }
        ]
    },
    {
        name: "Business",
        links: [
            {
                title: 'Business hours',
                href: business.hours(),
                icon: Clock,
            },
            {
                title: 'Analytics',
                href: business.analytics(),
                icon: ChartArea,
            },
            {
                title: 'Services',
                href: business.services(),
                icon: LayoutGrid,
            },
            {
                title: 'Settings',
                href: business.settings(),
                icon: Notebook,
            }
        ]
    }
];

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: Settings,
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
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
