'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const MODES = [
  { label: '🔴 Radar', href: '/radar' },
  { label: '🚛 Command', href: '/command' },
  { label: '📋 Issues', href: '/issues' },
  { label: '⚖️ Equity', href: '/equity' },
];

export default function ModeToggle() {
  const pathname = usePathname();

  return (
    <div className="flex bg-white border-3 border-brutal-border shadow-brutal overflow-hidden">
      {MODES.map((mode) => (
        <Link
          key={mode.href}
          href={mode.href}
          className={`px-4 py-2 font-display font-bold text-sm whitespace-nowrap transition-colors ${
            pathname === mode.href
              ? 'bg-brutal-border text-saffron'
              : 'hover:bg-gray-100'
          }`}
        >
          {mode.label}
        </Link>
      ))}
    </div>
  );
}
