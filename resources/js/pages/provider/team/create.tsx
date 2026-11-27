import KeenIcon from '@/components/keen-icon';
import AppLayout from '@/layouts/app-layout';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { TeamInviteEmailForm } from './components/team-invite-email-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: business.dashboard().url,
    },
    {
        title: 'Team Members',
        href: business.team.index().url,
    },
    {
        title: 'Invite by email',
        href: '',
    },
];

const card =
    'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';

export default function TeamCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invite by email" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <Link
                            href={business.team.index().url}
                            className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                        >
                            <KeenIcon name="arrow-left" className="text-sm" />
                            Team members
                        </Link>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Invite by email
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Send a personal invitation to someone on your team.
                        </span>
                    </div>
                </header>

                <section className={`${card} max-w-xl p-6 md:p-7`}>
                    <TeamInviteEmailForm
                        showCancel
                        onCancel={() =>
                            router.visit(business.team.index().url)
                        }
                        onSuccess={() => {
                            router.visit(business.team.index().url);
                        }}
                    />
                </section>
            </div>
        </AppLayout>
    );
}