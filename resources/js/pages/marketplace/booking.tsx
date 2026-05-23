import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import GuestLayout from '@/layouts/guest-layout';
import {
    isValidAddressChoiceForMode,
    normalizeDeliveryMode,
    requiresClientServiceAddress,
    type ServiceDeliveryMode,
    VISIT_PROVIDER_CHOICE,
} from '@/lib/service-delivery-mode';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { Head, router } from '@inertiajs/react';
import { gooeyToast as toast } from 'goey-toast';
import { Suspense, lazy, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';

import type {
    BusinessAddressOption,
    ClientAddressOption,
} from './components/address-dialogs';
import { BookingBlockedBanner } from './booking/components/booking-blocked-banner';
import { BookingHeader } from './booking/components/booking-header';
import { BookingPolicies } from './booking/components/booking-policies';
import { BookingSummary } from './booking/components/booking-summary';
import { NotesSection } from './booking/components/notes-section';
import { PaymentSection } from './booking/components/payment-section';
import { RecurrenceSection } from './booking/components/recurrence-section';
import { ServicePicker } from './booking/components/service-picker';
import { StepGate } from './booking/components/step-gate';
import { StepHeading } from './booking/components/step-heading';
import { StickyMobileCta } from './booking/components/sticky-mobile-cta';
import { TeamMemberPicker } from './booking/components/team-member-picker';
import { useBookingPricing } from './booking/hooks/use-booking-pricing';
import { useBookingSlots } from './booking/hooks/use-booking-slots';
import { useBookingSubmit } from './booking/hooks/use-booking-submit';
import { useClientAddresses } from './booking/hooks/use-client-addresses';
import type {
    BookingPayload,
    PaymentOption,
    Provider,
    ProviderSettings,
    RecurrencePattern,
    Service,
    TeamMember,
} from './booking/types';

const DateTimePicker = lazy(() =>
    import('./booking/components/date-time-picker').then((m) => ({
        default: m.DateTimePicker,
    })),
);

const AddressDialogs = lazy(() => import('./components/address-dialogs'));

interface Props {
    provider: Provider;
    services: Service[];
    teamMembers: TeamMember[];
    clientAddresses: ClientAddressOption[];
    businessAddressOption?: BusinessAddressOption | null;
    walletBalance?: number | null;
    settings?: ProviderSettings;
    recurringDiscountPercent?: number;
}

export default function Booking({
    provider,
    services,
    teamMembers,
    clientAddresses: initialClientAddresses,
    businessAddressOption,
    walletBalance,
    settings,
    recurringDiscountPercent = 10,
}: Props) {
    const providerSettings: ProviderSettings = settings || {
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
    };

    const deliveryMode: ServiceDeliveryMode = useMemo(
        () =>
            normalizeDeliveryMode(
                provider.serviceDeliveryMode ??
                    providerSettings.service_delivery_mode,
                providerSettings.offers_home_service,
            ),
        [
            provider.serviceDeliveryMode,
            providerSettings.service_delivery_mode,
            providerSettings.offers_home_service,
        ],
    );

    const supportsOnlinePayment =
        providerSettings.accept_online_payment ?? true;
    const supportsOfflineBooking =
        providerSettings.accept_offline_booking ?? false;
    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason =
        provider.bookingBlockedReason ||
        'Booking is unavailable for this provider.';

    // Read URL params once at mount so we don't have to re-sync via an effect.
    // Note: We intentionally do not auto-pick the first service here — the user
    // must explicitly choose a service, which keeps the slots query idle until
    // a real selection exists (see plan: services-first slot fetch).
    const initialFromUrl = ((): {
        serviceIds: string[];
        rescheduleId: string | null;
    } => {
        if (typeof window === 'undefined') {
            return { serviceIds: [], rescheduleId: null };
        }
        const params = new URLSearchParams(window.location.search);
        const serviceIdParam = params.get('service');
        const serviceIdsParam = params.get('service_ids')?.split(',') || [];
        const resId = params.get('reschedule_id');

        if (serviceIdsParam.length > 0) {
            const filtered = serviceIdsParam.filter((id) =>
                services.find((s) => s.id === id),
            );
            return { serviceIds: filtered, rescheduleId: resId };
        }
        if (serviceIdParam && services.find((s) => s.id === serviceIdParam)) {
            return { serviceIds: [serviceIdParam], rescheduleId: resId };
        }
        return { serviceIds: [], rescheduleId: resId };
    })();

    const [selectedDate, setSelectedDateInternal] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
        initialFromUrl.serviceIds,
    );
    const [notes, setNotes] = useState('');
    const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('');
    const [rescheduleId] = useState<string | null>(initialFromUrl.rescheduleId);
    const [recurrencePattern, setRecurrencePattern] =
        useState<RecurrencePattern | null>(null);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
        null,
    );
    const [recurrenceCount, setRecurrenceCount] = useState<number | null>(null);
    const [insufficientBalanceDialogOpen, setInsufficientBalanceDialogOpen] =
        useState(false);
    const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] =
        useState(false);
    const [addressSelectionDialogOpen, setAddressSelectionDialogOpen] =
        useState(false);
    const [createAddressDialogOpen, setCreateAddressDialogOpen] =
        useState(false);
    const [pendingShortfall, setPendingShortfall] = useState(0);
    const [useCustomTime, setUseCustomTime] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [paymentOption, setPaymentOption] = useState<PaymentOption>(
        () => (supportsOnlinePayment ? 'online' : 'offline'),
    );

    // Centralize date changes so the slot/custom-time gets cleared in lockstep
    // without a sync effect.
    const setSelectedDate = (date: Date) => {
        setSelectedDateInternal(date);
        setSelectedSlot('');
        setCustomTime('');
        setUseCustomTime(false);
    };

    const addresses = useClientAddresses({
        initialClientAddresses,
        businessAddressOption,
        deliveryMode,
    });

    const providerVisitOption = useMemo(
        () =>
            provider.address
                ? {
                      label: provider.businessName,
                      address: provider.address,
                  }
                : null,
        [provider.address, provider.businessName],
    );

    const slots = useBookingSlots({
        providerId: provider.id,
        serviceIds: selectedServiceIds,
        selectedDate,
        teamMemberId: selectedTeamMemberId,
        rescheduleId,
    });

    const pricing = useBookingPricing({
        services,
        selectedServiceIds,
        recurrencePattern,
        recurringDiscountPercent,
    });

    const { submit, submitting } = useBookingSubmit({ rescheduleId });

    const toggleService = (id: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(id)
                ? prev.filter((serviceId) => serviceId !== id)
                : [...prev, id],
        );
        setSelectedSlot('');
        setCustomTime('');
        setUseCustomTime(false);
    };

    const handleBooking = () => {
        if (!canBookProvider) {
            return;
        }
        if (
            !selectedDate ||
            !selectedSlot ||
            selectedServiceIds.length === 0
        ) {
            return;
        }

        if (deliveryMode === 'client_visits_provider') {
            addresses.setSelectedAddressChoice(VISIT_PROVIDER_CHOICE);
            continueBookingAfterAddressSelection();
            return;
        }

        setAddressSelectionDialogOpen(true);
    };

    const continueBookingAfterAddressSelection = () => {
        if (
            !isValidAddressChoiceForMode(
                deliveryMode,
                addresses.selectedAddressChoice,
            )
        ) {
            toast.error(
                requiresClientServiceAddress(deliveryMode)
                    ? 'Please add your service address before booking.'
                    : 'Please choose where the service will happen.',
            );
            setAddressSelectionDialogOpen(true);
            return;
        }

        setAddressSelectionDialogOpen(false);
        if (paymentOption === 'online') {
            if (
                walletBalance !== null &&
                walletBalance !== undefined &&
                walletBalance < pricing.totalPrice
            ) {
                setPendingShortfall(pricing.totalPrice - walletBalance);
                setInsufficientBalanceDialogOpen(true);
                return;
            }
            setPaymentConfirmDialogOpen(true);
            return;
        }
        submitBooking();
    };

    const submitBooking = () => {
        const payload: BookingPayload = {
            provider_id: provider.id,
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes,
            team_member_id: selectedTeamMemberId || null,
            payment_option: paymentOption,
        };

        if (addresses.selectedAddressChoice !== '__none__') {
            if (addresses.selectedAddressChoice === '__business__') {
                payload.use_business_address = true;
            } else if (
                addresses.selectedAddressChoice !== VISIT_PROVIDER_CHOICE
            ) {
                payload.client_address_id = addresses.selectedAddressChoice;
                if (
                    addresses.selectedAddressChoice ===
                    addresses.lastCreatedAddressId
                ) {
                    payload.set_address_active = addresses.setAddressAsActive;
                }
            }
        }

        if (recurrencePattern) {
            payload.recurrence_pattern = recurrencePattern;
            if (recurrenceEndDate) {
                payload.recurrence_end_date = recurrenceEndDate
                    .toISOString()
                    .slice(0, 10);
            }
            if (recurrenceCount) {
                payload.recurrence_count = recurrenceCount;
            }
            payload.discount_percent = pricing.discountPercent;
        }

        submit(payload);
    };

    const insufficientBalance =
        paymentOption === 'online' &&
        walletBalance !== null &&
        walletBalance !== undefined &&
        walletBalance < pricing.totalPrice;

    const stickyDisabled =
        submitting ||
        !canBookProvider ||
        !selectedSlot ||
        selectedServiceIds.length === 0 ||
        insufficientBalance;

    const hasAnyAddressOption =
        addresses.hasSavedAddressOptions || addresses.hasBusinessAddressOption;

    // Step gating: each later section is muted until its prerequisite is set.
    const hasServices = selectedServiceIds.length > 0;
    const hasDateTime = hasServices && Boolean(selectedSlot);

    return (
        <GuestLayout>
            <Head title={`Book with ${provider.businessName}`} />

            <CustomAlertDialog
                open={insufficientBalanceDialogOpen}
                onOpenChange={setInsufficientBalanceDialogOpen}
                icon={<Wallet className="size-12 text-amber-500" />}
                title="Insufficient Wallet Balance"
                description={`You need ₦${pendingShortfall.toLocaleString()} more to complete this booking. Payment is required upfront. Would you like to top up your wallet?`}
                acceptLabel="Top Up Wallet"
                rejectLabel="Cancel"
                onAccept={() => router.visit('/wallet')}
            />

            <CustomAlertDialog
                open={paymentConfirmDialogOpen}
                onOpenChange={setPaymentConfirmDialogOpen}
                icon={
                    <ShieldExclamationIcon className="size-12 text-primary" />
                }
                title="Confirm Payment"
                description={`You will be charged ₦${pricing.totalPrice.toLocaleString()} which will be held securely. Payment will be released to the provider only after both you and the provider confirm the service is completed. Continue?`}
                acceptLabel="Continue"
                rejectLabel="Cancel"
                onAccept={submitBooking}
            />

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
                        // attachCurrentLocation/onAttachCurrentLocationChange are
                        // legacy props kept for compatibility with the existing
                        // AddressDialogs surface; runtime-safe even though not in
                        // the component's typed props.
                        // @ts-expect-error legacy props passed for compatibility
                        attachCurrentLocation={addresses.attachCurrentLocation}
                        onAttachCurrentLocationChange={
                            addresses.setAttachCurrentLocation
                        }
                        clientAddresses={addresses.clientAddresses}
                        businessAddressOption={businessAddressOption}
                        selectedAddressChoice={addresses.selectedAddressChoice}
                        onSelectedAddressChoiceChange={
                            addresses.setSelectedAddressChoice
                        }
                        setAsActive={addresses.setAddressAsActive}
                        onSetAsActiveChange={addresses.setSetAddressAsActive}
                        onContinue={continueBookingAfterAddressSelection}
                        deliveryMode={deliveryMode}
                        providerVisitOption={providerVisitOption}
                    />
                </Suspense>
            )}

            <div className="mx-auto min-h-screen max-w-6xl bg-background pb-32 lg:pb-20">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <BookingHeader provider={provider} settings={providerSettings} />

                    <BookingPolicies
                        settings={providerSettings}
                        supportsOfflineBooking={supportsOfflineBooking}
                    />

                    {!canBookProvider && (
                        <BookingBlockedBanner reason={bookingBlockedReason} />
                    )}

                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                        <div className="space-y-8 lg:col-span-2">
                            <section className="space-y-4">
                                <StepHeading
                                    step={1}
                                    title="Choose services"
                                    description="Pick one or more services to book."
                                />
                                <ServicePicker
                                    services={services}
                                    selectedServiceIds={selectedServiceIds}
                                    onToggleService={toggleService}
                                    canBookProvider={canBookProvider}
                                />
                            </section>

                            {teamMembers.length > 0 && (
                                <section className="space-y-4">
                                    <StepHeading
                                        step={2}
                                        title="Choose who attends"
                                        optional
                                        description="Leave on the provider if you have no preference."
                                    />
                                    <StepGate
                                        enabled={hasServices}
                                        hint="Choose at least one service to continue."
                                    >
                                        <TeamMemberPicker
                                            provider={provider}
                                            teamMembers={teamMembers}
                                            selectedTeamMemberId={selectedTeamMemberId}
                                            onSelectedTeamMemberIdChange={(id) => {
                                                setSelectedTeamMemberId(id);
                                                setSelectedSlot('');
                                            }}
                                            canBookProvider={canBookProvider}
                                        />
                                    </StepGate>
                                </section>
                            )}

                            <section className="space-y-4">
                                <StepHeading
                                    step={teamMembers.length > 0 ? 3 : 2}
                                    title="Pick date and time"
                                    description={
                                        hasServices
                                            ? 'Available slots are based on the services you picked.'
                                            : 'Choose a service first so we can show available slots.'
                                    }
                                />
                                <StepGate
                                    enabled={hasServices}
                                    hint="Choose at least one service to load available slots."
                                >
                                    <Suspense
                                        fallback={
                                            <div className="overflow-hidden rounded-xl border bg-card">
                                                <div className="grid grid-cols-1 gap-3 sm:h-[360px] md:grid-cols-2">
                                                    <Skeleton className="m-3 h-[340px]" />
                                                    <Skeleton className="m-3 h-[340px]" />
                                                </div>
                                            </div>
                                        }
                                    >
                                        <DateTimePicker
                                            selectedDate={selectedDate}
                                            onSelectedDateChange={setSelectedDate}
                                            canBookProvider={canBookProvider}
                                            providerSettings={providerSettings}
                                            loading={slots.loading}
                                            apiMessage={slots.apiMessage}
                                            selectedSlot={selectedSlot}
                                            onSelectedSlotChange={setSelectedSlot}
                                            categorizedSlots={slots.categorizedSlots}
                                            availableSlots={slots.availableSlots}
                                            useCustomTime={useCustomTime}
                                            onUseCustomTimeChange={setUseCustomTime}
                                            customTime={customTime}
                                            onCustomTimeChange={setCustomTime}
                                        />
                                    </Suspense>
                                </StepGate>
                            </section>

                            <section className="space-y-4">
                                <StepHeading
                                    step={teamMembers.length > 0 ? 4 : 3}
                                    title="Add notes"
                                    optional
                                    description="Anything the provider should know ahead of time."
                                />
                                <StepGate
                                    enabled={hasDateTime}
                                    hint="Pick a date and time to add notes."
                                >
                                    <NotesSection
                                        notes={notes}
                                        onNotesChange={setNotes}
                                    />
                                </StepGate>
                            </section>

                            <section className="space-y-4">
                                <StepHeading
                                    step={teamMembers.length > 0 ? 5 : 4}
                                    title="Make it recurring"
                                    optional
                                    description="Repeat this booking on a schedule and unlock a discount."
                                />
                                <StepGate
                                    enabled={hasDateTime}
                                    hint="Pick a date and time to set up recurrence."
                                >
                                    <RecurrenceSection
                                        canBookProvider={canBookProvider}
                                        selectedDate={selectedDate}
                                        recurrencePattern={recurrencePattern}
                                        onRecurrencePatternChange={
                                            setRecurrencePattern
                                        }
                                        recurrenceEndDate={recurrenceEndDate}
                                        onRecurrenceEndDateChange={
                                            setRecurrenceEndDate
                                        }
                                        recurrenceCount={recurrenceCount}
                                        onRecurrenceCountChange={
                                            setRecurrenceCount
                                        }
                                        discountPercent={
                                            pricing.discountPercent ||
                                            recurringDiscountPercent
                                        }
                                        discountAmount={pricing.discountAmount}
                                    />
                                </StepGate>
                            </section>
                        </div>

                        <div className="order-last lg:sticky lg:top-8 lg:order-last">
                            <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
                                <BookingSummary
                                    provider={provider}
                                    settings={providerSettings}
                                    selectedServices={pricing.selectedServices}
                                    selectedDate={selectedDate}
                                    selectedSlot={selectedSlot}
                                    selectedAddressChoice={
                                        addresses.selectedAddressChoice
                                    }
                                    selectedAddressSummary={
                                        addresses.selectedAddressSummary
                                    }
                                    onAddAddress={() =>
                                        setCreateAddressDialogOpen(true)
                                    }
                                    onChangeAddress={() =>
                                        setAddressSelectionDialogOpen(true)
                                    }
                                    hasAnyAddressOption={hasAnyAddressOption}
                                />

                                <PaymentSection
                                    paymentOption={paymentOption}
                                    onPaymentOptionChange={setPaymentOption}
                                    supportsOnlinePayment={supportsOnlinePayment}
                                    supportsOfflineBooking={
                                        supportsOfflineBooking
                                    }
                                    walletBalance={walletBalance}
                                    totalPrice={pricing.totalPrice}
                                    originalPrice={pricing.originalPrice}
                                    discountAmount={pricing.discountAmount}
                                    discountPercent={pricing.discountPercent}
                                    providerSettings={providerSettings}
                                    canBookProvider={canBookProvider}
                                    selectedSlot={selectedSlot}
                                    selectedServiceCount={
                                        selectedServiceIds.length
                                    }
                                    submitting={submitting}
                                    onBook={handleBooking}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StickyMobileCta
                totalPrice={pricing.totalPrice}
                paymentOption={paymentOption}
                onBook={handleBooking}
                disabled={stickyDisabled}
                submitting={submitting}
                insufficientBalance={insufficientBalance}
                canBookProvider={canBookProvider}
            />
        </GuestLayout>
    );
}
