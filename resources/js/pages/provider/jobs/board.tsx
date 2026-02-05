import AppLayout from "@/layouts/guest-layout";
import { Head,  useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, DollarSign, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import jo from "@/routes/jobs";

interface Job {
    id: number;
    title: string;
    description: string;
    category: string;
    budget_min: number | null;
    budget_max: number | null;
    address: string;
    created_at: string;
    distance: number;
}

export default function JobBoard({ jobs }: { jobs: { data: Job[] } }) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const { data, setData, post, processing, errors, reset} = useForm({
        price: "",
        message: "",
    });

    const handlePlaceBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedJob) {
            post(jo.bid( selectedJob.id).url, {
                onSuccess: () => {
                    setSelectedJob(null);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Job Board" />
            <div className="max-w-7xl w-full mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold mb-8">Nearby Jobs</h1>

                {jobs.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No jobs available in your area right now.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Check back later for new opportunities!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {jobs.data.map((job) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle>{job.title}</CardTitle>
                                            <CardDescription className="mt-2">
                                                {job.description}
                                            </CardDescription>
                                            <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.address} ({job.distance.toFixed(1)} km away)
                                                </div>
                                                {job.budget_min && job.budget_max && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        ${job.budget_min} - ${job.budget_max}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Dialog
                                            open={selectedJob?.id === job.id}
                                            onOpenChange={(open) => !open && setSelectedJob(null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button onClick={() => setSelectedJob(job)}>
                                                    Place Bid
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Place Your Bid</DialogTitle>
                                                    <DialogDescription>
                                                        Submit your proposal for: {selectedJob?.title}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handlePlaceBid} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="price">Your Price ($)</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            value={data.price}
                                                            onChange={(e) => setData("price", e.target.value)}
                                                            placeholder="Enter your price"
                                                            required
                                                        />
                                                        {errors.price && (
                                                            <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="message">
                                                            Message (Optional)
                                                        </Label>
                                                        <Textarea
                                                            id="message"
                                                            value={data.message}
                                                            onChange={(e) => setData("message", e.target.value)}
                                                            placeholder="Why you're the best fit for this job..."
                                                            rows={4}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setSelectedJob(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={processing}>
                                                            {processing && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Submit Bid
                                                        </Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
