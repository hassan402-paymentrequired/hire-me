/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePage } from '@inertiajs/react';
import { gooeyToast } from 'goey-toast';
import { useEffect } from 'react';

const ToastNotification = () => {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            gooeyToast.success('Success!', {
                description: flash.success,
                bounce: 0.35,
            })
        }

        if (flash?.error) {
            gooeyToast.error('Opps!', {
                description: flash.success,
                bounce: 0.35,
            })
        }
    }, [flash]);

    return null;
};

export default ToastNotification;
