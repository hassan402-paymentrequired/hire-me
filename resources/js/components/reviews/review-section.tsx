import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reviews', {
            onSuccess: () => {
                setIsWriting(false);
                reset();
            },
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Reviews ({reviews.length})</h2>
                {canReview && !isWriting && (
                    <Button onClick={() => setIsWriting(true)}>Write a Review</Button>
                )}
            </div>

            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setData('rating', star)}
                                    className="focus:outline-none"
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
                        <label className="text-sm font-medium">Your Review</label>
                        <Textarea
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                        />
                        {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsWriting(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Submit Review
                        </Button>
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                    <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-card border rounded p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                <div className="font-bold text-foreground">{review.client_name}</div>
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
                                </div>
                                <div className="text-xs text-muted-foreground">{review.created_at}</div>
                            </div>

                            <p className="text-foreground leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
