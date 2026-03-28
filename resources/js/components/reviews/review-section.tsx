import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate } from '@/lib/utils';

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

export const ReviewSection = ({ reviews, canReview, pendingAppointmentId }: ReviewSectionProps) => {
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
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
                {canReview && !isWriting && (
                    <Button onClick={() => setIsWriting(true)} className="shrink-0">
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
                                    Your review helps other clients know what to expect.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {data.rating} of 5 stars
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Rating</label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        className={cn(
                                            'inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-ring/40',
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
                            <label className="text-sm font-medium text-foreground">Your Review</label>
                            <Textarea
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder="Tell others about the professionalism, service quality, and overall experience..."
                                rows={5}
                                className="min-h-[132px] rounded-2xl border-border/80 bg-background/80"
                            />
                            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span>Keep it honest and helpful.</span>
                                <span>{data.comment.trim().length}/500</span>
                            </div>
                            {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
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
                            <Button type="submit" disabled={processing || !data.comment.trim()}>
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
                    <h3 className="text-base font-semibold text-foreground">No reviews yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        Once clients start sharing feedback, their reviews will show up here. The first thoughtful review helps set the tone.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="group rounded-2xl border border-border/70 bg-card/90 p-5 transition hover:border-border"
                        >
                            <div className="flex h-full flex-col gap-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-semibold uppercase text-foreground">
                                            {review.client_name
                                                .split(' ')
                                                .map((part) => part[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold text-foreground">
                                                {review.client_name}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`size-4 ${
                                                                star <= review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                        {formatDate(review.created_at)}
                                    </div>
                                </div>

                                <p className="text-sm leading-7 text-foreground/90">
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
