'use client';

import React from 'react';
import VendorAssessment from '@/components/VendorAssessment';

export default function VendorAssessmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Vendor Assessment</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive assessment tool for evaluating AI vendors across strategic, technical, and operational dimensions.
          </p>
        </div>
        <VendorAssessment user={{ id: 'user-1', name: 'Current User' }} />
      </div>
    </div>
  );
}