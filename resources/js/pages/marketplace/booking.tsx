import { formatNaira } from '@/components/site/provider-card';
import { Input } from '@/components/ui/input';
import ToastNotification from '@/components/ui/toast-notification';
import {
    allowsHomeService,
    allowsVisitProvider,
    isValidAddressChoiceForMode,
    normalizeDeliveryMode,
    requiresClientServiceAddress,
    type ServiceDeliveryMode,
    VISIT_PROVIDER_CHOICE,
} from '@/lib/service-delivery-mode';
import bookingWaitlist from '@/routes/booking-waitlist';
import promoCodes from '@/routes/promo-codes';
import { show as providerShow } from '@/routes/provider';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { addDays, addMinutes, format, isSameDay, isValid, parseISO, startOfDay, startOfWeek, subHours } from 'date-fns';
import { gooeyToast as toast } from 'goey-toast';
import { Suspense, lazy, useMemo, useState } from 'react';

import type { BusinessAddressOption, ClientAddressOption } from './components/address-dialogs';
import { BookingAssurances } from './booking/components/booking-assurances';
import { BookingBlockedBanner } from './booking/components/booking-blocked-banner';
import { BookingSidebar, type BookingProvider } from './booking/components/booking-sidebar';
import { LocationChoice } from './booking/components/location-choice';
import { PaySection } from './booking/components/pay-section';
import { ServicePicker } from './booking/components/service-picker';
import { SlotList } from './booking/components/slot-list';
import { type BookingStep, StepHeader } from './booking/components/step-header';
import { VisitExtras } from './booking/components/visit-extras';
import { type VisitSegment, VisitPass } from './booking/components/visit-pass';
import { WaitlistCallout } from './booking/components/waitlist-callout';
import { WeekStrip } from './booking/components/week-strip';
import { distanceInKm, estimateDriveMinutes } from './booking/format';
import { useNextAvailability, useWeekAvailability } from './booking/hooks/use-booking-availability';
import { useBookingPricing } from './booking/hooks/use-booking-pricing';
import { useBookingSlots } from './booking/hooks/use-booking-slots';
import { useBookingSubmit } from './booking/hooks/use-booking-submit';
import { useClientAddresses } from './booking/hooks/use-client-addresses';
import type {
    AppliedPromo,
    BookingPayload,
    PaymentOption,
    ProviderSettings,
    RecurrencePattern,
    Service,
    ServiceTeamMembers,
    TeamMember,
} from './booking/types';

const AddressDialogs = lazy(() => import('./components/address-dialogs'));

interface Props {
    provider: BookingProvider;
    closedDays?: string[];
    popularHours?: number[];
    waitlistDates?: string[];
    cancellationCutoffHours?: number;
    services: Service[];
    teamMembers: TeamMember[];
    clientAddresses: ClientAddressOption[];
    businessAddressOption?: BusinessAddressOption | null;
    walletBalance?: number | null;
    settings?: ProviderSettings;
    recurringDiscountPercent?: number;
}

type StepKey = 'services' | 'time' | 'confirm';

const STEPS: BookingStep[] = [
    { key: 'services', label: 'Services' },
    { key: 'time', label: 'Time' },
    { key: 'confirm', label: 'Confirm' },
];

const DEFAULT_SETTINGS: ProviderSettings = {
    advanceBooking: 30,
    minNotice: null,
    allowSameDay: false,
    autoConfirm: false,
    allowOffHoursRequests: false,
    max_bookings_per_week: null,
    max_bookings_per_month: null,
    accept_online_payment: true,
    accept_offline_booking: false,
    offers_home_service: false,
    service_delivery_mode: 'client_visits_provider',
    home_service_fee: null,
};

