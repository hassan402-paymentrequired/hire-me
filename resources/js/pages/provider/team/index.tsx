import KeenIcon from '@/components/keen-icon';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import business from '@/routes/business';
import team from '@/routes/business/team';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface TeamMember {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    role: 'admin' | 'staff';
    is_active: boolean;
    inviter: {
        id: string;
        name: string;
    } | null;
    invited_at: string | null;
    accepted_at: string | null;
    appointments_count: number;
}

interface Stats {
    active: number;
    total: number;
    deactivated: number;
    staffs: number;
    admins: number;
}

interface Props {
    teamMembers: TeamMember[];
    stats: Stats;
    providerInvitationLink: string;
    filters: {
        search?: string;
        role?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: business.dashboard().url,
    },
    {
        title: 'Team Members',
        href: '',
    },
];

export default function TeamIndex({
    teamMembers,
    stats,
    providerInvitationLink,
    filters,
}: Props) {
    const [deletingMember, setDeletingMember] = useState<TeamMember | null>(
        null,
    );
    const [inviteOptionsOpen, setInviteOptionsOpen] = useState(false);
    const [copiedInviteLink, setCopiedInviteLink] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { delete: deleteMethod, processing } = useForm();

    const handleRoleUpdate = (member: TeamMember, newRole: string) => {
        router.put(
            business.team.update({ id: member.id }).url,
            { role: newRole },
            { preserveScroll: true },
        );
    };

    const handleToggleActive = (member: TeamMember) => {
        router.put(
            business.team.update({ id: member.id }).url,
            { is_active: !member.is_active },
            { preserveScroll: true },
        );
    };

    const handleDelete = (member: TeamMember) => {
        deleteMethod(business.team.destroy({ id: member.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingMember(null);
            },
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            router.get(
                team.index().url,
                { ...filters, search: value, role },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 500);
    };

    const handleRoleChange = (nextRole: string) => {
        const normalizedRole = nextRole === 'all' ? '' : nextRole;

        setRole(normalizedRole);
        router.get(
            team.index().url,
            { ...filters, search, role: normalizedRole },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleCopyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(providerInvitationLink);
            setCopiedInviteLink(true);
            window.setTimeout(() => setCopiedInviteLink(false), 2000);
        } catch {
            setCopiedInviteLink(false);
        }
    };

    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const initials = (name: string) =>
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();

    const statusOf = (member: TeamMember) =>
        !member.accepted_at
            ? {
                  label: 'Invited',
                  className:
                      'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
              }
            : member.is_active
              ? {
                    label: 'Active',
                    className:
                        'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
                }
              : {
                    label: 'Deactivated',
                    className: 'bg-muted text-muted-foreground',
                };

    const statCards = [
        { icon: 'people', label: 'Team size', value: stats.total },
        { icon: 'user-tick', label: 'Active', value: stats.active },
        { icon: 'shield-tick', label: 'Admins', value: stats.admins },
        { icon: 'user', label: 'Staff', value: stats.staffs },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Business
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Team members
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Invite people to take bookings under your business.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setInviteOptionsOpen(true)}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        <KeenIcon name="plus" className="text-lg" />
                        Invite member
                    </button>
                </header>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className={`${card} flex items-center gap-3.5 p-[18px]`}
                        >
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                <KeenIcon
                                    name={stat.icon}
                                    className="text-[22px]"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="font-[Sora] text-[22px] font-bold text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invite link banner */}
                <section className="relative flex flex-wrap items-center gap-3.5 overflow-hidden rounded-[20px] bg-[#0E3B2E] px-5 py-[18px] text-white">
                    <img
                        src="/brand/banners/proxideck-banner-general-dark.svg"
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    <div className="relative flex size-11 items-center justify-center rounded-xl bg-[#C8F169] text-[#0E3B2E]">
                        <KeenIcon name="fasten" className="text-[22px]" />
                    </div>
                    <div className="relative flex flex-[1_1_240px] flex-col gap-0.5">
                        <span className="font-[Sora] text-base font-semibold">
                            Invite with a link
                        </span>
                        <span className="text-[13px] text-white/80">
                            Anyone with this link can join your team as staff.
                        </span>
                    </div>
                    <div className="relative flex min-w-0 flex-[0_1_420px] items-center gap-2 rounded-xl bg-white py-1.5 pr-1.5 pl-3.5">
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#13201B]">
                            {providerInvitationLink.replace(/^https?:\/\//, '')}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyInviteLink}
                            className="flex h-9 items-center gap-1.5 rounded-[9px] bg-[#0E3B2E] px-3 text-[13px] font-bold text-white"
                        >
                            <KeenIcon name="copy" className="text-sm" />
                            {copiedInviteLink ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </section>

                {/* Members */}
                <section className={`${card} overflow-hidden`}>
                    <div className="flex flex-wrap items-center gap-3 px-[18px] py-3.5">
                        <div
                            role="tablist"
                            aria-label="Filter by role"
                            className="flex gap-1 rounded-xl bg-muted p-1"
                        >
                            {[
                                { value: '', label: 'All' },
                                { value: 'admin', label: 'Admins' },
                                { value: 'staff', label: 'Staff' },
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    role="tab"
                                    aria-selected={role === option.value}
                                    onClick={() =>
                                        handleRoleChange(option.value || 'all')
                                    }
                                    className={
                                        role === option.value
                                            ? 'h-[38px] rounded-[9px] bg-[#0E3B2E] px-3.5 text-[13px] font-bold text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                            : 'h-[38px] rounded-[9px] px-3.5 text-[13px] font-bold text-muted-foreground hover:text-foreground'
                                    }
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1" />
                        <label className="flex h-10 flex-[0_1_260px] items-center gap-2.5 rounded-[10px] bg-muted px-3 text-muted-foreground">
                            <KeenIcon name="magnifier" className="text-base" />
                            <input
                                type="search"
                                aria-label="Search team"
                                placeholder="Search by name or email…"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                            />
                        </label>
                    </div>

                    <div className="hidden gap-4 border-t border-[#0E3B2E]/[0.07] bg-muted/40 px-[22px] py-2.5 text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase md:flex dark:border-white/10">
                        <span className="flex-[1_1_240px]">Member</span>
                        <span className="w-[90px]">Role</span>
                        <span className="w-[110px]">Status</span>
                        <span className="w-[110px]">Bookings</span>
                        <span className="w-[130px]">Joined</span>
                        <span className="w-10" />
                    </div>

                    {teamMembers.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 border-t border-[#0E3B2E]/[0.07] py-14 text-center dark:border-white/10">
                            <KeenIcon
                                name="people"
                                className="text-3xl text-[#A9C7B8]"
                            />
                            <span className="text-sm font-semibold text-foreground">
                                No team members yet
                            </span>
                            <span className="text-[13px] text-muted-foreground">
                                Share your invite link to add your first
                                teammate.
                            </span>
                        </div>
                    ) : (
                        <ul>
                            {teamMembers.map((member) => {
                                const status = statusOf(member);

                                return (
                                    <li
                                        key={member.id}
                                        className="flex flex-wrap items-center gap-4 border-t border-[#0E3B2E]/[0.07] px-[22px] py-3.5 dark:border-white/10"
                                    >
                                        <div className="flex min-w-0 flex-[1_1_240px] items-center gap-3">
                                            <div
                                                className={
                                                    member.role === 'admin'
                                                        ? 'flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#0E3B2E] text-sm font-bold text-[#C8F169]'
                                                        : 'flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] text-sm font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                }
                                            >
                                                {initials(member.user.name)}
                                            </div>
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <span className="truncate text-[15px] font-bold text-foreground">
                                                    {member.user.name}
                                                </span>
                                                <span className="truncate text-[13px] text-muted-foreground">
                                                    {member.user.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-[90px]">
                                            <span
                                                className={
                                                    member.role === 'admin'
                                                        ? 'rounded-full bg-[#0E3B2E] px-2.5 py-1 text-xs font-bold text-[#C8F169]'
                                                        : 'rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground'
                                                }
                                            >
                                                {member.role === 'admin'
                                                    ? 'Admin'
                                                    : 'Staff'}
                                            </span>
                                        </div>
                                        <div className="w-[110px]">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                        <span className="w-[110px] text-[13px] text-muted-foreground">
                                            <b className="text-foreground">
                                                {member.appointments_count}
                                            </b>{' '}
                                            bookings
                                        </span>
                                        <span className="w-[130px] text-[13px] text-muted-foreground">
                                            {member.accepted_at
                                                ? new Date(
                                                      member.accepted_at,
                                                  ).toLocaleDateString(
                                                      'en-GB',
                                                      {
                                                          month: 'short',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : member.invited_at
                                                  ? `Invited ${new Date(member.invited_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                                  : '—'}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    aria-label={`Actions for ${member.user.name}`}
                                                    disabled={processing}
                                                    className="flex size-10 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-muted-foreground hover:bg-muted dark:border-white/15"
                                                >
                                                    <KeenIcon
                                                        name="dots-horizontal"
                                                        className="text-lg"
                                                    />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRoleUpdate(
                                                            member,
                                                            member.role ===
                                                                'admin'
                                                                ? 'staff'
                                                                : 'admin',
                                                        )
                                                    }
                                                >
                                                    <KeenIcon
                                                        name="shield-tick"
                                                        className="mr-2 text-sm"
                                                    />
                                                    {member.role === 'admin'
                                                        ? 'Make staff'
                                                        : 'Make admin'}
                                                </DropdownMenuItem>
                                                {member.accepted_at && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <KeenIcon
                                                            name={
                                                                member.is_active
                                                                    ? 'cross-circle'
                                                                    : 'check-circle'
                                                            }
                                                            className="mr-2 text-sm"
                                                        />
                                                        {member.is_active
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setDeletingMember(
                                                            member,
                                                        )
                                                    }
                                                    className="text-destructive"
                                                >
                                                    <KeenIcon
                                                        name="trash"
                                                        className="mr-2 text-sm"
                                                    />
                                                    Remove from team
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            {/* Invite options */}
            <Dialog
                open={inviteOptionsOpen}
                onOpenChange={setInviteOptionsOpen}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-[Sora]">
                            Invite a team member
                        </DialogTitle>
                        <DialogDescription>
                            Share a link, or send an invite to their email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 rounded-2xl border border-[#0E3B2E]/10 p-4 dark:border-white/10">
                            <span className="flex items-center gap-2 font-semibold text-foreground">
                                <KeenIcon name="fasten" className="text-base" />
                                Invite by link
                            </span>
                            <span className="text-sm text-muted-foreground">
                                They’ll sign up or log in and join as staff
                                automatically.
                            </span>
                            <span className="rounded-xl bg-muted p-3 text-xs break-all text-foreground">
                                {providerInvitationLink}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 rounded-2xl border border-[#0E3B2E]/10 p-4 dark:border-white/10">
                            <span className="flex items-center gap-2 font-semibold text-foreground">
                                <KeenIcon name="sms" className="text-base" />
                                Invite by email
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Enter their details and we’ll send them an
                                invitation.
                            </span>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyInviteLink}
                        >
                            <KeenIcon name="copy" className="mr-2 text-sm" />
                            {copiedInviteLink ? 'Copied' : 'Copy invite link'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setInviteOptionsOpen(false);
                                router.visit(business.team.create().url);
                            }}
                        >
                            <KeenIcon name="sms" className="mr-2 text-sm" />
                            Invite by email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove confirmation */}
            <AlertDialog
                open={!!deletingMember}
                onOpenChange={(open) => !open && setDeletingMember(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deletingMember?.user.name} will be removed from
                            your team and their appointments reassigned to you.
                            This can’t be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deletingMember && handleDelete(deletingMember)
                            }
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {processing ? 'Removing…' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
