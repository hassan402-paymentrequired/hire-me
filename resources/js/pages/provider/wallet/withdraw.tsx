import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Wallet, ArrowDown, Loader2, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormSelect } from '@/components/ui/form-select';
import { BreadcrumbItem } from '@/types';

interface WalletData {
    balance: number;
    escrow_balance: number;
    available_balance: number;
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

export default function Withdraw({ wallet, withdrawals, banks }: Props) {
    const [showAddBank, setShowAddBank] = useState(false);
    const [selectedBank, setSelectedBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
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

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        postBank('/wallet/withdraw/recipient', {
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
        postWithdrawal('/wallet/withdraw', {
            onSuccess: () => {
                setWithdrawalData({
                    amount: '',
                    recipient_code: '',
                    account_name: '',
                    bank_name: '',
                });
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdraw Funds" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
                    <p className="text-muted-foreground mt-2">
                        Transfer money from your wallet to your bank account
                    </p>
                </div>

                {/* Wallet Balance Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Available Balance</CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                ₦{wallet.available_balance.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Ready to withdraw
                            </p>
                        </CardContent>
                    </Card>

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

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Withdrawal Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDown className="h-5 w-5" />
                                Withdraw Funds
                            </CardTitle>
                            <CardDescription>
                                Transfer money to your bank account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!recipientCode && !showAddBank && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        You need to add a bank account first to withdraw funds.
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

                    {/* Withdrawal History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Withdrawal History</CardTitle>
                            <CardDescription>
                                View your past withdrawal requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {withdrawals.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No withdrawals yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
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
                                <div className="flex items-center justify-between mt-4">
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
