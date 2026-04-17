import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';

export const metadata: Metadata = {
  title: 'Nagarik',
  description: 'AI-powered civic issue tracking and dispatch system for municipal officers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-white text-black min-h-screen">
        <LocationProvider>
          <AuthProvider>
            <main className="min-h-screen">{children}</main>
          </AuthProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
