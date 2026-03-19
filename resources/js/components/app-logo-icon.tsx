/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
// import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({className, ...props}: any) {
    return (
        <img {...props} src='/logo.png' alt='logo' className={cn('w-44', className)} />
    );
}
