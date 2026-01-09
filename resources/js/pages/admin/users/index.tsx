import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import AdminLayout from '@/layouts/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Mail,
    Search,
    Shield,
    UserCheck,
    UserX,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    business_profile: {
        is_verified: boolean;
        business_name: string;
    } | null;
    wallet: {
        balance: number;
        available_balance: number;
    } | null;
    appointments_as_client_count: number;
    appointments_as_provider_count: number;
}

interface Props {
    users: {
        data: User[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
        is_provider?: string;
        is_verified?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '',
    },
];

export default function UserManagement({ users, filters }: Props) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        role: filters.role || '',
        is_provider: filters.is_provider || '',
        is_verified: filters.is_verified || '',
    });

    const handleFilter = () => {
        get('/admin/users', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setData({
            search: '',
            role: '',
            is_provider: '',
            is_verified: '',
        });
        router.get('/admin/users');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            User Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all platform users
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Name or email..."
                                        value={data.search}
                                        onChange={(e) =>
                                            setData('search', e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleFilter();
                                            }
                                        }}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Role
                                </label>
                                <Select
                                    value={data.role || 'all'}
                                    onValueChange={(value) =>
                                        setData('role', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>
                                        <SelectItem value="client">
                                            Client
                                        </SelectItem>
                                        <SelectItem value="provider">
                                            Provider
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Provider Status
                                </label>
                                <Select
                                    value={data.is_provider || 'all'}
                                    onValueChange={(value) =>
                                        setData('is_provider', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All users
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Providers only
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Clients only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Verification
                                </label>
                                <Select
                                    value={data.is_verified || 'all'}
                                    onValueChange={(value) =>
                                        setData('is_verified', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="1">
                                            Verified
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Not verified
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Users ({users?.total?.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users?.data?.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No users found
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Appointments</TableHead>
                                            <TableHead>Wallet</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {user.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.role ===
                                                            'provider'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {user.email_verified_at ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="flex w-fit items-center gap-1"
                                                            >
                                                                <UserCheck className="h-3 w-3" />
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="flex w-fit items-center gap-1"
                                                            >
                                                                <UserX className="h-3 w-3" />
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                        {user.business_profile
                                                            ?.is_verified && (
                                                            <Badge
                                                                variant="default"
                                                                className="flex w-fit items-center gap-1"
                                                            >
                                                                <Shield className="h-3 w-3" />
                                                                Business
                                                                Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>
                                                            Client:{' '}
                                                            {
                                                                user.appointments_as_client_count
                                                            }
                                                        </div>
                                                        <div>
                                                            Provider:{' '}
                                                            {
                                                                user.appointments_as_provider_count
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.wallet ? (
                                                        <div className="text-sm">
                                                            <div>
                                                                ₦
                                                                {user?.wallet?.balance?.toLocaleString()}
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                Available: ₦
                                                                {user?.wallet?.available_balance?.toLocaleString() || 0}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No wallet
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/admin/users/${user.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4">
                                    <Pagination links={users.links} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
