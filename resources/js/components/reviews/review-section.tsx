import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
    id: string;
    client_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ReviewSectionProps {
    reviews: Review[];
    canReview: boolean;
    pendingAppointmentId: string | null;
}

export const ReviewSection = ({
    reviews,
    canReview,
    pendingAppointmentId,
}: ReviewSectionProps) => {
    const [isWriting, setIsWriting] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        appointment_id: pendingAppointmentId,
        rating: 5,
        comment: '',
    });

    useEffect(() => {
        setData('appointment_id', pendingAppointmentId);
    }, [pendingAppointmentId, setData]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedComment = data.comment.trim();
        if (!trimmedComment) return;

        post('/reviews', {
            data: {
                ...data,
                comment: trimmedComment,
            },
            onSuccess: () => {
                setIsWriting(false);
                reset('comment');
                setData('rating', 5);
            },
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Reviews
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {reviews.length}{' '}
                        {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
                {canReview && !isWriting && (
                    <Button
                        onClick={() => setIsWriting(true)}
                        className="shrink-0"
                    >
                        Write a Review
                    </Button>
                )}
            </div>

            {isWriting && (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6"
                >
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-foreground">
                                    Share your experience
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Your review helps other clients know what to
                                    expect.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {data.rating} of 5 stars
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Rating
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        className={cn(
                                            'inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition focus:ring-2 focus:ring-ring/40 focus:outline-none',
                                            star <= data.rating
                                                ? 'border-amber-200 bg-amber-50 text-amber-500'
                                                : 'border-border bg-background text-muted-foreground hover:border-amber-200 hover:text-amber-500',
                                        )}
                                    >
                                        <Star
                                            className={`size-6 ${
                                                star <= data.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Your Review
                            </label>
                            <Textarea
                                value={data.comment}
                                onChange={(e) =>
                                    setData('comment', e.target.value)
                                }
                                placeholder="Tell others about the professionalism, service quality, and overall experience..."
                                rows={5}
                                className="min-h-[132px] rounded-2xl border-border/80 bg-background/80"
                            />
                            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span>Keep it honest and helpful.</span>
                                <span>{data.comment.trim().length}/500</span>
                            </div>
                            {errors.comment && (
                                <p className="text-sm text-destructive">
                                    {errors.comment}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsWriting(false);
                                    reset('comment');
                                    setData('rating', 5);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.comment.trim()}
                            >
                                Submit Review
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm">
                        <MessageSquare className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                        No reviews yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        Once clients start sharing feedback, their reviews will
                        show up here. The first thoughtful review helps set the
                        tone.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                    
                        <div key={review.id}>
                            <div className="mt-6 space-y-4">
                                <div className="flex flex-col items-start gap-3 sm:flex-row">
                                    <img
                                        src="data:image/png;base64,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"
                                        className="h-12 w-12 shrink-0 rounded-full border-2 border-white dark:border-neutral-700"
                                        alt="user avatar"
                                    />
                                    <div>
                                        <h4 className="text-sm capitalize font-semibold text-slate-900 dark:text-slate-50">
                                            {review.client_name}
                                        </h4>

                                        <div
                                            className="mt-1 flex items-center space-x-1"
                                            role="img"
                                            aria-label="Rated 3 out of 5 stars"
                                        >
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-3 w-3 ${i < review.rating ? 'fill-[#ffc107]' : 'fill-[#CED5D8] dark:fill-neutral-600'}`}
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="m23.363 8.584-7.378-1.127L12.678.413c-.247-.526-1.11-.526-1.357 0L8.015 7.457.637 8.584a.75.75 0 0 0-.423 1.265l5.36 5.494-1.267 7.767a.75.75 0 0 0 1.103.777L12 20.245l6.59 3.643a.75.75 0 0 0 1.103-.777l-1.267-7.767 5.36-5.494a.75.75 0 0 0-.423-1.266z" />
                                                </svg>
                                            ))}
                                            <p className="!ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {' '}
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                        <p className="mt-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
