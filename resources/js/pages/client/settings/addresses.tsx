import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { cn } from '@/lib/utils';
import {
    AddressFormDialog,
    emptyAddressForm,
    type AddressFormValues,
} from '@/pages/client/settings/components/address-form-dialog';
import { settingsOutlineButtonClass } from '@/pages/client/settings/components/settings-field';
import { Head } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { gooeyToast as toast } from 'goey-toast';
import { Loader2, MapPinned, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ClientAddress {
    id: string;
    label: string;
    address: string;
    city: string | null;
    state: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    addresses: ClientAddress[];
}

type ApiErrors = Record<string, string | string[]>;

function toCoordinate(value: number | string | null): number | null {
    if (value === null || value === '') {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function flattenErrors(errors: ApiErrors): Record<string, string> {
    return Object.fromEntries(
        Object.entries(errors).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ]),
    );
}

function errorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
}

function fullAddress(address: ClientAddress): string {
    const extras = [address.city, address.state].filter(
        (part): part is string =>
            Boolean(part) &&
            !address.address.toLowerCase().includes(String(part).toLowerCase()),
    );

    return [address.address, ...extras].join(', ');
}

/**
 * Active addresses first, then the rest in the order they were saved.
 */
function sortAddresses(addresses: ClientAddress[]): ClientAddress[] {
    return [...addresses].sort(
        (first, second) => Number(second.is_active) - Number(first.is_active),
    );
}

