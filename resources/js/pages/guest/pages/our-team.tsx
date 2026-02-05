import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function OurTeam({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Our Team
                    </h1>
                    <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
                        <p className="text-lg leading-relaxed">
                            The Clockra team is made up of dedicated individuals who are passionate about
                            connecting people with quality services. From product and engineering to customer
                            support, we work together to deliver the best experience for both clients and
                            providers.
                        </p>
                        <p className="text-lg leading-relaxed">
                            We are always looking for talented people who share our vision. Visit our Careers
                            page to explore opportunities to join us.
                        </p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
