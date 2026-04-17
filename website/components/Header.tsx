'use client';

import React, { useState } from 'react';
import { Bell, Settings, RefreshCw, ChevronDown, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';

interface HeaderProps {
    title?: string;
}

const CITIES = [
    'All',
    'Ahmedabad',
    'Bangalore',
    'Chennai',
    'Delhi',
    'Gurgaon',
    'Hyderabad',
    'Jaipur',
    'Kolkata',
    'Mumbai',
    'Pune',
    'Shimla',
    'Surat'
];

export default function Header({ title = 'City_Command_Center' }: HeaderProps) {
    const { user, isLoggedIn } = useAuth();
    const { selectedCity, setCity } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCities = CITIES.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between pr-6 sticky top-0 z-40 pl-[17.5rem]">
            <div className="flex items-center gap-4">
                <div className="px-4 py-1 font-black uppercase text-2xl italic tracking-tighter flex items-center">
                    {title === 'City_Command_Center' ? (
                        <span className="bg-neon-green px-4 py-1 border-4 border-black whitespace-nowrap">{title}</span>
                    ) : (
                        <span className="text-black uppercase tracking-widest font-black italic whitespace-nowrap">SYSTEM VIEW: {title}</span>
                    )}
                </div>

                {title === 'City_Command_Center' && (
                    <div className="flex items-center gap-6 md:flex hidden">
                        <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase">System_Online</span>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1 rounded-full">
                            <RefreshCw size={10} className="animate-spin-slow" />
                            <span className="text-[10px] font-bold uppercase">Data_Synced</span>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 border-4 border-black px-4 py-2 font-black uppercase text-[10px] bg-white shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition-all"
                    >
                        <MapPin size={14} className="fill-black" />
                        {selectedCity}
                        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border-4 border-black shadow-brutal z-50">
                            <div className="p-2 border-b-4 border-black bg-gray-50 flex items-center gap-2">
                                <Search size={14} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Type city name..."
                                    className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredCities.length > 0 ? (
                                    filteredCities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => {
                                                setCity(city);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-neon-green border-b-2 border-black last:border-0 transition-colors ${selectedCity === city ? 'bg-neon-green' : ''}`}
                                        >
                                            {city}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 italic">No cities found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 border-4 border-black bg-white hover:bg-gray-50 transition-colors shadow-brutal-sm">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 border-4 border-black bg-white hover:bg-gray-50 transition-colors shadow-brutal-sm">
                        <Settings size={20} />
                    </button>
                </div>
            </nav>
        </header>
    );
}
