import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientLayout from '@/layouts/client-layout';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { gooeyToast as toast } from 'goey-toast';
import { MapPin, PencilLine, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ClientAddress {
    id: string;
    label: string;
    address: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    addresses: ClientAddress[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Saved addresses',
        href: '/settings/addresses',
    },
];

export default function ClientAddresses({ addresses }: Props) {
    const [items, setItems] = useState<ClientAddress[]>(addresses);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        label: '',
        address: '',
        city: '',
        state: '',
        makeActive: true,
    });
    const [editForm, setEditForm] = useState({
        label: '',
        address: '',
        city: '',
        state: '',
        makeActive: false,
    });

    const resetForm = () => {
        setForm({
            label: '',
            address: '',
            city: '',
            state: '',
            makeActive: true,
        });
        setFormErrors({});
    };

    const handleCreate = async () => {
        setIsSaving(true);
        setFormErrors({});

        try {
            const response = await axios.post('/client-addresses', {
                label: form.label.trim(),
                address: form.address.trim(),
                city: form.city.trim() || null,
                state: form.state.trim() || null,
                latitude: null,
                longitude: null,
                is_active: form.makeActive,
            });

            const created = response.data.address as ClientAddress;
            setItems((prev) => [
                created,
                ...prev.map((address) => ({ ...address, is_active: false })),
            ]);
            resetForm();
            toast.success('Address saved.');
        } catch (error: any) {
            const errors = error?.response?.data?.errors ?? {};
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
            } else {
                toast.error(
                    error?.response?.data?.message ||
                        'Unable to save this address right now.',
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (address: ClientAddress) => {
        setEditingId(address.id);
        setEditForm({
            label: address.label,
            address: address.address,
            city: address.city ?? '',
            state: address.state ?? '',
            makeActive: address.is_active,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({
            label: '',
            address: '',
            city: '',
            state: '',
            makeActive: false,
        });
    };

    const handleUpdate = async (addressId: string) => {
        setIsSaving(true);
        setFormErrors({});

        try {
            const response = await axios.patch(
                `/client-addresses/${addressId}`,
                {
                    label: editForm.label.trim(),
                    address: editForm.address.trim(),
                    city: editForm.city.trim() || null,
                    state: editForm.state.trim() || null,
                    latitude: null,
                    longitude: null,
                    is_active: editForm.makeActive,
                },
            );

            const updated = response.data.address as ClientAddress;
            setItems((prev) => {
                const next = prev.map((item) =>
                    item.id === updated.id ? updated : item,
                );
                if (updated.is_active) {
                    return next.map((item) =>
                        item.id === updated.id
                            ? item
                            : { ...item, is_active: false },
                    );
                }
                return next;
            });
            cancelEditing();
            toast.success('Address updated.');
        } catch (error: any) {
            const errors = error?.response?.data?.errors ?? {};
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
            } else {
                toast.error(
                    error?.response?.data?.message ||
                        'Unable to update this address right now.',
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (addressId: string) => {
        const address = items.find((item) => item.id === addressId);
        if (!address) return;

        const confirmed = window.confirm(
            `Delete "${address.label}"? This action cannot be undone.`,
        );
        if (!confirmed) return;

        setIsDeleting(addressId);
        try {
            await axios.delete(`/client-addresses/${addressId}`);
            setItems((prev) => prev.filter((item) => item.id !== addressId));
            toast.success('Address deleted.');
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    'Unable to delete this address right now.',
            );
        } finally {
            setIsDeleting(null);
        }
    };

    const makeAddressActive = async (addressId: string) => {
        const address = items.find((item) => item.id === addressId);
        if (!address) return;

        setIsSaving(true);
        try {
            const response = await axios.patch(
                `/client-addresses/${addressId}`,
                {
                    label: address.label,
                    address: address.address,
                    city: address.city,
                    state: address.state,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    is_active: true,
                },
            );

            const updated = response.data.address as ClientAddress;
            setItems((prev) =>
                prev.map((item) =>
                    item.id === updated.id
                        ? updated
                        : { ...item, is_active: false },
                ),
            );
            toast.success('Current address updated.');
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    'Unable to update the active address.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <Head title="Saved addresses" />

            <ClientSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Saved addresses"
                        description="Manage where you want providers to meet you when booking services."
                    />

                    <Card className="border-border/70">
                        <CardContent className="space-y-4 p-5">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Add a new address
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Save multiple locations and set a default.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="address-label">Label</Label>
                                    <Input
                                        id="address-label"
                                        placeholder="Home, Office, Workshop"
                                        value={form.label}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                label: e.target.value,
                                            }))
                                        }
                                    />
                                    <InputError message={formErrors.label} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address-state">State</Label>
                                    <Input
                                        id="address-state"
                                        placeholder="Lagos"
                                        value={form.state}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                state: e.target.value,
                                            }))
                                        }
                                    />
                                    <InputError message={formErrors.state} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address-line">Address</Label>
                                <Input
                                    id="address-line"
                                    placeholder="12 Admiralty Way, Lekki Phase 1"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                />
                                <InputError message={formErrors.address} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address-city">City</Label>
                                <Input
                                    id="address-city"
                                    placeholder="Lekki"
                                    value={form.city}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            city: e.target.value,
                                        }))
                                    }
                                />
                                <InputError message={formErrors.city} />
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                                <Checkbox
                                    id="address-active"
                                    checked={form.makeActive}
                                    onCheckedChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            makeActive: checked === true,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="address-active"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Set as my current address
                                </label>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={handleCreate}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save address'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">
                                Your saved addresses
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {items.length} total
                            </span>
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                                No saved addresses yet. Add one above to make
                                booking faster.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((address) => (
                                    <Card
                                        key={address.id}
                                        className="border-border/70"
                                    >
                                        <CardContent className="space-y-4 p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <MapPin className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {address.label}
                                                            </p>
                                                            {address.is_active && (
                                                                <Badge variant="secondary">
                                                                    Active
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-foreground">
                                                            {address.address}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {[
                                                                address.city,
                                                                address.state,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ') ||
                                                                'Saved location'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {!address.is_active && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                makeAddressActive(
                                                                    address.id,
                                                                )
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            Make active
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            startEditing(
                                                                address,
                                                            )
                                                        }
                                                    >
                                                        <PencilLine className="size-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                address.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isDeleting ===
                                                            address.id
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                        {isDeleting ===
                                                        address.id
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {editingId === address.id && (
                                                <div className="grid gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-2">
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Label</Label>
                                                        <Input
                                                            value={
                                                                editForm.label
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        label: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                formErrors.label
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Address</Label>
                                                        <Input
                                                            value={
                                                                editForm.address
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        address:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                formErrors.address
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>City</Label>
                                                        <Input
                                                            value={
                                                                editForm.city
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        city: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>State</Label>
                                                        <Input
                                                            value={
                                                                editForm.state
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        state: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3">
                                                            <Checkbox
                                                                id={`active-${address.id}`}
                                                                checked={
                                                                    editForm.makeActive
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setEditForm(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            makeActive:
                                                                                checked ===
                                                                                true,
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`active-${address.id}`}
                                                                className="text-sm font-medium text-foreground"
                                                            >
                                                                Set as my
                                                                current address
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdate(
                                                                    address.id,
                                                                )
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving
                                                                ? 'Saving...'
                                                                : 'Save changes'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={
                                                                cancelEditing
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ClientSettingsLayout>
        </ClientLayout>
    );
}
