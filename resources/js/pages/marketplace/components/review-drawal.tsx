import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare } from 'lucide-react'

interface Review {
    client_name: string
    comment: string
    rating: number
    created_at: string
}

const ReviewDrawal = ({ reviews }: { reviews: Review[] }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    See all reviews
                </Button>
            </SheetTrigger>

            <SheetContent className="sm:max-w-md">
                <SheetHeader className="pb-0">
                    <SheetTitle className="text-lg">
                        Customer Reviews
                    </SheetTitle>
                    <SheetDescription>
                        What clients are saying about this service
                    </SheetDescription>
                </SheetHeader>

                {/* CONTENT */}
                <div className="mt-6 space-y-4 divide-y divide-border h-full overflow-y-auto">
                    {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center  p-8 text-center">
                            <MessageSquare className="mb-3 size-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                No reviews yet
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Reviews from customers will appear here once available.
                            </p>
                        </div>
                    ) : (
                        reviews.map((review, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 bg-background p-5 "
                            >
                                {/* Stars */}
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

                                {/* Review body */}
                                <div>
                                    <p className="text-xs font-semibold text-primary">
                                        {review.created_at}
                                    </p>

                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Author */}
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className='size-8 rounded-full bg-primary text-white flex items-center justify-center'>{review.client_name.charAt(0).toUpperCase()}</span>  — {review.client_name}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ReviewDrawal
