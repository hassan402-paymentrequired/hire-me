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
import KeenIcon from '@/components/keen-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import business from '@/routes/business';
import team from '@/routes/business/team';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Copy, Edit2, Mail, Plus, Search, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

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
        search?: string,
        role?: string
    }
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
    const [roleUpdateForm, setRoleUpdateForm] = useState<{
        id: string;
        role: string;
    } | null>(null);
    const [inviteOptionsOpen, setInviteOptionsOpen] = useState(false);
    const [copiedInviteLink, setCopiedInviteLink] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { put, delete: deleteMethod, processing } = useForm();

    const handleRoleUpdate = (member: TeamMember, newRole: string) => {
        put(business.team.update({ id: member.id }).url, {
            data: { role: newRole },
            preserveScroll: true,
            onSuccess: () => {
                setRoleUpdateForm(null);
            },
        });
    };

    const handleToggleActive = (member: TeamMember) => {
        put(business.team.update({ id: member.id }).url, {
            data: { is_active: !member.is_active },
            preserveScroll: true,
        });
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
        } catch (_error) {
            setCopiedInviteLink(false);
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />
            <div className="space-y-6 p-4 font-heading">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative space-y-5 px-6 py-6 lg:px-8 lg:py-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
                                    <KeenIcon name="people" className="text-sm text-sky-600 dark:text-sky-300" />
                                    Team workspace
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                    {stats.total} members in your workspace
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                        Team Members
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                        Manage who helps run the business, adjust access levels, and keep invitations moving without leaving this page.
                                    </p>
                                </div>
                                <Button onClick={() => setInviteOptionsOpen(true)} className="rounded-full px-5">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Team Member
                                </Button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="people" className="text-sm text-sky-600 dark:text-sky-300" />
                                        Team size
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">{stats.total}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {stats.active ?? 0} active, {stats.deactivated ?? 0} inactive
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="verify" className="text-sm text-emerald-600 dark:text-emerald-300" />
                                        Admin coverage
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">{stats.admins ?? 0}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        full access members
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="profile-user" className="text-sm text-violet-600 dark:text-violet-300" />
                                        Staff capacity
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">{stats.staffs ?? 0}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        support members with limited access
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Dialog
                    open={inviteOptionsOpen}
                    onOpenChange={setInviteOptionsOpen}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>
                                Choose how you want to invite the next member of
                                your team.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    <h3 className="font-semibold">
                                        Invite by link
                                    </h3>
                                </div>
                                <p className="mb-3 text-sm text-muted-foreground">
                                    Copy a secure invite link and send it to any
                                    staff member. They will register or log in
                                    and be added as staff automatically.
                                </p>
                                <div className="rounded border bg-muted/30 p-3 text-xs break-all">
                                    {providerInvitationLink}
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <h3 className="font-semibold">
                                        Manual invite
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Enter the person's details yourself and send
                                    a direct invitation from the existing manual
                                    flow.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCopyInviteLink}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {copiedInviteLink ? 'Copied' : 'Copy Invite Link'}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setInviteOptionsOpen(false);
                                    router.visit(business.team.create().url);
                                }}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Manual Invite
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card className="overflow-hidden rounded-3xl border border-border/70">
                    <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                                        <KeenIcon name="people" className="text-base" />
                                    </span>
                                    Team Directory
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Search team members, filter by role, and manage access without opening a separate page.
                                </CardDescription>
                            </div>

                            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                    placeholder="Search team member..."
                                    className="rounded-full pl-9"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                </div>
                                <div className="w-full md:w-48">
                                    <Select
                                        value={role || 'all'}
                                        onValueChange={handleRoleChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All roles
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="staff">
                                                Staff
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-5">
                        {teamMembers.length === 0 ? (
                            <div className="rounded-2xl border border-border/70 py-14 text-center text-muted-foreground">
                                <KeenIcon name="people" className="mx-auto mb-4 text-4xl opacity-50" />
                                <p>No team members yet.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 rounded-full"
                                    onClick={() =>
                                        router.visit(business.team.create().url)
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Team Member
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-5 transition-colors hover:bg-muted/20"
                                    >
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/20 text-primary">
                                                        <KeenIcon
                                                            name={member.role === 'admin' ? 'verify' : 'profile-user'}
                                                            className="text-lg"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="max-w-[220px] truncate text-base font-semibold capitalize sm:max-w-[320px]">
                                                                {member.user.name}
                                                            </h3>
                                                            {!member.accepted_at ? (
                                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                                    Invitation pending
                                                                </span>
                                                            ) : member.is_active ? (
                                                                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            <span className="truncate">{member.user.email}</span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            {roleUpdateForm?.id === member.id ? (
                                                                <Select
                                                                    value={roleUpdateForm.role}
                                                                    onValueChange={(value) => {
                                                                        handleRoleUpdate(member, value);
                                                                    }}
                                                                    onOpenChange={(open) => {
                                                                        if (!open && roleUpdateForm.id === member.id) {
                                                                            setRoleUpdateForm(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="w-36 rounded-full">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="admin">
                                                                            Admin
                                                                        </SelectItem>
                                                                        <SelectItem value="staff">
                                                                            Staff
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRoleUpdateForm({
                                                                            id: member.id,
                                                                            role: member.role,
                                                                        })
                                                                    }
                                                                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80"
                                                                >
                                                                    <KeenIcon
                                                                        name={member.role === 'admin' ? 'verify' : 'profile-user'}
                                                                        className="text-sm text-muted-foreground"
                                                                    />
                                                                    {member.role}
                                                                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                </button>
                                                            )}

                                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                {member.appointments_count} appointments
                                                            </span>

                                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                                <KeenIcon name="electronic-clock" className="text-sm text-muted-foreground" />
                                                                {member.accepted_at
                                                                    ? `Joined ${new Date(member.accepted_at).toLocaleDateString()}`
                                                                    : member.invited_at
                                                                      ? `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                                                                      : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-2 xl:ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(member)}
                                                    className="rounded-full"
                                                >
                                                    {member.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingMember(member)}
                                                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={!!deletingMember}
                    onOpenChange={(open) => !open && setDeletingMember(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Remove Team Member?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove{' '}
                                {deletingMember?.user.name} from your team? This
                                will reassign their appointments to you. This
                                action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() =>
                                    deletingMember &&
                                    handleDelete(deletingMember)
                                }
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {processing ? 'Removing...' : 'Remove'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
