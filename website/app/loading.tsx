import React from 'react';

export default function Loading() {
    return (
        <main className="flex-1 p-8 bg-dot-grid">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-200 border-4 border-gray-300 p-6 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <div className="h-6 w-24 bg-gray-300"></div>
                                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-10 w-16 bg-gray-300"></div>
                                <div className="h-3 w-32 bg-gray-300"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="flex gap-8">
                    <div className="w-80 h-[500px] bg-gray-200 border-4 border-gray-300 hidden md:block"></div>
                    <div className="flex-1 h-[500px] bg-gray-200 border-4 border-gray-300"></div>
                </div>
            </div>
        </main>
    );
}
