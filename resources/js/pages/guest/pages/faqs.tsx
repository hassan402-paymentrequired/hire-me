import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
}

const faqs = [
    {
        q: 'How do I book a service?',
        a: 'Browse providers on our marketplace, select a service, choose a time slot, and confirm your booking. You can pay securely through our platform.',
    },
    {
        q: 'How are providers verified?',
        a: 'All providers go through our verification process, including business profile review and compliance checks, before they can offer services.',
    },
    {
        q: 'Can I cancel or reschedule a booking?',
        a: 'Yes. You can cancel or reschedule your appointment from your bookings dashboard. Please check the provider\'s cancellation policy for any applicable fees.',
    },
    {
        q: 'How do I contact support?',
        a: 'You can reach our support team through the Contact page. We typically respond within 24 hours on business days.',
    },
];

export default function FAQs({ title }: Props) {
    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Frequently Asked Questions
                    </h1>
                    <dl className="mt-10 space-y-8">
                        {faqs.map((faq, i) => (
                            <div key={i}>
                                <dt className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                                    {faq.q}
                                </dt>
                                <dd className="mt-2 text-gray-600 dark:text-gray-400">{faq.a}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </AppLayout>
        </>
    );
}
