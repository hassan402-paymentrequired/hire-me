import KeenIcon from '@/components/keen-icon';
import { AppSelect } from '@/components/ui/app-select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import BusinessHoursLayout from '@/layouts/business-hours/layout';
import {
    formatHour,
    type Holiday,
    toHours,
    type WeeklySchedule,
} from '@/lib/schedule';
import { cn } from '@/lib/utils';
import business from '@/routes/business';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Hours', href: business.hours().url },
    { title: 'Holidays', href: '/business/hours/holidays' },
];

interface Props {
    initialSchedule: WeeklySchedule | null;
    initialHolidays: Holiday[];
}

const emptyHoliday: Holiday = {
    name: '',
    date: '',
    type: 'closed',
    customHours: { start: '09:00', end: '17:00' },
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const value = `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`;

    return { value, label: formatHour(toHours(value)) };
});

const card =
    'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
const inputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

function HolidayRow({
    holiday,
    onEdit,
    onRemove,
}: {
    holiday: Holiday;
    onEdit: () => void;
    onRemove: () => void;
}) {
    const date = parseISO(holiday.date);
    const isCustom = holiday.type === 'custom' && holiday.customHours;

    return (
        <li className="flex flex-wrap items-center gap-3.5 border-t border-[#0E3B2E]/[0.07] px-[22px] py-4 dark:border-white/10">
            <div className="flex size-[52px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                <span className="text-[11px] font-bold uppercase">
                    {format(date, 'MMM')}
                </span>
                <span className="font-[Sora] text-lg leading-none font-bold">
                    {format(date, 'dd')}
                </span>
            </div>
            <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                <span className="truncate text-[15px] font-bold text-foreground">
                    {holiday.name}
                </span>
                <span className="text-[13px] text-muted-foreground">
                    {format(date, 'EEEE, d MMMM yyyy')} ·{' '}
                    {isCustom
                        ? `Open ${formatHour(toHours(holiday.customHours!.start))} – ${formatHour(toHours(holiday.customHours!.end))}`
                        : 'Closed all day'}
                </span>
            </div>
            <span
                className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-bold',
                    isCustom
                        ? 'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                {isCustom ? 'Special hours' : 'Closed'}
            </span>
            <button
                type="button"
                aria-label={`Edit ${holiday.name}`}
                onClick={onEdit}
                className="flex size-10 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-muted-foreground hover:bg-muted dark:border-white/15"
            >
                <KeenIcon name="pencil" className="text-base" />
            </button>
            <button
                type="button"
                aria-label={`Remove ${holiday.name}`}
                onClick={onRemove}
                className="flex size-10 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-red-700 hover:bg-red-50 dark:border-white/15 dark:text-red-300 dark:hover:bg-red-950/30"
            >
                <KeenIcon name="trash" className="text-base" />
            </button>
        </li>
    );
}

