import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function About({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        About Clockra
                    </h1>
                    <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
                        <p className="text-lg leading-relaxed">
                            Clockra is your trusted platform for discovering and connecting with local service
                            providers. We believe everyone deserves easy access to quality services, from home
                            repairs to personal care and professional expertise.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Our mission is to simplify how people find and book trusted professionals in their
                            area. We vet our providers to ensure you get the best experience every time.
                        </p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
