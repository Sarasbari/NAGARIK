'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface LocationContextType {
    selectedCity: string;
    setCity: (city: string) => void;
    cities: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [selectedCity, setSelectedCity] = useState('All');
    const [cities, setCities] = useState<string[]>(['All']);

    useEffect(() => {
        const savedCity = localStorage.getItem('nagarik_city');
        if (savedCity) {
            setSelectedCity(savedCity);
        }

        const fetchCities = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('complaints')
                .select('city');

            if (error) {
                console.error('Error fetching cities:', error);
            } else if (data) {
                const uniqueCities = Array.from(new Set(data.map(item => item.city).filter(Boolean))).sort() as string[];
                setCities(['All', ...uniqueCities]);
            }
        };

        fetchCities();
    }, []);

    const setCity = (city: string) => {
        setSelectedCity(city);
        localStorage.setItem('nagarik_city', city);
    };

    return (
        <LocationContext.Provider value={{ selectedCity, setCity, cities }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
