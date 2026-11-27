import { AccountMenu, type AccountSection } from '@/components/site/account-menu';
import GuestLayout from '@/layouts/guest-layout';
import { type ReactNode } from 'react';

interface AccountLayoutProps {
    active: AccountSection;
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function AccountLayout({ active, title, description, actions, children }: AccountLayoutProps) {
    return (
        <GuestLayout>
            <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 pt-10 pb-24 sm:px-6 lg:flex-row lg:gap-12">
                <aside className="lg:w-[260px] lg:shrink-0">
                    <AccountMenu active={active} />
                </aside>

                <section className="flex min-w-0 flex-1 flex-col gap-7">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-[40px] leading-tight font-bold tracking-tight">{title}</h1>
                            {description && <p className="mt-1.5 text-base text-moss">{description}</p>}
                        </div>
                        {actions}
                    </div>
                    {children}
                </section>
            </div>
        </GuestLayout>
    );
}
