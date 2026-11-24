import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { contact, logout } from '@/routes';
import client from '@/routes/client';
import favourites from '@/routes/favourites';
import { edit as editProfile } from '@/routes/profile';
import wallet from '@/routes/wallet';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, CircleHelp, Heart, LogOut, UserRound, Wallet, type LucideIcon } from 'lucide-react';

export type AccountSection = 'bookings' | 'wallet' | 'favourites' | 'settings';

const items: { key: AccountSection; label: string; href: string; icon: LucideIcon }[] = [
    { key: 'bookings', label: 'My bookings', href: client.bookings.index().url, icon: CalendarDays },
    { key: 'wallet', label: 'Wallet', href: wallet.index().url, icon: Wallet },
    { key: 'favourites', label: 'Favourite pros', href: favourites.index().url, icon: Heart },
    { key: 'settings', label: 'Account settings', href: editProfile().url, icon: UserRound },
];

export function AccountMenu({ active }: { active: AccountSection }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const user = auth.user;

    return (
        <nav aria-label="Account" className="flex flex-col gap-5 font-heading text-ink">
            <div className="flex items-center gap-3 px-1">
                <Avatar className="size-13">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-lime text-lg font-bold text-forest">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate text-[17px] font-bold">{user.name}</div>
                    <div className="text-[13px] text-moss">
                        Member since {new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto lg:flex-col">
                {items.map(({ key, label, href, icon: Icon }) => (
                    <Link
                        key={key}
                        href={href}
                        prefetch
                        className={cn(
                            'flex h-12 shrink-0 items-center gap-3 rounded-2xl px-3.5 text-[15px] font-semibold',
                            key === active ? 'bg-forest text-white' : 'hover:bg-paper',
                        )}
                    >
                        <Icon className={cn('size-5', key === active ? 'text-lime' : 'text-moss')} />
                        {label}
                    </Link>
                ))}
            </div>

            <div className="hidden flex-col gap-1 border-t border-line pt-4 lg:flex">
                <Link href={contact()} className="flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[15px] text-moss hover:bg-paper">
                    <CircleHelp className="size-5" /> Help &amp; support
                </Link>
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    className="flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[15px] text-[#B42318] hover:bg-[#FFF8F7]"
                >
                    <LogOut className="size-5" /> Log out
                </Link>
            </div>
        </nav>
    );
}
