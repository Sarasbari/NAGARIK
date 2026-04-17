'use client';

import React from 'react';

export default function RoutePreview() {
  // TODO: Show optimized route on map before dispatch confirmation
  return (
    <div className="border-3 border-brutal-border bg-gray-50 p-4 mb-4">
      <h3 className="font-display font-bold mb-2">Route Preview</h3>
      <p className="text-sm text-gray-500">
        Optimized route with {4} waypoints • ~{2.5}km total
      </p>
      <div className="mt-2 space-y-1">
        {['Start: Depot', 'Stop 1: Pothole - K-East', 'Stop 2: Garbage - H-West', 'Stop 3: Drainage - L-Ward'].map(
          (stop, i) => (
            <div key={i} className="text-sm flex items-center gap-2">
              <span className="w-5 h-5 bg-brutal-border text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              {stop}
            </div>
          )
        )}
      </div>
    </div>
  );
}
