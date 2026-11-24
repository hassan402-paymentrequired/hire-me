import { SiteNav } from '@/components/site/site-nav';
import GuestLayout from '@/layouts/guest-layout';
import client from '@/routes/client';
import contact from '@/routes/contact';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronRight, Mail, MessageCircle, Phone, Plus, type LucideIcon } from 'lucide-react';
import { type FormEvent, type ReactNode } from 'react';

interface Props {
    title: string;
    support: { email: string; whatsapp: string | null; phone: string | null };
    prefill: { name?: string; email?: string };
}

const categories = [
    { value: 'booking', label: 'A booking' },
    { value: 'payment', label: 'Wallet, payment or refund' },
    { value: 'provider', label: 'Listing my business' },
    { value: 'technical', label: 'Something isn’t working' },
    { value: 'general', label: 'Something else' },
];

const faqs = [
    { question: 'When is my payment released to the pro?', answer: 'After both you and the pro confirm the appointment is complete. Until then it is held by Proxideck.' },
    { question: 'What if the pro doesn’t show up?', answer: 'Report it from the booking in My bookings. Once we confirm, your money goes back to your wallet.' },
    { question: 'Can I reschedule a booking?', answer: 'Yes. Open the booking in My bookings and choose Reschedule, as long as it is within the pro’s cut-off time.' },
    { question: 'How do I withdraw my wallet balance?', answer: 'Go to Wallet, add your bank account and tap Withdraw.' },
    { question: 'How do I list my business?', answer: 'Tap List your business, add your services and hours, then verify your ID.' },
];

const inputClass = 'h-12.5 rounded-2xl border border-[#DDE3DE] px-4 text-[15px] font-normal outline-none focus:border-forest';

function ContactOption({ href, icon: Icon, title, detail, highlight = false }: { href: string; icon: LucideIcon; title: string; detail: string; highlight?: boolean }) {
    return (
        <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="flex items-center gap-4 rounded-[22px] border border-line bg-white p-5.5 shadow-[0_12px_32px_rgba(19,32,27,0.08)] hover:border-sage"
        >
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${highlight ? 'bg-lime' : 'bg-mint'}`}>
                <Icon className="size-5.5 text-forest" />
            </span>
            <span className="flex-1">
                <span className="block text-[17px] font-bold">{title}</span>
                <span className="block text-sm text-moss">{detail}</span>
            </span>
            <ChevronRight className="size-4.5 text-moss" />
        </a>
    );
}

export default function Contact({ title, support, prefill }: Props) {
    const form = useForm({
        name: prefill?.name ?? '',
        email: prefill?.email ?? '',
        category: 'booking',
        subject: '',
        message: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(contact.submit().url, { preserveScroll: true, onSuccess: () => form.reset('subject', 'message') });
    };

    return (
        <GuestLayout nav="none">
            <Head title={title} />

            <section className="relative overflow-hidden bg-forest-deep">
                <img src="/brand/banners/proxideck-banner-general-dark.jpg" alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-forest-deep/65" />
                <SiteNav variant="dark" />
                <div className="relative mx-auto flex max-w-[1240px] flex-col gap-4 px-4 pt-16 pb-40 sm:px-6">
                    <h1 className="text-5xl leading-none font-bold tracking-tight text-white sm:text-[64px]">We’re here to help.</h1>
                    <p className="max-w-140 text-[19px] leading-relaxed text-[#C9E2D3]">
                        Questions about a booking, a refund or listing your business? Pick the quickest way to reach us.
                    </p>
                </div>
            </section>

            <div className="relative mx-auto -mt-26 flex max-w-[1240px] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-start">
                <div className="flex flex-col gap-3 lg:w-[38%]">
                    {support.whatsapp && (
                        <ContactOption href={`https://wa.me/${support.whatsapp.replace(/\D/g, '')}`} icon={MessageCircle} title="Chat on WhatsApp" detail="Fastest. Usually replies in minutes." highlight />
                    )}
                    <ContactOption href={`mailto:${support.email}`} icon={Mail} title="Email support" detail={`${support.email} · within 24 hours`} highlight={!support.whatsapp} />
                    {support.phone && <ContactOption href={`tel:${support.phone}`} icon={Phone} title="Call us" detail={`${support.phone} · Mon–Sat, 8am–8pm`} />}
                    <div className="flex flex-col gap-1.5 rounded-[22px] bg-paper p-5.5">
                        <div className="text-[15px] font-bold">Problem with a booking?</div>
                        <div className="text-sm leading-relaxed text-moss">
                            Report it from the booking itself in{' '}
                            <Link href={client.bookings.index()} className="font-bold text-forest">
                                My bookings
                            </Link>
                            . It reaches the right team faster.
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col gap-4.5 rounded-[28px] border border-line bg-white p-7 shadow-[0_12px_32px_rgba(19,32,27,0.08)] sm:p-9">
                    <h2 className="text-[26px] font-bold tracking-tight">Send us a message</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Your name" error={form.errors.name}>
                            <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className={inputClass} required />
                        </Field>
                        <Field label="Email" error={form.errors.email}>
                            <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className={inputClass} required />
                        </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="What’s it about?" error={form.errors.category}>
                            <select value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className={`${inputClass} bg-white`}>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Subject" error={form.errors.subject}>
                            <input value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} placeholder="e.g. Refund for booking on 14 Nov" className={inputClass} required />
                        </Field>
                    </div>
                    <Field label="Message" error={form.errors.message}>
                        <textarea
                            rows={5}
                            value={form.data.message}
                            onChange={(event) => form.setData('message', event.target.value)}
                            placeholder="Tell us what happened (at least 20 characters)"
                            className="resize-y rounded-2xl border border-[#DDE3DE] px-4 py-3.5 text-[15px] font-normal outline-none focus:border-forest"
                            required
                        />
                    </Field>
                    <button type="submit" disabled={form.processing} className="h-13.5 rounded-full bg-forest font-bold text-white disabled:opacity-50">
                        {form.processing ? 'Sending…' : 'Send message'}
                    </button>
                </form>
            </div>

            <section className="mx-auto flex max-w-220 flex-col gap-2 px-4 py-26 sm:px-6">
                <h2 className="mb-4 text-center text-4xl font-bold tracking-tight">Quick answers</h2>
                {faqs.map((faq) => (
                    <details key={faq.question} className="group border-b border-line px-1 py-5">
                        <summary className="flex cursor-pointer list-none justify-between gap-4 text-lg font-bold">
                            {faq.question}
                            <Plus className="size-5 shrink-0 text-leaf transition group-open:rotate-45" />
                        </summary>
                        <p className="mt-3 leading-relaxed text-moss">{faq.answer}</p>
                    </details>
                ))}
            </section>
        </GuestLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-semibold">
            {label}
            {children}
            {error && <span className="text-[13px] font-medium text-[#B42318]">{error}</span>}
        </label>
    );
}
