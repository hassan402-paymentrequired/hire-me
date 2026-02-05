import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Users,
    Shield,
    User,
    Mail,
    Calendar,
    Edit2,
} from 'lucide-react';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';
import { Badge } from '@/components/ui/badge';
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

interface Props {
    teamMembers: TeamMember[];
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

export default function TeamIndex({ teamMembers }: Props) {
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
    const [roleUpdateForm, setRoleUpdateForm] = useState<{ id: string; role: string } | null>(null);

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

    const activeMembers = teamMembers.filter(m => m.is_active);
    const inactiveMembers = teamMembers.filter(m => !m.is_active);

    return (
        <AppLayout>
            <Head title="Team Members" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                        <p className="text-muted-foreground">
                            Manage your team members and their permissions
                        </p>
                    </div>
                    <Button onClick={() => router.visit(business.team.create().url)}>
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
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamMembers.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {activeMembers.length} active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Admins
                            </CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeMembers.filter(m => m.role === 'admin').length}
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
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeMembers.filter(m => m.role === 'staff').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Limited access
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Members Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeMembers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No active team members yet.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.visit(business.team.create().url)}
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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{member.user.name}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {member.user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
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
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="staff">Staff</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                                            {member.role === 'admin' ? (
                                                                <>
                                                                    <Shield className="mr-1 h-3 w-3" />
                                                                    Admin
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <User className="mr-1 h-3 w-3" />
                                                                    Staff
                                                                </>
                                                            )}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setRoleUpdateForm({ id: member.id, role: member.role })}
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
                                                <Badge variant="default">Active</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {member.accepted_at
                                                    ? new Date(member.accepted_at).toLocaleDateString()
                                                    : 'Pending'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(member)}
                                                    >
                                                        Deactivate
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setDeletingMember(member)}
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

                {/* Inactive Members */}
                {inactiveMembers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Inactive Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inactiveMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{member.user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{member.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(member)}
                                                >
                                                    Reactivate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove {deletingMember?.user.name} from your team?
                                This will reassign their appointments to you. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deletingMember && handleDelete(deletingMember)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
