import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function FloatingSaveButton({
    visible,
    processing,
}: {
    visible: boolean;
    processing: boolean;
}) {
    return (
        <div
            className={cn(
                'pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 transition-all duration-200 sm:bottom-8',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <Button
                type="submit"
                disabled={processing}
                className="pointer-events-auto rounded-full px-5 shadow-lg"
            >
                {processing ? <Spinner className="mr-2" /> : null}
                Save Changes
            </Button>
        </div>
    );
}
