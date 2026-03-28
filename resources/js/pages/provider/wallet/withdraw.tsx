import KeenIcon from '@/components/keen-icon';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormSelect } from '@/components/ui/form-select';
import { BreadcrumbItem } from '@/types';

interface WalletData {
    balance: number;
    escrow_balance: number;
    available_balance: number;
    pending_earnings: number;
}

interface BankAccount {
    recipient_code: string;
    bank_name: string;
    account_name: string;
    account_number_masked: string | null;
}

interface Withdrawal {
    id: number;
    amount: number;
    status: string;
    description: string;
    created_at: string;
    reference?: string;
    metadata?: any;
}

interface Bank {
    code: string;
    name: string;
}

interface Props {
    wallet: WalletData;
    bankAccount: BankAccount | null;
    withdrawals: {
        data: Withdrawal[];
        links: any;
        meta: any;
    };
    banks: Bank[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/business/dashboard' },
    { title: 'Withdrawals', href: '/provider/withdrawals' },
];

export default function Withdraw({ wallet, bankAccount = null, withdrawals, banks }: Props) {
    const [showAddBank, setShowAddBank] = useState(false);
    const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
    const hasBankAccount = !!bankAccount;
    const totalBalance = wallet.balance + wallet.pending_earnings;

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, transform: transformWithdrawal, processing: processingWithdrawal, errors: withdrawalErrors } = useForm({
        amount: '',
        recipient_code: bankAccount?.recipient_code ?? '',
        account_name: bankAccount?.account_name ?? '',
        bank_name: bankAccount?.bank_name ?? '',
    });

    const { data: bankData, setData: setBankData, post: postBank, transform: transformBank, processing: processingBank, errors: bankErrors } = useForm({
        account_number: '',
        bank_code: '',
        account_name: '',
        bank_name: '',
    });

