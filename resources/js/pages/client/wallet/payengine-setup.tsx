import { AppSelect } from '@/components/ui/app-select';
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
import AppLayout from '@/layouts/guest-layout';
import payengine from '@/routes/wallet/payengine';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface WalletDetails {
    is_configured: boolean;
    account_number: string | null;
    status: string | null;
}

interface Props {
    wallet: WalletDetails;
}

export default function PayEngineSetup({ wallet }: Props) {
    const form = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_number: '',
        gender: '',
        date_of_birth: '',
        bvn: '',
        nin: '',
        consent: false,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(payengine.setup.store.url());
    }

    return (
        <AppLayout>
            <Head title="Set up your wallet" />
            <main className="mx-auto w-full max-w-2xl px-4 py-8">
                <Link
                    href="/wallet"
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    Back to wallet
                </Link>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>PayEngine virtual account</CardTitle>
                        <CardDescription>
                            Set up a dedicated Nigerian bank account for wallet
                            deposits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {wallet.is_configured ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Account number
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {wallet.account_number}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Transfers to this account will be added to
                                    your Proxideck wallet after PayEngine
                                    confirms settlement.
                                </p>
                                <Button asChild>
                                    <Link href="/wallet">Return to wallet</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <p className="mb-6 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                    PayEngine requires identity verification.
                                    Your BVN and optional NIN are sent securely
                                    to PayEngine for verification and are not
                                    stored by Proxideck.
                                </p>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                Legal first name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                autoComplete="given-name"
                                                value={form.data.first_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'first_name',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors.first_name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.first_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">
                                                Legal last name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                autoComplete="family-name"
                                                value={form.data.last_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'last_name',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors.last_name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.last_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="middle_name">
                                                Middle name (optional)
                                            </Label>
                                            <Input
                                                id="middle_name"
                                                autoComplete="additional-name"
                                                value={form.data.middle_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'middle_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.middle_name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.middle_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number">
                                                Phone number
                                            </Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="08012345678"
                                                value={form.data.phone_number}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone_number',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors.phone_number && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.phone_number}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">
                                                Gender (optional)
                                            </Label>
                                            <AppSelect
                                                id="gender"
                                                value={form.data.gender}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'gender',
                                                        value,
                                                    )
                                                }
                                                placeholder="Select"
                                                size="sm"
                                                searchable={false}
                                                options={[
                                                    {
                                                        value: 'male',
                                                        label: 'Male',
                                                    },
                                                    {
                                                        value: 'female',
                                                        label: 'Female',
                                                    },
                                                ]}
                                            />
                                            {form.errors.gender && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.gender}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth">
                                                Date of birth (optional)
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                autoComplete="bday"
                                                value={form.data.date_of_birth}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'date_of_birth',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.date_of_birth && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.date_of_birth}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bvn">BVN</Label>
                                            <Input
                                                id="bvn"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                maxLength={11}
                                                value={form.data.bvn}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'bvn',
                                                        event.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        ),
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors.bvn && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.bvn}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nin">
                                                NIN (optional)
                                            </Label>
                                            <Input
                                                id="nin"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                maxLength={11}
                                                value={form.data.nin}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'nin',
                                                        event.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        ),
                                                    )
                                                }
                                            />
                                            {form.errors.nin && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.nin}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.consent}
                                            onChange={(event) =>
                                                form.setData(
                                                    'consent',
                                                    event.target.checked,
                                                )
                                            }
                                            required
                                            className="mt-1"
                                        />
                                        <span>
                                            I consent to Proxideck sending the
                                            details above to PayEngine to verify
                                            my identity and create a virtual
                                            account.
                                        </span>
                                    </label>
                                    {form.errors.consent && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.consent}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={
                                            form.processing ||
                                            !form.data.consent
                                        }
                                    >
                                        {form.processing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {form.processing
                                            ? 'Setting up account...'
                                            : 'Create virtual account'}
                                    </Button>
                                </form>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
