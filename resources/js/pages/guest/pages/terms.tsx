import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

export default function TermsAndConditions({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Terms and Conditions
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Last updated: January 2026
                    </p>
                    <div className="mt-8 space-y-8 text-gray-600 dark:text-gray-400">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Acceptance of Terms
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                By accessing or using proxideck, you agree to be
                                bound by these Terms and Conditions. If you do
                                not agree with any part of these terms, you may
                                not use our platform.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Use of the Platform
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                You agree to use proxideck only for lawful
                                purposes. You must provide accurate information
                                when creating an account and booking services.
                                You are responsible for maintaining the
                                confidentiality of your account credentials.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Bookings and Payments
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                When you book a service, you enter into an
                                agreement with the service provider. proxideck
                                facilitates the connection but is not a party to
                                the service contract. Payments are processed in
                                accordance with our payment policies.
                                Cancellation and refund policies may vary by
                                provider.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Provider Services
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                Service providers listed on our platform are
                                independent. We verify providers but do not
                                guarantee the quality of their services. Any
                                disputes regarding services should be raised
                                with the provider or through our support team.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Limitation of Liability
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                proxideck is provided &quot;as is&quot;. We are
                                not liable for any indirect, incidental, or
                                consequential damages arising from your use of
                                the platform. Our liability is limited to the
                                extent permitted by applicable law.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Contact
                            </h2>
                            <p className="mt-4 leading-relaxed">
                                For questions about these Terms and Conditions,
                                contact us at{' '}
                                <a
                                    href="mailto:support@proxideck.com"
                                    className="text-primary hover:underline"
                                >
                                    support@proxideck.com
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
