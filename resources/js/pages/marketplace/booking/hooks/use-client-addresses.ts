import { gooeyToast as toast } from 'goey-toast';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import type {
    AddressFormState,
    AddressSummary,
    BusinessAddressOption,
    ClientAddressOption,
} from '../types';

const EMPTY_FORM: AddressFormState = {
    label: '',
    address: '',
    city: '',
    state: '',
    latitude: null,
    longitude: null,
};

interface UseClientAddressesArgs {
    initialClientAddresses: ClientAddressOption[];
    businessAddressOption?: BusinessAddressOption | null;
}

interface UseClientAddressesResult {
    clientAddresses: ClientAddressOption[];
    selectedAddressChoice: string;
    setSelectedAddressChoice: (next: string) => void;
    selectedAddressSummary: AddressSummary | null;
    addressForm: AddressFormState;
    setAddressForm: (next: AddressFormState) => void;
    resetAddressForm: () => void;
    creatingAddress: boolean;
    locatingAddress: boolean;
    attachCurrentLocation: boolean;
    setAttachCurrentLocation: (next: boolean) => void;
    setAddressAsActive: boolean;
    setSetAddressAsActive: (next: boolean) => void;
    lastCreatedAddressId: string | null;
    createAddress: () => Promise<ClientAddressOption | null>;
    hasSavedAddressOptions: boolean;
    hasBusinessAddressOption: boolean;
}

export function useClientAddresses({
    initialClientAddresses,
    businessAddressOption,
}: UseClientAddressesArgs): UseClientAddressesResult {
    const [clientAddresses, setClientAddresses] = useState<ClientAddressOption[]>(
        initialClientAddresses,
    );
    const [selectedAddressChoice, setSelectedAddressChoice] = useState<string>(
        initialClientAddresses.find((address) => address.is_active)?.id ||
            '__none__',
    );
    const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_FORM);
    const [creatingAddress, setCreatingAddress] = useState(false);
    const [locatingAddress, setLocatingAddress] = useState(false);
    const [attachCurrentLocation, setAttachCurrentLocation] = useState(false);
    const [setAddressAsActive, setSetAddressAsActive] = useState(true);
    const [lastCreatedAddressId, setLastCreatedAddressId] = useState<string | null>(
        null,
    );

    const hasSavedAddressOptions = clientAddresses.length > 0;
    const hasBusinessAddressOption = Boolean(businessAddressOption?.address);

    const resetAddressForm = () => setAddressForm(EMPTY_FORM);

    const captureCurrentLocation = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setLocatingAddress(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setAddressForm({
                    ...addressForm,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocatingAddress(false);
                toast.success('Current location attached to this address.');
            },
            () => {
                setLocatingAddress(false);
                toast.error(
                    'We could not access your current location. You can still save the address manually.',
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        if (attachCurrentLocation) {
            captureCurrentLocation();
        } else {
            setAddressForm((prev) => ({
                ...prev,
                latitude: null,
                longitude: null,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachCurrentLocation]);

    const createAddress = async (): Promise<ClientAddressOption | null> => {
        if (!addressForm.label.trim() || !addressForm.address.trim()) {
            toast.error('Please add a label and address.');
            return null;
        }
        setCreatingAddress(true);
        try {
            const response = await axios.post('/client-addresses', {
                label: addressForm.label.trim(),
                address: addressForm.address.trim(),
                city: addressForm.city.trim() || null,
                state: addressForm.state.trim() || null,
                latitude: addressForm.latitude,
                longitude: addressForm.longitude,
                is_active: setAddressAsActive,
            });
            const createdAddress = response.data.address as ClientAddressOption;
            setClientAddresses((prev) => [
                createdAddress,
                ...prev.map((address) => ({
                    ...address,
                    is_active: false,
                })),
            ]);
            setSelectedAddressChoice(createdAddress.id);
            setSetAddressAsActive(true);
            setLastCreatedAddressId(createdAddress.id);
            resetAddressForm();
            toast.success('Address saved successfully.');
            return createdAddress;
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                'We could not save that address right now.';
            toast.error(message);
            return null;
        } finally {
            setCreatingAddress(false);
        }
    };

    const selectedAddressSummary = useMemo<AddressSummary | null>(() => {
        if (selectedAddressChoice === '__business__' && businessAddressOption) {
            return {
                label: businessAddressOption.label,
                address: businessAddressOption.address,
                meta: [businessAddressOption.city, businessAddressOption.state]
                    .filter(Boolean)
                    .join(', '),
            };
        }

        const selectedAddress = clientAddresses.find(
            (address) => address.id === selectedAddressChoice,
        );

        if (!selectedAddress) {
            return null;
        }

        return {
            label: selectedAddress.label,
            address: selectedAddress.address,
            meta: [selectedAddress.city, selectedAddress.state]
                .filter(Boolean)
                .join(', '),
        };
    }, [businessAddressOption, clientAddresses, selectedAddressChoice]);

    return {
        clientAddresses,
        selectedAddressChoice,
        setSelectedAddressChoice,
        selectedAddressSummary,
        addressForm,
        setAddressForm,
        resetAddressForm,
        creatingAddress,
        locatingAddress,
        attachCurrentLocation,
        setAttachCurrentLocation,
        setAddressAsActive,
        setSetAddressAsActive,
        lastCreatedAddressId,
        createAddress,
        hasSavedAddressOptions,
        hasBusinessAddressOption,
    };
}
