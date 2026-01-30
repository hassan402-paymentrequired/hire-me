import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function Contact({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Contact Us
                    </h1>
                    <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
                        <p className="text-lg leading-relaxed">
                            Have questions or feedback? We would love to hear from you. Reach out to our team
                            and we will get back to you as soon as possible.
                        </p>
                        <div className="mt-10 space-y-4">
                            <p>
                                <span className="font-medium text-gray-900 dark:text-white">Email:</span>{' '}
                                <a
                                    href="mailto:clockrainfo@gmail.com"
                                    className="text-primary hover:underline"
                                >
                                    clockrainfo@gmail.com
                                </a>
                            </p>
                            <p>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    Support hours:
                                </span>{' '}
                                Monday – Saturday, 9am – 7pm
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
