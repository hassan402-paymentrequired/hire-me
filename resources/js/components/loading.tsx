import React from 'react';
import { useLoading } from '@/contexts/loading-context';

const LoadingScreen = () => {
    const { isLoading, message } = useLoading();

    if (!isLoading) return null;

    return (
        <div className={"flex flex-col justify-center items-center h-screen z-[9999] fixed inset-0 bg-background/30 backdrop-blur-sm transition-all duration-300"}>

            <div className="typing-indicator">
                <div className="typing-circle"></div>
                <div className="typing-circle"></div>
                <div className="typing-circle"></div>
                <div className="typing-shadow"></div>
                <div className="typing-shadow"></div>
                <div className="typing-shadow"></div>
            </div>

            {message && (
                <p className="mt-4 text-lg font-black tracking-tight animate-pulse text-foreground/80 lowercase ">
                    {message}
                </p>
            )}

        </div>
    );
};

export default LoadingScreen;
