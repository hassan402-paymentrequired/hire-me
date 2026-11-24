import KeenIcon from '@/components/keen-icon';
import { formatNaira } from '@/components/site/provider-card';
import { AppSelect } from '@/components/ui/app-select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatDuration, formatNextOpening, initials } from '../format';
import type { NextAvailability, Service, ServiceTeamMembers, TeamMember } from '../types';

const SERVICES_PER_PAGE = 6;
const ALL_CATEGORIES = '__all__';
const OTHER_CATEGORY = 'Other services';
/** Inline tabs besides “All” before the rest move into the category menu. */
const VISIBLE_CATEGORY_COUNT = 2;

interface ServicePickerProps {
    services: Service[];
    selectedServiceIds: string[];
    onToggleService: (id: string) => void;
    teamMembers: TeamMember[];
    serviceTeamMembers: ServiceTeamMembers;
    onServiceTeamMemberChange: (serviceId: string, teamMemberId: string) => void;
    nextAvailability: Record<string, NextAvailability>;
    canBookProvider: boolean;
}

/** Searchable, category-tabbed, paginated service list; each picked service gets its own pro. */
export function ServicePicker({
    services,
    selectedServiceIds,
    onToggleService,
    teamMembers,
    serviceTeamMembers,
    onServiceTeamMemberChange,
    nextAvailability,
    canBookProvider,
}: ServicePickerProps) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState(ALL_CATEGORIES);
    const [page, setPage] = useState(1);

    const categories = useMemo(() => {
        const counts = new Map<string, number>();
        services.forEach((service) => {
            const name = service.categoryName || OTHER_CATEGORY;
            counts.set(name, (counts.get(name) ?? 0) + 1);
        });

        return [...counts.entries()]
            .sort(([a], [b]) => (a === OTHER_CATEGORY ? 1 : b === OTHER_CATEGORY ? -1 : a.localeCompare(b)))
            .map(([name, count]) => ({ name, count }));
    }, [services]);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        const order = categories.map((item) => item.name);

        return services
            .filter((service) => category === ALL_CATEGORIES || (service.categoryName || OTHER_CATEGORY) === category)
            .filter((service) => !term || `${service.name} ${service.description ?? ''}`.toLowerCase().includes(term))
            .sort((a, b) => order.indexOf(a.categoryName || OTHER_CATEGORY) - order.indexOf(b.categoryName || OTHER_CATEGORY));
    }, [services, categories, category, query]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / SERVICES_PER_PAGE));
    const currentPage = Math.min(page, pageCount);
    const firstIndex = (currentPage - 1) * SERVICES_PER_PAGE;
    const visible = filtered.slice(firstIndex, firstIndex + SERVICES_PER_PAGE);
    const groups = visible.reduce<{ name: string; services: Service[] }[]>((list, service) => {
        const name = service.categoryName || OTHER_CATEGORY;
        const last = list[list.length - 1];
        if (last?.name === name) {
            last.services.push(service);
        } else {
            list.push({ name, services: [service] });
        }

        return list;
    }, []);
    const showGroupHeadings = categories.length > 1 || Boolean(services[0]?.categoryName);

    const changeFilter = (apply: () => void) => {
        apply();
        setPage(1);
    };

    if (services.length === 0) {
        return (
            <div className="rounded-[22px] bg-paper px-6 py-10 text-center">
                <p className="font-bold">No services yet</p>
                <p className="mt-1 text-sm text-moss">This business hasn’t listed any services to book.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-7">
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex h-11 min-w-0 flex-1 basis-60 items-center gap-2.5 rounded-full border border-[#DDE3DE] px-4 focus-within:border-forest">
                    <Search className="size-4 shrink-0 text-moss" />
                    <span className="sr-only">Search services</span>
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => changeFilter(() => setQuery(event.target.value))}
                        placeholder={`Search ${services.length} services`}
                        className="h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:border-transparent focus-visible:ring-0"
                    />
                </label>
                {categories.length > 1 && (
                    <CategoryFilterBar
                        categories={categories}
                        totalServices={services.length}
                        activeCategory={category}
                        onSelect={(value) => changeFilter(() => setCategory(value))}
                    />
                )}
            </div>

            {visible.length === 0 ? (
                <div className="rounded-[22px] bg-paper px-6 py-10 text-center">
                    <p className="font-bold">No services match “{query}”</p>
                    <p className="mt-1 text-sm text-moss">Try a different word, or clear the search.</p>
                </div>
            ) : (
                groups.map((group) => (
                    <section key={`${group.name}-${group.services[0].id}`} className="flex flex-col gap-3">
                        {showGroupHeadings && <h2 className="text-[15px] font-bold text-moss">{group.name}</h2>}
                        {group.services.map((service) => (
                            <ServiceRow
                                key={service.id}
                                service={service}
                                selected={selectedServiceIds.includes(service.id)}
                                onToggle={() => onToggleService(service.id)}
                                teamMembers={teamMembers}
                                selectedTeamMemberId={serviceTeamMembers[service.id] ?? ''}
                                onTeamMemberChange={(id) => onServiceTeamMemberChange(service.id, id)}
                                nextAvailability={nextAvailability[service.id]}
                                disabled={!canBookProvider}
                            />
                        ))}
                    </section>
                ))
            )}

            {filtered.length > SERVICES_PER_PAGE && (
                <nav aria-label="Service pages" className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-moss">
                        Showing {firstIndex + 1}–{firstIndex + visible.length} of {filtered.length} services
                    </span>
                    <div className="flex items-center gap-1.5">
                        <PageButton label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                            <ChevronLeft className="size-4" />
                        </PageButton>
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                            <PageButton key={number} label={`Page ${number}`} active={number === currentPage} onClick={() => setPage(number)}>
                                {number}
                            </PageButton>
                        ))}
                        <PageButton label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
                            <ChevronRight className="size-4" />
                        </PageButton>
                    </div>
                </nav>
            )}
        </div>
    );
}

