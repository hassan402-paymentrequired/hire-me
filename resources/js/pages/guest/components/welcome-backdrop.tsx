export function WelcomeBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden bg-[#EEF6F0]"
        >
            <img
                src="/brand/banners/proxideck-banner-general-light.svg"
                alt=""
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        </div>
    );
}
