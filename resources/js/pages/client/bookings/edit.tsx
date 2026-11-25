import { formatNaira } from '@/components/site/provider-card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import GuestLayout from '@/layouts/guest-layout';
import appointments from '@/routes/appointments';
import client from '@/routes/client';
import wallet from '@/routes/wallet';
import { ServicePicker } from '@/pages/marketplace/booking/components/service-picker';
import type { Service, ServiceTeamMembers, TeamMember } from '@/pages/marketplace/booking/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { gooeyToast as toast } from 'goey-toast';
import { ChevronLeft, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AppointmentPayload {
    id: string;
    start_time: string;
    end_time?: string | null;
    notes?: string | null;
    price: number;
    service_ids: string[];
    payment_method?: 'online' | 'offline' | null;
    escrow_status?: string | null;
}

interface ProviderPayload {
    id: string;
    name: string;
    businessName: string;
    slug: string;
}

interface Props {
    appointment: AppointmentPayload;
    provider: ProviderPayload;
    services: Service[];
    teamMembers: TeamMember[];
    serviceTeamMembers: ServiceTeamMembers;
    walletBalance: number;
    policy: { changeCutoffHours: number };
}

export default function EditBooking({
    appointment,
    provider,
    services,
    teamMembers,
    serviceTeamMembers: initialServiceTeamMembers,
    walletBalance,
    policy,
}: Props) {
    const start = new Date(appointment.start_time);

    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(appointment.service_ids);
    const [serviceTeamMembers, setServiceTeamMembers] = useState<ServiceTeamMembers>(initialServiceTeamMembers);
    const [notes, setNotes] = useState(appointment.notes ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [walletDialogOpen, setWalletDialogOpen] = useState(false);

    const originalPrice = appointment.price;
    const newTotalPrice = useMemo(
        () => services.filter((service) => selectedServiceIds.includes(service.id)).reduce((sum, service) => sum + Number(service.price), 0),
        [services, selectedServiceIds],
    );
    const priceDifference = newTotalPrice - originalPrice;
    const escrowHeld = appointment.escrow_status === 'held' && appointment.payment_method === 'online';

    const toggleService = (id: string) => {
        setSelectedServiceIds((previous) => (previous.includes(id) ? previous.filter((serviceId) => serviceId !== id) : [...previous, id]));
    };

    const changeServiceTeamMember = (serviceId: string, teamMemberId: string) => {
        setServiceTeamMembers((previous) => ({ ...previous, [serviceId]: teamMemberId }));
    };

    const buildPayload = () => {
        const pros = selectedServiceIds.map((id) => serviceTeamMembers[id] || '');
        const sharedPro = pros.every((pro) => pro === pros[0]) ? pros[0] || null : null;

        return {
            service_ids: selectedServiceIds,
            start_time: appointment.start_time,
            notes,
            team_member_id: sharedPro,
            service_team_members: Object.fromEntries(selectedServiceIds.map((id) => [id, serviceTeamMembers[id] || null])),
        };
    };

    const trySave = () => {
        if (selectedServiceIds.length === 0) {
            toast.error('Choose at least one service.');

            return;
        }

        if (escrowHeld && priceDifference > 0 && walletBalance < priceDifference) {
            setWalletDialogOpen(true);

            return;
        }

        setConfirmOpen(true);
    };

    const submit = () => {
        setSubmitting(true);
        router.put(`/appointments/${appointment.id}`, buildPayload(), {
            onError: (errors) => {
                const first = Object.values(errors)[0];
                toast.error(typeof first === 'string' ? first : 'We could not save your changes. Please try again.');
            },
            onFinish: () => {
                setSubmitting(false);
                setConfirmOpen(false);
            },
        });
    };

    const confirmDescription =
        priceDifference > 0 && escrowHeld
            ? `Your new total is ${formatNaira(newTotalPrice)} — ${formatNaira(priceDifference)} more than before. The extra amount will be held in escrow.`
            : priceDifference < 0 && escrowHeld
              ? `Your new total is ${formatNaira(newTotalPrice)}. ${formatNaira(Math.abs(priceDifference))} goes back to your wallet.`
              : `Your visit stays on ${format(start, 'EEE d MMM')} at ${format(start, 'h:mm a')}. We'll update your services and note.`;

    return (
        <GuestLayout>
            <Head title={`Edit booking · ${provider.businessName}`} />

            <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-8 pb-24 sm:px-6">
                <Link href={client.bookings.show(appointment.id)} className="flex items-center gap-2 self-start text-[15px] font-semibold text-moss">
                    <ChevronLeft className="size-4" /> Booking details
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-[13px] font-bold text-moss">EDIT BOOKING</p>
                        <h1 className="text-4xl font-bold tracking-tight">Change services or your note</h1>
                        <p className="max-w-xl text-[15px] leading-relaxed text-moss">
                            Need a different day or time?{' '}
                            <Link href={appointments.reschedule(appointment.id).url} className="font-semibold text-forest underline">
                                Reschedule
                            </Link>{' '}
                            from your booking details instead.
                        </p>
                    </div>
                    <ReservedDateCard start={start} providerName={provider.businessName} />
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-8">
                        <section className="flex flex-col gap-5">
                            <h2 className="text-[22px] font-bold tracking-tight">What you’re booking</h2>
                            <ServicePicker
                                services={services}
                                selectedServiceIds={selectedServiceIds}
                                onToggleService={toggleService}
                                teamMembers={teamMembers}
                                serviceTeamMembers={serviceTeamMembers}
                                onServiceTeamMemberChange={changeServiceTeamMember}
                                nextAvailability={{}}
                                canBookProvider
                            />
                        </section>

                        <section className="flex flex-col gap-3 rounded-3xl border border-line p-6">
                            <label className="text-[15px] font-bold" htmlFor="booking-note">
                                Note for {provider.businessName}
                            </label>
                            <Textarea
                                id="booking-note"
                                rows={4}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Anything your pro should know before you arrive?"
                                className="min-h-28 resize-none rounded-2xl border-[#DDE3DE] text-[15px]"
                            />
                        </section>
                    </div>

                    <aside className="w-full shrink-0 lg:sticky lg:top-8 lg:w-95">
                        <div className="flex flex-col gap-5 rounded-3xl bg-forest p-6 text-white">
                            <h2 className="text-xl font-bold">Updated total</h2>

                            <div className="flex flex-col gap-3 text-[15px]">
                                {services
                                    .filter((service) => selectedServiceIds.includes(service.id))
                                    .map((service) => (
                                        <div key={service.id} className="flex justify-between gap-4">
                                            <span className="text-[#C9E2D3] capitalize">{service.name}</span>
                                            <span className="font-semibold">{formatNaira(service.price)}</span>
                                        </div>
                                    ))}
                            </div>

                            <div className="flex justify-between border-t border-white/15 pt-3.5 text-lg font-bold">
                                <span>Total</span>
                                <span className="text-lime">{formatNaira(newTotalPrice)}</span>
                            </div>

                            {priceDifference !== 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#C9E2D3]">Was</span>
                                    <span>{formatNaira(originalPrice)}</span>
                                </div>
                            )}

                            {escrowHeld && priceDifference !== 0 && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-lime/12 px-3.5 py-3 text-[13px] leading-snug text-[#E3EFE8]">
                                    <Lock className="size-4 shrink-0 text-lime" />
                                    <span>
                                        {priceDifference > 0
                                            ? `${formatNaira(priceDifference)} more will be held in escrow.`
                                            : `${formatNaira(Math.abs(priceDifference))} will return to your wallet.`}
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={submitting || selectedServiceIds.length === 0}
                                onClick={trySave}
                                className="h-12.5 rounded-full bg-lime text-[15px] font-bold text-forest disabled:opacity-50"
                            >
                                {submitting ? 'Saving…' : 'Save changes'}
                            </button>

                            <p className="text-center text-xs text-sage">
                                You can edit up to {policy.changeCutoffHours} hours before your visit starts.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="rounded-3xl p-7 font-heading sm:max-w-md">
                    <DialogTitle className="text-[22px] font-bold">Save these changes?</DialogTitle>
                    <DialogDescription className="text-[15px] leading-relaxed text-moss">{confirmDescription}</DialogDescription>
                    <div className="mt-2 flex gap-2.5">
                        <button type="button" onClick={() => setConfirmOpen(false)} className="h-12 flex-1 rounded-full border border-[#DDE3DE] font-bold">
                            Go back
                        </button>
                        <button type="button" disabled={submitting} onClick={submit} className="h-12 flex-1 rounded-full bg-forest font-bold text-white disabled:opacity-50">
                            {submitting ? 'Saving…' : 'Yes, save'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
                <DialogContent className="rounded-3xl p-7 font-heading sm:max-w-md">
                    <DialogTitle className="text-[22px] font-bold">Top up your wallet</DialogTitle>
                    <DialogDescription className="text-[15px] leading-relaxed text-moss">
                        You need {formatNaira(priceDifference - walletBalance)} more to cover the higher total before we can save your changes.
                    </DialogDescription>
                    <div className="mt-2 flex gap-2.5">
                        <button type="button" onClick={() => setWalletDialogOpen(false)} className="h-12 flex-1 rounded-full border border-[#DDE3DE] font-bold">
                            Cancel
                        </button>
                        <Link href={wallet.index()} className="flex h-12 flex-1 items-center justify-center rounded-full bg-forest font-bold text-white">
                            Open wallet
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}

function ReservedDateCard({ start, providerName }: { start: Date; providerName: string }) {
    return (
        <div className="rounded-3xl border border-line bg-paper px-5 py-4">
            <p className="text-[13px] font-bold text-moss">Your scheduled visit</p>
            <p className="mt-1 text-lg font-bold">
                {format(start, 'EEE d MMM')} · {format(start, 'h:mm a')}
            </p>
            <p className="mt-0.5 text-sm text-moss">at {providerName}</p>
        </div>
    );
}
