'use client';

import VendorAssessment from '@/components/VendorAssessment';
import { useUserData } from '@/contexts/UserContext';

export default function VendorAssessmentPage() {
  const { userData } = useUserData();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VendorAssessment user={{ 
          id: userData?.id || 'user-1', 
          name: userData ? `${userData.firstName} ${userData.lastName}` : 'Current User' 
        }} />
      </div>
    </div>
  );
}