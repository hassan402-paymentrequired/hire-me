import BrandMark from '@/components/brand-mark';
import { Spinner } from '@/components/ui/spinner';
import ToastNotification from '@/components/ui/toast-notification';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import business from '@/routes/business';
import verification from '@/routes/verification';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Check,
    Clock,
    FileText,
    Lock,
    RefreshCw,
    ScanLine,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    existingVerification?: {
        status: string;
        document_type: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
    is_verified?: boolean;
}

interface DocumentTypeOption {
    value: string;
    label: string;
    /** Which side or page of the document to photograph. */
    capture: string;
    /** Real-world shape of the document, so the frame matches what they hold. */
    frameClassName: string;
}

const documentTypeOptions: DocumentTypeOption[] = [
    {
        value: 'national_id',
        label: 'National ID',
        capture: 'Front of your NIN slip or card',
        frameClassName: 'aspect-[1.586]',
    },
    {
        value: 'drivers_license',
        label: "Driver's license",
        capture: 'Front of the card',
        frameClassName: 'aspect-[1.586]',
    },
    {
        value: 'passport',
        label: 'Passport',
        capture: 'The photo page, opened flat',
        frameClassName: 'aspect-[1.42]',
    },
    {
        value: 'cac_registration',
        label: 'CAC certificate',
        capture: 'The full certificate page',
        frameClassName: 'mx-auto aspect-[0.72] max-w-80',
    },
];

const captureTips = [
    'All four corners in the shot',
    'No glare or shadows on the text',
    'Your name is easy to read',
];

function FrameCorners({ className }: { className?: string }) {
    const corner = 'absolute size-7 border-lime';

    return (
        <span aria-hidden className={cn('pointer-events-none', className)}>
            <span
                className={cn(
                    corner,
                    'top-0 left-0 rounded-tl-2xl border-t-[3px] border-l-[3px]',
                )}
            />
            <span
                className={cn(
                    corner,
                    'top-0 right-0 rounded-tr-2xl border-t-[3px] border-r-[3px]',
                )}
            />
            <span
                className={cn(
                    corner,
                    'bottom-0 left-0 rounded-bl-2xl border-b-[3px] border-l-[3px]',
                )}
            />
            <span
                className={cn(
                    corner,
                    'right-0 bottom-0 rounded-br-2xl border-r-[3px] border-b-[3px]',
                )}
            />
        </span>
    );
}

