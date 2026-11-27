import { EmptyState } from '@/components/site/empty-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import AccountLayout from '@/layouts/account-layout';
import { cn } from '@/lib/utils';
import walletRoutes from '@/routes/wallet';
import { recipient as withdrawRecipient } from '@/routes/wallet/client/withdraw';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Copy, Loader2, Lock, Minus, Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface WalletData {
    balance: number;
    escrow_balance: number;
    available_balance: number;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    status: string;
    description: string;
    created_at: string;
    date_label: string;
    business_name?: string | null;
    is_held: boolean;
    appointment_id?: string | null;
    reference?: string;
}

interface HeldBooking {
    id: string;
    service_name: string;
    business_name: string | null;
    amount: number;
    month: string;
    day: string;
}

interface Bank {
    code: string;
    name: string;
}

interface BankAccount {
    recipient_code: string;
    bank_name: string;
    account_name: string;
    account_number_masked: string;
}

interface Paginated<T> {
    data: T[];
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    wallet: WalletData;
    transactions: Paginated<Transaction>;
    heldBookings: HeldBooking[];
    banks?: Bank[];
    bankAccount?: BankAccount | null;
    paymentProvider: string;
    payengineWallet: {
        is_configured: boolean;
        account_number: string | null;
        status: string | null;
        bank_name: string | null;
        account_name: string;
    };
}

type TransactionFilter = 'all' | 'in' | 'out';

const TRANSACTION_FILTERS: Array<{ key: TransactionFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'Money in' },
    { key: 'out', label: 'Money out' },
];

const HOLD_TYPES = ['payment_hold', 'escrow_hold'];

const cardClass = 'rounded-[20px] border border-line bg-white p-6';

const chipClass =
    'h-10 rounded-full px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest';

const primaryButtonClass =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-bold text-white transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-forest/40';

const outlineButtonClass =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink transition hover:bg-paper';

function formatNaira(amount: number): string {
    return `₦${Math.abs(Number(amount) || 0).toLocaleString('en-NG', {
        maximumFractionDigits: 0,
    })}`;
}

function isMoneyIn(transaction: Transaction): boolean {
    return !HOLD_TYPES.includes(transaction.type) && transaction.amount > 0;
}

function transactionKind(type: string): string {
    const kinds: Record<string, string> = {
        deposit: 'Top-up',
        withdrawal: 'Withdrawal',
        escrow_hold: 'Booking deposit',
        payment_hold: 'Booking deposit',
        escrow_release: 'Booking payment',
        payment_release: 'Booking payment',
        escrow_refund: 'Refund',
        refund: 'Refund',
        escrow_forfeit: 'Forfeited deposit',
    };

    return kinds[type] ?? type.replace(/_/g, ' ');
}

function transactionTitle(
    transaction: Transaction,
    paymentProvider: string,
): string {
    const business = transaction.business_name;

    switch (transaction.type) {
        case 'deposit':
            return paymentProvider === 'payengine'
                ? 'Bank transfer top-up'
                : 'Card top-up';
        case 'withdrawal':
            return 'Withdrawal to bank';
        case 'escrow_hold':
        case 'payment_hold':
            return business ? `Deposit — ${business}` : 'Booking deposit';
        case 'escrow_refund':
        case 'refund':
            return business ? `Refund — ${business}` : 'Refund';
        default:
            return business ?? transaction.description ?? 'Transaction';
    }
}

function TransactionStatus({ transaction }: { transaction: Transaction }) {
    if (transaction.is_held) {
        return (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                Held
            </span>
        );
    }

    const styles: Record<string, string> = {
        completed: 'bg-mint text-leaf',
        pending: 'bg-paper text-moss',
        failed: 'bg-red-50 text-red-700',
    };

    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
                styles[transaction.status] ?? 'bg-paper text-moss',
            )}
        >
            {transaction.status}
        </span>
    );
}

