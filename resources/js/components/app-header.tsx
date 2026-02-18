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
import { becomeProvider, home, login } from '@/routes';
import business from '@/routes/business';
import client from '@/routes/client';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarSync, Folder, Heart, Menu } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { NotificationBell } from './notification-bell';

interface NavItem {
    title: string;
    href: string;
    icon?: any;
}

const mainNavItems = (auth?: any): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Marketplace',
            href: home().url,
        },
    ];
    return items;
};

const rightNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
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
                <div className="flex h-12 items-center px-4 ">
                    {/* Mobile Menu */}
                    <div className="hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems(auth).map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={resolveUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={'/'}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems(auth).map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center hover:bg-none"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isSameUrl(
                                                    page.url,
                                                    item.href,
                                                ) && activeItemStyles,
                                                'relative h-9 cursor-pointer px-3',
                                            )}
                                            prefetch
                                        >
                                            {item.title}
                                        </Link>
                                        {/* for now since we have one link it should alway be active */}
                                        {/* {isSameUrl(page.url, item.href) && ( */} 
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        {/* )} */}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        {auth?.user ? (
                            <div className="flex items-center gap-2">
                                {auth.user.has_provider_setup ? (
                                    <Link href={business.dashboard()} prefetch>
                                        <Button
                                            size="sm"
                                            className="rounded-2xl"
                                        >
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="space-x-4">
                                        <Link href={becomeProvider()} prefetch>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="rounded-2xl"
                                            >
                                                Become Provider
                                            </Button>
                                        </Link>
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={client.bookings.index()}
                                                        prefetch
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-full shadow-none"
                                                        >
                                                            <CalendarSync className="size-3" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {auth.user
                                                            .has_provider_setup
                                                            ? 'Dashboard'
                                                            : 'My appointments'}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}

                                {/* Wallet Balance Display */}
                                {auth.user.wallet && (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href="/wallet" prefetch>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-2xl shadow-none"
                                                    >
                                                        <span className="text-xs font-medium">
                                                            ₦
                                                            {auth.user.wallet.available_balance.toLocaleString()}
                                                        </span>
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Wallet Balance (Click to
                                                    view details)
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                size="sm"
                                                onClick={toggleFavoriteSheet}
                                                variant="outline"
                                                className="rounded-full shadow-none"
                                            >
                                                <Heart className="size-3 opacity-80 group-hover:opacity-100" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Favourite services</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <NotificationBell />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="size-10 rounded-full p-1"
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={auth.user.avatar}
                                                    alt={auth.user.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(
                                                        auth.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Link href={login()} prefetch>
                                    <Button size={'sm'} className='rounded'>Get started</Button>
                                </Link>
                            </>
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
