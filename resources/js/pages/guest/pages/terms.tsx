import { LegalPage } from '@/components/site/legal-page';

export default function Terms({ title }: { title: string }) {
    return (
        <LegalPage
            document="terms"
            title={title}
            lastUpdated="November 2026"
            summary={[
                'Book in good faith and turn up on time.',
                'Payments are held until your appointment is complete.',
                'Reviews must be honest and based on a real booking.',
            ]}
            sections={[
                {
                    id: 'using',
                    title: 'Using Proxideck',
                    body: 'Proxideck is a marketplace that connects customers with independent service providers. Providers set their own services, prices and availability.',
                },
                {
                    id: 'bookings',
                    title: 'Bookings and cancellations',
                    body: 'A booking is confirmed when the provider accepts it. Each provider sets a cancellation window, shown before you pay. Late cancellations may mean you lose part of your payment.',
                },
                {
                    id: 'payments',
                    title: 'Payments and refunds',
                    body: 'Payments are held in escrow and released to the provider after both sides confirm the appointment is complete. If the provider cancels or does not show up, the money goes back to your wallet.',
                },
                {
                    id: 'providers',
                    title: 'Provider responsibilities',
                    body: 'Providers must list accurate prices, keep their calendar up to date, hold any licences their work requires, and treat customers with respect.',
                },
                {
                    id: 'reviews',
                    title: 'Reviews',
                    body: 'Only customers with a completed booking can leave a review. We may remove reviews that are abusive, fake or unrelated to the service.',
                },
                {
                    id: 'liability',
                    title: 'Liability',
                    body: 'Services are provided by independent providers. Proxideck is responsible for the platform and payments, and will help resolve disputes raised through the app.',
                },
            ]}
        />
    );
}
