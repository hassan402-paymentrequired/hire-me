import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function PrivacyPolicy({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Last updated: January 2026
                    </p>
                    <div className="mt-8 space-y-8 text-gray-600 dark:text-gray-400">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Information We Collect
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                We collect information you provide when you register, book services, or contact
                                us. This may include your name, email address, phone number, location, and
                                payment information. We also collect usage data to improve our services.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                How We Use Your Information
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                We use your information to facilitate bookings, process payments, communicate
                                with you about your appointments, and improve our platform. We may send you
                                service-related notifications and, with your consent, promotional updates.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Data Sharing
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                We share necessary information with service providers to complete your
                                bookings. We do not sell your personal data to third parties. We may share
                                data with trusted partners who assist in operating our platform, under
                                strict confidentiality agreements.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Security
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                We implement industry-standard security measures to protect your personal
                                information. All data transmitted over our platform is encrypted.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Contact Us
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                If you have questions about this Privacy Policy, please contact us at{' '}
                                <a
                                    href="mailto:support@clockra.com"
                                    className="text-primary hover:underline"
                                >
                                    support@clockra.com
                                </a>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
