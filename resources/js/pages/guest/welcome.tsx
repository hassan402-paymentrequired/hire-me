import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { HeaderFilter } from '@/pages/guest/components/filter';

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    servicesCount: number;
    services: string[];
}

interface Props {
    providers: Provider[];
    canRegister: boolean;
}

export default function Welcome({ providers }: Props) {
    return (
        <>
            <Head title="Find Services">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <AppLayout>
                <div className="flex flex-col space-y-6 px-5 box-border overflow-hidden">
                    {/* Top Filter Bar */}
                    <HeaderFilter />

                    {/* Main Content Grid */}
                    <div className="px-1 py-4">
                        {providers.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No providers available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {providers.map((provider) => (
                                    <Link
                                        key={provider.id}
                                        href={`/provider/${provider.slug}`}
                                        className="group flex flex-col space-y-3 hover:border p-2 rounded"
                                    >
                                        {/* Card Image/Placeholder */}
                                        <div className="relative aspect-[4/3] overflow-hidden rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                                    {provider.businessName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                                                </p>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>

                                        {/* Card Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="space-y-1">
                                                <h3 className="line-clamp-1 font-semibold text-foreground group-hover:underline">
                                                    {provider.businessName}
                                                </h3>
                                                <p className="line-clamp-1 text-sm text-muted-foreground">
                                                    by {provider.name}
                                                </p>
                                            </div>

                                            {provider.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {provider.description}
                                                </p>
                                            )}

                                            {provider.services.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {provider.services.map((service, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {service}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
