/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminLayout from '@/layouts/admin-layout';
import { Head,  useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import {
    Star,
    Trash2,
    Calendar,
} from 'lucide-react';
import { Pagination } from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    provider_name: string;
    appointment_id: number | null;
    created_at: string;
}

interface Props {
    reviews: {
        data: Review[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        rating?: string;
        flagged?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Moderation',
        href: '',
    },
    {
        title: 'Reviews',
        href: '',
    },
];

export default function ModerationReviews({ reviews, filters }: Props) {
    const [deletingReview, setDeletingReview] = useState<Review | null>(null);

    const { data, setData, get, delete: deleteMethod, processing } = useForm({
        rating: filters.rating || '',
        flagged: filters.flagged || '',
    });

    const handleFilter = () => {
        get('/admin/moderation/reviews', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deletingReview) return;

        deleteMethod(`/admin/moderation/reviews/${deletingReview.id}`, {
            onSuccess: () => {
                setDeletingReview(null);
            },
        });
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-600';
        if (rating >= 3) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderation - Reviews" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Reviews
                    </h1>
                    <p className="text-muted-foreground">
                        Moderate user reviews and ratings
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Rating
                                </label>
                                <Select
                                    value={data.rating}
                                    onValueChange={(value) =>
                                        setData('rating', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All ratings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Flagged
                                </label>
                                <Select
                                    value={data.flagged}
                                    onValueChange={(value) =>
                                        setData('flagged', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All reviews" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All reviews</SelectItem>
                                        <SelectItem value="1">
                                            Low ratings (≤2 stars)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button onClick={handleFilter}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Reviews ({reviews.total.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reviews.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No reviews found
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Comment</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reviews.data.map((review) => (
                                            <TableRow key={review.id}>
                                                <TableCell className="font-medium">
                                                    {review.user_name}
                                                </TableCell>
                                                <TableCell>
                                                    {review.provider_name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Star
                                                            className={`h-4 w-4 fill-current ${getRatingColor(review.rating)}`}
                                                        />
                                                        <span
                                                            className={`font-medium ${getRatingColor(review.rating)}`}
                                                        >
                                                            {review.rating}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <p className="truncate">
                                                        {review.comment || (
                                                            <span className="text-muted-foreground italic">
                                                                No comment
                                                            </span>
                                                        )}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            review.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeletingReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4">
                                    <Pagination links={reviews.links} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Dialog */}
                <AlertDialog
                    open={!!deletingReview}
                    onOpenChange={(open) => {
                        if (!open) setDeletingReview(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this review? This
                                action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={processing}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
