import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/guest-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDownUp, Loader2, Plus, Wallet, ArrowDown, Building2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormSelect } from '@/components/ui/form-select';

interface WalletData {
    balance: number;
    escrow_balance: number;
    available_balance: number;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    status: string;
    description: string;
    created_at: string;
    appointment_id?: number;
    reference?: string;
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
    transactions: {
        data: Transaction[];
        links: any;
        meta: any;
    };
    withdrawals?: {
        data: Withdrawal[];
        links: any;
        meta: any;
    };
    banks?: Bank[];
    paystackPublicKey: string;
}

export default function WalletIndex({
    wallet,
    transactions,
    withdrawals,
    banks = [],
    paystackPublicKey,
}: Props) {
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);
    const [recipientCode, setRecipientCode] = useState('');

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, errors: withdrawalErrors } = useForm({
        amount: '',
        recipient_code: '',
        account_name: '',
        bank_name: '',
    });

    const { data: bankData, setData: setBankData, post: postBank, processing: processingBank, errors: bankErrors } = useForm({
        account_number: '',
        bank_code: '',
        account_name: '',
    });

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topUpAmount || parseFloat(topUpAmount) < 100) {
            return;
        }

        setIsProcessing(true);
        try {
            try {
                router.post('/wallet/top-up/initialize', {
                    amount: parseFloat(topUpAmount),
                });
                setIsProcessing(false);
            } catch (error) {
                console.error('Top-up error:', error);
                toast.error('An error occurred. Please try again.');
                setIsProcessing(false);
            }
            setIsProcessing(false);
        } catch (error) {
            console.error('Top-up error:', error);
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    const getStatusBadgeWithdrawal = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
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

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            deposit: 'Top-up',
            withdrawal: 'Withdrawal',
            escrow_hold: 'Escrow Hold',
            escrow_release: 'Escrow Release',
            escrow_refund: 'Escrow Refund',
            escrow_forfeit: 'Escrow Forfeit',
        };
        return labels[type] || type;
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        postBank('/wallet/client/withdraw/recipient', {
            onSuccess: (page) => {
                const recipientCode = (page.props as any).recipient_code;
                if (recipientCode) {
                    setRecipientCode(recipientCode);
                    setShowAddBank(false);
                    // Pre-fill withdrawal form
                    setWithdrawalData({
                        ...withdrawalData,
                        recipient_code: recipientCode,
                        account_name: bankData.account_name,
                        bank_name: banks.find(b => b.code === bankData.bank_code)?.name || '',
                    });
                }
            },
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal('/wallet/client/withdraw', {
            onSuccess: () => {
                setWithdrawalData({
                    amount: '',
                    recipient_code: '',
                    account_name: '',
                    bank_name: '',
                });
                setRecipientCode('');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
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

    return (
        <AppLayout>
            <Head title="My Wallet" />
            <div className="mx-auto w-full max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        My Wallet
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage your wallet balance and view transaction history
                    </p>
                </div>

                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    {/* Available Balance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Available Balance</CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                ₦{wallet.available_balance.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Ready to use for bookings
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Balance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Balance</CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                ₦{wallet.balance.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Including escrow funds
                            </p>
                        </CardContent>
                    </Card>

                    {/* Escrow Balance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Escrow Balance</CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                ₦{wallet.escrow_balance.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Held for active appointments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top-up Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Top Up Wallet
                        </CardTitle>
                        <CardDescription>
                            Add funds to your wallet to book appointments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTopUp} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="amount">Amount (₦)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min="100"
                                        step="100"
                                        value={topUpAmount}
                                        onChange={(e) =>
                                            setTopUpAmount(e.target.value)
                                        }
                                        placeholder="Enter amount (minimum ₦100)"
                                        required
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="submit"
                                        disabled={
                                            isProcessing ||
                                            !topUpAmount ||
                                            parseFloat(topUpAmount) < 100
                                        }
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Top Up
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Minimum top-up amount is ₦100. You'll be
                                redirected to Paystack to complete the payment.
                            </p>
                        </form>
                    </CardContent>
                </Card>

                {/* Withdrawal Section */}
                {wallet.available_balance > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDown className="h-5 w-5" />
                                Withdraw Funds
                            </CardTitle>
                            <CardDescription>
                                Transfer money from your wallet to your bank account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!recipientCode && !showAddBank && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Add a bank account to withdraw funds
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddBank(true)}
                                        className="w-full"
                                    >
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Add Bank Account
                                    </Button>
                                </div>
                            )}

                            {showAddBank && (
                                <form onSubmit={handleAddBank} className="space-y-4">
                                    <div>
                                        <Label htmlFor="bank_code">Bank</Label>
                                        <FormSelect
                                            id="bank_code"
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
                                            Add Bank Account
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
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {recipientCode && !showAddBank && (
                                <form onSubmit={handleWithdraw} className="space-y-4">
                                    <div>
                                        <Label htmlFor="withdraw_amount">Amount (₦)</Label>
                                        <Input
                                            id="withdraw_amount"
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

                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900">
                                        <p className="text-sm font-medium mb-1">Bank Account</p>
                                        <p className="text-sm text-muted-foreground">
                                            {withdrawalData.bank_name} - {withdrawalData.account_name}
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
                                                <ArrowDown className="mr-2 h-4 w-4" />
                                                Withdraw Funds
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setRecipientCode('');
                                            setWithdrawalData({
                                                amount: '',
                                                recipient_code: '',
                                                account_name: '',
                                                bank_name: '',
                                            });
                                        }}
                                        className="w-full"
                                    >
                                        Change Bank Account
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Withdrawal History */}
                {withdrawals && withdrawals.data.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDown className="h-5 w-5" />
                                Withdrawal History
                            </CardTitle>
                            <CardDescription>
                                View your withdrawal requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
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
                                                <TableCell className="max-w-xs truncate">
                                                    {withdrawal.description}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(withdrawal.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowDownUp className="h-5 w-5" />
                            Transaction History
                        </CardTitle>
                        <CardDescription>
                            View all your wallet transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No transactions yet
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Balance After
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map(
                                            (transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="text-sm">
                                                        {transaction.created_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getTypeLabel(
                                                            transaction.type,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {
                                                            transaction.description
                                                        }
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-medium ${
                                                            transaction.amount >
                                                            0
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {transaction.amount > 0
                                                            ? '+'
                                                            : ''}
                                                        ₦
                                                        {Math.abs(
                                                            transaction.amount,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        ₦
                                                        {transaction.balance_after.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(
                                                            transaction.status,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.links &&
                            transactions.links.length > 3 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {transactions.meta.from} to{' '}
                                        {transactions.meta.to} of{' '}
                                        {transactions.meta.total} transactions
                                    </div>
                                    <div className="flex gap-2">
                                        {transactions.links.map(
                                            (link: any, index: number) => (
                                                <Button
                                                    key={index}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() =>
                                                        link.url &&
                                                        router.visit(link.url)
                                                    }
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
