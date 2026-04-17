'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
    selectedCity: string;
    setCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [selectedCity, setSelectedCity] = useState('All');

    useEffect(() => {
        const savedCity = localStorage.getItem('nagarik_city');
        if (savedCity) {
            setSelectedCity(savedCity);
        }
    }, []);

    const setCity = (city: string) => {
        setSelectedCity(city);
        localStorage.setItem('nagarik_city', city);
    };

    return (
        <LocationContext.Provider value={{ selectedCity, setCity }}>
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