type CategoryCount = { name: string; count: number };

function CategoryFilterBar({
    categories,
    totalServices,
    activeCategory,
    onSelect,
}: {
    categories: CategoryCount[];
    totalServices: number;
    activeCategory: string;
    onSelect: (category: string) => void;
}) {
    const useMenu = categories.length > VISIBLE_CATEGORY_COUNT;
    const visible = useMemo(() => {
        if (!useMenu) {
            return categories;
        }

        const selected = categories.find((item) => item.name === activeCategory);
        const defaultVisible = categories.slice(0, VISIBLE_CATEGORY_COUNT);

        if (selected && !defaultVisible.some((item) => item.name === selected.name)) {
            return [selected, ...categories.filter((item) => item.name !== selected.name).slice(0, VISIBLE_CATEGORY_COUNT - 1)];
        }

        return defaultVisible;
    }, [categories, activeCategory, useMenu]);

    const overflow = useMenu ? categories.filter((item) => !visible.some((shown) => shown.name === item.name)) : [];
    const menuActive = overflow.some((item) => item.name === activeCategory);

    return (
        <div role="tablist" aria-label="Service categories" className="flex shrink-0 items-center gap-1.5">
            <CategoryTab label="All" count={totalServices} active={activeCategory === ALL_CATEGORIES} onSelect={() => onSelect(ALL_CATEGORIES)} />
            {visible.map((item) => (
                <CategoryTab
                    key={item.name}
                    label={item.name}
                    count={item.count}
                    active={activeCategory === item.name}
                    onSelect={() => onSelect(item.name)}
                />
            ))}
            {overflow.length > 0 && (
                <div className="relative shrink-0">
                    <KeenIcon
                        name="category"
                        className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-moss"
                        aria-hidden
                    />
                    <AppSelect
                        value={overflow.some((item) => item.name === activeCategory) ? activeCategory : ''}
                        onChange={(value) => onSelect(value)}
                        ariaLabel={`More categories (${overflow.length})`}
                        placeholder=""
                        searchable={overflow.length > 8}
                        size="sm"
                        className="w-[4rem]"
                        triggerClassName={cn(
                            'h-10 min-h-10 rounded-full border-0 pl-7 text-sm font-semibold shadow-none',
                            menuActive
                                ? 'bg-forest text-white hover:bg-forest'
                                : 'bg-[#F2F5F2] text-ink hover:bg-paper',
                        )}
                        options={overflow.map((item) => ({
                            value: item.name,
                            label: item.name,
                            description: `${item.count} service${item.count === 1 ? '' : 's'}`,
                        }))}
                    />
                </div>
            )}
        </div>
    );
}

