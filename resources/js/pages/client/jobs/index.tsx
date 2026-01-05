import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Calendar, User } from "lucide-react";

interface Job {
    id: number;
    title: string;
    description: string;
    category: string;
    budget_min: number | null;
    budget_max: number | null;
    address: string;
    status: string;
    created_at: string;
    bids_count: number;
    bids: Bid[];
}

interface Bid {
    id: number;
    price: number;
    message: string;
    status: string;
    created_at: string;
    provider: {
        name: string;
        business_profile: {
            business_name: string;
            logo: string | null;
        };
    };
}

export default function MyJobs({ jobs }: { jobs: Job[] }) {
    const acceptBid = (bidId: number) => {
        if (confirm("Accept this bid? This will close the job and notify the provider.")) {
            router.post(route("jobs.bids.accept", bidId));
        }
    };

    return (
        <AppLayout>
            <Head title="My Jobs" />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Jobs</h1>
                    <Button onClick={() => router.visit(route("jobs.post"))}>
                        Post New Job
                    </Button>
                </div>

                {jobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                You haven't posted any jobs yet.
                            </p>
                            <Button onClick={() => router.visit(route("jobs.post"))}>
                                Post Your First Job
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{job.title}</CardTitle>
                                            <CardDescription className="mt-2">
                                                {job.description}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                job.status === "open"
                                                    ? "default"
                                                    : job.status === "awarded"
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                        >
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {job.address}
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
                                </CardHeader>

                                {job.bids.length > 0 && (
                                    <CardContent>
                                        <h4 className="font-semibold mb-4">
                                            Bids ({job.bids_count})
                                        </h4>
                                        <div className="space-y-4">
                                            {job.bids.map((bid) => (
                                                <div
                                                    key={bid.id}
                                                    className="border rounded-lg p-4"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <User className="h-4 w-4" />
                                                                <span className="font-medium">
                                                                    {bid.provider.business_profile?.business_name ||
                                                                        bid.provider.name}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    ${bid.price}
                                                                </Badge>
                                                            </div>
                                                            {bid.message && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {bid.message}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                {new Date(bid.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {job.status === "open" &&
                                                            bid.status === "pending" && (
                                                                <Button
                                                                    onClick={() => acceptBid(bid.id)}
                                                                    size="sm"
                                                                >
                                                                    Accept Bid
                                                                </Button>
                                                            )}
                                                        {bid.status === "accepted" && (
                                                            <Badge>Accepted</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
