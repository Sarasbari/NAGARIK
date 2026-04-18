'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicRoute = pathname === '/login' || pathname.startsWith('/auth');

    if (isPublicRoute) {
        return <>{children}</>;
    }

    let headerTitle = 'City_Command_Center';
    if (pathname.includes('/potholes')) headerTitle = 'ACTIVE POTHOLES';
    else if (pathname.includes('/bins')) headerTitle = 'OVERFLOWING BINS';
    else if (pathname.includes('/water-leaks')) headerTitle = 'WATER LEAKS';
    else if (pathname.includes('/issues')) headerTitle = 'VERIFIED ISSUES';
    else if (pathname === '/') headerTitle = 'CITY_COMMAND_CENTER';
    else if (pathname.includes('/command')) headerTitle = 'DISPATCH COMMAND';
    else if (pathname.includes('/unclaimed')) headerTitle = 'UNCLAIMED PUBLIC WORKS';
    else if (pathname.includes('/radar')) headerTitle = 'CIVIC RADAR';
    else if (pathname.includes('/fames')) headerTitle = 'F.A.M.E.S. AI';
    else if (pathname.includes('/equity')) headerTitle = 'EQUITY MAP';

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title={headerTitle} />
                {children}
            </div>
        </div>
    );
}
