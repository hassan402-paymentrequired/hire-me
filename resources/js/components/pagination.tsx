import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export function Pagination({ links }: PaginationProps) {
    if (!links || links.length <= 1) {
        return null;
    }

    // Remove first and last items as they're handled separately
    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            {links[0]?.url && (
                <Link href={links[0].url}>
                    <Button variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                </Link>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pageLinks.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-1 text-sm text-muted-foreground"
                            >
                                {link.label}
                            </span>
                        );
                    }

                    return (
                        <Link key={index} href={link.url}>
                            <Button
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                            >
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            {links[links.length - 1]?.url && (
                <Link href={links[links.length - 1].url}>
                    <Button variant="outline" size="sm">
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
            )}
        </div>
    );
}
