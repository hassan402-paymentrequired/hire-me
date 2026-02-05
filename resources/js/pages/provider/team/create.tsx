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
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, User, Shield } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';
import { router } from '@inertiajs/react';

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
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        role: 'staff',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(business.team.store().url, {
            onSuccess: () => {
                router.visit(business.team.index().url);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Team Member" />
            <div className="space-y-6 p-4 w-full max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add Team Member</h1>
                        <p className="text-muted-foreground">
                            Invite a user to join your team
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Team Member Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="pl-10"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    The user must already have an account on the platform.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value as 'admin' | 'staff')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Admin</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Full access to manage business
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Staff</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Can manage appointments and services
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-destructive">{errors.role}</p>
                                )}
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950/20">
                                <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                                    Role Permissions
                                </h4>
                                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    {data.role === 'admin' ? (
                                        <>
                                            <li>• Full access to all business settings</li>
                                            <li>• Can manage team members</li>
                                            <li>• Can manage appointments and services</li>
                                            <li>• Can view analytics and reports</li>
                                            <li>• Can manage business hours and settings</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• Can view and manage appointments</li>
                                            <li>• Can view services</li>
                                            <li>• Cannot modify business settings</li>
                                            <li>• Cannot manage team members</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(business.team.index().url)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Adding...' : 'Add Team Member'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
