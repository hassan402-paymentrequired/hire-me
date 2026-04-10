import { InertiaLinkProps } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

type AppIcon = LucideIcon | ComponentType<{ className?: string }>;

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
    icon?: AppIcon | null;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    name: string,
    links: Array<{
        title: string;
        href: NonNullable<InertiaLinkProps['href']>;
        icon?: AppIcon | null;
        isActive?: boolean;
    }>
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: 'client' | 'provider';
    has_provider_setup?: boolean;
    can_access_provider_workspace?: boolean;
    wallet?: {
        balance: number;
        escrow_balance: number;
        available_balance: number;
    } | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}


export interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description?: string;
    servicesCount: number;
    services: string[];
    distance?: number | null;
    logo?: string | null;
    rating: number;
    reviewsCount: number;
    minPrice: number | string;
    address: string;
    [key: string]: unknown;
}

export interface Service {
    provider_id: string,
    category_id: string,
    name: string,
    description: string,
    duration_minutes: string,
    buffer_time_minutes: string,
    price: string,
    status: string,
}

export interface Appointment {
    id?: string;
    provider_id: string,
    client_id: string,
    service_id: string,
    start_time: string,
    end_time: string,
    buffer_time_minutes: string,
    status: string,
    client_approved: boolean,
    provider_approved: boolean,
    client_approved_at?: string,
    provider_approved_at?: string,
    price: number,
    notes: string,
    client_name: string,
    client_email: string,
    cancelled_by: string,
    cancellation_reason: string,
    first_reminder_sent_at: string,
    last_reminder_sent_at: string,
    reminder_count: string,
    escrow_amount: string,
    escrow_status: string,
    escrow_transaction_id: string,
    payment_released_at: string,
    payment_method?: 'online' | 'offline' | string,
    recurrence_pattern: string,
    recurrence_parent_id: string,
    recurrence_end_date: string,
    recurrence_count: number,
    original_price: number,
    discount_percent: number,
    recurrence_stopped_at: string,
    team_member_id: string | null,
    team_member?: {
        id: string;
        role: 'admin' | 'staff';
        user: {
            id: string;
            name: string;
            email: string;
        };
    } | null,
    services: Service[],
    client: User
}



export interface WelcomeProps {
    providers: {
        data: Provider[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        next_page_url: string | null;
        current_page: number;
    };
    categories: { name: string; slug: string }[];
    filters: {
        search?: string;
        category?: string;
        lat?: number | string;
        lng?: number | string;
        sort?: string;
        min_rating?: number | string;
    };
    canRegister: boolean;
}