import KeenIcon from '@/components/keen-icon';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import { FormSelect } from '@/components/ui/form-select';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import walletRoutes from '@/routes/wallet';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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
    metadata?: Record<string, unknown>;
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
        links: { url: string | null; label: string; active: boolean }[];
        meta?: { from?: number; to?: number; total?: number };
    };
    banks: Bank[];
    paymentProvider: string;
    payengineWallet: {
        is_configured: boolean;
        account_number: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/business/dashboard' },
    { title: 'Withdrawals', href: '/provider/withdrawals' },
];

export default function Withdraw({
    wallet,
    bankAccount = null,
    withdrawals,
    banks,
    paymentProvider,
    payengineWallet,
}: Props) {
    const [showAddBank, setShowAddBank] = useState(false);
    const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
    const hasBankAccount = !!bankAccount;
    const totalBalance = wallet.balance + wallet.pending_earnings;

    const {
        data: withdrawalData,
        setData: setWithdrawalData,
        post: postWithdrawal,
        transform: transformWithdrawal,
        processing: processingWithdrawal,
        errors: withdrawalErrors,
    } = useForm({
        amount: '',
        recipient_code: bankAccount?.recipient_code ?? '',
        account_name: bankAccount?.account_name ?? '',
        bank_name: bankAccount?.bank_name ?? '',
    });

    const {
        data: bankData,
        setData: setBankData,
        post: postBank,
        transform: transformBank,
        processing: processingBank,
        errors: bankErrors,
    } = useForm({
        account_number: '',
        bank_code: '',
        account_name: '',
        bank_name: '',
    });

    const handleAddOrUpdateBank = (e: React.FormEvent) => {
        e.preventDefault();
        const bankName =
            banks.find((b) => b.code === bankData.bank_code)?.name ?? '';
        if (!bankName) return;
        transformBank((data) => ({ ...data, bank_name: bankName }));
        postBank('/wallet/withdraw/recipient', {
            onSuccess: () => {
                setShowAddBank(false);
                setBankData({
                    account_number: '',
                    bank_code: '',
                    account_name: '',
                    bank_name: '',
                });
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

    const bankOptions = banks.map((bank) => ({
        value: bank.code,
        label: bank.name,
    }));

    const naira = (value: number) =>
        `₦${Math.round(value || 0).toLocaleString()}`;

    const statusStyle: Record<string, string> = {
        completed:
            'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
        success:
            'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
        pending:
            'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
        failed: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    };

    const setQuickAmount = (fraction: number) => {
        const amount =
            Math.floor((wallet.available_balance * fraction) / 100) * 100;
        setWithdrawalData('amount', String(amount));
    };

    const amountValue = parseFloat(withdrawalData.amount || '0');
    const canWithdraw =
        !processingWithdrawal &&
        amountValue >= 100 &&
        amountValue <= wallet.available_balance;

    const inputClass =
        'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

    const balanceTiles = [
        { label: 'Held for bookings', value: wallet.escrow_balance ?? 0 },
        { label: 'Pending earnings', value: wallet.pending_earnings ?? 0 },
        { label: 'Total balance', value: totalBalance },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />

            <CustomAlertDialog
                open={withdrawConfirmOpen}
                onOpenChange={setWithdrawConfirmOpen}
                icon={
                    <KeenIcon
                        name="receipt-square"
                        className="text-4xl text-[#0E3B2E] dark:text-[#C8F169]"
                    />
                }
                title="Confirm withdrawal"
                description={`You are about to withdraw ${naira(Number(withdrawalData.amount || 0))} to ${bankAccount?.bank_name || 'your bank account'}.`}
                acceptLabel="Confirm withdrawal"
                rejectLabel="Cancel"
                onAccept={submitWithdrawal}
            />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">
                        Business
                    </span>
                    <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                        Wallet
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        Your earnings, money held for upcoming bookings, and
                        payouts to your bank.
                    </span>
                </header>

                <div className="flex flex-wrap items-stretch gap-6">
                    {/* Balance hero */}
                    <section className="relative flex min-w-0 flex-[999_1_460px] flex-col gap-[22px] overflow-hidden rounded-3xl bg-[#0E3B2E] p-7 text-white">
                        <img
                            src="/brand/banners/proxideck-banner-general-dark.svg"
                            alt=""
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85"
                        />
                        <div className="relative flex flex-col gap-1.5">
                            <span className="text-[13px] font-bold text-[#C8F169]">
                                Available to withdraw
                            </span>
                            <span className="font-[Sora] text-[44px] leading-none font-bold tracking-[-0.02em]">
                                {naira(wallet.available_balance)}
                            </span>
                        </div>
                        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {balanceTiles.map((tile) => (
                                <div
                                    key={tile.label}
                                    className="flex flex-col gap-1 rounded-2xl border border-white/12 bg-white/[0.08] p-3.5 backdrop-blur-sm"
                                >
                                    <span className="text-xs text-white/75">
                                        {tile.label}
                                    </span>
                                    <span className="font-[Sora] text-lg font-bold">
                                        {naira(tile.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Withdraw / PayEngine */}
                    <section className="flex max-w-[400px] flex-[1_1_320px] flex-col gap-3.5 rounded-[20px] border border-[#0E3B2E]/10 bg-card p-[22px] shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
                        {paymentProvider === 'payengine' ? (
                            <>
                                <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                    Wallet account
                                </h2>
                                <p className="text-sm leading-normal text-muted-foreground">
                                    {payengineWallet.is_configured
                                        ? 'Your virtual account is ready to receive bank transfers.'
                                        : 'Set up identity verification to receive your virtual account.'}
                                </p>
                                {payengineWallet.is_configured && (
                                    <span className="font-[Sora] text-2xl font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                        {payengineWallet.account_number}
                                    </span>
                                )}
                                <Link
                                    href={walletRoutes.payengine.setup.url()}
                                    className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#0E3B2E] text-sm font-bold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                >
                                    {payengineWallet.is_configured
                                        ? 'View account'
                                        : 'Set up account'}
                                </Link>
                            </>
                        ) : showAddBank || !hasBankAccount ? (
                            <form
                                onSubmit={handleAddOrUpdateBank}
                                className="flex flex-col gap-3.5"
                            >
                                <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                    {hasBankAccount
                                        ? 'Update bank account'
                                        : 'Add a bank account'}
                                </h2>
                                {!hasBankAccount && !showAddBank && (
                                    <p className="text-sm text-muted-foreground">
                                        Add where your money should go before
                                        you withdraw.
                                    </p>
                                )}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="bank_code">Bank</Label>
                                    <FormSelect
                                        value={bankData.bank_code}
                                        onChange={(value) =>
                                            setBankData('bank_code', value)
                                        }
                                        options={bankOptions}
                                        placeholder="Select bank"
                                        error={bankErrors.bank_code}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="account_number">
                                        Account number
                                    </Label>
                                    <input
                                        id="account_number"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={bankData.account_number}
                                        onChange={(e) =>
                                            setBankData(
                                                'account_number',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="10-digit account number"
                                        className={inputClass}
                                    />
                                    {bankErrors.account_number && (
                                        <p className="text-sm text-destructive">
                                            {bankErrors.account_number}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="account_name">
                                        Account name
                                    </Label>
                                    <input
                                        id="account_name"
                                        value={bankData.account_name}
                                        onChange={(e) =>
                                            setBankData(
                                                'account_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Name on the account"
                                        className={inputClass}
                                    />
                                    {bankErrors.account_name && (
                                        <p className="text-sm text-destructive">
                                            {bankErrors.account_name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2.5">
                                    {hasBankAccount && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddBank(false);
                                                setBankData({
                                                    account_number: '',
                                                    bank_code: '',
                                                    account_name: '',
                                                    bank_name: '',
                                                });
                                            }}
                                            className="h-12 flex-1 rounded-xl border border-[#0E3B2E]/15 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={processingBank}
                                        className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-sm font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-70 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                    >
                                        {processingBank && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}
                                        {hasBankAccount
                                            ? 'Save bank account'
                                            : 'Add bank account'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleWithdraw}
                                className="flex flex-col gap-3.5"
                            >
                                <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                    Withdraw
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="flex h-[52px] items-center overflow-hidden rounded-xl border border-[#0E3B2E]/15 focus-within:ring-[3px] focus-within:ring-[#C8F169]/60 dark:border-white/15">
                                        <span className="flex h-full items-center bg-muted px-3.5 font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                            ₦
                                        </span>
                                        <input
                                            id="amount"
                                            type="number"
                                            min="100"
                                            step="100"
                                            max={wallet.available_balance}
                                            value={withdrawalData.amount}
                                            onChange={(e) =>
                                                setWithdrawalData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Minimum ₦100"
                                            required
                                            className="h-full min-w-0 flex-1 bg-transparent px-3 font-[Sora] text-lg font-bold text-foreground outline-none"
                                        />
                                    </div>
                                    {withdrawalErrors.amount && (
                                        <p className="text-sm text-destructive">
                                            {withdrawalErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { label: '25%', fraction: 0.25 },
                                        { label: '50%', fraction: 0.5 },
                                        { label: 'Max', fraction: 1 },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={() =>
                                                setQuickAmount(option.fraction)
                                            }
                                            className="h-[34px] rounded-full border border-[#0E3B2E]/15 px-3 text-xs font-bold text-foreground hover:bg-muted dark:border-white/15"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 rounded-[14px] bg-muted/60 px-3.5 py-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#0E3B2E] text-[#C8F169]">
                                        <KeenIcon
                                            name="cheque"
                                            className="text-xl"
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-bold text-foreground">
                                            {bankAccount?.bank_name}{' '}
                                            {bankAccount?.account_number_masked}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {bankAccount?.account_name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddBank(true)}
                                        className="text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                                    >
                                        Change
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!canWithdraw}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-sm font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                >
                                    {processingWithdrawal && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    {amountValue >= 100
                                        ? `Withdraw ${naira(amountValue)}`
                                        : 'Withdraw'}
                                </button>
                                <span className="text-center text-xs text-muted-foreground">
                                    Maximum {naira(wallet.available_balance)}.
                                </span>
                            </form>
                        )}
                    </section>
                </div>

                {/* History */}
                <section className="overflow-hidden rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
                    <div className="px-[22px] py-[18px]">
                        <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                            Withdrawal history
                        </h2>
                    </div>
                    {withdrawals.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 border-t border-[#0E3B2E]/[0.07] py-12 text-center dark:border-white/10">
                            <KeenIcon
                                name="receipt-square"
                                className="text-3xl text-[#A9C7B8]"
                            />
                            <span className="text-sm font-semibold text-foreground">
                                No withdrawals yet
                            </span>
                            <span className="text-[13px] text-muted-foreground">
                                Your payouts will show up here.
                            </span>
                        </div>
                    ) : (
                        <ul>
                            {withdrawals.data.map((withdrawal) => (
                                <li
                                    key={withdrawal.id}
                                    className="flex flex-wrap items-center gap-4 border-t border-[#0E3B2E]/[0.07] px-[22px] py-3.5 dark:border-white/10"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-[#0E3B2E] dark:text-[#C8F169]">
                                        <KeenIcon
                                            name="arrow-up"
                                            className="text-lg"
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                                        <span className="text-sm font-bold text-foreground">
                                            {withdrawal.description ||
                                                'Withdrawal to bank'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {withdrawal.created_at}
                                            {withdrawal.reference &&
                                                ` · ${withdrawal.reference}`}
                                        </span>
                                    </div>
                                    <span className="font-[Sora] text-[15px] font-bold text-foreground">
                                        {naira(withdrawal.amount)}
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${statusStyle[withdrawal.status] ?? 'bg-muted text-muted-foreground'}`}
                                    >
                                        {withdrawal.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            withdrawal.status.slice(1)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {withdrawals.links && withdrawals.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#0E3B2E]/[0.07] px-[22px] py-4 dark:border-white/10">
                            <span className="text-[13px] text-muted-foreground">
                                Showing {withdrawals.meta?.from} to{' '}
                                {withdrawals.meta?.to} of{' '}
                                {withdrawals.meta?.total}
                            </span>
                            <div className="flex gap-2">
                                {withdrawals.links.map(
                                    (
                                        link: {
                                            url: string | null;
                                            label: string;
                                            active: boolean;
                                        },
                                        index: number,
                                    ) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url)
                                            }
                                            className={`h-10 min-w-10 rounded-[10px] px-3 text-sm font-bold disabled:opacity-40 ${
                                                link.active
                                                    ? 'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                                    : 'border border-[#0E3B2E]/12 bg-card text-foreground hover:bg-muted dark:border-white/15'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