function CategoryTab({ label, count, active, onSelect }: { label: string; count: number; active: boolean; onSelect: () => void }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onSelect}
            className={cn(
                'h-10 max-w-[11rem] truncate rounded-full px-3.5 text-sm font-semibold',
                active ? 'bg-forest text-white' : 'bg-[#F2F5F2] text-ink hover:bg-paper',
            )}
        >
            <span className="truncate">{label}</span> <span className={cn('tabular-nums', active ? 'opacity-70' : 'text-moss')}>{count}</span>
        </button>
    );
}

function PageButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'grid size-10 place-items-center rounded-full text-sm font-bold disabled:opacity-40',
                active ? 'bg-forest text-white' : 'border border-[#DDE3DE] hover:bg-paper',
            )}
        >
            {children}
        </button>
    );
}

interface ServiceRowProps {
    service: Service;
    selected: boolean;
    onToggle: () => void;
    teamMembers: TeamMember[];
    selectedTeamMemberId: string;
    onTeamMemberChange: (id: string) => void;
    nextAvailability?: NextAvailability;
    disabled: boolean;
}

function ServiceRow({ service, selected, onToggle, teamMembers, selectedTeamMemberId, onTeamMemberChange, nextAvailability, disabled }: ServiceRowProps) {
    const detail = [formatDuration(Number(service.duration)), service.description].filter(Boolean).join(' · ');

    return (
        <div className={cn('rounded-[20px]', selected ? 'border-2 border-forest bg-paper' : 'border border-line')}>
            <button
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={onToggle}
                className={cn('flex w-full items-center gap-4 text-left disabled:cursor-not-allowed', selected ? 'px-[19px] py-[17px]' : 'px-5 py-4.5')}
            >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold capitalize">{service.name}</span>
                        {service.isMostBooked && <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-forest">Most booked</span>}
                    </span>
                    <span className="line-clamp-1 text-sm text-moss">{detail}</span>
                </span>
                <span className="shrink-0 text-base font-bold">{formatNaira(service.price)}</span>
                <span
                    aria-hidden
                    className={cn('grid size-9 shrink-0 place-items-center rounded-full', selected ? 'bg-forest text-lime' : 'border border-[#DDE3DE] bg-white text-ink')}
                >
                    {selected ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" />}
                </span>
            </button>

            {selected && teamMembers.length > 0 && (
                <div role="radiogroup" aria-label={`Who does your ${service.name}`} className="flex flex-wrap items-center gap-2 px-[19px] pb-4">
                    <span className="mr-1 text-[13px] font-bold text-moss">With</span>
                    <ProChip
                        name="Anyone"
                        isAnyone
                        nextOpening={nextAvailability?.any}
                        loading={!nextAvailability || !('any' in nextAvailability)}
                        active={selectedTeamMemberId === ''}
                        onSelect={() => onTeamMemberChange('')}
                    />
                    {teamMembers.map((member) => (
                        <ProChip
                            key={member.id}
                            name={member.name}
                            avatar={member.avatar}
                            nextOpening={nextAvailability?.[member.id]}
                            loading={!nextAvailability || !(member.id in nextAvailability)}
                            active={selectedTeamMemberId === member.id}
                            onSelect={() => onTeamMemberChange(member.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ProChipProps {
    name: string;
    avatar?: string | null;
    isAnyone?: boolean;
    nextOpening?: string | null;
    loading: boolean;
    active: boolean;
    onSelect: () => void;
}

function ProChip({ name, avatar, isAnyone = false, nextOpening, loading, active, onSelect }: ProChipProps) {
    const firstName = name.split(' ')[0];

    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onSelect}
            className={cn('flex h-9.5 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1', active ? 'border-forest bg-white' : 'border-[#DDE3DE] hover:bg-white')}
        >
            {avatar ? (
                <img src={avatar} alt="" className="size-7.5 rounded-full object-cover" />
            ) : (
                <span
                    aria-hidden
                    className={cn('grid size-7.5 place-items-center rounded-full text-[11px] font-bold', isAnyone ? 'bg-lime text-forest' : 'bg-forest text-lime')}
                >
                    {isAnyone ? '★' : initials(name)}
                </span>
            )}
            <span className="text-[13px] font-semibold">{isAnyone ? name : firstName}</span>
            {!loading && (
                <span className={cn('text-[11px] font-bold', nextOpening ? 'text-leaf' : 'text-moss')}>
                    {nextOpening ? formatNextOpening(nextOpening) : 'Fully booked'}
                </span>
            )}
        </button>
    );
}
