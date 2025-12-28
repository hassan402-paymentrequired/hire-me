import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {  Filter,  Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const HeaderFilter = () => {
    const [selectedCategory, setSelectedCategory] = useState('For You');

    const categories = [
        'For You',
        'Following',
        'Best of Behance',
        'Graphic Design',
        'Photography',
        'Illustration',
        '3D Art',
        'UI/UX',
        'Motion',
        'Architecture',
        'Product Design',
        'Fashion',
        'Advertising',
        'Game Design',
    ];


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
                        />
                    </div>
                </div>

                {/* Right: Tabs & Sort */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                    <div className="hidden sm:flex items-center rounded-full bg-muted/50 p-1">
                        {['Projects'].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                        tab === 'Projects'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ),
                        )}
                    </div>
                    <div className="hidden border-l pl-2 md:block">
                        <Select defaultValue="recommended">
                            <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recommended">
                                    Recommended
                                </SelectItem>
                                <SelectItem value="curated">Curated</SelectItem>
                                <SelectItem value="most-viewed">
                                    Most Viewed
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide mt-4 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                            selectedCategory === category
                                ? 'bg-foreground text-background shadow-md'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}

