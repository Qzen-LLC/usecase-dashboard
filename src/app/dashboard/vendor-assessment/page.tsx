'use client';

import React from 'react';
import VendorAssessment from '@/components/VendorAssessment';

export default function VendorAssessmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VendorAssessment user={{ id: 'user-1', name: 'Current User' }} />
      </div>
    </div>
  );
}