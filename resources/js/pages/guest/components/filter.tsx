import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    name: string;
    slug: string;
}

interface HeaderFilterProps {
    categories: Category[];
    filters: {
        category?: string;
        search?: string;
        lat?: number | string;
        lng?: number | string;
        sort?: string;
        min_rating?: number | string;
    };
    onLocationRequest?: () => void;
    hasLocation?: boolean;
}

export const HeaderFilter = ({
    categories,
    filters,
    onLocationRequest,
    hasLocation,
}: HeaderFilterProps) => {
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category || 'For You',
    );
    const [search, setSearch] = useState(filters?.search || '');

    useEffect(() => {
        setSearch(filters?.search || '');
    }, [filters?.search]);

    useEffect(() => {
        setSelectedCategory(filters?.category || 'For You');
    }, [filters?.category]);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/',
            { ...filters, search: value },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.get(
            '/',
            { ...filters, category: category },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleSortChange = (sort: string) => {
        router.get(
            '/',
            { ...filters, sort: sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleRatingChange = (rating: string) => {
        router.get(
            '/',
            { ...filters, min_rating: rating === 'all' ? undefined : rating },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    return (
        <div className="sticky top-12 z-20 -mx-4 -mt-4 border-b bg-background px-4 py-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left: Filter & Search */}
                <div className="flex flex-1 items-center space-x-4">
                    <div className="relative flex w-full items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Service, location..."
                                className="h-12 rounded-full border-border/60 pr-12 pl-11 focus-visible:bg-background focus-visible:ring-1"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <button
                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                                onClick={onLocationRequest}
                                title="Use current location"
                            >
                                <MapPin className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Filters & Sort */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                    <Select onValueChange={handleRatingChange}>
                        <SelectTrigger className="h-9 w-[130px] rounded-full border-none bg-muted/50">
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Rating</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="2">2+ Stars</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={handleSortChange}>
                        <SelectTrigger className="h-9 w-[160px] rounded-full border-none bg-muted/50">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="recommended">
                                    Recommended
                                </SelectItem>
                                <SelectItem value="price_asc">
                                    Price: Low to High
                                </SelectItem>
                                <SelectItem value="price_desc">
                                    Price: High to Low
                                </SelectItem>
                                <SelectItem value="rating_desc">
                                    Top Rated
                                </SelectItem>
                                {hasLocation && (
                                    <SelectItem value="distance_asc">
                                        Distance
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide mt-3 flex space-x-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    onClick={() => handleCategoryChange('For You')}
                    className={`rounded px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === 'For You'
                            ? 'bg-foreground text-background shadow-md'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                >
                    For You
                </button>
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`rounded px-4 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                            selectedCategory === category.slug
                                ? 'bg-foreground text-background shadow-md'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
