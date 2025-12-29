import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';

interface HeaderFilterProps {
    categories: string[];
    filters: {
        category?: string;
        search?: string;
        lat?: number | string;
        lng?: number | string;
    };
}

export const HeaderFilter = ({ categories, filters }: HeaderFilterProps) => {
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'For You');
    const [search, setSearch] = useState(filters?.search || '');

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

    return (
        <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left: Filter & Search */}
                <div className="flex flex-1 items-center space-x-4">
                    <div className="relative w-full ">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search Service, location..."
                            className="h-10 rounded-full shadow-none pl-10 focus-visible:bg-background focus-visible:ring-1"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right: Tabs & Sort */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                    <div className="hidden sm:flex items-center rounded-full bg-muted/50 p-1">
                        {['Services'].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                        tab === 'Services'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide mt-4 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={() => handleCategoryChange('For You')}
                    className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === 'For You'
                            ? 'bg-foreground text-background shadow-md'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                >
                    For You
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                            selectedCategory === category
                                ? 'bg-foreground text-background shadow-md'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        {category?.charAt(0).toUpperCase() + category?.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
}