    const handleAddOrUpdateBank = (e: React.FormEvent) => {
        e.preventDefault();
        const bankName = banks.find((b) => b.code === bankData.bank_code)?.name ?? '';
        if (!bankName) return;
        transformBank((data) => ({ ...data, bank_name: bankName }));
        postBank('/wallet/withdraw/recipient', {
            onSuccess: () => {
                setShowAddBank(false);
                setBankData({ account_number: '', bank_code: '', account_name: '', bank_name: '' });
            },
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        setWithdrawConfirmOpen(true);
    };

    const submitWithdrawal = () => {
        if (bankAccount) {
            transformWithdrawal((data) => ({
                ...data,
                recipient_code: bankAccount.recipient_code,
                account_name: bankAccount.account_name,
                bank_name: bankAccount.bank_name,
            }));
        }
        postWithdrawal('/wallet/withdraw', {
            onSuccess: () => {
                setWithdrawalData((prev) => ({ ...prev, amount: '' }));
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            completed: 'default',
            pending: 'secondary',
            failed: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const bankOptions = banks.map(bank => ({
        value: bank.code,
        label: bank.name,
    }));

    const walletStats = [
        {
            title: 'Available balance',
            value: `₦${wallet.available_balance.toLocaleString()}`,
            note: 'Ready to withdraw now',
            icon: 'receipt-square',
        },
        {
            title: 'Total balance',
            value: `₦${totalBalance.toLocaleString()}`,
            note: 'Available plus pending earnings',
            icon: 'status',
        },
        {
            title: 'Pending earnings',
            value: `₦${(wallet.pending_earnings ?? 0).toLocaleString()}`,
            note: 'Held until appointments complete',
            icon: 'electronic-clock',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdraw Funds" />
            <div className="flex flex-col gap-6 p-4">
                <CustomAlertDialog
                    open={withdrawConfirmOpen}
                    onOpenChange={setWithdrawConfirmOpen}
                    icon={<KeenIcon name="receipt-square" className="text-4xl text-emerald-600" />}
                    title="Confirm withdrawal"
                    description={`You are about to withdraw ₦${Number(withdrawalData.amount || 0).toLocaleString()} to ${bankAccount?.bank_name || 'your bank account'}. Please confirm this request before we send it to Paystack.`}
                    acceptLabel="Confirm withdrawal"
                    rejectLabel="Cancel"
                    onAccept={submitWithdrawal}
                />

                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative space-y-5 px-6 py-6 lg:px-8 lg:py-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border-border bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70 hover:bg-muted">
                                    Wallet workspace
                                </Badge>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {hasBankAccount ? 'Bank account connected' : 'Bank setup needed'}
                                </Badge>
                            </div>

                            <div className="max-w-2xl space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                    Withdraw funds
                                </h1>
                                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    Move your available earnings to a connected bank account, keep track of pending releases, and review every withdrawal request from one place.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {walletStats.map((stat) => (
                                    <div key={stat.title} className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                                    {stat.title}
                                                </p>
                                                <p className="mt-3 text-3xl font-semibold text-foreground">
                                                    {stat.value}
                                                </p>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-foreground">
                                                <KeenIcon name={stat.icon} className="text-base" />
                                            </div>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {stat.note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Withdrawal Form */}
                    <Card className="overflow-hidden rounded-3xl border border-border/70 shadow-none">
                        <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                            <CardTitle className="flex items-center gap-2">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-emerald-600 dark:text-emerald-300">
                                    <KeenIcon name="receipt-square" className="text-base" />
                                </span>
                                Withdraw Funds
                            </CardTitle>
                            <CardDescription>
                                Transfer money to your bank account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!hasBankAccount && !showAddBank && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        You need to add a bank account first to withdraw funds.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddBank(true)}
                                        className="w-full"
                                    >
                                        <KeenIcon name="book-square" className="mr-2 text-sm" />
                                        Add Bank Account
                                    </Button>
                                </div>
                            )}

                            {showAddBank && (
                                <form onSubmit={handleAddOrUpdateBank} className="space-y-4">
                                    <div>
                                        <Label htmlFor="bank_code">Bank</Label>
                                        <FormSelect
                                            value={bankData.bank_code}
                                            onChange={(value) => setBankData('bank_code', value)}
                                            options={bankOptions}
                                            placeholder="Select bank"
                                        />
                                        {bankErrors.bank_code && (
                                            <p className="text-sm text-destructive mt-1">
                                                {bankErrors.bank_code}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="account_number">Account Number</Label>
                                        <Input
                                            id="account_number"
                                            type="text"
                                            maxLength={10}
                                            value={bankData.account_number}
                                            onChange={(e) => setBankData('account_number', e.target.value)}
                                            placeholder="Enter 10-digit account number"
                                        />
                                        {bankErrors.account_number && (
                                            <p className="text-sm text-destructive mt-1">
                                                {bankErrors.account_number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="account_name">Account Name</Label>
                                        <Input
                                            id="account_name"
                                            type="text"
                                            value={bankData.account_name}
                                            onChange={(e) => setBankData('account_name', e.target.value)}
                                            placeholder="Enter account name"
                                        />
                                        {bankErrors.account_name && (
                                            <p className="text-sm text-destructive mt-1">
                                                {bankErrors.account_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={processingBank}
                                        className="flex-1"
                                    >
                                            {processingBank && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            {hasBankAccount ? 'Update Bank Account' : 'Add Bank Account'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddBank(false);
                                                setBankData({
                                                    account_number: '',
                                                    bank_code: '',
                                                    account_name: '',
                                                    bank_name: '',
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {hasBankAccount && !showAddBank && (
                                <form onSubmit={handleWithdraw} className="space-y-4">
                                    <div>
                                        <Label htmlFor="amount">Amount (₦)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="100"
                                            step="100"
                                            max={wallet.available_balance}
                                            value={withdrawalData.amount}
                                            onChange={(e) => setWithdrawalData('amount', e.target.value)}
                                            placeholder="Enter amount (minimum ₦100)"
                                            required
                                        />
                                        {withdrawalErrors.amount && (
                                            <p className="text-sm text-destructive mt-1">
                                                {withdrawalErrors.amount}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Maximum: ₦{wallet.available_balance.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200">
                                        <p className="text-sm font-medium mb-1">Bank Account</p>
                                        <p className="text-sm text-muted-foreground">
                                            {bankAccount?.bank_name} - {bankAccount?.account_name}
                                            {bankAccount?.account_number_masked && (
                                                <span className="ml-1">({bankAccount.account_number_masked})</span>
                                            )}
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processingWithdrawal || !withdrawalData.amount || parseFloat(withdrawalData.amount) < 100 || parseFloat(withdrawalData.amount) > wallet.available_balance}
                                        className="w-full"
                                    >
                                        {processingWithdrawal ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <KeenIcon name="receipt-square" className="mr-2 text-sm" />
                                                Withdraw Funds
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddBank(true)}
                                        className="w-full"
                                    >
                                        Update Bank Account
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Withdrawal History */}
                    <Card className="overflow-hidden rounded-3xl border border-border/70 shadow-none">
                        <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                            <CardTitle className="flex items-center gap-2">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                                    <KeenIcon name="electronic-clock" className="text-base" />
                                </span>
                                Withdrawal History
                            </CardTitle>
                            <CardDescription>
                                View your past withdrawal requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            {withdrawals.data.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-border/70 bg-muted/30 text-muted-foreground">
                                        <KeenIcon name="receipt-square" className="text-lg" />
                                    </div>
                                    <p className="text-muted-foreground">No withdrawals yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-border/70">
                                    <Table>
                                        <TableHeader className="bg-muted/20">
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Reference</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {withdrawals.data.map((withdrawal) => (
                                                <TableRow key={withdrawal.id}>
                                                    <TableCell className="text-sm">
                                                        {withdrawal.created_at}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        ₦{withdrawal.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(withdrawal.status)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                                        {withdrawal.reference || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Pagination */}
                            {withdrawals.links && withdrawals.links.length > 3 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {withdrawals.meta.from} to {withdrawals.meta.to} of {withdrawals.meta.total} withdrawals
                                    </div>
                                    <div className="flex gap-2">
                                        {withdrawals.links.map((link: any, index: number) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
