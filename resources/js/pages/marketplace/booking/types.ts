import type {
    BusinessAddressOption,
    ClientAddressOption,
} from '../components/address-dialogs';

export type RecurrencePattern = 'weekly' | 'bi_weekly' | 'monthly';

export type PaymentOption = 'online' | 'offline';

export interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    categoryId?: string | null;
    categoryName?: string | null;
}

export interface Provider {
    id: string;
    name: string;
    businessName: string;
    address: string;
    slug: string;
    logo: string | null;
    isVerified?: boolean;
    canBook?: boolean;
    bookingBlockedReason?: string | null;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    avatar?: string | null;
}

export interface TimeSlot {
    start: string;
    end: string;
    display: string;
    datetime: string;
}

export interface ProviderSettings {
    advanceBooking: string | number;
    minNotice: string | number | null;
    allowSameDay: boolean;
    autoConfirm?: boolean;
    allowOffHoursRequests?: boolean;
    max_bookings_per_week: string | number | null;
    max_bookings_per_month: string | number | null;
    accept_online_payment?: boolean;
    accept_offline_booking?: boolean;
}

export interface AddressFormState {
    label: string;
    address: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
}

export interface AddressSummary {
    label: string;
    address: string;
    meta: string;
}

export interface BookingPayload {
    provider_id: string;
    service_ids: string[];
    start_time: string;
    notes: string;
    team_member_id: string | null;
    payment_option: PaymentOption;
    use_business_address?: boolean;
    client_address_id?: string;
    set_address_active?: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_end_date?: string;
    recurrence_count?: number;
    discount_percent?: number;
}

export type { BusinessAddressOption, ClientAddressOption };
