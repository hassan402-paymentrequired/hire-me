import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    Shield,
    UserCheck,
    UserX,
    Ban,
    Trash2,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
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
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    business_profile: {
        id: number;
        business_name: string;
        business_address: string;
        is_verified: boolean;
    } | null;
    wallet: {
        balance: number;
        escrow_balance: number;
        available_balance: number;
    } | null;
    appointments_as_client: Array<{
        id: number;
        date: string;
        time: string;
        status: string;
        price: number;
    }>;
    appointments_as_provider: Array<{
        id: number;
        date: string;
        time: string;
        status: string;
        price: number;
    }>;
    services: Array<{
        id: number;
        name: string;
        price: number;
    }>;
    reviews: Array<{
        id: number;
        rating: number;
        comment: string;
    }>;
    appointments_as_client_count: number;
    appointments_as_provider_count: number;
    services_count: number;
    reviews_count: number;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '',
    },
];

export default function UserShow({ user }: Props) {
    const [showSuspendDialog, setShowSuspendDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditingWallet, setIsEditingWallet] = useState(false);

    const { post, delete: deleteMethod, processing } = useForm();
    const walletForm = useForm<{
        balance: string;
        escrow_balance: string;
        reason: string;
    }>({
        balance: String(user.wallet?.balance ?? 0),
        escrow_balance: String(user.wallet?.escrow_balance ?? 0),
        reason: '',
    });

    const handleSuspend = () => {
        post(`/admin/users/${user.id}/suspend`, {
            onSuccess: () => {
                setShowSuspendDialog(false);
            },
        });
    };

    const handleDelete = () => {
        deleteMethod(`/admin/users/${user.id}`, {
            onSuccess: () => {
                router.visit('/admin/users');
            },
        });
    };

    const startEditWallet = () => {
        setIsEditingWallet(true);
        walletForm.setData({
            balance: String(user.wallet?.balance ?? 0),
            escrow_balance: String(user.wallet?.escrow_balance ?? 0),
            reason: '',
        });
        walletForm.clearErrors();
    };

    const cancelEditWallet = () => {
        setIsEditingWallet(false);
        walletForm.reset();
        walletForm.clearErrors();
    };

    const saveWallet = () => {
        walletForm.put(`/admin/users/${user.id}/wallet`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingWallet(false);
                walletForm.reset('reason');
            },
        });
    };

    const currentBalance = Number(user.wallet?.balance ?? 0);
    const currentEscrow = Number(user.wallet?.escrow_balance ?? 0);
    const currentAvailable = Math.max(0, currentBalance - currentEscrow);

    const draftBalance = Number(walletForm.data.balance || 0);
    const draftEscrow = Number(walletForm.data.escrow_balance || 0);
    const draftAvailable = Math.max(0, draftBalance - draftEscrow);


    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {user.business_profile?.is_verified === false && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.post(
                                        `/admin/users/${user.id}`,
                                        {
                                            is_verified: true,
                                        }
                                    )
                                }
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Verify Business
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowSuspendDialog(true)}
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* User Info */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-sm">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </label>
                                <p className="text-sm">{user.email}</p>
                            </div>
                            {user.phone && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        Phone
                                    </label>
                                    <p className="text-sm">{user.phone}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Role
                                </label>
                                <div className="mt-1">
                                    <Badge>{user.role}</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Account Status
                                </label>
                                <div className="mt-1">
                                    {user.email_verified_at ? (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 w-fit"
                                        >
                                            <UserCheck className="h-3 w-3" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 w-fit"
                                        >
                                            <UserX className="h-3 w-3" />
                                            Unverified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined
                                </label>
                                <p className="text-sm">
                                    {new Date(
                                        user.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {user.business_profile && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Business Name
                                    </label>
                                    <p className="text-sm">
                                        {user.business_profile.business_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Address
                                    </label>
                                    <p className="text-sm">
                                        {user.business_profile.business_address}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Verification Status
                                    </label>
                                    <div className="mt-1">
                                        {user.business_profile.is_verified ? (
                                            <Badge
                                                variant="default"
                                                className="flex items-center gap-1 w-fit"
                                            >
                                                <Shield className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1 w-fit"
                                            >
                                                Not Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Wallet Information</CardTitle>
                            {!isEditingWallet ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={startEditWallet}
                                >
                                    Edit wallet
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditWallet}
                                        disabled={walletForm.processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={saveWallet}
                                        disabled={walletForm.processing}
                                    >
                                        Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditingWallet ? (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Total Balance
                                        </label>
                                        <p className="text-2xl font-bold">
                                            ₦{currentBalance.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Escrow Balance
                                        </label>
                                        <p className="text-sm">
                                            ₦{currentEscrow.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Available Balance
                                        </label>
                                        <p className="text-sm">
                                            ₦{currentAvailable.toLocaleString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="balance">
                                                Total balance
                                            </Label>
                                            <Input
                                                id="balance"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={walletForm.data.balance}
                                                onChange={(e) =>
                                                    walletForm.setData(
                                                        'balance',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {walletForm.errors.balance && (
                                                <p className="text-sm text-destructive">
                                                    {walletForm.errors.balance}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="escrow_balance">
                                                Escrow balance
                                            </Label>
                                            <Input
                                                id="escrow_balance"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    walletForm.data.escrow_balance
                                                }
                                                onChange={(e) =>
                                                    walletForm.setData(
                                                        'escrow_balance',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {walletForm.errors.escrow_balance && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        walletForm.errors
                                                            .escrow_balance
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-md border bg-muted/20 p-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Available (computed)
                                            </span>
                                            <span className="font-semibold">
                                                ₦{draftAvailable.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">
                                            Reason (optional)
                                        </Label>
                                        <Input
                                            id="reason"
                                            value={walletForm.data.reason}
                                            onChange={(e) =>
                                                walletForm.setData(
                                                    'reason',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Manual correction"
                                        />
                                        {walletForm.errors.reason && (
                                            <p className="text-sm text-destructive">
                                                {walletForm.errors.reason}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Appointments as Client
                                </label>
                                <p className="text-2xl font-bold">
                                    {user.appointments_as_client_count}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Appointments as Provider
                                </label>
                                <p className="text-2xl font-bold">
                                    {user.appointments_as_provider_count}
                                </p>
                            </div>
                            {user.services_count > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Services
                                    </label>
                                    <p className="text-2xl font-bold">
                                        {user.services_count}
                                    </p>
                                </div>
                            )}
                            {user.reviews_count > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Reviews
                                    </label>
                                    <p className="text-2xl font-bold">
                                        {user.reviews_count}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Appointments */}
                {(user.appointments_as_client.length > 0 ||
                    user.appointments_as_provider.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        ...user.appointments_as_client.map(
                                            (apt) => ({
                                                ...apt,
                                                role: 'Client',
                                            })
                                        ),
                                        ...user.appointments_as_provider.map(
                                            (apt) => ({
                                                ...apt,
                                                role: 'Provider',
                                            })
                                        ),
                                    ]
                                        .sort(
                                            (a, b) =>
                                                new Date(b.date).getTime() -
                                                new Date(a.date).getTime()
                                        )
                                        .slice(0, 10)
                                        .map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell>
                                                    {new Date(
                                                        apt.date
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{apt.time}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            apt.status ===
                                                            'completed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {apt.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    ₦{apt.price.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {apt.role}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Dialogs */}
                <AlertDialog
                    open={showSuspendDialog}
                    onOpenChange={setShowSuspendDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Suspend User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to suspend this user?
                                They will not be able to access their account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleSuspend}
                                disabled={processing}
                            >
                                Suspend
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the user and all associated
                                data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={processing}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
