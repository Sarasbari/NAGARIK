'use client';

import React from 'react';
import RoutePreview from './RoutePreview';

export default function DispatchModal() {
  // TODO: Confirm/override waypoints, assign truck, dispatch

  return (
    <div className="space-y-4">
      <RoutePreview />

      <div className="border-3 border-brutal-border p-4">
        <h3 className="font-display font-bold mb-2">Assign Truck</h3>
        <select className="w-full border-2 border-brutal-border p-2 font-body">
          <option>🚛 Truck #01 — Ramesh (idle)</option>
          <option>🚛 Truck #03 — Sunil (idle)</option>
          <option>🚛 Truck #07 — Mahesh (idle)</option>
        </select>
      </div>

      <button className="w-full bg-brutal-border text-saffron font-display font-bold py-3 border-3 border-brutal-border shadow-brutal hover:shadow-brutal-sm transition-shadow">
        ✅ Confirm Dispatch
      </button>

      <button className="w-full bg-white text-brutal-border font-display font-bold py-3 border-3 border-brutal-border hover:bg-gray-50 transition-colors">
        ✏️ Override Waypoints
      </button>
    </div>
  );
}
