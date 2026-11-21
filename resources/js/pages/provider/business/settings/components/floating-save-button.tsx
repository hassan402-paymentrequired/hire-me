import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function FloatingSaveButton({
    visible,
    processing,
    onDiscard,
}: {
    visible: boolean;
    processing: boolean;
    onDiscard?: () => void;
}) {
    return (
        <div
            className={cn(
                'pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 transition-all duration-200 sm:bottom-8',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0',
            )}
            aria-hidden={!visible}
        >
            <div className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 rounded-2xl bg-[#0E3B2E] px-[18px] py-3 text-white shadow-[0_20px_50px_rgba(14,59,46,0.35)]">
                <span className="flex flex-1 items-center gap-2.5 text-sm font-semibold">
                    <span className="size-2 rounded-full bg-[#C8F169]" />
                    You have unsaved changes
                </span>
                {onDiscard && (
                    <button
                        type="button"
                        onClick={onDiscard}
                        tabIndex={visible ? 0 : -1}
                        className="h-11 rounded-xl border border-white/25 px-4 text-sm font-bold text-white hover:bg-white/10"
                    >
                        Discard
                    </button>
                )}
                <button
                    type="submit"
                    disabled={processing}
                    tabIndex={visible ? 0 : -1}
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#C8F169] px-[18px] text-sm font-bold text-[#0E3B2E] disabled:opacity-70"
                >
                    {processing && <Spinner />}
                    Save changes
                </button>
            </div>
        </div>
    );
}
