import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendLabel: string;
    icon: LucideIcon;
    iconColor: string;
    href?: string;
}

export default function StatCard({
    title,
    value,
    trend,
    trendLabel,
    icon: Icon,
    iconColor,
    href
}: StatCardProps) {
    const CardContent = (
        <div className={`bg-white border-4 border-black p-6 flex flex-col justify-between h-40 shadow-brutal translate-x-[-4px] translate-y-[-4px] transition-all ${href ? 'hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer' : ''}`}>
            <div className="flex justify-between items-start">
                <span className="bg-gray-100 border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {title}
                </span>
                <Icon className={iconColor} size={24} />
            </div>

            <div className="mt-4">
                <h2 className="text-5xl font-black tracking-tighter transition-all hover:scale-105">
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

    if (href) {
        return <Link href={href}>{CardContent}</Link>;
    }

    return CardContent;
}
