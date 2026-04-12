import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/guest-layout';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    title: string;
    prefill: {
        name?: string;
        email?: string;
    };
}

const categories = [
    { value: 'general', label: 'General question' },
    { value: 'booking', label: 'Booking issue' },
    { value: 'payment', label: 'Payment issue' },
    { value: 'provider', label: 'Provider support' },
    { value: 'technical', label: 'Technical issue' },
];

export default function Contact({ title, prefill }: Props) {
    const form = useForm({
        name: prefill?.name || '',
        email: prefill?.email || '',
        subject: '',
        category: 'general',
        message: '',
    });

    return (
        <>
            <Head title={title} />
            <AppLayout>
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                    Contact Support
                                </h1>
                                <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                                    Tell us what is going on and we will route
                                    it to the right team. For most issues, you
                                    can expect a response within one business
                                    day.
                                </p>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.18em] uppercase">
                                        Support details
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        Need a quick fallback? You can still
                                        email us directly while this request is
                                        being reviewed.
                                    </p>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Email:
                                        </span>{' '}
                                        <a
                                            href="mailto:proxideckinfo@gmail.com"
                                            className="text-primary hover:underline"
                                        >
                                            support@proxideck.com
                                        </a>
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Support hours:
                                        </span>{' '}
                                        Monday - Saturday, 9am - 7pm
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border/70 bg-background p-6 sm:p-8">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.post('/contact', {
                                        preserveScroll: true,
                                    });
                                }}
                                className="space-y-5"
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                            value={form.data.name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {form.errors.name && (
                                            <p className="text-xs text-destructive">
                                                {form.errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Your email"
                                            value={form.data.email}
                                            onChange={(e) =>
                                                form.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {form.errors.email && (
                                            <p className="text-xs text-destructive">
                                                {form.errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <select
                                            id="category"
                                            title="cat"
                                            value={form.data.category}
                                            onChange={(e) =>
                                                form.setData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            {categories.map((category) => (
                                                <option
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={form.data.subject}
                                            onChange={(e) =>
                                                form.setData(
                                                    'subject',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="What do you need help with?"
                                        />
                                        {form.errors.subject && (
                                            <p className="text-xs text-destructive">
                                                {form.errors.subject}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        value={form.data.message}
                                        onChange={(e) =>
                                            form.setData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Share the issue, what you expected, and any helpful context."
                                        className="min-h-[180px]"
                                    />
                                    {form.errors.message && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-full px-6"
                                >
                                    {form.processing
                                        ? 'Sending...'
                                        : 'Send support request'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
