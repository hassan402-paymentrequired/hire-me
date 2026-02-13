import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Cubes from './cube';
import { useState, useEffect } from 'react';

export default function Landing() {
    const [imageOpacity, setImageOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const marketplaceElement = document.getElementById('marketplace');
            if (!marketplaceElement) return;

            const marketplaceTop = marketplaceElement.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            const fadeStart = windowHeight * 0.9;
            const fadeEnd = windowHeight * 0.7;

            if (marketplaceTop >= fadeStart) {
                setImageOpacity(1);
            } else if (marketplaceTop <= fadeEnd) {
                setImageOpacity(0);
            } else {
                const range = fadeStart - fadeEnd;
                const opacity = (marketplaceTop - fadeEnd) / range;
                setImageOpacity(Math.max(0, Math.min(1, opacity)));
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative isolate flex min-h-[calc(100vh-3rem)] items-center overflow-hidden">
            {/* Subtle gradient background */}
            <div
                className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-primary/5"
                aria-hidden
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    {/* Trust badge - staggered entrance */}
                    <div
                        className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <SparklesIcon className="h-4 w-4" />
                        Trusted by local professionals
                    </div>

                    {/* Cubes - staggered */}
                    <div
                        className="relative h-[10px] animate-fade-in-up"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <Cubes
                            gridSize={1}
                            maxAngle={45}
                            radius={3}
                            faceColor="#1a1a2e"
                            rippleColor="#ff6b6b"
                            rippleSpeed={1.5}
                            autoAnimate
                            rippleOnClick
                        />
                        <Cubes
                            gridSize={1}
                            maxAngle={45}
                            radius={3}
                            faceColor="#1a1a2e"
                            rippleColor="#ff6b6b"
                            rippleSpeed={1.5}
                            autoAnimate
                            rippleOnClick
                        />
                    </div>

                    {/* Headline - staggered */}
                    <h1
                        className="mt-4 animate-fade-in-up text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white"
                        style={{ animationDelay: '0.3s' }}
                    >
                        Your Next Favorite{' '}
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Service Provider
                        </span>{' '}
                        Awaits
                    </h1>

                    {/* Description - staggered */}
                    <p
                        className="mt-8 animate-fade-in-up text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400"
                        style={{ animationDelay: '0.45s' }}
                    >
                        Discover and connect with top-rated local professionals
                        for all your service needs. Whether you're looking for
                        home repairs, personal care, or specialized services,
                        we've got you covered.
                    </p>

                    {/* CTA - staggered */}
                    <div
                        className="mt-2 flex flex-col items-center gap-6 animate-fade-in-up"
                        style={{ animationDelay: '0.6s' }}
                    >
                        <a href="#marketplace">
                            {/* <Button
                                size="lg"
                                className="h-12 px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-[0.98]"
                            >
                                Scroll to explore
                                <ArrowDownIcon className="ml-2 h-5 w-5 animate-bounce" />
                            </Button> */}
                        </a>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">Scroll to explore <ArrowDownIcon className="ml-2 h-5 w-5 animate-bounce" /></p>
                    </div>
                </div>
            </div>

            <img
                alt=""
                src="assets/illustrations/group.svg"
                aria-hidden="true"
                className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 z-0 min-w-screen transition-opacity duration-200 ease-out"
                style={{ opacity: imageOpacity }}
            />
        </div>
    );
}
