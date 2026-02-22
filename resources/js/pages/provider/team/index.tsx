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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import business from '@/routes/business';
import team from '@/routes/business/team';
import { BreadcrumbItem } from '@/types';
import {
    ShieldCheckIcon,
    UserIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Edit2, Mail, Plus, Search, Trash2 } from 'lucide-react';
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
    invited_by: {
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

export default function TeamIndex({ teamMembers, stats, filters }: Props) {
    const [deletingMember, setDeletingMember] = useState<TeamMember | null>(
        null,
    );
    const [roleUpdateForm, setRoleUpdateForm] = useState<{
        id: string;
        role: string;
    } | null>(null);
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
                    { ...filters, search: value },
                    { preserveState: true, replace: true, preserveScroll: true },
                );
            }, 500); 
        };
    
       const handleRoleChange = (role: string) => {
        setRole(role);
        router.get(
            team.index().url,
            { ...filters, role },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />
            <div className="space-y-6 p-4 font-heading">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Team Members
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your team members and their permissions
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit(business.team.create().url)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Team Member
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Members
                            </CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active} active, {stats.deactivated}{' '}
                                deactivated
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Admins
                            </CardTitle>
                            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.admins}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Full access
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Staff Members
                            </CardTitle>
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.staffs}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Limited access
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Members Table */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            {/* Search Section */}
                            <div className="relative w-full md:w-80 border rounded-full p-2">
                                <Search className="absolute  focus-within:outline-none outline-none focus:outline-none top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    placeholder="Search team member..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Filter Section */}
                            <div className="w-full md:w-48">
                                <Select onValueChange={v => handleRoleChange(v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by role" />
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
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {teamMembers.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <UsersIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>No active team members yet.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() =>
                                        router.visit(business.team.create().url)
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Team Member
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Appointments</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teamMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium capitalize">
                                                        {member.user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {member.user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {roleUpdateForm?.id ===
                                                member.id ? (
                                                    <Select
                                                        value={
                                                            roleUpdateForm.role
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            handleRoleUpdate(
                                                                member,
                                                                value,
                                                            );
                                                        }}
                                                        onOpenChange={(
                                                            open,
                                                        ) => {
                                                            if (
                                                                !open &&
                                                                roleUpdateForm.id ===
                                                                    member.id
                                                            ) {
                                                                setRoleUpdateForm(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-32">
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
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                member.role ===
                                                                'admin'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {member.role ===
                                                            'admin' ? (
                                                                <>
                                                                    <ShieldCheckIcon className="mr-1 h-3 w-3" />
                                                                    Admin
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserIcon className="mr-1 h-3 w-3" />
                                                                    Staff
                                                                </>
                                                            )}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setRoleUpdateForm(
                                                                    {
                                                                        id: member.id,
                                                                        role: member.role,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {member.appointments_count}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {member.accepted_at
                                                    ? new Date(
                                                          member.accepted_at,
                                                      ).toLocaleDateString()
                                                    : 'Pending'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        Deactivate
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeletingMember(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
