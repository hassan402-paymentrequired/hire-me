import { ProviderCard } from '@/components/site/provider-card';
import { EmptyState } from '@/components/site/empty-state';
import AccountLayout from '@/layouts/account-layout';
import explore from '@/routes/explore';
import { booking as bookProvider } from '@/routes/marketplace';
import { type Provider } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Favourite = Provider & { lastBookedAt: string | null };

export default function Favourites({ favourites }: { favourites: Favourite[] }) {
    return (
        <AccountLayout
            active="favourites"
            title="Favourite pros"
            description="Your go-to people, ready to rebook."
            actions={<span className="text-[15px] text-moss">{favourites.length} saved</span>}
        >
            <Head title="Favourite pros" />

            {favourites.length === 0 ? (
                <EmptyState
                    illustration="favourites"
                    title="No favourites yet"
                    description="Tap the heart on any pro to keep them here for quick rebooking."
                    actions={
                        <Link href={explore.index()} className="flex h-12 items-center rounded-full bg-forest px-6 text-[15px] font-bold text-white">
                            Explore pros
                        </Link>
                    }
                />
            ) : (
                <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {favourites.map((provider) => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            isFavourite
                            footer={
                                <div className="flex flex-col gap-3">
                                    <div className="text-[13px] text-moss">
                                        {provider.lastBookedAt
                                            ? `Last booked ${new Date(provider.lastBookedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                            : 'Not booked yet'}
                                    </div>
                                    <Link
                                        href={bookProvider(provider.slug)}
                                        className="flex h-11 items-center justify-center rounded-full bg-forest text-[15px] font-bold text-white"
                                    >
                                        {provider.lastBookedAt ? 'Book again' : 'Book now'}
                                    </Link>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
