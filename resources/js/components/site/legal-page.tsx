import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { contact, privacyPolicy, terms } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

export interface LegalSection {
    id: string;
    title: string;
    body: string;
}

interface LegalPageProps {
    document: 'privacy' | 'terms';
    title: string;
    lastUpdated: string;
    summary: string[];
    sections: LegalSection[];
}

const tabs = [
    { key: 'privacy', label: 'Privacy policy', href: privacyPolicy().url },
    { key: 'terms', label: 'Terms & conditions', href: terms().url },
] as const;

export function LegalPage({ document, title, lastUpdated, summary, sections }: LegalPageProps) {
    return (
        <GuestLayout>
            <Head title={title} />

            <header className="border-b border-line bg-paper">
                <div className="mx-auto flex max-w-[1240px] flex-col gap-3.5 px-4 pt-14 sm:px-6">
                    <span className="text-[15px] font-bold text-leaf">Legal</span>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-[52px]">{title}</h1>
                    <p className="text-[15px] text-moss">Last updated {lastUpdated}</p>
                    <nav aria-label="Legal documents" className="mt-5 flex gap-1">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                aria-current={tab.key === document ? 'page' : undefined}
                                className={cn(
                                    '-mb-px border-b-[3px] px-5.5 py-3.5 text-base',
                                    tab.key === document ? 'border-forest font-bold text-ink' : 'border-transparent text-moss',
                                )}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            <div className="mx-auto flex max-w-[1240px] flex-col gap-16 px-4 pt-14 pb-26 sm:px-6 lg:flex-row">
                <nav aria-label="On this page" className="flex flex-col gap-1 self-start lg:sticky lg:top-6 lg:w-60">
                    <span className="mb-2 text-[13px] font-bold text-moss">On this page</span>
                    {sections.map((section) => (
                        <a key={section.id} href={`#${section.id}`} className="border-l-2 border-line px-3 py-2 text-[15px] hover:border-forest">
                            {section.title}
                        </a>
                    ))}
                </nav>

                <article className="flex max-w-190 flex-1 flex-col gap-10">
                    <div className="flex flex-col gap-3 rounded-3xl bg-forest px-8 py-7 text-white">
                        <span className="text-sm font-bold text-lime">In short</span>
                        {summary.map((point) => (
                            <div key={point} className="flex gap-3 leading-relaxed">
                                <Check className="mt-0.5 size-5 shrink-0 text-lime" /> {point}
                            </div>
                        ))}
                    </div>

                    {sections.map((section, index) => (
                        <section key={section.id} id={section.id} className="flex scroll-mt-6 flex-col gap-3">
                            <h2 className="flex items-baseline gap-3.5 text-[26px] font-bold tracking-tight">
                                <span className="text-[15px] text-leaf">{String(index + 1).padStart(2, '0')}</span>
                                {section.title}
                            </h2>
                            <p className="text-[17px] leading-[1.75] text-[#33392D]">{section.body}</p>
                        </section>
                    ))}

                    <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-line p-6">
                        <div className="flex-1">
                            <div className="text-[17px] font-bold">Questions about this?</div>
                            <div className="mt-0.5 text-[15px] text-moss">Our team will get back to you within 2 working days.</div>
                        </div>
                        <Link href={contact()} className="rounded-full bg-forest px-5 py-3 text-[15px] font-bold text-white">
                            Contact us
                        </Link>
                    </div>
                </article>
            </div>
        </GuestLayout>
    );
}
