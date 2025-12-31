import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Search, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';

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

export const HeaderFilter = ({ categories, filters, onLocationRequest, hasLocation }: HeaderFilterProps) => {
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'For You');
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
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.get(
            '/',
            { ...filters, category: category },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const handleSortChange = (sort: string) => {
        router.get(
            '/',
            { ...filters, sort: sort },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const handleRatingChange = (rating: string) => {
        router.get(
            '/',
            { ...filters, min_rating: rating === 'all' ? undefined : rating },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    return (
        <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left: Filter & Search */}
                <div className="flex flex-1 items-center space-x-4">
                    <div className="relative w-full flex items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Service, location..."
                                className="h-12 rounded-full pl-11 pr-12 focus-visible:bg-background focus-visible:ring-1 border-border/60"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <button
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
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
                    <Select  onValueChange={handleRatingChange}>
                        <SelectTrigger className="w-[130px] rounded-full bg-muted/50 border-none h-9">
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Rating</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="2">2+ Stars</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select  onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[160px] rounded-full bg-muted/50 border-none h-9">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="recommended">Recommended</SelectItem>
                                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                <SelectItem value="rating_desc">Top Rated</SelectItem>
                                {hasLocation && <SelectItem value="distance_asc">Distance</SelectItem>}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide mt-3 flex space-x-2 overflow-x-auto  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
}
