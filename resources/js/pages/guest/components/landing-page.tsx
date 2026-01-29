import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import Cubes from './cube';

export default function Landing() {
    return (
        <div className="relative isolate flex min-h-[calc(90vh-3rem)] items-center overflow-hidden">
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className='relative h-[10px]'>
                        <Cubes
                            gridSize={1}
                            maxAngle={45}
                            radius={3}
                            // borderStyle="2px dashed #B19EEF"
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
                            // borderStyle="2px dashed #B19EEF"
                            faceColor="#1a1a2e"
                            rippleColor="#ff6b6b"
                            rippleSpeed={1.5}
                            autoAnimate
                            rippleOnClick
                        />
                    </div>


                    <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
                        {/* Your  Favorite Servcice At Your Fingertips */}
                        Your Next Favorite Service Provider Awaits
                    </h1>
                    <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
                        Discover and connect with top-rated local professionals
                        for all your service needs. Whether you're looking for
                        home repairs, personal care, or specialized services,
                        we've got you covered.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-x-6">
                        <a href="#marketplace">
                            <Button>
                                Get started <ArrowDownIcon />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            <img
                alt="hero image"
                src="assets/illustrations/group.svg"
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 z-0 min-w-screen -translate-x-1/2"
            />


        </div>
    );
}
