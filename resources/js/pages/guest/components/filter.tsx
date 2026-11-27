import { AppSelect } from '@/components/ui/app-select';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import {
    BookOpen,
    Briefcase,
    Camera,
    Car,
    Droplet,
    Dumbbell,
    Flower2,
    GraduationCap,
    Hammer,
    HeartPulse,
    Home,
    LayoutGrid,
    Lightbulb,
    type LucideIcon,
    MapPin,
    MessagesSquare,
    Palette,
    Scale,
    Scissors,
    Search,
    ShoppingBag,
    Sparkles,
    Store,
    Video,
    Wrench,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'home-services': Home,
    cleaning: Sparkles,
    plumbing: Wrench,
    'electrical-repairs': Lightbulb,
    carpentry: Hammer,
    'beauty-personal-care': Sparkles,
    salon: Store,
    barbing: Scissors,
    makeup: Palette,
    nails: Droplet,
    'spa-massage': Flower2,
    'fitness-training': Dumbbell,
    'health-wellness': HeartPulse,
    'events-photography': Camera,
    photography: Camera,
    videography: Video,
    'education-tutoring': GraduationCap,
    'private-tutors': BookOpen,
    'professional-services': Briefcase,
    'personal-shopping': ShoppingBag,
    'legal-services': Scale,
    consulting: MessagesSquare,
    automotive: Car,
    'car-repairs': Wrench,
    other: LayoutGrid,
};

const categoryIcon = (slug: string): LucideIcon =>
    CATEGORY_ICONS[slug] ?? LayoutGrid;

const categoryChipClass = (active: boolean) =>
    `inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
        active
            ? 'border-[#0E3B2E] bg-[#0E3B2E] text-white dark:border-[#C8F169] dark:bg-[#C8F169] dark:text-[#0E3B2E]'
            : 'border-[#E6EBE3] bg-white text-[#173028] hover:border-[#C9D5CC] dark:border-white/10 dark:bg-transparent dark:text-foreground'
    }`;

const categoryIconClass = (active: boolean) =>
    `size-3.5 shrink-0 stroke-[1.75] ${
        active
            ? 'text-[#C8F169] dark:text-[#0E3B2E]'
            : 'text-[#6E9480] dark:text-[#A9C7B8]'
    }`;

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
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setSelectedCategory(filters?.category || 'For You');
        setSearch(filters?.search || '');
    }, [filters?.category, filters?.search]);

    const handleSearch = (value: string) => {
        setSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            router.get(
                '/',
                { ...filters, search: value },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 500);
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
                                className="h-12 rounded-full border-border/60 pr-12 pl-11 font-heading focus-visible:bg-background focus-visible:ring-1"
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
                    <AppSelect
                        onChange={handleRatingChange}
                        placeholder="Rating"
                        ariaLabel="Rating"
                        size="sm"
                        searchable={false}
                        className="w-[140px] shrink-0"
                        triggerClassName="h-9 min-h-9 rounded-full border-none bg-muted/50"
                        options={[
                            { value: 'all', label: 'Any Rating' },
                            { value: '4', label: '4+ Stars' },
                            { value: '3', label: '3+ Stars' },
                            { value: '2', label: '2+ Stars' },
                        ]}
                    />

                    <AppSelect
                        onChange={handleSortChange}
                        placeholder="Sort by"
                        ariaLabel="Sort by"
                        size="sm"
                        searchable={false}
                        className="w-[180px] shrink-0"
                        triggerClassName="h-9 min-h-9 rounded-full border-none bg-muted/50"
                        options={[
                            { value: 'recommended', label: 'Recommended' },
                            { value: 'price_asc', label: 'Price: Low to High' },
                            {
                                value: 'price_desc',
                                label: 'Price: High to Low',
                            },
                            { value: 'rating_desc', label: 'Top Rated' },
                            ...(hasLocation
                                ? [{ value: 'distance_asc', label: 'Distance' }]
                                : []),
                        ]}
                    />
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide mt-5 flex space-x-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    onClick={() => handleCategoryChange('For You')}
                    className={categoryChipClass(
                        selectedCategory === 'For You',
                    )}
                >
                    <LayoutGrid
                        className={categoryIconClass(
                            selectedCategory === 'For You',
                        )}
                    />
                    For You
                </button>
                {categories.map((category) => {
                    const Icon = categoryIcon(category.slug);
                    const active = selectedCategory === category.slug;

                    return (
                        <button
                            key={category.slug}
                            onClick={() => handleCategoryChange(category.slug)}
                            className={categoryChipClass(active)}
                        >
                            <Icon className={categoryIconClass(active)} />
                            {category.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