export default function WalletIndex({
    wallet,
    transactions,
    heldBookings = [],
    banks = [],
    bankAccount = null,
    paymentProvider,
    payengineWallet,
}: Props) {
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [filter, setFilter] = useState<TransactionFilter>('all');
    const topUpRef = useRef<HTMLElement>(null);
    const topUpInputRef = useRef<HTMLInputElement>(null);

    const usesPayEngine = paymentProvider === 'payengine';
    const hasBankAccount = !!bankAccount;
    const [wholeBalance, balanceKobo] = Number(wallet.balance || 0)
        .toFixed(2)
        .split('.');

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
        reset: resetBank,
    } = useForm({
        account_number: '',
        bank_code: '',
        account_name: '',
        bank_name: '',
    });

    const filteredTransactions = useMemo(
        () =>
            transactions.data.filter((transaction) => {
                if (filter === 'all') {
                    return true;
                }

                return filter === 'in'
                    ? isMoneyIn(transaction)
                    : !isMoneyIn(transaction);
            }),
        [transactions.data, filter],
    );

    const scrollToTopUp = () => {
        topUpRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        topUpInputRef.current?.focus({ preventScroll: true });
    };

    const handleTopUp = (event: React.FormEvent) => {
        event.preventDefault();
        const amount = parseFloat(topUpAmount);

        if (!amount || amount < 100 || amount > 1000000) {
            toast.error('Enter an amount between ₦100 and ₦1,000,000.');

            return;
        }

        setIsProcessing(true);
        router.post(
            walletRoutes.topUp.initialize.url(),
            { amount },
            { onFinish: () => setIsProcessing(false) },
        );
    };

    const copyAccountNumber = async () => {
        if (!payengineWallet.account_number) {
            return;
        }

        try {
            await navigator.clipboard.writeText(payengineWallet.account_number);
            toast.success('Account number copied');
        } catch {
            toast.error('Could not copy the account number.');
        }
    };

    const handleAddOrUpdateBank = (event: React.FormEvent) => {
        event.preventDefault();
        const bankName =
            banks.find((bank) => bank.code === bankData.bank_code)?.name ?? '';

        if (!bankName) {
            toast.error('Please select a valid bank');

            return;
        }

        transformBank((data) => ({ ...data, bank_name: bankName }));
        postBank(withdrawRecipient.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddBank(false);
                resetBank();
            },
        });
    };

    const handleWithdraw = (event: React.FormEvent) => {
        event.preventDefault();

        if (bankAccount) {
            transformWithdrawal((data) => ({
                ...data,
                recipient_code: bankAccount.recipient_code,
                account_name: bankAccount.account_name,
                bank_name: bankAccount.bank_name,
            }));
        }

        postWithdrawal(walletRoutes.client.withdraw.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setWithdrawalData('amount', '');
                setIsWithdrawOpen(false);
            },
        });
    };

    const withdrawAmount = parseFloat(withdrawalData.amount);
    const canSubmitWithdrawal =
        !processingWithdrawal &&
        withdrawAmount >= 100 &&
        withdrawAmount <= wallet.available_balance;

    return (
        <AccountLayout
            active="wallet"
            title="Wallet"
            description="Top up once, pay deposits in a tap, get refunds back instantly."
        >
            <Head title="My Wallet" />

            <section className="relative overflow-hidden rounded-[28px] bg-forest-deep text-white">
                <img
                    src="/brand/banners/proxideck-banner-general-dark.jpg"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full object-cover"
                />
                <div className="relative flex flex-wrap items-end justify-between gap-8 bg-forest-deep/60 p-7 sm:p-9">
                    <div>
                        <p className="text-[15px] text-[#C9E2D3]">
                            Total balance
                        </p>
                        <p className="mt-2 text-5xl leading-none font-bold tracking-tight sm:text-[64px]">
                            ₦{Number(wholeBalance).toLocaleString('en-NG')}
                            <span className="text-2xl font-semibold text-sage sm:text-3xl">
                                .{balanceKobo}
                            </span>
                        </p>
                        <div className="mt-5 flex flex-wrap gap-6">
                            <div>
                                <p className="text-[13px] text-sage">
                                    Available
                                </p>
                                <p className="text-xl font-bold">
                                    {formatNaira(wallet.available_balance)}
                                </p>
                            </div>
                            <div className="w-px bg-white/20" aria-hidden />
                            <div>
                                <p className="inline-flex items-center gap-1 text-[13px] text-sage">
                                    <Lock className="size-3" aria-hidden />
                                    Held for bookings
                                </p>
                                <p className="text-xl font-bold text-lime">
                                    {formatNaira(wallet.escrow_balance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {usesPayEngine && !payengineWallet.is_configured ? (
                            <Link
                                href={walletRoutes.payengine.setup.url()}
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-bold text-forest transition hover:brightness-95"
                            >
                                <Plus className="size-4" />
                                Add money
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={scrollToTopUp}
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-bold text-forest transition hover:brightness-95"
                            >
                                <Plus className="size-4" />
                                Add money
                            </button>
                        )}
                        {!usesPayEngine && (
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(true)}
                                disabled={wallet.available_balance <= 0}
                                className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Withdraw
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
                <section ref={topUpRef} className={cardClass}>
                    {usesPayEngine ? (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold">
                                    Top up by bank transfer
                                </h2>
                                <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-leaf">
                                    Instant
                                </span>
                            </div>
                            {payengineWallet.is_configured ? (
                                <>
                                    <dl className="mt-4 space-y-3 rounded-2xl bg-paper px-4 py-4 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-moss">Bank</dt>
                                            <dd className="font-semibold">
                                                {payengineWallet.bank_name ??
                                                    'Partner bank'}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-moss">
                                                Account number
                                            </dt>
                                            <dd className="flex items-center gap-2">
                                                <span className="text-lg font-bold tracking-wide">
                                                    {
                                                        payengineWallet.account_number
                                                    }
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={copyAccountNumber}
                                                    aria-label="Copy account number"
                                                    className="grid size-8 place-items-center rounded-lg border border-line bg-white transition hover:bg-paper"
                                                >
                                                    <Copy className="size-3.5" />
                                                </button>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-moss">Name</dt>
                                            <dd className="text-right font-semibold">
                                                {payengineWallet.account_name}
                                            </dd>
                                        </div>
                                    </dl>
                                    <p className="mt-4 text-xs text-moss">
                                        Money sent to this account lands in your
                                        wallet within a minute.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="mt-3 text-sm text-moss">
                                        Get your own account number. Money you
                                        send to it lands in your wallet within a
                                        minute.
                                    </p>
                                    <Link
                                        href={walletRoutes.payengine.setup.url()}
                                        className={cn(
                                            primaryButtonClass,
                                            'mt-5',
                                        )}
                                    >
                                        Set up account number
                                    </Link>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold">
                                    Top up by card
                                </h2>
                                <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-leaf">
                                    Instant
                                </span>
                            </div>
                            <form
                                onSubmit={handleTopUp}
                                className="mt-4 rounded-2xl bg-paper p-4"
                            >
                                <Label htmlFor="amount" className="text-moss">
                                    Amount (₦)
                                </Label>
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        ref={topUpInputRef}
                                        id="amount"
                                        type="number"
                                        min="100"
                                        step="100"
                                        value={topUpAmount}
                                        onChange={(event) =>
                                            setTopUpAmount(event.target.value)
                                        }
                                        placeholder="e.g. 20000"
                                        className="h-12 rounded-full bg-white px-4"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            isProcessing ||
                                            !topUpAmount ||
                                            parseFloat(topUpAmount) < 100
                                        }
                                        className={cn(
                                            primaryButtonClass,
                                            'shrink-0',
                                        )}
                                    >
                                        {isProcessing && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}
                                        Top up
                                    </button>
                                </div>
                            </form>
                            <p className="mt-4 text-xs text-moss">
                                Minimum ₦100. You'll finish paying on Paystack.
                            </p>
                        </>
                    )}
                </section>

                <section className={cardClass}>
                    <h2 className="text-lg font-bold">
                        Held for upcoming bookings
                    </h2>
                    {heldBookings.length === 0 ? (
                        <p className="mt-4 rounded-2xl bg-paper px-4 py-5 text-sm text-moss">
                            Nothing held right now. Deposits for your next
                            bookings will show here.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {heldBookings.map((booking) => (
                                <li
                                    key={booking.id}
                                    className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-3"
                                >
                                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest text-center leading-none text-white">
                                        <span>
                                            <span className="block text-[9px] font-bold text-lime uppercase">
                                                {booking.month}
                                            </span>
                                            <span className="block text-base font-bold text-lime">
                                                {booking.day}
                                            </span>
                                        </span>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {booking.service_name}
                                        </p>
                                        <p className="truncate text-xs text-moss">
                                            {booking.business_name &&
                                                `${booking.business_name} · `}
                                            releases after appointment
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-bold">
                                        {formatNaira(booking.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="mt-4 text-xs leading-5 text-moss">
                        If the pro cancels or doesn&rsquo;t show, held money
                        goes straight back to Available.
                    </p>
                </section>
            </div>

            <section aria-labelledby="transactions-heading" className="mt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="transactions-heading"
                        className="text-[22px] font-bold tracking-tight"
                    >
                        Transactions
                    </h2>
                    <div
                        role="tablist"
                        aria-label="Filter transactions"
                        className="flex gap-2"
                    >
                        {TRANSACTION_FILTERS.map((option) => {
                            const isActive = filter === option.key;

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setFilter(option.key)}
                                    className={cn(
                                        chipClass,
                                        isActive
                                            ? 'bg-forest text-white'
                                            : 'border border-line bg-white hover:bg-paper',
                                    )}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filteredTransactions.length === 0 ? (
                    <EmptyState
                        illustration="wallet"
                        title={
                            transactions.data.length === 0
                                ? 'No transactions yet'
                                : 'Nothing here'
                        }
                        description={
                            transactions.data.length === 0
                                ? 'Top up once and pay deposits in a tap. Refunds land back here instantly.'
                                : 'No transactions match this filter on this page.'
                        }
                        className="mt-4 rounded-[20px] border border-line py-10"
                    />
                ) : (
                    <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-white">
                        {filteredTransactions.map((transaction) => {
                            const moneyIn = isMoneyIn(transaction);

                            return (
                                <li
                                    key={transaction.id}
                                    className="flex items-center gap-4 px-5 py-4"
                                >
                                    <span
                                        aria-hidden
                                        className={cn(
                                            'grid size-10 shrink-0 place-items-center rounded-xl',
                                            transaction.is_held
                                                ? 'bg-lime text-forest'
                                                : moneyIn
                                                  ? 'bg-mint text-leaf'
                                                  : 'bg-paper text-ink',
                                        )}
                                    >
                                        {transaction.is_held ? (
                                            <span className="size-1.5 rounded-full bg-forest" />
                                        ) : moneyIn ? (
                                            <Plus className="size-4" />
                                        ) : (
                                            <Minus className="size-4" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[15px] font-semibold">
                                            {transactionTitle(
                                                transaction,
                                                paymentProvider,
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-moss">
                                            {transaction.date_label} ·{' '}
                                            {transactionKind(transaction.type)}
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-flex">
                                        <TransactionStatus
                                            transaction={transaction}
                                        />
                                    </span>
                                    <span
                                        className={cn(
                                            'w-24 shrink-0 text-right text-[15px] font-bold',
                                            moneyIn ? 'text-leaf' : 'text-ink',
                                        )}
                                    >
                                        {moneyIn ? '+' : '−'}
                                        {formatNaira(transaction.amount)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {(transactions.prev_page_url || transactions.next_page_url) && (
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-moss">
                        <span>
                            {transactions.from}–{transactions.to} of{' '}
                            {transactions.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!transactions.prev_page_url}
                                onClick={() =>
                                    transactions.prev_page_url &&
                                    router.visit(transactions.prev_page_url, {
                                        preserveScroll: true,
                                    })
                                }
                                className={cn(
                                    outlineButtonClass,
                                    'h-10 disabled:opacity-40',
                                )}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={!transactions.next_page_url}
                                onClick={() =>
                                    transactions.next_page_url &&
                                    router.visit(transactions.next_page_url, {
                                        preserveScroll: true,
                                    })
                                }
                                className={cn(
                                    outlineButtonClass,
                                    'h-10 disabled:opacity-40',
                                )}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {!usesPayEngine && (
                <Dialog
                    open={isWithdrawOpen}
                    onOpenChange={(open) => {
                        setIsWithdrawOpen(open);

                        if (!open) {
                            setShowAddBank(false);
                        }
                    }}
                >
                    <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {showAddBank || !hasBankAccount
                                    ? 'Add a bank account'
                                    : 'Withdraw to your bank'}
                            </DialogTitle>
                            <DialogDescription>
                                Available to withdraw:{' '}
                                {formatNaira(wallet.available_balance)}
                            </DialogDescription>
                        </DialogHeader>

                        {showAddBank || !hasBankAccount ? (
                            <form
                                onSubmit={handleAddOrUpdateBank}
                                className="space-y-4"
                            >
                                <SearchableSelect
                                    label="Bank"
                                    value={bankData.bank_code}
                                    onChange={(value) =>
                                        setBankData('bank_code', value)
                                    }
                                    options={banks.map((bank) => ({
                                        value: bank.code,
                                        label: bank.name,
                                    }))}
                                    placeholder="Select bank"
                                    searchPlaceholder="Search banks..."
                                    error={bankErrors.bank_code}
                                />
                                <div>
                                    <Label htmlFor="account_number">
                                        Account number
                                    </Label>
                                    <Input
                                        id="account_number"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={bankData.account_number}
                                        onChange={(event) =>
                                            setBankData(
                                                'account_number',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="10-digit account number"
                                    />
                                    {bankErrors.account_number && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {bankErrors.account_number}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="account_name">
                                        Account name
                                    </Label>
                                    <Input
                                        id="account_name"
                                        type="text"
                                        value={bankData.account_name}
                                        onChange={(event) =>
                                            setBankData(
                                                'account_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Name on the account"
                                    />
                                    {bankErrors.account_name && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {bankErrors.account_name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processingBank}
                                        className={cn(
                                            primaryButtonClass,
                                            'flex-1',
                                        )}
                                    >
                                        {processingBank && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}
                                        {hasBankAccount
                                            ? 'Update bank account'
                                            : 'Add bank account'}
                                    </button>
                                    {hasBankAccount && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddBank(false);
                                                resetBank();
                                            }}
                                            className={outlineButtonClass}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleWithdraw}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="withdraw_amount">
                                        Amount (₦)
                                    </Label>
                                    <Input
                                        id="withdraw_amount"
                                        type="number"
                                        min="100"
                                        step="100"
                                        max={wallet.available_balance}
                                        value={withdrawalData.amount}
                                        onChange={(event) =>
                                            setWithdrawalData(
                                                'amount',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Minimum ₦100"
                                        required
                                    />
                                    {withdrawalErrors.amount && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {withdrawalErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-semibold">
                                            {bankAccount?.bank_name}
                                        </p>
                                        <p className="truncate text-moss">
                                            {bankAccount?.account_name} · ****
                                            {bankAccount?.account_number_masked}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddBank(true)}
                                        className="shrink-0 font-semibold text-forest underline underline-offset-2"
                                    >
                                        Change
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!canSubmitWithdrawal}
                                    className={cn(primaryButtonClass, 'w-full')}
                                >
                                    {processingWithdrawal && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Withdraw
                                </button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </AccountLayout>
    );
}
