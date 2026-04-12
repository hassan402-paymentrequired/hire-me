import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LifeBuoy, Mail, Search } from 'lucide-react';

interface SupportRequest {
    id: string;
    name: string;
    email: string;
    subject: string;
    category: string | null;
    message: string;
    status: string;
    source: string;
    admin_notes: string | null;
    created_at: string;
    resolved_at: string | null;
}

interface Props {
    requests: {
        data: SupportRequest[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support Requests',
        href: '/admin/support',
    },
];

type SupportBadgeVariant = 'primary' | 'secondary' | 'outline';

export default function AdminSupportIndex({ requests, filters }: Props) {
    const filterForm = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
    });

    const resolveForm = useForm({
        admin_notes: '',
    });

    const applyFilters = () => {
        filterForm.get('/admin/support', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        filterForm.setData({
            search: '',
            status: 'all',
        });

        router.get('/admin/support');
    };

    const getStatusVariant = (status: string): SupportBadgeVariant => {
        if (status === 'open') {
            return 'primary';
        }

        if (status === 'resolved') {
            return 'secondary';
        }

        return 'outline';
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Requests" />

            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Support Requests
                        </h1>
                        <p className="text-muted-foreground">
                            Review contact and help-center submissions from
                            users.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-sm text-muted-foreground">
                        <LifeBuoy className="h-4 w-4 text-primary" />
                        {requests.total} total requests
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={filterForm.data.search}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'search',
                                                e.target.value,
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                applyFilters();
                                            }
                                        }}
                                        placeholder="Search by name, email, subject, or message"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    title="Support status"
                                    value={filterForm.data.status}
                                    onChange={(e) =>
                                        filterForm.setData(
                                            'status',
                                            e.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="all">All requests</option>
                                    <option value="open">Open</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {requests.data.length > 0 ? (
                        requests.data.map((request) => (
                            <Card key={request.id}>
                                <CardContent className="space-y-5 py-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-semibold">
                                                    {request.subject}
                                                </h2>
                                                <Badge
                                                    variant={getStatusVariant(
                                                        request.status,
                                                    )}
                                                    className="capitalize"
                                                >
                                                    {request.status}
                                                </Badge>
                                                {request.category && (
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize"
                                                    >
                                                        {request.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                <span>{request.name}</span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {request.email}
                                                </span>
                                                <span>
                                                    {request.created_at}
                                                </span>
                                                <span className="capitalize">
                                                    Source:{' '}
                                                    {request.source.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        {request.resolved_at && (
                                            <div className="text-sm text-muted-foreground">
                                                Resolved {request.resolved_at}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-foreground/85">
                                        {request.message}
                                    </div>

                                    {request.admin_notes && (
                                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Admin notes
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-foreground/85">
                                                {request.admin_notes}
                                            </p>
                                        </div>
                                    )}

                                    {request.status !== 'resolved' && (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                resolveForm.post(
                                                    `/admin/support/${request.id}/resolve`,
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            resolveForm.reset(
                                                                'admin_notes',
                                                            );
                                                        },
                                                    },
                                                );
                                            }}
                                            className="space-y-3 rounded-2xl border border-border/70 bg-background p-4"
                                        >
                                            <Label
                                                htmlFor={`notes-${request.id}`}
                                            >
                                                Resolution notes
                                            </Label>
                                            <Textarea
                                                id={`notes-${request.id}`}
                                                value={
                                                    resolveForm.data.admin_notes
                                                }
                                                onChange={(e) =>
                                                    resolveForm.setData(
                                                        'admin_notes',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Add an internal note before resolving this request."
                                                className="min-h-[110px]"
                                            />
                                            {resolveForm.errors.admin_notes && (
                                                <p className="text-xs text-destructive">
                                                    {
                                                        resolveForm.errors
                                                            .admin_notes
                                                    }
                                                </p>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={
                                                    resolveForm.processing
                                                }
                                            >
                                                {resolveForm.processing
                                                    ? 'Resolving...'
                                                    : 'Mark as resolved'}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="flex min-h-[280px] flex-col items-center justify-center text-center">
                                <LifeBuoy className="h-10 w-10 text-primary" />
                                <h2 className="mt-4 text-lg font-semibold">
                                    No support requests found
                                </h2>
                                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                    Once users submit contact or help-center
                                    requests, they will show up here for the
                                    admin team to review.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Pagination links={requests.links} />
            </div>
        </AdminLayout>
    );
}
