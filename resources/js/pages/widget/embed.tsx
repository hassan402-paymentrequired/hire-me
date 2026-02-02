import { BookingWidget } from '@/widgets/booking-widget';
import { useEffect, useRef } from 'react';

interface Props {
    slug: string;
    primaryColor?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function WidgetEmbed({ slug, primaryColor, size }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Get parameters from URL if not provided
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlColor = params.get('color');
        const urlSize = params.get('size') as 'small' | 'medium' | 'large' | null;
        
        if (urlColor && !primaryColor) {
            document.documentElement.style.setProperty('--primary', urlColor);
        }
    }, []);

    // Send resize message to parent if in iframe
    useEffect(() => {
        const sendResize = () => {
            if (containerRef.current && window.parent !== window) {
                const height = containerRef.current.scrollHeight;
                window.parent.postMessage({
                    type: 'clockra-widget-resize',
                    height: height
                }, '*');
            }
        };

        // Send initial resize
        sendResize();

        // Send resize on content changes
        const observer = new MutationObserver(sendResize);
        if (containerRef.current) {
            observer.observe(containerRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        // Also listen for window resize
        window.addEventListener('resize', sendResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', sendResize);
        };
    }, []);

    const finalColor = primaryColor || '#3B82F6';
    const finalSize = size || 'medium';

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4">
            <BookingWidget 
                slug={slug} 
                apiBaseUrl={window.location.origin}
                primaryColor={finalColor}
                size={finalSize}
            />
        </div>
    );
}