export default function Verification({
    existingVerification,
    is_verified,
}: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        document_type: '',
        document: null as File | null,
    });

    const isPending =
        !is_verified && existingVerification?.status === 'pending';
    const isRejected =
        !is_verified && existingVerification?.status === 'rejected';
    const canSubmit = !is_verified && !isPending;

    const selectedType = documentTypeOptions.find(
        (option) => option.value === data.document_type,
    );
    const previousTypeLabel =
        documentTypeOptions.find(
            (option) => option.value === existingVerification?.document_type,
        )?.label ?? existingVerification?.document_type;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedFile(file);
        setData('document', file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const chooseAnotherFile = () => {
        setSelectedFile(null);
        setPreview(null);
        setData('document', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        fileInputRef.current?.click();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(verification.submit().url, { forceFormData: true });
    };

    const heading = is_verified
        ? { lead: 'You are', accent: 'verified.' }
        : isPending
          ? { lead: 'Thanks. We are', accent: 'on it.' }
          : { lead: 'Show us', accent: 'it is really you.' };

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-forest font-heading text-white">
            <Head title="Verify your identity" />

            <img
                src="/brand/banners/proxideck-auth-panel-dark.svg"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-forest/60 via-forest/80 to-forest" />

            <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-6 sm:px-8">
                <Link href={home()} className="flex items-center gap-2.5">
                    <BrandMark className="size-8" onDark />
                    <span className="font-['Sora'] text-xl font-bold tracking-[-0.03em]">
                        proxideck
                    </span>
                </Link>
                {canSubmit && (
                    <Link
                        href={business.dashboard()}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                    >
                        Do it later
                    </Link>
                )}
            </header>

            <form
                onSubmit={submit}
                className="relative z-10 mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-center gap-12 px-5 pt-4 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20"
            >
                {/* Instructions */}
                <div className="flex min-w-0 flex-col gap-7">
                    <div className="flex flex-col gap-4">
                        <span className="flex items-center gap-2 text-sm font-semibold text-lime">
                            <ScanLine className="size-4" />
                            Identity check
                        </span>
                        <h1 className="font-['Sora'] text-5xl leading-[0.98] font-bold tracking-[-0.035em] sm:text-6xl">
                            {heading.lead}{' '}
                            <span className="text-lime">{heading.accent}</span>
                        </h1>
                        <p className="max-w-115 text-lg leading-relaxed text-[#C9E2D3]">
                            {is_verified
                                ? 'Your listing carries the verified badge, so clients know the pro they book is the pro who shows up.'
                                : isPending
                                  ? 'A member of our team is checking your document. We will notify you as soon as it is done, and your listing goes live with the verified badge.'
                                  : 'One photo of a valid document. Once our team approves it, your listing goes live with the verified badge.'}
                        </p>
                    </div>

                    {isRejected && (
                        <div className="flex gap-3.5 rounded-2xl border border-red-300/30 bg-red-500/10 p-4">
                            <XCircle className="mt-0.5 size-5 shrink-0 text-red-300" />
                            <div className="text-[15px] leading-relaxed">
                                <p className="font-semibold">
                                    Your {previousTypeLabel ?? 'document'} was
                                    not accepted
                                </p>
                                <p className="mt-0.5 text-white/70">
                                    {existingVerification?.rejection_reason ||
                                        'Please send a new, clearer photo.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {canSubmit && (
                        <>
                            <fieldset className="flex flex-col gap-3">
                                <legend className="mb-3 text-[15px] font-semibold text-white/85">
                                    What are you holding?
                                </legend>
                                <div className="flex flex-wrap gap-2">
                                    {documentTypeOptions.map((option) => {
                                        const isSelected =
                                            data.document_type === option.value;

                                        return (
                                            <label
                                                key={option.value}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[15px] font-semibold transition has-focus-visible:ring-2 has-focus-visible:ring-lime',
                                                    isSelected
                                                        ? 'border-lime bg-lime text-forest'
                                                        : 'border-white/20 text-white/85 hover:border-white/40 hover:bg-white/5',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value={option.value}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setData(
                                                            'document_type',
                                                            option.value,
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                {isSelected && (
                                                    <Check
                                                        className="size-4"
                                                        strokeWidth={3}
                                                    />
                                                )}
                                                {option.label}
                                            </label>
                                        );
                                    })}
                                </div>
                                {errors.document_type && (
                                    <p className="text-sm text-red-300">
                                        {errors.document_type}
                                    </p>
                                )}
                            </fieldset>

                            <ul className="flex flex-col gap-2.5">
                                {captureTips.map((tip) => (
                                    <li
                                        key={tip}
                                        className="flex items-center gap-3 text-[15px] text-[#C9E2D3]"
                                    >
                                        <span className="grid size-5 place-items-center rounded-full bg-white/10 text-lime">
                                            <Check
                                                className="size-3"
                                                strokeWidth={3.5}
                                            />
                                        </span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Viewfinder */}
                <div className="flex min-w-0 flex-col gap-5">
                    <div
                        className={cn(
                            'relative w-full transition-all duration-500',
                            canSubmit
                                ? (selectedType?.frameClassName ??
                                      'aspect-[1.586]')
                                : 'aspect-[1.586]',
                        )}
                    >
                        <FrameCorners className="absolute -inset-3" />

                        <input
                            ref={fileInputRef}
                            id="document"
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                            disabled={!canSubmit}
                        />

                        {is_verified ? (
                            <div className="flex size-full flex-col items-center justify-center gap-3 rounded-2xl bg-lime text-forest">
                                <BadgeCheck
                                    className="size-14"
                                    strokeWidth={1.6}
                                />
                                <span className="font-['Sora'] text-2xl font-bold">
                                    Verified
                                </span>
                            </div>
                        ) : isPending && existingVerification ? (
                            <div className="flex size-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-lime/50 bg-white/5 px-6 text-center">
                                <span className="grid size-14 place-items-center rounded-full bg-lime text-forest">
                                    <Clock className="size-6" />
                                </span>
                                <span className="font-['Sora'] text-2xl font-bold">
                                    In review
                                </span>
                                <span className="text-sm text-sage">
                                    {previousTypeLabel} sent on{' '}
                                    {new Date(
                                        existingVerification.created_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        ) : selectedFile ? (
                            <div className="relative size-full overflow-hidden rounded-2xl bg-white/5">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Your document"
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center">
                                        <FileText
                                            className="size-12 text-lime"
                                            strokeWidth={1.4}
                                        />
                                        <span className="w-full truncate font-semibold">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                )}
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-0.5 bg-lime shadow-[0_0_24px_4px_rgba(200,241,105,0.55)] motion-reduce:hidden"
                                    style={{
                                        animation:
                                            'verification-scan 1.6s ease-in-out 1 forwards',
                                    }}
                                />
                                <style>{`@keyframes verification-scan { 0% { top: 0; opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
                            </div>
                        ) : (
                            <label
                                htmlFor="document"
                                className="flex size-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-white/[0.04] px-6 text-center transition hover:bg-white/[0.08]"
                            >
                                <ScanLine
                                    className="size-12 text-lime"
                                    strokeWidth={1.4}
                                />
                                <span className="font-['Sora'] text-xl font-bold">
                                    {selectedType
                                        ? `Place your ${selectedType.label} here`
                                        : 'Pick a document first'}
                                </span>
                                <span className="text-sm text-sage">
                                    {selectedType
                                        ? selectedType.capture
                                        : 'Then tap here to upload a photo or PDF'}
                                </span>
                            </label>
                        )}
                    </div>

                    {canSubmit && selectedFile && (
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 flex-1 truncate text-sage">
                                {selectedFile.name} ·{' '}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                                MB
                            </span>
                            <button
                                type="button"
                                onClick={chooseAnotherFile}
                                className="flex shrink-0 items-center gap-1.5 font-semibold text-lime"
                            >
                                <RefreshCw className="size-3.5" />
                                Retake
                            </button>
                        </div>
                    )}
                    {errors.document && (
                        <p className="text-sm text-red-300">
                            {errors.document}
                        </p>
                    )}

                    {canSubmit ? (
                        <div className="mt-2 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.document_type ||
                                    !selectedFile
                                }
                                className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-7 font-bold text-forest transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {processing && <Spinner className="size-4" />}
                                Send for review
                                {!processing && (
                                    <ArrowRight className="size-5" />
                                )}
                            </button>
                            <p className="flex items-center justify-center gap-2 text-center text-[13px] text-sage">
                                <Lock className="size-3.5 shrink-0" />
                                JPG, PNG or PDF up to 5MB. Only used to verify
                                you. We never ask for your BVN.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href={business.dashboard()}
                            className="mt-2 flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-7 font-bold text-forest transition hover:brightness-95"
                        >
                            Continue to dashboard
                            <ArrowRight className="size-5" />
                        </Link>
                    )}
                </div>
            </form>

            <ToastNotification />
        </div>
    );
}
