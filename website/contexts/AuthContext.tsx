'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    name: string;
    email: string;
    image: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Initialize with dummy user for demo if needed, but per request we start logged in or out
    // Let's start with a mock user as "logged in" by default to match current state, 
    // but provide the logout functionality.
    useEffect(() => {
        const savedUser = localStorage.getItem('nagarik_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        } else {
            // Default mock user if nothing saved
            const mockUser = {
                name: 'Officer Arjun',
                email: 'arjun@municipal.gov',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop'
            };
            setUser(mockUser);
            setIsLoggedIn(true);
            localStorage.setItem('nagarik_user', JSON.stringify(mockUser));
        }
    }, []);

    const login = () => {
        const MOCK_USERS = [
            {
                name: 'Neha Gupta',
                email: 'neha.gupta@municipal.gov',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop'
            },
            {
                name: 'Arjun Verma',
                email: 'arjun.verma@municipal.gov',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop'
            },
            {
                name: 'Siddharth Roy',
                email: 'sid.roy@municipal.gov',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop'
            }
        ];

        const selectedUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        setUser(selectedUser);
        setIsLoggedIn(true);
        localStorage.setItem('nagarik_user', JSON.stringify(selectedUser));
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('nagarik_user');
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
