import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientLayout from '@/layouts/client-layout';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { gooeyToast as toast } from 'goey-toast';
import { MapPin, MapPinned, PencilLine, Plus, Trash2 } from 'lucide-react';
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
    { title: 'Saved addresses', href: '/settings/addresses' },
];

const emptyForm = {
    label: '',
    address: '',
    city: '',
    state: '',
    makeActive: true,
};

export default function ClientAddresses({ addresses }: Props) {
    const [items, setItems] = useState<ClientAddress[]>(addresses);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Create modal
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ ...emptyForm, makeActive: false });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    const resetCreate = () => {
        setForm({ ...emptyForm });
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
                ...prev.map((a) => ({ ...a, is_active: form.makeActive ? false : a.is_active })),
            ]);
            resetCreate();
            setCreateOpen(false);
            toast.success('Address saved.');
        } catch (error: any) {
            const errors = error?.response?.data?.errors ?? {};
            if (Object.keys(errors).length > 0) setFormErrors(errors);
            else toast.error(error?.response?.data?.message || 'Unable to save this address right now.');
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
        setEditErrors({});
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setIsSaving(true);
        setEditErrors({});
        try {
            const response = await axios.patch(`/client-addresses/${editingId}`, {
                label: editForm.label.trim(),
                address: editForm.address.trim(),
                city: editForm.city.trim() || null,
                state: editForm.state.trim() || null,
                latitude: null,
                longitude: null,
                is_active: editForm.makeActive,
            });
            const updated = response.data.address as ClientAddress;
            setItems((prev) => {
                const next = prev.map((item) => (item.id === updated.id ? updated : item));
                if (updated.is_active) return next.map((item) => (item.id === updated.id ? item : { ...item, is_active: false }));
                return next;
            });
            setEditOpen(false);
            setEditingId(null);
            toast.success('Address updated.');
        } catch (error: any) {
            const errors = error?.response?.data?.errors ?? {};
            if (Object.keys(errors).length > 0) setEditErrors(errors);
            else toast.error(error?.response?.data?.message || 'Unable to update this address right now.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (addressId: string) => {
        const address = items.find((item) => item.id === addressId);
        if (!address) return;
        const confirmed = window.confirm(`Delete "${address.label}"? This action cannot be undone.`);
        if (!confirmed) return;
        setIsDeleting(addressId);
        try {
            await axios.delete(`/client-addresses/${addressId}`);
            setItems((prev) => prev.filter((item) => item.id !== addressId));
            toast.success('Address deleted.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Unable to delete this address right now.');
        } finally {
            setIsDeleting(null);
        }
    };

    const makeAddressActive = async (addressId: string) => {
        const address = items.find((item) => item.id === addressId);
        if (!address) return;
        setIsSaving(true);
        try {
            const response = await axios.patch(`/client-addresses/${addressId}`, {
                label: address.label,
                address: address.address,
                city: address.city,
                state: address.state,
                latitude: address.latitude,
                longitude: address.longitude,
                is_active: true,
            });
            const updated = response.data.address as ClientAddress;
            setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : { ...item, is_active: false })));
            toast.success('Current address updated.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Unable to update the active address.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <Head title="Saved addresses" />

            <ClientSettingsLayout>
                <div className="space-y-6">
                    {/* Page header */}
                    <div className="flex items-start justify-between gap-4">
                        <HeadingSmall
                            title="Saved addresses"
                            description="Manage where you want providers to meet you when booking services."
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => { resetCreate(); setCreateOpen(true); }}
                            className="shrink-0 gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Add address
                        </Button>
                    </div>

                    {/* Address list */}
                    {items.length === 0 ? (
                        <EmptyState onAdd={() => { resetCreate(); setCreateOpen(true); }} />
                    ) : (
                        <div className="space-y-3">
                            {items.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    address={address}
                                    isDeleting={isDeleting === address.id}
                                    isSaving={isSaving}
                                    onEdit={() => startEditing(address)}
                                    onDelete={() => handleDelete(address.id)}
                                    onMakeActive={() => makeAddressActive(address.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ClientSettingsLayout>

            {/* ── Create Modal ── */}
            <AddressModal
                open={createOpen}
                onOpenChange={(open) => { if (!open) resetCreate(); setCreateOpen(open); }}
                title="Add an address"
                description="Save a location for faster booking next time."
                form={form}
                onFormChange={(next) => setForm(next)}
                errors={formErrors}
                isSaving={isSaving}
                onSave={handleCreate}
                onCancel={() => { resetCreate(); setCreateOpen(false); }}
                saveLabel="Save address"
                cancelLabel="Cancel"
                icon={<MapPin className="h-4 w-4 text-primary" />}
            />

            {/* ── Edit Modal ── */}
            <AddressModal
                open={editOpen}
                onOpenChange={(open) => { if (!open) { setEditingId(null); setEditErrors({}); } setEditOpen(open); }}
                title="Edit address"
                description="Update the details for this saved location."
                form={editForm}
                onFormChange={(next) => setEditForm(next)}
                errors={editErrors}
                isSaving={isSaving}
                onSave={handleUpdate}
                onCancel={() => { setEditOpen(false); setEditingId(null); }}
                saveLabel="Save changes"
                cancelLabel="Cancel"
                icon={<PencilLine className="h-4 w-4 text-primary" />}
            />
        </ClientLayout>
    );
}

// ─────────────────────────────────────────────
// Shared Address Modal
// ─────────────────────────────────────────────

interface FormState {
    label: string;
    address: string;
    city: string;
    state: string;
    makeActive: boolean;
}

interface AddressModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    form: FormState;
    onFormChange: (next: FormState) => void;
    errors: Record<string, string>;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
    cancelLabel: string;
    icon: React.ReactNode;
}

function AddressModal({
    open,
    onOpenChange,
    title,
    description,
    form,
    onFormChange,
    errors,
    isSaving,
    onSave,
    onCancel,
    saveLabel,
    cancelLabel,
    icon,
}: AddressModalProps) {
    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        onFormChange({ ...form, [key]: e.target.value });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                {/* Header */}
                <div className="border-b bg-muted/30 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
                            {icon}
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold leading-tight">{title}</DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">{description}</DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-6">
                    {/* Label */}
                    <div className="space-y-1.5">
                        <Label htmlFor="addr-label" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Label
                        </Label>
                        <Input
                            id="addr-label"
                            placeholder="e.g. Home, Office, Mom's house"
                            value={form.label}
                            onChange={set('label')}
                            className="h-10"
                        />
                        <InputError message={errors.label} />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label htmlFor="addr-address" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Street address
                        </Label>
                        <Input
                            id="addr-address"
                            placeholder="12 Admiralty Way, Lekki Phase 1"
                            value={form.address}
                            onChange={set('address')}
                            className="h-10"
                        />
                        <InputError message={errors.address} />
                    </div>

                    {/* City + State */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="addr-city" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                City
                            </Label>
                            <Input
                                id="addr-city"
                                placeholder="Lekki"
                                value={form.city}
                                onChange={set('city')}
                                className="h-10"
                            />
                            <InputError message={errors.city} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="addr-state" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                State
                            </Label>
                            <Input
                                id="addr-state"
                                placeholder="Lagos"
                                value={form.state}
                                onChange={set('state')}
                                className="h-10"
                            />
                            <InputError message={errors.state} />
                        </div>
                    </div>

                    {/* Set active */}
                    <div className="rounded-lg border bg-muted/20 divide-y">
                        <label
                            htmlFor="addr-active"
                            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                        >
                            <Checkbox
                                id="addr-active"
                                checked={form.makeActive}
                                onCheckedChange={(checked) => onFormChange({ ...form, makeActive: checked === true })}
                            />
                            <p className="text-sm font-medium text-foreground">Set as my active address</p>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
                        {cancelLabel}
                    </Button>
                    <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving…' : saveLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// Address Card
// ─────────────────────────────────────────────

interface AddressCardProps {
    address: ClientAddress;
    isDeleting: boolean;
    isSaving: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onMakeActive: () => void;
}

function AddressCard({ address, isDeleting, isSaving, onEdit, onDelete, onMakeActive }: AddressCardProps) {
    return (
        <div className="group flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background p-4 transition-colors hover:bg-muted/20">
            {/* Left: icon + info */}
            <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{address.label}</p>
                        {address.is_active && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                                Active
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-foreground/80 leading-snug">{address.address}</p>
                    {(address.city || address.state) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {[address.city, address.state].filter(Boolean).join(', ')}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex shrink-0 items-center gap-1.5">
                {!address.is_active && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onMakeActive}
                        disabled={isSaving}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Set active
                    </Button>
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 w-8 p-0"
                    title="Edit"
                >
                    <PencilLine className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-destructive hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 bg-muted/10 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MapPinned className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">No saved addresses yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Add a location to make booking faster next time.</p>
            </div>
            <Button type="button" size="sm" onClick={onAdd} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add your first address
            </Button>
        </div>
    );
}