export default function ClientAddresses({ addresses }: Props) {
    const [items, setItems] = useState<ClientAddress[]>(() =>
        sortAddresses(addresses),
    );
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formValues, setFormValues] =
        useState<AddressFormValues>(emptyAddressForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<ClientAddress | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const editingAddress = items.find((item) => item.id === editingId);

    const applySaved = (saved: ClientAddress) => {
        setItems((previous) => {
            const exists = previous.some((item) => item.id === saved.id);
            const next = exists
                ? previous.map((item) => (item.id === saved.id ? saved : item))
                : [saved, ...previous];

            return sortAddresses(
                saved.is_active
                    ? next.map((item) =>
                          item.id === saved.id
                              ? item
                              : { ...item, is_active: false },
                      )
                    : next,
            );
        });
    };

    const openCreate = () => {
        setEditingId(null);
        setFormValues({
            ...emptyAddressForm,
            label:
                ['Home', 'Office'].find(
                    (preset) =>
                        !items.some(
                            (item) =>
                                item.label.toLowerCase() ===
                                preset.toLowerCase(),
                        ),
                ) ?? '',
            makeActive: items.length === 0,
        });
        setFormErrors({});
        setFormOpen(true);
    };

    const openEdit = (address: ClientAddress) => {
        setEditingId(address.id);
        setFormValues({
            label: address.label,
            address: address.address,
            city: address.city ?? '',
            state: address.state ?? '',
            latitude: toCoordinate(address.latitude),
            longitude: toCoordinate(address.longitude),
            makeActive: address.is_active,
        });
        setFormErrors({});
        setFormOpen(true);
    };

    const handleFormChange = useCallback(
        (values: AddressFormValues) => setFormValues(values),
        [],
    );

    const submitForm = async () => {
        const payload = {
            label: formValues.label.trim(),
            address: formValues.address.trim(),
            city: formValues.city.trim() || null,
            state: formValues.state || null,
            latitude: formValues.latitude,
            longitude: formValues.longitude,
            is_active: formValues.makeActive,
        };

        setIsSaving(true);
        setFormErrors({});

        try {
            const response = editingId
                ? await axios.patch(`/client-addresses/${editingId}`, payload)
                : await axios.post('/client-addresses', payload);

            applySaved(response.data.address as ClientAddress);
            setFormOpen(false);
            toast.success(editingId ? 'Address updated.' : 'Address saved.');
        } catch (error) {
            const errors = isAxiosError(error)
                ? (error.response?.data?.errors as ApiErrors | undefined)
                : undefined;

            if (errors && Object.keys(errors).length > 0) {
                setFormErrors(flattenErrors(errors));
            } else {
                toast.error(
                    errorMessage(error, 'We couldn’t save this address.'),
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const makeActive = async (address: ClientAddress) => {
        setActivatingId(address.id);

        try {
            const response = await axios.patch(
                `/client-addresses/${address.id}`,
                {
                    label: address.label,
                    address: address.address,
                    city: address.city,
                    state: address.state,
                    latitude: toCoordinate(address.latitude),
                    longitude: toCoordinate(address.longitude),
                    is_active: true,
                },
            );
            applySaved(response.data.address as ClientAddress);
            toast.success(`${address.label} is now your active address.`);
        } catch (error) {
            toast.error(
                errorMessage(error, 'We couldn’t change your active address.'),
            );
        } finally {
            setActivatingId(null);
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) {
            return;
        }

        setIsDeleting(true);

        try {
            await axios.delete(`/client-addresses/${pendingDelete.id}`);
            setItems((previous) =>
                previous.filter((item) => item.id !== pendingDelete.id),
            );
            toast.success('Address deleted.');
            setPendingDelete(null);
        } catch (error) {
            toast.error(
                errorMessage(error, 'We couldn’t delete this address.'),
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Head title="Saved addresses" />

            <ClientSettingsLayout bare>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-sage bg-white px-6 py-14 text-center">
                        <span className="grid size-12 place-items-center rounded-2xl bg-mint text-forest">
                            <MapPinned className="size-5" />
                        </span>
                        <p className="mt-4 text-lg font-bold">
                            No saved addresses yet
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-moss">
                            Save your home or office so pros who come to you
                            know where to go.
                        </p>
                        <button
                            type="button"
                            onClick={openCreate}
                            className={cn(settingsOutlineButtonClass, 'mt-6')}
                        >
                            <Plus className="size-4" />
                            Add an address
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <ul className="grid gap-4 md:grid-cols-2">
                            {items.map((address) => (
                                <li
                                    key={address.id}
                                    className={cn(
                                        'flex flex-col rounded-[20px] bg-white px-6 py-5',
                                        address.is_active
                                            ? 'border-2 border-forest'
                                            : 'border border-line',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="truncate text-base font-bold">
                                            {address.label}
                                        </p>
                                        {address.is_active && (
                                            <span className="shrink-0 rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold text-forest">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-[15px] leading-6 text-ink/80">
                                        {fullAddress(address)}
                                    </p>
                                    <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-sm font-semibold">
                                        {!address.is_active && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    makeActive(address)
                                                }
                                                disabled={activatingId !== null}
                                                className="inline-flex items-center gap-1.5 text-forest underline underline-offset-4 hover:text-forest-deep disabled:opacity-50"
                                            >
                                                {activatingId ===
                                                    address.id && (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                )}
                                                Set as active
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openEdit(address)}
                                            className="text-forest underline underline-offset-4 hover:text-forest-deep"
                                        >
                                            Edit
                                        </button>
                                        {!address.is_active && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPendingDelete(address)
                                                }
                                                className="text-red-600 underline underline-offset-4 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex h-16 items-center justify-center gap-2 rounded-[20px] border border-dashed border-sage bg-white text-[15px] font-semibold text-forest transition hover:border-forest hover:bg-paper"
                        >
                            <Plus className="size-4" />
                            Add an address
                        </button>
                    </div>
                )}
            </ClientSettingsLayout>

            <AddressFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                mode={editingId ? 'edit' : 'create'}
                values={formValues}
                onChange={handleFormChange}
                errors={formErrors}
                isSaving={isSaving}
                isActiveAlready={editingAddress?.is_active}
                onSubmit={submitForm}
            />

            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <DialogContent className="gap-0 rounded-3xl p-0 sm:max-w-md">
                    <div className="px-7 pt-7 pb-6">
                        <DialogTitle className="text-xl font-bold">
                            Delete “{pendingDelete?.label}”?
                        </DialogTitle>
                        <DialogDescription className="mt-1.5 text-sm leading-6 text-moss">
                            {pendingDelete && fullAddress(pendingDelete)} will
                            be removed from your saved addresses.
                        </DialogDescription>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-line px-7 py-5">
                        <button
                            type="button"
                            onClick={() => setPendingDelete(null)}
                            className={settingsOutlineButtonClass}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[15px] font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
