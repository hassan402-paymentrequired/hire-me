import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function History({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Our History
                    </h1>
                    <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
                        <p className="text-lg leading-relaxed">
                            proxideck was founded with a simple idea: make it
                            easier for people to find and book trusted local
                            service providers. What started as a small project
                            has grown into a platform serving thousands of users
                            and providers.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Over the years, we have continuously improved our
                            platform based on user feedback, expanding our
                            service categories and building features that make
                            booking seamless and reliable.
                        </p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
