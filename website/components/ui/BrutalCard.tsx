import React from 'react';

interface BrutalCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function BrutalCard({ children, className = '' }: BrutalCardProps) {
  return (
    <div
      className={`bg-white border-3 border-brutal-border shadow-brutal p-4 ${className}`}
    >
      {children}
    </div>
  );
}
