import { BookingWidget } from '@/widgets/booking-widget';
import { useEffect, useRef } from 'react';

interface Props {
    slug: string;
    customization?: {
        primaryColor?: string;
        size?: 'small' | 'medium' | 'large';
        cardBackground?: string;
        textColor?: string;
        borderRadius?: string;
        padding?: string;
        borderColor?: string;
        inputBackground?: string;
        inputBorderColor?: string;
        inputTextColor?: string;
        buttonBorderRadius?: string;
        buttonFontSize?: string;
        labelFontSize?: string;
        labelFontWeight?: string;
        serviceCardHoverColor?: string;
        summaryBackground?: string;
        fontFamily?: string;
        boxShadow?: string;
    };
}

export default function WidgetEmbed({ slug, customization }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Apply customization styles
    useEffect(() => {
        if (customization) {
            if (customization.primaryColor) {
                document.documentElement.style.setProperty('--widget-primary', customization.primaryColor);
            }
            if (customization.cardBackground) {
                document.documentElement.style.setProperty('--widget-card-bg', customization.cardBackground);
            }
            if (customization.textColor) {
                document.documentElement.style.setProperty('--widget-text', customization.textColor);
            }
        }
    }, [customization]);

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

    const finalColor = customization?.primaryColor || '#3B82F6';
    const finalSize = customization?.size || 'medium';
    const cardBg = customization?.cardBackground || '#FFFFFF';
    const textColor = customization?.textColor || '#000000';
    const borderRadius = customization?.borderRadius || '8';
    const padding = customization?.padding || '24';
    
    const getBoxShadow = () => {
        const shadow = customization?.boxShadow || 'md';
        switch (shadow) {
            case 'none': return 'none';
            case 'sm': return '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            case 'md': return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
            case 'lg': return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            default: return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
        }
    };

    return (
        <div 
            ref={containerRef} 
            style={{
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                minHeight: 'auto',
                fontFamily: customization?.fontFamily || undefined,
            }}
        >
            <div 
                className="mx-auto"
                style={{
                    backgroundColor: cardBg,
                    color: textColor,
                    borderRadius: `${borderRadius}px`,
                    padding: `${padding}px`,
                    maxWidth: finalSize === 'small' ? '400px' : finalSize === 'medium' ? '600px' : '800px',
                    boxShadow: getBoxShadow(),
                }}
            >
                <BookingWidget 
                    slug={slug} 
                    apiBaseUrl={window.location.origin}
                    primaryColor={finalColor}
                    size={finalSize}
                    cardBackground={cardBg}
                    textColor={textColor}
                    borderRadius={borderRadius}
                    padding={padding}
                    borderColor={customization?.borderColor}
                    inputBackground={customization?.inputBackground}
                    inputBorderColor={customization?.inputBorderColor}
                    inputTextColor={customization?.inputTextColor}
                    buttonBorderRadius={customization?.buttonBorderRadius}
                    buttonFontSize={customization?.buttonFontSize}
                    labelFontSize={customization?.labelFontSize}
                    labelFontWeight={customization?.labelFontWeight}
                    serviceCardHoverColor={customization?.serviceCardHoverColor}
                    summaryBackground={customization?.summaryBackground}
                    fontFamily={customization?.fontFamily}
                    boxShadow={customization?.boxShadow}
                />
            </div>
        </div>
    );
}
