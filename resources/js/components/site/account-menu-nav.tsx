import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { becomeProvider, contact, logout } from '@/routes';
import business from '@/routes/business';
import client from '@/routes/client';
import favourites from '@/routes/favourites';
import { edit as editProfile } from '@/routes/profile';
import wallet from '@/routes/wallet';
import { type SharedData, type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    CalendarDays,
    CircleHelp,
    CreditCard,
    Heart,
    LogOut,
    UserRound,
    Wallet,
    type LucideIcon,
} from 'lucide-react';

export type AccountSection = 'bookings' | 'wallet' | 'favourites' | 'settings';

export const accountDropdownPanelClass =
    'w-[280px] overflow-hidden rounded-3xl border border-line bg-white p-4 font-heading text-ink shadow-[0_24px_60px_rgba(19,32,27,0.16)]';

const primaryItems: {
    key: AccountSection;
    label: string;
    href: string;
    icon: LucideIcon;
}[] = [
    {
        key: 'bookings',
        label: 'My bookings',
        href: client.bookings.index().url,
        icon: CalendarDays,
    },
    {
        key: 'wallet',
        label: 'Wallet',
        href: wallet.index().url,
        icon: Wallet,
    },
    {
        key: 'favourites',
        label: 'Favourite pros',
        href: favourites.index().url,
        icon: Heart,
    },
    {
        key: 'settings',
        label: 'Account settings',
        href: editProfile().url,
        icon: UserRound,
    },
];

export function resolveAccountSection(url: string): AccountSection | null {
    if (
        url.startsWith('/my-bookings') ||
        url.startsWith('/bookings') ||
        url.includes('/client/bookings')
    ) {
        return 'bookings';
    }

    if (url.startsWith('/wallet')) {
        return 'wallet';
    }

    if (url.startsWith('/favourites')) {
        return 'favourites';
    }

    if (url.startsWith('/settings') || url.startsWith('/user/profile')) {
        return 'settings';
    }

    return null;
}

export function menuLinkClass(isActive: boolean): string {
    return cn(
        'flex h-12 w-full items-center gap-3 rounded-2xl px-3.5 text-left text-[15px] font-semibold transition-colors',
        isActive ? 'bg-forest text-white' : 'text-ink hover:bg-paper',
    );
}

interface AccountMenuNavProps {
    user: User;
    active?: AccountSection | null;
    onNavigate?: () => void;
    showHelp?: boolean;
    showProviderLinks?: boolean;
    className?: string;
}

export function AccountMenuNav({
    user,
    active = null,
    onNavigate,
    showHelp = true,
    showProviderLinks = true,
    className,
}: AccountMenuNavProps) {
    const { features } = usePage<SharedData>().props;
    const shouldShowBilling =
        Boolean(features?.subscriptions) &&
        Boolean(user.has_provider_setup) &&
        user.business_profile?.settings?.billing_model === 'subscription';

    return (
        <nav
            aria-label="Account"
            className={cn('flex flex-col gap-5', className)}
        >
            <AccountMenuIdentity user={user} />

            <div className="flex flex-col gap-1">
                {primaryItems.map(({ key, label, href, icon: Icon }) => {
                    if (key === 'wallet' && !user.wallet) {
                        return null;
                    }

                    const isActive = active === key;

                    return (
                        <Link
                            key={key}
                            href={href}
                            prefetch
                            onClick={onNavigate}
                            className={menuLinkClass(isActive)}
                        >
                            <Icon
                                className={cn(
                                    'size-5 shrink-0',
                                    isActive ? 'text-lime' : 'text-moss',
                                )}
                            />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}

                {showProviderLinks && user.can_access_provider_workspace && (
                    <Link
                        href={business.dashboard()}
                        prefetch
                        onClick={onNavigate}
                        className={menuLinkClass(false)}
                    >
                        <Briefcase className="size-5 shrink-0 text-moss" />
                        <span className="truncate">Business dashboard</span>
                    </Link>
                )}

                {showProviderLinks && !user.can_access_provider_workspace && (
                    <Link
                        href={becomeProvider()}
                        prefetch
                        onClick={onNavigate}
                        className={menuLinkClass(false)}
                    >
                        <Briefcase className="size-5 shrink-0 text-moss" />
                        <span className="truncate">Become a provider</span>
                    </Link>
                )}

                {showProviderLinks && shouldShowBilling && (
                    <Link
                        href="/business/billing"
                        prefetch
                        onClick={onNavigate}
                        className={menuLinkClass(false)}
                    >
                        <CreditCard className="size-5 shrink-0 text-moss" />
                        <span className="truncate">Billing</span>
                    </Link>
                )}
            </div>

            <AccountMenuFooter onNavigate={onNavigate} showHelp={showHelp} />
        </nav>
    );
}

export function AccountMenuIdentity({
    user,
    subtitle,
}: {
    user: User;
    subtitle?: string | null;
}) {
    const getInitials = useInitials();
    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
          })
        : null;
    const caption =
        subtitle ?? (memberSince ? `Member since ${memberSince}` : null);

    return (
        <div className="flex items-center gap-3 px-1 pt-0.5">
            <Avatar className="size-13 shrink-0">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-lime text-lg font-bold text-forest">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <div className="truncate text-[17px] font-bold">
                    {user.name}
                </div>
                {caption && (
                    <div className="truncate text-[13px] text-moss">
                        {caption}
                    </div>
                )}
            </div>
        </div>
    );
}

export function AccountMenuFooter({
    onNavigate,
    showHelp = true,
}: {
    onNavigate?: () => void;
    showHelp?: boolean;
}) {
    const handleLogout = () => {
        onNavigate?.();
        router.flushAll();
    };

    return (
        <div className="flex flex-col gap-1 border-t border-line pt-4">
            {showHelp && (
                <Link
                    href={contact()}
                    prefetch
                    onClick={onNavigate}
                    className="flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[15px] font-semibold text-moss hover:bg-paper"
                >
                    <CircleHelp className="size-5 shrink-0" />
                    Help &amp; support
                </Link>
            )}
            <Link
                href={logout()}
                as="button"
                onClick={handleLogout}
                data-test="logout-button"
                className="flex h-11 w-full items-center gap-3 rounded-2xl px-3.5 text-left text-[15px] font-semibold text-[#B42318] hover:bg-[#FFF8F7]"
            >
                <LogOut className="size-5 shrink-0" />
                Log out
            </Link>
        </div>
    );
}
