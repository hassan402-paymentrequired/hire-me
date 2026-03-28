/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import KeenIcon from '@/components/keen-icon';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ArchiveIcon,
    BadgeAlert,
    Calendar,
    Clock,
    CreditCard,
    Star,
    Users,
    AlertCircle,
    ShieldCheck,
    Wallet,
    Siren,
    Hourglass,
    ArrowUpRight,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes/business';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        revenue: { value: number; change: number };
        bookings: { value: number; change: number };
        new_clients: { value: number; change: number };
        rating: { value: number; change: number };
    };
    upcomingAppointments: Array<{
        id: number;
        client: string;
        service: string;
        time: string;
        date: string;
        status: string;
        avatar: string;
    }>;
    needsAttention: Array<{
        type: string;
        count: number;
        label: string;
        description: string;
        href: string;
        action_label: string;
        tone: 'danger' | 'warning' | 'info';
    }>;
    is_verified?: boolean;
    verification_status?: {
        status: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
}
 
export default function Index({ stats, upcomingAppointments, needsAttention, is_verified, verification_status }: DashboardProps) {
    const page = usePage();
    const auth = (page.props as any).auth;
    const verificationTone =
        verification_status?.status === 'pending'
            ? {
                  wrap: 'border-sky-200/80 bg-sky-50/80 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-300',
                  icon: 'text-sky-600 dark:text-sky-300',
                  title: 'Verification under review',
                  body: "We'll notify you once it's processed. You can keep operating while we review your submission.",
                  chip: 'border-sky-200 bg-white/80 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300',
              }
            : verification_status?.status === 'rejected'
              ? {
                    wrap: 'border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300',
                    icon: 'text-red-600 dark:text-red-300',
                    title: 'Verification needs attention',
                    body: verification_status.rejection_reason || 'Your last verification was rejected. Please resubmit a valid document.',
                    chip: 'border-red-200 bg-white/80 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
                }
              : {
                    wrap: 'border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300',
                    icon: 'text-amber-600 dark:text-amber-300',
                    title: 'Verification required',
                    body: 'Your business profile stays limited until you complete provider verification.',
                    chip: 'border-amber-200 bg-white/80 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
                };

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₦${stats.revenue.value.toLocaleString()}`,
            change: stats.revenue.change >= 0 
                ? `+${stats.revenue.change}% from last month`
                : `${stats.revenue.change}% from last month`,
            icon: CreditCard,
            keenIcon: 'receipt-square',
            accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
            iconTone: 'text-emerald-600 dark:text-emerald-300',
        },
        {
            title: 'Bookings',
            value: stats.bookings.value,
            change: stats.bookings.change >= 0
                ? `+${stats.bookings.change}% from last month`
                : `${stats.bookings.change}% from last month`,
            icon: Calendar,
            keenIcon: 'electronic-clock',
            accent: 'from-sky-500/15 via-sky-500/5 to-transparent',
            iconTone: 'text-sky-600 dark:text-sky-300',
        },
        {
            title: 'New Clients',
            value: stats.new_clients.value,
            change: stats.new_clients.change >= 0
                ? `+${stats.new_clients.change}% from last month`
                : `${stats.new_clients.change}% from last month`,
            icon: Users,
            keenIcon: 'people',
            accent: 'from-violet-500/15 via-violet-500/5 to-transparent',
            iconTone: 'text-violet-600 dark:text-violet-300',
        },
        {
            title: 'Overall Rating',
            value: stats.rating.value > 0 ? stats.rating.value.toFixed(1) : 'N/A',
            change: stats.rating.value > 0
                ? (stats.rating.change >= 0 
                    ? `+${stats.rating.change} from last month`
                    : `${stats.rating.change} from last month`)
                : 'No reviews yet',
            icon: Star,
            keenIcon: 'star',
            accent: 'from-amber-500/15 via-amber-500/5 to-transparent',
            iconTone: 'text-amber-500 dark:text-amber-300',
        },
    ];

    const attentionIconMap = {
        urgent_bookings: Siren,
        awaiting_confirmation: BadgeAlert,
        pending_client_confirmation: Hourglass,
        payout_issues: Wallet,
        verification_issue: ShieldCheck,
    } as const;

    const toneClassMap = {
        danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
        warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
        info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300',
    } as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_26%),radial-gradient(circle_at_left,_rgba(59,130,246,0.06),_transparent_24%)]" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        <div className="relative grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:px-8 lg:py-8">
                            <div className="space-y-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase text-foreground/70 hover:bg-muted">
                                        Provider workspace
                                    </Badge>
                                    <Badge
                                        className={
                                            is_verified
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                : verificationTone.chip
                                        }
                                    >
                                        {is_verified ? 'Verified business' : verificationTone.title}
                                    </Badge>
                                </div>

                                <div className="max-w-2xl space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                        Welcome back, {auth.user.name}
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                        Keep an eye on today&apos;s activity, respond to pending items, and stay on top of bookings without digging through multiple pages.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="electronic-clock" className="text-sm text-sky-600 dark:text-sky-300" />
                                            Today&apos;s queue
                                        </div>
                                        <p className="mt-3 text-3xl font-semibold text-foreground">
                                            {upcomingAppointments.length}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            upcoming appointments on deck
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="status" className="text-sm text-amber-600 dark:text-amber-300" />
                                            Needs action
                                        </div>
                                        <p className="mt-3 text-3xl font-semibold text-foreground">
                                            {needsAttention.length}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            items waiting for your decision
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="star" className="text-sm text-amber-500 dark:text-amber-300" />
                                            Reputation
                                        </div>
                                        <p className="mt-3 text-3xl font-semibold text-foreground">
                                            {stats.rating.value > 0 ? stats.rating.value.toFixed(1) : 'N/A'}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            overall service rating
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-border/70 bg-muted/20 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
                                            Business pulse
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold text-foreground">
                                            What deserves attention first
                                        </h2>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground">
                                        <KeenIcon name="abstract-26" className="text-lg" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-muted-foreground">Monthly bookings</span>
                                            <span className="font-semibold text-foreground">{stats.bookings.value}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-muted-foreground">Revenue this month</span>
                                            <span className="font-semibold text-foreground">₦{stats.revenue.value.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-muted-foreground">New clients this month</span>
                                            <span className="font-semibold text-foreground">{stats.new_clients.value}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Button asChild size="sm" className="rounded-full">
                                        <Link href="/schedule/appointments">
                                            Open appointments
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-full border border-border/70 bg-background hover:bg-muted"
                                    >
                                        <Link href="/business/analytics">View analytics</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Verification Alert */}
                {!is_verified && (
                    <Alert className={`rounded-2xl border ${verificationTone.wrap}`}>
                        <AlertCircle className={`h-4 w-4 ${verificationTone.icon}`} />
                        <AlertTitle className="text-sm font-semibold">
                            {verificationTone.title}
                        </AlertTitle>
                        <AlertDescription className="w-full">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm leading-6">
                                    {verificationTone.body}
                                </p>
                                {verification_status?.status !== 'pending' && (
                                    <Link href="/onboarding/verification">
                                        <Button size="sm" variant="default" className="rounded-full">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            {verification_status?.status === 'rejected' ? 'Resubmit Verification' : 'Verify Now'}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, i) => (
                        <Card key={i} className="relative overflow-hidden rounded-3xl border border-border/70">
                            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${stat.accent}`} />
                            <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Monthly snapshot
                                    </CardDescription>
                                </div>
                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/90 ${stat.iconTone}`}>
                                    <KeenIcon name={stat.keenIcon} className="text-lg" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-3">
                                <div className="text-3xl font-semibold tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-foreground/80">{stat.title}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <stat.icon className="h-3.5 w-3.5" />
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Upcoming Schedule (4 cols) */}
                    <Card className="overflow-hidden rounded-3xl border border-border/70 lg:col-span-4">
                        <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                                            <KeenIcon name="electronic-clock" className="text-base" />
                                        </span>
                                        Upcoming Schedule
                                    </CardTitle>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {upcomingAppointments.length} today
                                </Badge>
                            </div>
                            <CardDescription>
                                You have {upcomingAppointments.length}{' '}
                                appointments left today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="space-y-4">
                                {upcomingAppointments.length === 0 ? (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="default">
                                                <ArchiveIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No Upcoming Appointment
                                            </EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    upcomingAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border border-border/70">
                                                        <AvatarImage
                                                            src={apt.avatar}
                                                            alt={apt.client}
                                                        />
                                                        <AvatarFallback>
                                                            {apt.client.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1.5">
                                                        <p className="text-sm font-semibold">
                                                            {apt.client}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {apt.service}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {apt.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2 text-right">
                                                        <div className="flex items-center text-sm font-medium">
                                                            <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                            {apt.time}
                                                        </div>
                                                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                                            Start time
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            apt.status ===
                                                            'Confirmed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="rounded-full px-3 py-1"
                                                    >
                                                        {apt.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Needs Attention (3 cols) */}
                    <Card className="overflow-hidden rounded-3xl border border-border/70 lg:col-span-3">
                        <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-amber-600 dark:text-amber-300">
                                            <KeenIcon name="status" className="text-base" />
                                        </span>
                                        Needs Attention
                                    </CardTitle>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {needsAttention.length} open
                                </Badge>
                            </div>
                            <CardDescription>
                                Priority items that need action right now.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="space-y-3">
                                {needsAttention.length === 0 ? (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="default">
                                                <ShieldCheck />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No urgent items
                                            </EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    needsAttention.map((item, i) => {
                                        const Icon =
                                            attentionIconMap[
                                                item.type as keyof typeof attentionIconMap
                                            ] ?? BadgeAlert;

                                        return (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div
                                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClassMap[item.tone]}`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-semibold">
                                                                    {item.label}
                                                                </p>
                                                                <Badge variant="secondary" className="rounded-full">
                                                                    {item.count}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm leading-6 text-muted-foreground">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] sm:inline-flex ${toneClassMap[item.tone]}`}
                                                    >
                                                        {item.tone}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-full"
                                                    >
                                                        <Link href={item.href}>
                                                            {item.action_label}
                                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )})
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
