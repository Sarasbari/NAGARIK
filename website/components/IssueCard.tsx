import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface IssueCardProps {
    title: string;
    description: string;
    location: string;
    subLocation: string;
    timeAgo: string;
    status: 'CRITICAL' | 'HIGH' | 'MED';
    image: string;
    onClick?: () => void;
}

export default function IssueCard({
    title,
    description,
    location,
    subLocation,
    timeAgo,
    status,
    image,
    onClick
}: IssueCardProps) {
    const statusColor = status === 'CRITICAL' ? 'bg-neon-orange' : 'bg-neon-green';

    return (
        <div
            onClick={onClick}
            className={`flex bg-white border-4 border-black shadow-brutal transition-all group ${onClick ? 'cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px]' : ''}`}
        >
            {/* Image Section */}
            <div className="w-48 bg-gray-100 border-r-4 border-black p-4 flex items-center justify-center">
                <div className="w-full h-32 border-4 border-black bg-gray-200 overflow-hidden relative">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-500"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black uppercase tracking-tight italic">{title}</h3>
                        <span className={`${statusColor} border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase italic`}>
                            {status}
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed max-w-2xl">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-1">
                        <MapPin size={12} className="fill-black" />
                        <span className="text-[10px] font-black uppercase">{location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-1">
                        <span className="text-[10px] font-black uppercase">{subLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-1">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase">{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <button className="w-20 border-l-4 border-black flex items-center justify-center bg-white group-hover:bg-gray-50 transition-colors">
                <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
            </button>
        </div>
    );
}
