import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L8 20H40L24 4Z" fill="currentColor"/>
            <path d="M24 14L12 30H36L24 14Z" fill="currentColor" opacity="0.6"/>
            <path d="M24 24L16 40H32L24 24Z" fill="currentColor" opacity="0.3"/>
        </svg>
    );
}
