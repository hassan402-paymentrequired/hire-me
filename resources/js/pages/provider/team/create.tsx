import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { InboxArrowDownIcon } from '@heroicons/react/24/solid';
import { Head, router, useForm } from '@inertiajs/react';
import { Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';
import InviteModal from './components/invite-modal';

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
        title: 'Add Team Member',
        href: '',
    },
];

export default function TeamCreate() {
    const { data, setData, processing, errors, setError, reset } = useForm({
        name: '',
        email: '',
        role: 'staff',
    });
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(business.team.index().url, data, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(business.team.index().url);
            },
            onError: (error) => {
                if (error?.exists) {
                    setInviteModalOpen(true);
                } else {
                    setError(error);
                }
            },
        });
    };

    const handleAccept = () => {};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <InviteModal
                showDialog={inviteModalOpen}
                setShowDialog={setInviteModalOpen}
                dialogIcon={
                    <InboxArrowDownIcon className="size-12" />
                }
                title="Invite team member"
                description="The user you are trying to add to team lready exists on the system, will you like to send them an invite?"
                acceptLabel="Send invite"
                rejectLabel="cancel"
                handleAccept={handleAccept}
                handleReject={() => {
                    setInviteModalOpen(false)
                    reset();
                }}
            />

            <Head title="Add Team Member" />
            <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Add Team Member
                        </h1>
                        <p className="text-muted-foreground">
                            Invite a user to join your team
                        </p>
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Team Member Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="name"
                                        placeholder="e.g John doe"
                                        className="pl-10"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="pl-10"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) =>
                                        setData(
                                            'role',
                                            value as 'admin' | 'staff',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">
                                                        Admin
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Full access to manage
                                                        business
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">
                                                        Staff
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Can manage appointments
                                                        and services
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-destructive">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950/20">
                                <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                                    Role Permissions
                                </h4>
                                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    {data.role === 'admin' ? (
                                        <>
                                            <li>
                                                • Full access to all business
                                                settings
                                            </li>
                                            <li>• Can manage team members</li>
                                            <li>
                                                • Can manage appointments and
                                                services
                                            </li>
                                            <li>
                                                • Can view analytics and reports
                                            </li>
                                            <li>
                                                • Can manage business hours and
                                                settings
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                • Can view and manage
                                                appointments
                                            </li>
                                            <li>• Can view services</li>
                                            <li>
                                                • Cannot modify business
                                                settings
                                            </li>
                                            <li>
                                                • Cannot manage team members
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(business.team.index().url)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Adding...'
                                        : 'Add Team Member'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
