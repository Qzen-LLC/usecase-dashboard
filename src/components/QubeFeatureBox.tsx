import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QubeFeatureBoxProps {
  // Icon prop retained for API compatibility but not rendered
  icon?: LucideIcon;
  title: string;
  description: string;
}

export function QubeFeatureBox({ icon: _icon, title, description }: QubeFeatureBoxProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

