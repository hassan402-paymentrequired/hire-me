import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
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
        icon?: LucideIcon | null;
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