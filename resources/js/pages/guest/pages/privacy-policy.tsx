import { LegalPage } from '@/components/site/legal-page';

export default function PrivacyPolicy({ title }: { title: string }) {
    return (
        <LegalPage
            document="privacy"
            title={title}
            lastUpdated="November 2026"
            summary={[
                'We only collect what we need to run your bookings and payments.',
                'We never sell your personal data.',
                'You can ask us to export or delete your data at any time.',
            ]}
            sections={[
                {
                    id: 'collect',
                    title: 'What we collect',
                    body: 'Your name, email, phone number and saved addresses; your booking history; wallet transactions; and basic device information we use to keep your account secure.',
                },
                {
                    id: 'use',
                    title: 'How we use it',
                    body: 'To create and manage bookings, process wallet payments and refunds, send booking updates, prevent fraud, and improve Proxideck. You choose which booking updates reach you by email or push in Account settings.',
                },
                {
                    id: 'share',
                    title: 'Who we share it with',
                    body: 'The pro you book sees your name, phone number and, for home-service bookings, your address. Our payment partner processes wallet top-ups and withdrawals. We do not sell your data.',
                },
                {
                    id: 'payments',
                    title: 'Payments and your wallet',
                    body: 'Card and bank details are handled by our licensed payment partner. Proxideck stores only the references needed to show your transaction history.',
                },
                {
                    id: 'security',
                    title: 'Security',
                    body: 'We use industry-standard measures to protect your information, and all data sent to and from Proxideck is encrypted.',
                },
                {
                    id: 'rights',
                    title: 'Your rights',
                    body: 'Under the Nigeria Data Protection Act you can access, correct, export or delete your personal data. Contact us and we will act on your request.',
                },
            ]}
        />
    );
}
