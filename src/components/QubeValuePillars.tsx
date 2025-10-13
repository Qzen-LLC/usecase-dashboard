import React from 'react';

export function QubeValuePillars() {
  const pillars = ['CLARITY', 'CONTROL', 'GOVERNANCE', 'VALUE'];
  
  return (
    <div className="mt-6">
      <p className="text-center text-lg font-bold text-gray-800 tracking-wide">
        {pillars.map((pillar, index) => (
          <span key={pillar}>
            {pillar}
            {index < pillars.length - 1 && (
              <span className="mx-5 text-gray-300">|</span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

