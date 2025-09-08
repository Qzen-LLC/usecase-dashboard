import React from 'react';
import TechnicalFeasibility from './TechnicalFeasibility';
import { ensureCompatibility } from '@/lib/assessment/field-mapper';

interface ReadOnlyTechnicalFeasibilityProps {
  data: any; // Accept any format for backward compatibility
}

const ReadOnlyTechnicalFeasibility: React.FC<ReadOnlyTechnicalFeasibilityProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  // Ensure the data is in UI format for display
  const compatibleData = ensureCompatibility({ technicalFeasibility: data }).technicalFeasibility || data;

  return (
    <div className="read-only-mode">
      <TechnicalFeasibility
        value={compatibleData}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyTechnicalFeasibility; 