import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';
import { Eye,  MoreHorizontal,  ThumbsUp } from 'lucide-react';
import { HeaderFilter } from '@/pages/guest/components/filter';


const projects = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: `Project Title ${i + 1}`,
    author: `Creator Name ${i + 1}`,
    image: `https://picsum.photos/seed/${i + 100}/800/600`, // Placeholder
    likes: Math.floor(Math.random() * 1000) + 50,
    views: Math.floor(Math.random() * 10000) + 1000,
}));

export default function Welcome() {

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
                <div className="flex flex-col space-y-6  px-5 box-border overflow-hidden">
                    {/* Top Filter Bar */}
                   <HeaderFilter />

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
