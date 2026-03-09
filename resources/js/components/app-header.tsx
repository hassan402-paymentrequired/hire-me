/* eslint-disable @typescript-eslint/no-explicit-any */
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useLoading } from '@/contexts/loading-context';
import { useInitials } from '@/hooks/use-initials';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { becomeProvider, home, login, register } from '@/routes';
import business from '@/routes/business';
import client from '@/routes/client';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarSync, Folder, Heart, Menu, Wallet, Store } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { NotificationBell } from './notification-bell';

interface NavItem {
    title: string;
    href: string;
    icon?: any;
}

const mainNavItems = (auth?: any): NavItem[] => [
    { title: 'Marketplace', href: home().url },
];

const activeItemStyles = '';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { toggleFavoriteSheet } = useLoading();

    return (
        <>
            <div className="fixed top-0 right-0 left-0 z-30 border-b border-sidebar-border/80 bg-background">
                <div className="flex h-12 items-center px-3 sm:px-4 gap-2">

                    {/* ── Mobile hamburger (visible on < lg) ── */}
                    <div className="flex lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-72 flex-col bg-sidebar p-0">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex items-start p-4 pb-2">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>

                                <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4 text-sm">
                                    {/* Top nav links */}
                                    <div className="flex flex-col space-y-1">
                                        {mainNavItems(auth).map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted"
                                            >
                                                {item.icon && <Icon iconNode={item.icon} className="h-4 w-4" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        ))}

                                        {/* Auth-specific mobile links */}
                                        {auth?.user && (
                                            <>
                                                <div className="my-2 border-t" />
                                                {auth.user.can_access_provider_workspace ? (
                                                    <Link
                                                        href={business.dashboard()}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted"
                                                    >
                                                        <Store className="h-4 w-4" />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={becomeProvider()}
                                                            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted"
                                                        >
                                                            <Store className="h-4 w-4" />
                                                            <span>Become a Provider</span>
                                                        </Link>
                                                        <Link
                                                            href={client.bookings.index()}
                                                            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted"
                                                        >
                                                            <CalendarSync className="h-4 w-4" />
                                                            <span>My Appointments</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {auth.user.wallet && (
                                                    <Link
                                                        href="/wallet"
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted"
                                                    >
                                                        <Wallet className="h-4 w-4" />
                                                        <span>
                                                            Wallet —{' '}
                                                            <span className="font-bold">
                                                                ₦{auth.user.wallet.balance.toLocaleString()}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={toggleFavoriteSheet}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-muted w-full text-left"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    <span>Favourites</span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Bottom: sign in / sign up for guests */}
                                    {!auth?.user && (
                                        <div className="flex flex-col gap-2 pt-4 border-t">
                                            <Link href={register()}>
                                                <Button size="sm" className="w-full rounded-full">Get started</Button>
                                            </Link>
                                            <Link href={login()}>
                                                <Button size="sm" variant="outline" className="w-full rounded-full">Sign in</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* ── Logo ── */}
                    <Link href="/" prefetch className="flex items-center space-x-2 shrink-0">
                        <AppLogo />
                    </Link>

                    {/* ── Desktop nav links ── */}
                    <div className="ml-4 hidden h-full items-center lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems(auth).map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isSameUrl(page.url, item.href) && activeItemStyles,
                                                'relative h-9 cursor-pointer px-3',
                                            )}
                                            prefetch
                                        >
                                            {item.title}
                                        </Link>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* ── Right side actions ── */}
                    <div className="ml-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
                        {auth?.user ? (
                            <>
                                {/* Desktop-only: Become Provider / Dashboard */}
                                <div className="hidden sm:flex items-center gap-2">
                                    {auth.user.can_access_provider_workspace ? (
                                        <Link href={business.dashboard()} prefetch>
                                            <Button size="sm" className="rounded-2xl">
                                                Dashboard
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={becomeProvider()} prefetch className="hidden md:block">
                                                <Button size="sm" variant="default" className="rounded-2xl">
                                                    Become Provider
                                                </Button>
                                            </Link>
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={client.bookings.index()} prefetch>
                                                            <Button size="sm" variant="outline" className="rounded-full shadow-none">
                                                                <CalendarSync className="size-3.5" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>My appointments</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </>
                                    )}
                                </div>

                                {/* Wallet — hidden on mobile */}
                                {auth.user.wallet && (
                                    <div className="hidden sm:block">
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/wallet" prefetch>
                                                        <Button size="sm" variant="outline" className="rounded-2xl shadow-none">
                                                            <span className="text-xs font-medium">
                                                                ₦{auth.user.wallet.balance.toLocaleString()}
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Wallet Balance</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}

                                {/* Favourites — hidden on mobile (accessible via sheet) */}
                                <div className="hidden sm:block">
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={toggleFavoriteSheet}
                                                    variant="outline"
                                                    className="rounded-full shadow-none"
                                                >
                                                    <Heart className="size-3.5 opacity-80" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Favourite services</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* Notifications — always visible */}
                                <NotificationBell />

                                {/* Avatar dropdown — always visible */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="size-8 sm:size-10 rounded-full p-0.5 sm:p-1">
                                            <Avatar className="size-7 sm:size-8 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-xs">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            /* Guest — show buttons on desktop, hidden on mobile (use hamburger) */
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href={register()} prefetch>
                                    <Button size="sm" className="rounded-full">Get started</Button>
                                </Link>
                                <Link href={login()} prefetch>
                                    <Button size="sm" variant="outline" className="rounded-full">Sign in</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="mt-12 flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
