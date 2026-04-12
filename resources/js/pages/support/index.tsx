import KeenIcon from '@/components/keen-icon';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Mail, MessageSquareText } from 'lucide-react';

interface SupportTicket {
    id: string;
    subject: string;
    category: string | null;
    status: string;
    message: string;
    created_at: string;
    resolved_at: string | null;
}

interface Props {
    prefill: {
        name: string;
        email: string;
    };
    requests: {
        data: SupportTicket[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
}

type SupportBadgeVariant = 'primary' | 'secondary' | 'outline';

export default function SupportIndex({ prefill, requests }: Props) {
    const openRequests = requests.data.filter(
        (request) => request.status === 'open',
    ).length;

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
        <AppLayout>
            <Head title="Help Center" />

            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                <KeenIcon
                                    name="message-question"
                                    className="text-sm"
                                />
                                Support history
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Help Center
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Use the contact form when you need help,
                                    then follow the requests tied to your
                                    account from here.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                    Total requests
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-foreground">
                                    {requests.total}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Requests linked to {prefill.email}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                    Open now
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-foreground">
                                    {openRequests}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Waiting on review or response
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="rounded-3xl border border-border/70 bg-background/80 py-0">
                        <CardContent className="flex h-full flex-col justify-between gap-5 px-6 py-6">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                    Need help with a booking, payment, or
                                    account issue?
                                </h2>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                    Use the contact form once, and every new
                                    request will show up in the table below.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button asChild className="rounded-full px-6">
                                    <Link href="/contact">
                                        Open contact form
                                    </Link>
                                </Button>
                                <a
                                    href="mailto:support@proxideck.com"
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <Mail className="h-4 w-4" />
                                    support@proxideck.com
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-border/70 bg-background/80 py-0">
                        <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                                <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                    Name
                                </div>
                                <div className="mt-2 text-base font-semibold text-foreground">
                                    {prefill.name}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Signed-in account
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                                <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                    Email
                                </div>
                                <div className="mt-2 text-base font-semibold text-foreground">
                                    {prefill.email}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Used to match support history
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background">
                    <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                Recent requests
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                A full table of support requests linked to your
                                account.
                            </p>
                        </div>
                        <div
                            className={cn(
                                'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium',
                                requests.length > 0
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border/70 bg-muted/30 text-muted-foreground',
                            )}
                        >
                            {requests.total} total
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        {requests.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Resolved</TableHead>
                                            <TableHead className="w-[36%]">
                                                Message
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.data.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium whitespace-normal">
                                                    {request.subject}
                                                </TableCell>
                                                <TableCell className="whitespace-normal text-muted-foreground capitalize">
                                                    {request.category || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusVariant(
                                                            request.status,
                                                        )}
                                                        className="capitalize"
                                                    >
                                                        {request.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-normal text-muted-foreground">
                                                    {request.created_at}
                                                </TableCell>
                                                <TableCell className="whitespace-normal text-muted-foreground">
                                                    {request.resolved_at || '-'}
                                                </TableCell>
                                                <TableCell className="whitespace-normal text-muted-foreground">
                                                    {request.message}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-6">
                                    <Pagination links={requests.links} />
                                </div>
                            </>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
                                <div className="mb-4 flex justify-center">
                                    <MessageSquareText className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight">
                                    No support requests yet
                                </h3>
                                <p className="mx-auto mt-2 mb-6 max-w-sm text-sm leading-6 text-muted-foreground">
                                    Once you submit a request from the contact
                                    page, it will appear here for easy tracking.
                                </p>
                                <Link href="/contact">
                                    <Button>Open Contact Form</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
