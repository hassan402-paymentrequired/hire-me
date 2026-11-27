import {
    AccountMenuFooter,
    AccountMenuIdentity,
    menuLinkClass,
} from '@/components/site/account-menu-nav';
import { cn } from '@/lib/utils';
import business from '@/routes/business';
import account from '@/routes/business/account';
import client from '@/routes/client';
import { type SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    CreditCard,
    ExternalLink,
    Settings2,
    ShieldCheck,
    type LucideIcon,
} from 'lucide-react';

type ProviderMenuSection = 'business-settings' | 'account' | 'billing';

interface ProviderMenuItem {
    key: ProviderMenuSection | 'public-page' | 'switch';
    label: string;
    href: string;
    icon: LucideIcon;
    external?: boolean;
}

function resolveProviderMenuSection(url: string): ProviderMenuSection | null {
    if (url.startsWith('/business/account')) {
        return 'account';
    }

    if (url.startsWith('/business/settings')) {
        return 'business-settings';
    }

    if (url.startsWith('/business/billing')) {
        return 'billing';
    }

    return null;
}

interface ProviderMenuNavProps {
    user: User;
    onNavigate?: () => void;
}

/**
 * Account dropdown for the provider workspace. Keeps business and personal
 * account settings inside the dashboard, with a single way back to the
 * client side.
 */
export function ProviderMenuNav({ user, onNavigate }: ProviderMenuNavProps) {
    const { url, props } = usePage<SharedData>();
    const active = resolveProviderMenuSection(url);
    const businessName =
        typeof user.business_profile?.business_name === 'string'
            ? user.business_profile.business_name
            : null;
    const businessSlug =
        typeof user.business_profile?.slug === 'string'
            ? user.business_profile.slug
            : null;
    const shouldShowBilling =
        Boolean(props.features?.subscriptions) &&
        user.business_profile?.settings?.billing_model === 'subscription';

    const items: ProviderMenuItem[] = [
        {
            key: 'business-settings',
            label: 'Business settings',
            href: business.settings().url,
            icon: Settings2,
        },
        {
            key: 'account',
            label: 'Account & security',
            href: account.profile().url,
            icon: ShieldCheck,
        },
        ...(shouldShowBilling
            ? [
                  {
                      key: 'billing' as const,
                      label: 'Billing',
                      href: business.billing().url,
                      icon: CreditCard,
                  },
              ]
            : []),
        ...(businessSlug
            ? [
                  {
                      key: 'public-page' as const,
                      label: 'View public page',
                      href: `/provider/${businessSlug}`,
                      icon: ExternalLink,
                      external: true,
                  },
              ]
            : []),
    ];

    return (
        <nav aria-label="Business account" className="flex flex-col gap-5">
            <AccountMenuIdentity
                user={user}
                subtitle={businessName ?? 'Business account'}
            />

            <div className="flex flex-col gap-1">
                {items.map(({ key, label, href, icon: Icon, external }) => {
                    const isActive = active === key;
                    const iconClass = cn(
                        'size-5 shrink-0',
                        isActive ? 'text-lime' : 'text-moss',
                    );

                    if (external) {
                        return (
                            <a
                                key={key}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={onNavigate}
                                className={menuLinkClass(false)}
                            >
                                <Icon className={iconClass} />
                                <span className="truncate">{label}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={key}
                            href={href}
                            prefetch
                            onClick={onNavigate}
                            className={menuLinkClass(isActive)}
                        >
                            <Icon className={iconClass} />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </div>

            <Link
                href={client.bookings.index().url}
                prefetch
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-3.5 py-3 text-left transition-colors hover:border-forest/30"
            >
                <ArrowLeftRight className="size-5 shrink-0 text-forest" />
                <span className="min-w-0">
                    <span className="block text-[15px] font-semibold">
                        Switch to client
                    </span>
                    <span className="block truncate text-[13px] text-moss">
                        Your bookings, wallet and favourites
                    </span>
                </span>
            </Link>

            <AccountMenuFooter onNavigate={onNavigate} showHelp={false} />
        </nav>
    );
}
