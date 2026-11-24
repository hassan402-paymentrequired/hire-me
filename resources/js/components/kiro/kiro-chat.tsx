import BrandMark from '@/components/brand-mark';
import { cn } from '@/lib/utils';
import kiro from '@/routes/kiro';
import { booking } from '@/routes/marketplace';
import { show as providerShow } from '@/routes/provider';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowUp, BadgeCheck, Star, X } from 'lucide-react';
import {
    FormEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

interface KiroProvider {
    businessName: string;
    slug: string;
    city: string;
    rating: number;
    reviewsCount: number;
    minPrice: number | null;
}

interface KiroMessage {
    role: 'user' | 'assistant';
    content: string;
    providers?: KiroProvider[];
    failed?: boolean;
}

interface KiroBusiness {
    slug: string;
    businessName: string;
    canBook: boolean;
}

interface KiroChatProps {
    /** Set on a provider's page; Kiro then answers about that business only. */
    business?: KiroBusiness;
    /** Extra classes for the launcher, e.g. to sit above a fixed mobile bar. */
    launcherClassName?: string;
}

/** Wait after page load before the launcher first opens into the greeting pill. */
const GREETING_DELAY_MS = 1500;
/** How long the page must be still before the launcher opens into the pill again. */
const SCROLL_IDLE_MS = 700;
/** Scroll movement smaller than this does not collapse the launcher. */
const SCROLL_THRESHOLD_PX = 6;

function readSession<T>(key: string, fallback: T): T {
    try {
        const raw = window.sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function writeSession(key: string, value: unknown): void {
    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage can be blocked (private mode); the chat still works for this page.
    }
}

function formatNaira(amount: number): string {
    return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function KiroAvatar({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-[#0E3B2E]',
                className,
            )}
        >
            <BrandMark onDark className="h-3/5 w-3/5" />
        </span>
    );
}

function KiroName() {
    return (
        <span className="flex items-center gap-1 font-semibold text-neutral-900">
            Kiro
            <BadgeCheck
                className="h-4.5 w-4.5 fill-sky-500 text-white"
                aria-label="Verified assistant"
            />
        </span>
    );
}

function ProviderSuggestion({ provider }: { provider: KiroProvider }) {
    return (
        <Link
            href={providerShow(provider.slug)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition hover:border-[#0E3B2E]/40 hover:bg-neutral-50"
        >
            <span className="min-w-0">
                <span className="block truncate font-medium text-neutral-900">
                    {provider.businessName}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                    {provider.rating > 0 && (
                        <>
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {provider.rating.toFixed(1)}
                            <span aria-hidden>·</span>
                        </>
                    )}
                    {provider.city || 'Proxideck'}
                </span>
            </span>
            {provider.minPrice !== null && (
                <span className="shrink-0 text-sm text-neutral-600">
                    from {formatNaira(provider.minPrice)}
                </span>
            )}
        </Link>
    );
}

function TypingDots() {
    return (
        <div
            className="flex w-fit items-center gap-1 rounded-3xl bg-neutral-100 px-5 py-4"
            aria-label="Kiro is typing"
        >
            {[0, 150, 300].map((delay) => (
                <span
                    key={delay}
                    className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </div>
    );
}

export default function KiroChat({
    business,
    launcherClassName,
}: KiroChatProps) {
    const storageKey = `kiro:${business?.slug ?? 'site'}`;
    const greeting = business
        ? 'Hi! Got a question?'
        : 'Hi! Looking for an artisan?';
    const subtitle = business
        ? `AI assistant for ${business.businessName}`
        : 'AI assistant for Proxideck';
    const placeholder = business
        ? 'Ask about prices, hours or services'
        : 'Find me a plumber in Lekki';
    const suggestions = business
        ? ['What services do you offer?', 'When are you open?']
        : [
              'Find a plumber near me',
              'Top-rated hairstylists',
              'How does booking work?',
          ];

    const [isOpen, setIsOpen] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [messages, setMessages] = useState<KiroMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessages(readSession<KiroMessage[]>(storageKey, []));
    }, [storageKey]);

    useEffect(() => {
        writeSession(storageKey, messages);
    }, [storageKey, messages]);

    // The launcher shrinks to a circle while the page scrolls and opens into the greeting pill once it stops.
    useEffect(() => {
        let idleTimer: number | undefined;
        const lastPositions = new WeakMap<object, number>();

        const ready = window.setTimeout(
            () => setShowGreeting(true),
            GREETING_DELAY_MS,
        );

        const onScroll = (event: Event) => {
            const target =
                event.target instanceof Element
                    ? event.target
                    : (document.scrollingElement ?? document.documentElement);
            const position = target.scrollTop;
            const previous = lastPositions.get(target) ?? position;
            lastPositions.set(target, position);

            // Ignore tiny shifts from images loading or more results being added.
            if (Math.abs(position - previous) < SCROLL_THRESHOLD_PX) {
                return;
            }

            window.clearTimeout(ready);
            window.clearTimeout(idleTimer);
            setShowGreeting(false);
            idleTimer = window.setTimeout(
                () => setShowGreeting(true),
                SCROLL_IDLE_MS,
            );
        };

        // Capture catches scrolling in any container, not just the window.
        document.addEventListener('scroll', onScroll, {
            capture: true,
            passive: true,
        });

        return () => {
            window.clearTimeout(ready);
            window.clearTimeout(idleTimer);
            document.removeEventListener('scroll', onScroll, { capture: true });
        };
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isSending, isOpen]);

    useEffect(() => {
        const openChat = () => setIsOpen(true);
        window.addEventListener('kiro:open', openChat);

        return () => window.removeEventListener('kiro:open', openChat);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        inputRef.current?.focus();

        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    const open = () => setIsOpen(true);

    const send = useCallback(
        async (text: string) => {
            const content = text.trim();

            if (!content || isSending) {
                return;
            }

            const history: KiroMessage[] = [
                ...messages.filter((m) => !m.failed),
                { role: 'user', content },
            ];

            setMessages(history);
            setDraft('');
            setIsSending(true);

            try {
                const { data } = await axios.post<{
                    reply: string;
                    providers: KiroProvider[];
                }>(kiro.chat().url, {
                    provider_slug: business?.slug ?? null,
                    messages: [
                        { role: 'assistant', content: greeting },
                        ...history.map(({ role, content }) => ({
                            role,
                            content,
                        })),
                    ].slice(-30),
                });

                setMessages((current) => [
                    ...current,
                    {
                        role: 'assistant',
                        content: data.reply,
                        providers: data.providers,
                    },
                ]);
            } catch (error) {
                const message =
                    axios.isAxiosError(error) && error.response?.status === 429
                        ? "You're sending messages quickly. Give me a moment and try again."
                        : "Sorry, I can't answer right now. Please try again in a moment.";

                setMessages((current) => [
                    ...current,
                    { role: 'assistant', content: message, failed: true },
                ]);
            } finally {
                setIsSending(false);
            }
        },
        [business?.slug, greeting, isSending, messages],
    );

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        void send(draft);
    };

    const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void send(draft);
        }
    };

    const hasConversation = messages.length > 0;
    const canSend = draft.trim() !== '' && !isSending;

    return (
        <>
            {!isOpen && (
                <div
                    className={cn(
                        'fixed right-4 bottom-5 z-50 flex items-center sm:right-6 sm:bottom-6',
                        launcherClassName,
                    )}
                >
                    <button
                        type="button"
                        onClick={open}
                        aria-label="Chat with Kiro"
                        className="flex items-center rounded-full border border-neutral-200 bg-white p-1.5 text-left shadow-lg transition-shadow hover:shadow-xl"
                    >
                        <KiroAvatar className="h-12 w-12" />
                        <span
                            className={cn(
                                'block overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out will-change-[max-width] motion-reduce:transition-none',
                                showGreeting
                                    ? 'max-w-[min(24rem,calc(100vw-6.5rem))] opacity-100'
                                    : 'max-w-0 opacity-0',
                            )}
                            aria-hidden={!showGreeting}
                        >
                            <span className="block pr-5 pl-3">
                                <KiroName />
                                <span className="block truncate text-neutral-700">
                                    {greeting}
                                </span>
                            </span>
                        </span>
                    </button>
                </div>
            )}

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 animate-in bg-black/30 fade-in sm:hidden"
                        onClick={() => setIsOpen(false)}
                        aria-hidden
                    />
                    <section
                        role="dialog"
                        aria-label="Chat with Kiro"
                        className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] animate-in flex-col overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-xl duration-200 slide-in-from-bottom-6 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[min(640px,calc(100dvh-3rem))] sm:w-[min(720px,calc(100vw-3rem))] sm:rounded-3xl"
                    >
                        <div className="flex justify-center pt-3 sm:hidden">
                            <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
                        </div>

                        <header className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
                            <KiroAvatar className="h-12 w-12" />
                            <div className="min-w-0 flex-1">
                                <KiroName />
                                <p className="truncate text-sm text-neutral-500">
                                    {subtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                                aria-label="Close chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
                        >
                            <p className="w-fit max-w-[85%] rounded-3xl bg-neutral-100 px-5 py-3 text-neutral-900">
                                {greeting}
                            </p>

                            {!hasConversation && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() =>
                                                void send(suggestion)
                                            }
                                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-800 transition hover:border-[#0E3B2E] hover:bg-neutral-50"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                    {business?.canBook && (
                                        <Link
                                            href={booking(business.slug)}
                                            className="rounded-full border border-[#0E3B2E] bg-[#0E3B2E] px-4 py-2 text-sm text-white transition hover:bg-[#0E3B2E]/90"
                                        >
                                            Book now
                                        </Link>
                                    )}
                                </div>
                            )}

                            {messages.map((message, index) =>
                                message.role === 'user' ? (
                                    <p
                                        key={index}
                                        className="ml-auto w-fit max-w-[85%] rounded-3xl bg-[#0E3B2E] px-5 py-3 whitespace-pre-line text-white"
                                    >
                                        {message.content}
                                    </p>
                                ) : (
                                    <div key={index} className="space-y-2">
                                        <p
                                            className={cn(
                                                'w-fit max-w-[85%] rounded-3xl px-5 py-3 whitespace-pre-line',
                                                message.failed
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-neutral-100 text-neutral-900',
                                            )}
                                        >
                                            {message.content}
                                        </p>
                                        {message.providers?.map((provider) => (
                                            <ProviderSuggestion
                                                key={provider.slug}
                                                provider={provider}
                                            />
                                        ))}
                                    </div>
                                ),
                            )}

                            {isSending && <TypingDots />}
                        </div>

                        <form
                            onSubmit={onSubmit}
                            className="flex items-center gap-3 border-t border-neutral-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                        >
                            <input
                                ref={inputRef}
                                value={draft}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={onInputKeyDown}
                                maxLength={1000}
                                placeholder={placeholder}
                                aria-label="Message Kiro"
                                className="h-12 min-w-0 flex-1 rounded-full border border-neutral-300 px-5 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#0E3B2E]"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className={cn(
                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition',
                                    canSend
                                        ? 'bg-[#0E3B2E] hover:bg-[#0E3B2E]/90'
                                        : 'bg-neutral-300',
                                )}
                                aria-label="Send"
                            >
                                <ArrowUp className="h-5 w-5" />
                            </button>
                        </form>
                    </section>
                </>
            )}
        </>
    );
}
