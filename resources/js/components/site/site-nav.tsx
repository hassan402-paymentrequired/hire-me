import BrandLogo from '@/components/brand-logo';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { becomeProvider, contact, home, login, register } from '@/routes';
import business from '@/routes/business';
import client from '@/routes/client';
import explore from '@/routes/explore';
import favourites from '@/routes/favourites';
import wallet from '@/routes/wallet';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, Wallet } from 'lucide-react';

export type SiteNavVariant = 'light' | 'dark';

interface NavLink {
    title: string;
    href: string;
}

export function SiteNav({ variant = 'light' }: { variant?: SiteNavVariant }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const getInitials = useInitials();
    const isDark = variant === 'dark';

    const links: NavLink[] = user
        ? [
              { title: 'Explore', href: explore.index().url },
              { title: 'My bookings', href: client.bookings.index().url },
              { title: 'Favourites', href: favourites.index().url },
          ]
        : [
              { title: 'Explore', href: explore.index().url },
              { title: 'For business', href: becomeProvider().url },
              { title: 'Help', href: contact().url },
          ];

    const textColor = isDark ? 'text-white' : 'text-ink';
    const outline = isDark ? 'border-white/35' : 'border-[#DDE3DE]';

    return (
        <header
            className={cn(
                'relative z-20 w-full font-heading',
                isDark ? 'bg-transparent' : 'border-b border-line bg-white',
            )}
        >
            <div className="mx-auto flex max-w-[1240px] items-center gap-7 px-4 py-4 sm:px-6">
                <Link href={home()} aria-label="Proxideck home" className="shrink-0">
                    <BrandLogo onDark={isDark} />
                </Link>

                <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            prefetch
                            className={cn('rounded-full px-3.5 py-2.5 text-[15px] font-medium hover:opacity-75', textColor)}
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2.5">
                    {user ? (
                        <>
                            {user.can_access_provider_workspace && (
                                <Link
                                    href={business.dashboard()}
                                    className={cn('hidden rounded-full border px-4 py-2.5 text-sm font-semibold md:block', outline, textColor)}
                                >
                                    Business dashboard
                                </Link>
                            )}
                            {user.wallet && (
                                <Link
                                    href={wallet.index()}
                                    className={cn('hidden h-11 items-center gap-2 rounded-full border pr-3.5 pl-1.5 text-[15px] font-bold sm:flex', outline, textColor)}
                                >
                                    <span className="grid size-8 place-items-center rounded-full bg-lime">
                                        <Wallet className="size-4 text-forest" />
                                    </span>
                                    ₦{user.wallet.available_balance.toLocaleString()}
                                </Link>
                            )}
                            <div className={cn('rounded-full', isDark && '[&_button]:text-white')}>
                                <NotificationBell />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className={cn('flex h-11 items-center gap-2 rounded-full border pr-3 pl-1 text-[15px] font-semibold', outline, textColor)}
                                >
                                    <Avatar className="size-9 border-2 border-lime">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-forest text-xs font-bold text-lime">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                                    <ChevronDown className="size-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href={login()}
                                className={cn('rounded-full border px-4.5 py-2.5 text-[15px] font-semibold', outline, textColor)}
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-full bg-lime px-5 py-2.5 text-[15px] font-bold text-forest"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}

                    <Sheet>
                        <SheetTrigger
                            className={cn('grid size-11 place-items-center rounded-full border lg:hidden', outline, textColor)}
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 font-heading">
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            <nav className="mt-10 flex flex-col gap-1 px-4">
                                {links.map((link) => (
                                    <Link key={link.title} href={link.href} className="rounded-xl px-3 py-3 font-semibold text-ink hover:bg-paper">
                                        {link.title}
                                    </Link>
                                ))}
                                {user?.wallet && (
                                    <Link href={wallet.index()} className="rounded-xl px-3 py-3 font-semibold text-ink hover:bg-paper">
                                        Wallet · ₦{user.wallet.available_balance.toLocaleString()}
                                    </Link>
                                )}
                                {!user && (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <Link href={register()} className="rounded-full bg-forest py-3 text-center font-bold text-white">
                                            Sign up
                                        </Link>
                                        <Link href={login()} className="rounded-full border border-line py-3 text-center font-semibold text-ink">
                                            Log in
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