export default function BusinessHoursHolidays({
    initialHolidays,
}: Props) {
    const form = useForm<{ holidays: Holiday[] }>({
        holidays: initialHolidays || [],
    });
    const [draft, setDraft] = useState<Holiday>(emptyHoliday);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const indexed = form.data.holidays
        .map((holiday, index) => ({ holiday, index }))
        .filter(({ holiday }) => holiday?.date)
        .sort((a, b) => a.holiday.date.localeCompare(b.holiday.date));
    const today = startOfToday();
    const upcoming = indexed.filter(
        ({ holiday }) => !isBefore(parseISO(holiday.date), today),
    );
    const past = indexed
        .filter(({ holiday }) => isBefore(parseISO(holiday.date), today))
        .reverse();

    const resetDraft = () => {
        setDraft(emptyHoliday);
        setEditingIndex(null);
    };

    const saveDraft = () => {
        if (!draft.name.trim() || !draft.date) {
            return;
        }

        const holiday: Holiday = {
            ...draft,
            name: draft.name.trim(),
            customHours: draft.customHours ?? emptyHoliday.customHours,
        };

        form.setData(
            'holidays',
            editingIndex === null
                ? [...form.data.holidays, holiday]
                : form.data.holidays.map((item, index) =>
                      index === editingIndex ? holiday : item,
                  ),
        );
        resetDraft();
    };

    const removeHoliday = (index: number) => {
        form.setData(
            'holidays',
            form.data.holidays.filter((_, idx) => idx !== index),
        );

        if (editingIndex === index) {
            resetDraft();
        }
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setDraft({ ...emptyHoliday, ...form.data.holidays[index] });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Holidays" />

            <BusinessHoursLayout>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/hours/holidays', {
                            preserveScroll: true,
                        });
                    }}
                    className="flex flex-wrap items-start gap-6"
                >
                    <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
                        <section className={cn(card, 'overflow-hidden')}>
                            <div className="flex items-center justify-between px-[22px] py-[18px]">
                                <span className="font-[Sora] text-[17px] font-semibold text-foreground">
                                    Upcoming
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    {upcoming.length} date
                                    {upcoming.length === 1 ? '' : 's'}
                                </span>
                            </div>
                            {upcoming.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 border-t border-[#0E3B2E]/[0.07] py-12 text-center dark:border-white/10">
                                    <KeenIcon
                                        name="calendar"
                                        className="text-3xl text-[#A9C7B8]"
                                    />
                                    <span className="text-sm font-semibold text-foreground">
                                        No upcoming holidays
                                    </span>
                                    <span className="text-[13px] text-muted-foreground">
                                        Add public holidays or days off so
                                        clients can’t book them.
                                    </span>
                                </div>
                            ) : (
                                <ul>
                                    {upcoming.map(({ holiday, index }) => (
                                        <HolidayRow
                                            key={`${holiday.date}-${index}`}
                                            holiday={holiday}
                                            onEdit={() => startEdit(index)}
                                            onRemove={() =>
                                                removeHoliday(index)
                                            }
                                        />
                                    ))}
                                </ul>
                            )}
                        </section>

                        {past.length > 0 && (
                            <section
                                className={cn(
                                    card,
                                    'overflow-hidden opacity-75',
                                )}
                            >
                                <div className="px-[22px] py-[18px]">
                                    <span className="font-[Sora] text-[17px] font-semibold text-foreground">
                                        Past
                                    </span>
                                </div>
                                <ul>
                                    {past.map(({ holiday, index }) => (
                                        <HolidayRow
                                            key={`${holiday.date}-${index}`}
                                            holiday={holiday}
                                            onEdit={() => startEdit(index)}
                                            onRemove={() =>
                                                removeHoliday(index)
                                            }
                                        />
                                    ))}
                                </ul>
                            </section>
                        )}

                        {form.isDirty && (
                            <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl bg-[#0E3B2E] px-[18px] py-3.5 text-white shadow-[0_20px_50px_rgba(14,59,46,0.35)]">
                                <span className="flex flex-[1_1_240px] items-center gap-2.5 text-sm font-semibold">
                                    <span className="size-2 rounded-full bg-[#C8F169]" />
                                    You have unsaved changes
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        form.reset();
                                        resetDraft();
                                    }}
                                    className="h-11 rounded-xl border border-white/25 px-4 text-sm font-bold text-white hover:bg-white/10"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex h-11 items-center gap-2 rounded-xl bg-[#C8F169] px-[18px] text-sm font-bold text-[#0E3B2E] disabled:opacity-70"
                                >
                                    {form.processing && <Spinner />}
                                    Save holidays
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex max-w-[380px] flex-[1_1_320px] flex-col gap-4">
                        <section
                            className={cn(card, 'flex flex-col gap-3.5 p-5')}
                        >
                            <span className="font-[Sora] text-base font-semibold text-foreground">
                                {editingIndex === null
                                    ? 'Add a holiday or day off'
                                    : 'Edit date'}
                            </span>
                            <label className="flex flex-col gap-2">
                                <span className="text-[13px] font-bold text-foreground">
                                    Name
                                </span>
                                <input
                                    value={draft.name}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Christmas Day"
                                    className={inputClass}
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-[13px] font-bold text-foreground">
                                    Date
                                </span>
                                <input
                                    type="date"
                                    value={draft.date}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            date: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </label>
                            <div className="flex flex-col gap-2">
                                <span className="text-[13px] font-bold text-foreground">
                                    On this day
                                </span>
                                <div
                                    role="radiogroup"
                                    className="flex gap-1 rounded-xl bg-muted p-1"
                                >
                                    {[
                                        {
                                            value: 'closed',
                                            label: 'Closed all day',
                                        },
                                        {
                                            value: 'custom',
                                            label: 'Special hours',
                                        },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={
                                                draft.type === option.value
                                            }
                                            onClick={() =>
                                                setDraft({
                                                    ...draft,
                                                    type: option.value,
                                                })
                                            }
                                            className={cn(
                                                'h-10 flex-1 rounded-[9px] text-[13px] font-bold',
                                                draft.type === option.value
                                                    ? 'bg-card text-foreground shadow-sm'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {draft.type === 'custom' && (
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['start', 'end'] as const).map(
                                        (field) => (
                                            <label
                                                key={field}
                                                className="flex flex-col gap-2"
                                            >
                                                <span className="text-[13px] font-bold text-foreground">
                                                    {field === 'start'
                                                        ? 'Opens'
                                                        : 'Closes'}
                                                </span>
                                                <AppSelect
                                                    value={
                                                        draft.customHours?.[
                                                            field
                                                        ]
                                                    }
                                                    onChange={(value) =>
                                                        setDraft({
                                                            ...draft,
                                                            customHours: {
                                                                ...(draft.customHours ??
                                                                    emptyHoliday.customHours!),
                                                                [field]: value,
                                                            },
                                                        })
                                                    }
                                                    options={timeOptions}
                                                    searchable={false}
                                                />
                                            </label>
                                        ),
                                    )}
                                </div>
                            )}
                            <div className="flex gap-2.5">
                                {editingIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={resetDraft}
                                        className="h-12 flex-1 rounded-xl border border-[#0E3B2E]/15 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={saveDraft}
                                    disabled={!draft.name.trim() || !draft.date}
                                    className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-sm font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                >
                                    <KeenIcon
                                        name={
                                            editingIndex === null
                                                ? 'plus'
                                                : 'check'
                                        }
                                        className="text-base"
                                    />
                                    {editingIndex === null
                                        ? 'Add date'
                                        : 'Update date'}
                                </button>
                            </div>
                        </section>

                        <div className="flex gap-3 rounded-2xl bg-[#C8F169] p-4 text-[#0E3B2E]">
                            <KeenIcon
                                name="information-2"
                                className="text-xl"
                            />
                            <span className="text-[13px] leading-normal font-semibold">
                                Holidays override your weekly hours. Existing
                                bookings on these dates aren’t cancelled
                                automatically.
                            </span>
                        </div>

                    </div>
                </form>
            </BusinessHoursLayout>
        </AppLayout>
    );
}
