import type { Metadata } from 'next';
import './globals.css';
import KPIStrip from '../components/ui/KPIStrip';

export const metadata: Metadata = {
  title: 'Nagarik Dashboard — Municipal Command Center',
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
      <body className="font-body bg-brutal-bg text-brutal-border min-h-screen">
        <KPIStrip />
        <main className="h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
