import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendLabel: string;
    icon: LucideIcon;
    iconColor: string;
}

export default function StatCard({
    title,
    value,
    trend,
    trendLabel,
    icon: Icon,
    iconColor
}: StatCardProps) {
    return (
        <div className="bg-white border-4 border-black p-6 flex flex-col justify-between h-40 shadow-brutal translate-x-[-4px] translate-y-[-4px]">
            <div className="flex justify-between items-start">
                <span className="bg-gray-100 border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {title}
                </span>
                <Icon className={iconColor} size={24} />
            </div>

            <div className="mt-4">
                <h2 className="text-5xl font-black tracking-tighter transition-all hover:scale-105 cursor-default">
                    {value}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-black uppercase ${trend.startsWith('+') ? 'text-neon-orange' : 'text-neon-green'}`}>
                        {trend}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {trendLabel}
                    </span>
                </div>
            </div>
        </div>
    );
}
