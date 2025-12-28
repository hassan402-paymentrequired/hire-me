import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Eye, Filter, MoreHorizontal, Search, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

// Mock Data
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

const projects = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: `Project Title ${i + 1}`,
    author: `Creator Name ${i + 1}`,
    image: `https://picsum.photos/seed/${i + 100}/800/600`, // Placeholder
    likes: Math.floor(Math.random() * 1000) + 50,
    views: Math.floor(Math.random() * 10000) + 1000,
}));

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [selectedCategory, setSelectedCategory] = useState('For You');

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <AppLayout>
                <div className="flex flex-col space-y-6">
                    {/* Top Filter Bar */}
                    <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            {/* Left: Filter & Search */}
                            <div className="flex flex-1 items-center space-x-4">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 rounded-full px-4"
                                >
                                    <Filter className="h-4 w-4" />
                                    <span>Filter</span>
                                </Button>
                                <div className="relative w-full max-w-xl">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Behance..."
                                        className="h-10 rounded-full bg-muted/50 pl-10 focus-visible:bg-background focus-visible:ring-1"
                                    />
                                </div>
                            </div>

                            {/* Right: Tabs & Sort */}
                            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                                <div className="flex items-center rounded-full bg-muted/50 p-1">
                                    {[
                                        'Projects',
                                        'People',
                                        'Assets',
                                        'Images',
                                    ].map((tab) => (
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
                                    ))}
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
                                            <SelectItem value="curated">
                                                Curated
                                            </SelectItem>
                                            <SelectItem value="most-viewed">
                                                Most Viewed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="scrollbar-hide mt-4 flex space-x-2 overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
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

                    {/* Main Content Grid */}
                    <div className="px-1 py-4">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group flex flex-col space-y-3"
                                >
                                    {/* Card Image */}
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90">
                                                Featured
                                            </Badge>
                                        </div>
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-full bg-background/20 text-white hover:bg-background/40"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="line-clamp-1 font-semibold text-foreground group-hover:underline">
                                                {project.title}
                                            </h3>
                                            <p className="line-clamp-1 text-sm text-muted-foreground">
                                                {project.author}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                <span>{project.likes}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>
                                                    {(
                                                        project.views / 1000
                                                    ).toFixed(1)}
                                                    k
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
