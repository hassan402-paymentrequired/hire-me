import { cn, isSameUrl } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Building2, Image as ImageIcon, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const items = [
    { title: 'General Info', href: '/business/settings', icon: Building2 },
    { title: 'Location', href: '/business/settings/location', icon: MapPin },
    { title: 'Advanced Settings', href: '/business/settings/advanced', icon: SettingsIcon },
    { title: 'Images & Logo', href: '/business/settings/appearance', icon: ImageIcon },
];

export default function BusinessSettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col p-4 md:p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Business Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your business profile and booking preferences.
                </p>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border no-scrollbar">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        className={cn(
                            'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-smooth',
                            isSameUrl(currentPath, item.href)
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <item.icon size={18} />
                        {item.title}
                    </Link>
                ))}
            </div>

            <section className="space-y-6">{children}</section>
        </main>
    );
}
