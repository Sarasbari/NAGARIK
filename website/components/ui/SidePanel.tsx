import React from 'react';

interface SidePanelProps {
  children: React.ReactNode;
  width?: string;
}

export default function SidePanel({ children, width = 'w-[420px]' }: SidePanelProps) {
  return (
    <div
      className={`${width} h-full bg-white border-l-3 border-brutal-border shadow-brutal-lg overflow-y-auto p-6 animate-slide-in`}
    >
      {children}
    </div>
  );
}
