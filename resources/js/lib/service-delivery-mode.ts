export type ServiceDeliveryMode =
    | 'client_visits_provider'
    | 'provider_visits_client'
    | 'both';

export const VISIT_PROVIDER_CHOICE = '__visit_provider__';

export function normalizeDeliveryMode(
    mode?: string | null,
    offersHomeService?: boolean,
): ServiceDeliveryMode {
    if (
        mode === 'client_visits_provider' ||
        mode === 'provider_visits_client' ||
        mode === 'both'
    ) {
        return mode;
    }

    return offersHomeService ? 'provider_visits_client' : 'client_visits_provider';
}

export function requiresClientServiceAddress(mode: ServiceDeliveryMode): boolean {
    return mode === 'provider_visits_client';
}

export function allowsVisitProvider(mode: ServiceDeliveryMode): boolean {
    return mode === 'client_visits_provider' || mode === 'both';
}

export function allowsHomeService(mode: ServiceDeliveryMode): boolean {
    return mode === 'provider_visits_client' || mode === 'both';
}

export function getBookingCtaLabel(mode: ServiceDeliveryMode): string {
    switch (mode) {
        case 'provider_visits_client':
            return 'Book a visit';
        case 'both':
            return 'Book now';
        default:
            return 'Book appointment';
    }
}

export function getDeliveryModeBadge(mode: ServiceDeliveryMode): string {
    switch (mode) {
        case 'provider_visits_client':
            return 'We come to you';
        case 'both':
            return 'At your location or ours';
        default:
            return 'Visit us';
    }
}

export function getLocationSummaryLabel(mode: ServiceDeliveryMode): string {
    switch (mode) {
        case 'provider_visits_client':
            return 'Service at your address';
        case 'client_visits_provider':
            return 'Visit location';
        default:
            return 'Service location';
    }
}

export function isValidAddressChoiceForMode(
    mode: ServiceDeliveryMode,
    choice: string,
): boolean {
    if (requiresClientServiceAddress(mode)) {
        return (
            choice !== VISIT_PROVIDER_CHOICE &&
            choice !== '__none__' &&
            choice !== '__business__' &&
            choice.length > 0
        );
    }

    if (mode === 'client_visits_provider') {
        return true;
    }

    return (
        choice === VISIT_PROVIDER_CHOICE ||
        (choice !== '__none__' &&
            choice !== '__business__' &&
            choice.length > 0)
    );
}

export function defaultAddressChoice(
    mode: ServiceDeliveryMode,
    activeClientAddressId?: string | null,
): string {
    if (mode === 'client_visits_provider') {
        return VISIT_PROVIDER_CHOICE;
    }

    if (activeClientAddressId) {
        return activeClientAddressId;
    }

    if (mode === 'provider_visits_client') {
        return '__none__';
    }

    return VISIT_PROVIDER_CHOICE;
}