export default function Booking({
    provider,
    closedDays = [],
    popularHours = [],
    waitlistDates = [],
    cancellationCutoffHours = 12,
    services,
    teamMembers,
    clientAddresses: initialClientAddresses,
    businessAddressOption,
    walletBalance,
    settings,
    recurringDiscountPercent = 10,
}: Props) {
    const providerSettings: ProviderSettings = settings || DEFAULT_SETTINGS;

    const deliveryMode: ServiceDeliveryMode = useMemo(
        () => normalizeDeliveryMode(provider.serviceDeliveryMode ?? providerSettings.service_delivery_mode, providerSettings.offers_home_service),
        [provider.serviceDeliveryMode, providerSettings.service_delivery_mode, providerSettings.offers_home_service],
    );

    const supportsOnlinePayment = providerSettings.accept_online_payment ?? true;
    const supportsOfflineBooking = providerSettings.accept_offline_booking ?? false;
    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason = provider.bookingBlockedReason || 'Booking is unavailable for this provider.';
    const today = startOfDay(new Date());
    const maxBookingDate = addDays(today, Number(providerSettings.advanceBooking) || 30);

    const isDayUnavailable = (date: Date) =>
        !canBookProvider ||
        date < today ||
        date > maxBookingDate ||
        (!providerSettings.allowSameDay && isSameDay(date, today)) ||
        closedDays.includes(format(date, 'EEEE'));

    // Read URL params once at mount: preselected services, a date (from waitlist alerts), or a booking being rescheduled.
    const [initialFromUrl] = useState(() => {
        if (typeof window === 'undefined') {
            return { serviceIds: [] as string[], date: null as Date | null, rescheduleId: null as string | null };
        }
        const params = new URLSearchParams(window.location.search);
        const requested = params.get('service_ids')?.split(',') ?? (params.get('service') ? [params.get('service') as string] : []);
        const dateParam = params.get('date') ? parseISO(params.get('date') as string) : null;

        return {
            serviceIds: requested.filter((id) => services.some((service) => service.id === id)),
            date: dateParam && isValid(dateParam) ? startOfDay(dateParam) : null,
            rescheduleId: params.get('reschedule_id'),
        };
    });
    const rescheduleId = initialFromUrl.rescheduleId;

    const [selectedDate, setSelectedDateInternal] = useState<Date>(() => {
        if (initialFromUrl.date && !isDayUnavailable(initialFromUrl.date)) {
            return initialFromUrl.date;
        }
        for (let offset = providerSettings.allowSameDay ? 0 : 1; offset < 60; offset++) {
            const day = addDays(today, offset);
            if (!closedDays.includes(format(day, 'EEEE'))) {
                return day;
            }
        }

        return today;
    });
    const [weekStart, setWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 1 }));
    const [selectedSlot, setSelectedSlot] = useState('');
    const [customTime, setCustomTime] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialFromUrl.serviceIds);
    const [serviceTeamMembers, setServiceTeamMembers] = useState<ServiceTeamMembers>({});
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState<StepKey>(initialFromUrl.serviceIds.length > 0 ? 'time' : 'services');
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
    const [recurrenceCount, setRecurrenceCount] = useState<number | null>(null);
    const [addressSelectionDialogOpen, setAddressSelectionDialogOpen] = useState(false);
    const [createAddressDialogOpen, setCreateAddressDialogOpen] = useState(false);
    const [paymentOption, setPaymentOption] = useState<PaymentOption>(() => {
        if (!supportsOnlinePayment) {
            return 'offline';
        }

        return walletBalance == null ? 'card' : 'online';
    });
    const [promo, setPromo] = useState<AppliedPromo | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [checkingPromo, setCheckingPromo] = useState(false);
    const [joiningWaitlist, setJoiningWaitlist] = useState(false);

    const clearTime = () => {
        setSelectedSlot('');
        setCustomTime('');
    };

    const setSelectedDate = (date: Date) => {
        setSelectedDateInternal(date);
        clearTime();
    };

    const addresses = useClientAddresses({ initialClientAddresses, businessAddressOption, deliveryMode });
    const showStudio = allowsVisitProvider(deliveryMode);
    const showHome = allowsHomeService(deliveryMode);
    const atHome = showHome && addresses.selectedAddressChoice !== VISIT_PROVIDER_CHOICE;
    const homeServiceFee = atHome && !rescheduleId ? Number(providerSettings.home_service_fee) || 0 : 0;

    const slots = useBookingSlots({ providerId: provider.id, serviceIds: selectedServiceIds, selectedDate, serviceTeamMembers, rescheduleId });
    const weekAvailability = useWeekAvailability({ providerId: provider.id, serviceIds: selectedServiceIds, serviceTeamMembers, weekStart, rescheduleId });
    const nextAvailability = useNextAvailability(provider.id, selectedServiceIds, teamMembers.length > 0);

    const pricing = useBookingPricing({
        services,
        selectedServiceIds,
        recurrencePattern,
        recurringDiscountPercent,
        homeServiceFee,
        promo: rescheduleId ? null : promo,
    });

    const { submit, submitting } = useBookingSubmit({ rescheduleId });

    const proNameFor = (serviceId: string): string => {
        const member = teamMembers.find((teamMember) => teamMember.id === serviceTeamMembers[serviceId]);
        if (member) {
            return member.name;
        }

        return teamMembers.length > 0 ? 'anyone available' : provider.name;
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds((previous) => (previous.includes(id) ? previous.filter((serviceId) => serviceId !== id) : [...previous, id]));
        clearTime();
    };

    const changeServiceTeamMember = (serviceId: string, teamMemberId: string) => {
        setServiceTeamMembers((previous) => ({ ...previous, [serviceId]: teamMemberId }));
        clearTime();
    };

    const slotStart = selectedSlot ? new Date(selectedSlot) : null;
    const segments: VisitSegment[] = [];
    if (slotStart) {
        let cursor = slotStart;
        pricing.selectedServices.forEach((service) => {
            segments.push({ id: service.id, name: service.name, proName: proNameFor(service.id), start: cursor, duration: Number(service.duration), price: Number(service.price) });
            cursor = addMinutes(cursor, Number(service.duration));
        });
    }
    const durationMinutes = pricing.selectedServices.reduce((sum, service) => sum + Number(service.duration), 0);
    const slotEnd = slotStart ? addMinutes(slotStart, durationMinutes) : null;

    const homeAddressLabel = addresses.selectedAddressSummary
        ? `${addresses.selectedAddressSummary.address} (${addresses.selectedAddressSummary.label})`
        : null;
    const studioDetail = useMemo(() => {
        const street = provider.address?.split(',')[0]?.trim() || provider.businessName;
        const from = initialClientAddresses.find((address) => address.is_active && address.latitude != null && address.longitude != null);
        if (!from || provider.latitude == null || provider.longitude == null) {
            return street;
        }
        const km = distanceInKm({ lat: Number(from.latitude), lng: Number(from.longitude) }, { lat: provider.latitude, lng: provider.longitude });

        return `${street} · ${km.toFixed(1)} km · ${estimateDriveMinutes(km)} min drive`;
    }, [provider.address, provider.businessName, provider.latitude, provider.longitude, initialClientAddresses]);

    const chooseHome = () => {
        if (addresses.selectedAddressChoice !== VISIT_PROVIDER_CHOICE && addresses.selectedAddressChoice !== '__none__') {
            return;
        }
        const preferred = addresses.clientAddresses.find((address) => address.is_active) ?? addresses.clientAddresses[0];
        if (preferred) {
            addresses.setSelectedAddressChoice(preferred.id);
        } else {
            addresses.setSelectedAddressChoice('__none__');
            setCreateAddressDialogOpen(true);
        }
    };

    const changeHomeAddress = () => (addresses.hasSavedAddressOptions ? setAddressSelectionDialogOpen(true) : setCreateAddressDialogOpen(true));

    const applyPromo = async (code: string) => {
        setCheckingPromo(true);
        setPromoError(null);
        try {
            const response = await axios.post(promoCodes.check().url, { provider_id: provider.id, code });
            setPromo(response.data as AppliedPromo);
        } catch (error: unknown) {
            const data = (error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
            setPromoError(data?.errors?.promo_code?.[0] ?? data?.message ?? 'We couldn’t check that code. Try again.');
        } finally {
            setCheckingPromo(false);
        }
    };

    const joinWaitlist = () => {
        setJoiningWaitlist(true);
        router.post(
            bookingWaitlist.store().url,
            { provider_id: provider.id, date: format(selectedDate, 'yyyy-MM-dd'), service_ids: selectedServiceIds },
            { preserveScroll: true, preserveState: true, onFinish: () => setJoiningWaitlist(false) },
        );
    };

    const submitBooking = () => {
        if (!canBookProvider || !selectedSlot || selectedServiceIds.length === 0) {
            return;
        }
        if (!isValidAddressChoiceForMode(deliveryMode, addresses.selectedAddressChoice)) {
            toast.error(requiresClientServiceAddress(deliveryMode) ? 'Please add your service address before booking.' : 'Please choose where the service will happen.');
            changeHomeAddress();
            return;
        }

        const pros = selectedServiceIds.map((id) => serviceTeamMembers[id] || '');
        const sharedPro = pros.every((pro) => pro === pros[0]) ? pros[0] || null : null;
        const payload: BookingPayload = {
            provider_id: provider.id,
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes,
            team_member_id: sharedPro,
            payment_option: paymentOption,
        };

        if (!rescheduleId) {
            payload.service_team_members = Object.fromEntries(selectedServiceIds.map((id) => [id, serviceTeamMembers[id] || null]));
            if (promo) {
                payload.promo_code = promo.code;
            }
        }

        if (addresses.selectedAddressChoice === '__business__') {
            payload.use_business_address = true;
        } else if (addresses.selectedAddressChoice !== VISIT_PROVIDER_CHOICE && addresses.selectedAddressChoice !== '__none__') {
            payload.client_address_id = addresses.selectedAddressChoice;
            if (addresses.selectedAddressChoice === addresses.lastCreatedAddressId) {
                payload.set_address_active = addresses.setAddressAsActive;
            }
        }

        if (recurrencePattern && !rescheduleId) {
            payload.recurrence_pattern = recurrencePattern;
            if (recurrenceCount) {
                payload.recurrence_count = recurrenceCount;
            }
            payload.discount_percent = pricing.discountPercent;
        }

        submit(payload);
    };

    const walletShort = paymentOption === 'online' && (walletBalance ?? 0) < pricing.totalPrice;
    const paidToday = rescheduleId || paymentOption === 'offline' ? 0 : pricing.totalPrice;
    const stepIndex = STEPS.findIndex((item) => item.key === step);
    const goTo = (key: StepKey) => {
        setStep(key);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const goBack = () => (stepIndex > 0 ? goTo(STEPS[stepIndex - 1].key as StepKey) : router.visit(providerShow(provider.slug).url));

    const confirmCta = (): { label: string; hint: string | null } => {
        if (rescheduleId) {
            return { label: submitting ? 'Saving…' : 'Confirm new time', hint: 'Your payment stays where it is' };
        }
        if (submitting) {
            return { label: paymentOption === 'card' ? 'Opening payment…' : 'Booking…', hint: null };
        }
        if (paymentOption === 'offline') {
            return { label: 'Confirm booking', hint: `Pay ${formatNaira(pricing.totalPrice)} at the visit` };
        }
        if (paymentOption === 'card') {
            return { label: `Confirm and pay ${formatNaira(pricing.totalPrice)}`, hint: 'You’ll pay on the next screen' };
        }

        return {
            label: `Confirm and pay ${formatNaira(pricing.totalPrice)}`,
            hint: walletShort ? 'Not enough in your wallet. Top up or pay by card' : 'Paid from your wallet · held until your visit',
        };
    };

    const cta =
        step === 'services'
            ? {
                  label: `Continue · ${selectedServiceIds.length} selected`,
                  disabled: selectedServiceIds.length === 0,
                  hint: selectedServiceIds.length ? null : 'Pick one or more services',
                  onClick: () => goTo('time'),
              }
            : step === 'time'
              ? {
                    label: 'Continue',
                    disabled: !selectedSlot,
                    hint: selectedSlot ? `Free cancellation up to ${cancellationCutoffHours} hrs before` : 'Pick a time to continue',
                    onClick: () => goTo('confirm'),
                }
              : {
                    ...confirmCta(),
                    disabled: submitting || !canBookProvider || !selectedSlot || selectedServiceIds.length === 0 || (!rescheduleId && walletShort),
                    onClick: submitBooking,
                };

    const freeCancelDeadline = slotStart ? subHours(slotStart, cancellationCutoffHours) : null;
    const noteFor = (() => {
        const pros = [...new Set(selectedServiceIds.map((id) => serviceTeamMembers[id] || ''))];
        const member = pros.length === 1 ? teamMembers.find((teamMember) => teamMember.id === pros[0]) : null;

        return member ? member.name.split(' ')[0] : provider.businessName;
    })();
    const isWaitlisted = waitlistDates.includes(format(selectedDate, 'yyyy-MM-dd'));

    return (
        <div className="min-h-screen bg-white font-heading text-ink">
            <Head title={`Book with ${provider.businessName}`} />

            {(createAddressDialogOpen || addressSelectionDialogOpen) && (
                <Suspense fallback={null}>
                    <AddressDialogs
                        createOpen={createAddressDialogOpen}
                        onCreateOpenChange={setCreateAddressDialogOpen}
                        selectionOpen={addressSelectionDialogOpen}
                        onSelectionOpenChange={setAddressSelectionDialogOpen}
                        addressForm={addresses.addressForm}
                        onAddressFormChange={addresses.setAddressForm}
                        creatingAddress={addresses.creatingAddress}
                        locatingAddress={addresses.locatingAddress}
                        onCreateAddress={async () => {
                            const created = await addresses.createAddress();
                            if (created) {
                                setCreateAddressDialogOpen(false);
                            }
                        }}
                        // @ts-expect-error legacy props passed for compatibility
                        attachCurrentLocation={addresses.attachCurrentLocation}
                        onAttachCurrentLocationChange={addresses.setAttachCurrentLocation}
                        clientAddresses={addresses.clientAddresses}
                        businessAddressOption={businessAddressOption}
                        selectedAddressChoice={addresses.selectedAddressChoice}
                        onSelectedAddressChoiceChange={addresses.setSelectedAddressChoice}
                        setAsActive={addresses.setAddressAsActive}
                        onSetAsActiveChange={addresses.setSetAddressAsActive}
                        onContinue={() => setAddressSelectionDialogOpen(false)}
                        deliveryMode={deliveryMode}
                        providerVisitOption={provider.address ? { label: provider.businessName, address: provider.address } : null}
                    />
                </Suspense>
            )}

            <StepHeader
                steps={STEPS}
                current={step}
                onBack={goBack}
                onClose={() => router.visit(providerShow(provider.slug).url)}
                onStepClick={(key) => goTo(key as StepKey)}
            />

            <main className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 pt-6 pb-32 sm:px-6 lg:flex-row lg:items-start lg:gap-14 lg:pb-16">
                <div className="flex min-w-0 flex-1 flex-col gap-7">
                    {!canBookProvider && <BookingBlockedBanner reason={bookingBlockedReason} />}

                    {step === 'services' && (
                        <>
                            <div>
                                <h1 className="text-[40px] leading-tight font-bold tracking-tight">{rescheduleId ? 'Your services' : 'What are you booking?'}</h1>
                                <p className="mt-1.5 text-base text-moss">
                                    {teamMembers.length > 0 ? 'Pick one or more. You can choose who does each one.' : 'Pick one or more services.'}
                                </p>
                            </div>
                            <ServicePicker
                                services={services}
                                selectedServiceIds={selectedServiceIds}
                                onToggleService={toggleService}
                                teamMembers={teamMembers}
                                serviceTeamMembers={serviceTeamMembers}
                                onServiceTeamMemberChange={changeServiceTeamMember}
                                nextAvailability={nextAvailability}
                                canBookProvider={canBookProvider}
                            />
                        </>
                    )}

                    {step === 'time' && (
                        <>
                            <WeekStrip
                                weekStart={weekStart}
                                onWeekChange={setWeekStart}
                                selectedDate={selectedDate}
                                onSelect={setSelectedDate}
                                isDisabled={isDayUnavailable}
                                maxDate={maxBookingDate}
                                availability={weekAvailability}
                            />
                            <SlotList
                                groups={slots.categorizedSlots}
                                selectedSlot={customTime ? '' : selectedSlot}
                                onSelect={(datetime) => {
                                    setCustomTime('');
                                    setSelectedSlot(datetime);
                                }}
                                popularHours={popularHours}
                                loading={slots.loading}
                                emptyMessage={slots.apiMessage}
                            />
                            {providerSettings.allowOffHoursRequests && !slots.loading && (
                                <label className="flex flex-wrap items-center gap-3 rounded-[18px] border border-line px-4.5 py-4 text-sm">
                                    <span className="flex-1">
                                        <strong className="block text-ink">Need a different time?</strong>
                                        <span className="text-moss">Request one. The pro has to confirm it.</span>
                                    </span>
                                    <Input
                                        type="time"
                                        value={customTime}
                                        onChange={(event) => {
                                            setCustomTime(event.target.value);
                                            setSelectedSlot(event.target.value ? `${format(selectedDate, 'yyyy-MM-dd')}T${event.target.value}:00` : '');
                                        }}
                                        className="h-11 w-auto rounded-xl border-[#DDE3DE] bg-white px-3 shadow-none"
                                    />
                                </label>
                            )}
                            {!rescheduleId && canBookProvider && selectedServiceIds.length > 0 && !slots.loading && (
                                <WaitlistCallout dayLabel={format(selectedDate, 'EEE d MMM')} joined={isWaitlisted} joining={joiningWaitlist} onJoin={joinWaitlist} />
                            )}
                        </>
                    )}

                    {step === 'confirm' && slotStart && slotEnd && (
                        <div className="flex flex-col gap-4.5">
                            <div>
                                <h1 className="text-[40px] leading-tight font-bold tracking-tight">Here’s your visit</h1>
                                <p className="mt-1.5 text-base text-moss">
                                    {rescheduleId ? 'Check the new time, then confirm the change.' : 'One last look, then lock it in.'}
                                </p>
                            </div>

                            <VisitPass
                                businessName={provider.businessName}
                                start={slotStart}
                                end={slotEnd}
                                segments={segments}
                                onChangeTime={() => goTo('time')}
                                onEditServices={() => goTo('services')}
                            />

                            <LocationChoice
                                showStudio={showStudio}
                                showHome={showHome}
                                atHome={atHome}
                                businessInitial={provider.businessName.charAt(0).toUpperCase()}
                                studioDetail={studioDetail}
                                homeServiceFee={rescheduleId ? 0 : Number(providerSettings.home_service_fee) || 0}
                                homeAddressLabel={homeAddressLabel}
                                onChooseStudio={() => addresses.setSelectedAddressChoice(VISIT_PROVIDER_CHOICE)}
                                onChooseHome={chooseHome}
                                onChangeHomeAddress={changeHomeAddress}
                            />

                            <PaySection
                                showPayment={!rescheduleId}
                                total={pricing.totalPrice}
                                paymentOption={paymentOption}
                                onPaymentOptionChange={setPaymentOption}
                                supportsOnlinePayment={supportsOnlinePayment}
                                supportsOfflineBooking={supportsOfflineBooking}
                                walletBalance={walletBalance ?? null}
                                businessName={provider.businessName}
                                promo={promo}
                                promoDiscount={pricing.promoDiscount}
                                checkingPromo={checkingPromo}
                                promoError={promoError}
                                onApplyPromo={applyPromo}
                                onRemovePromo={() => {
                                    setPromo(null);
                                    setPromoError(null);
                                }}
                                noteLabel={`Note for ${noteFor}`}
                                notes={notes}
                                onNotesChange={setNotes}
                                notesDisabled={!canBookProvider}
                            />

                            {!rescheduleId && (
                                <VisitExtras
                                    recurrencePattern={recurrencePattern}
                                    onRecurrencePatternChange={setRecurrencePattern}
                                    recurrenceCount={recurrenceCount}
                                    onRecurrenceCountChange={setRecurrenceCount}
                                    recurringDiscountPercent={recurringDiscountPercent}
                                    disabled={!canBookProvider}
                                />
                            )}

                            <BookingAssurances
                                freeCancelUntil={freeCancelDeadline && freeCancelDeadline > new Date() ? format(freeCancelDeadline, 'EEE d MMM, h:mm aaa') : null}
                                isPaidUpfront={paymentOption !== 'offline'}
                            />
                        </div>
                    )}
                </div>

                <aside className="lg:sticky lg:top-6 lg:w-100 lg:shrink-0">
                    <BookingSidebar
                        provider={provider}
                        lines={pricing.selectedServices.map((service) => ({ id: service.id, name: service.name, proName: proNameFor(service.id), price: Number(service.price) }))}
                        durationMinutes={durationMinutes}
                        selectedSlot={selectedSlot}
                        whereLabel={atHome ? 'At your place' : 'At the studio'}
                        originalPrice={pricing.originalPrice}
                        discountAmount={pricing.discountAmount}
                        discountPercent={pricing.discountPercent}
                        promoCode={promo?.code ?? null}
                        promoDiscount={pricing.promoDiscount}
                        homeServiceFee={pricing.homeServiceFee}
                        totalPrice={pricing.totalPrice}
                        paidToday={paidToday}
                        ctaLabel={cta.label}
                        ctaDisabled={cta.disabled}
                        ctaHint={cta.hint}
                        onContinue={cta.onClick}
                    />
                </aside>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-white px-4 py-3 lg:hidden">
                <div className="flex-1">
                    <div className="text-xs text-moss">{pricing.selectedServices.length} selected</div>
                    <div className="font-bold">{formatNaira(pricing.totalPrice)}</div>
                </div>
                <button
                    type="button"
                    onClick={cta.onClick}
                    disabled={cta.disabled}
                    className="h-12 rounded-full bg-forest px-6 font-bold text-white disabled:bg-[#CCD2C6]"
                >
                    {step === 'services' ? 'Continue' : cta.label}
                </button>
            </div>
            <ToastNotification />
        </div>
    );
}
