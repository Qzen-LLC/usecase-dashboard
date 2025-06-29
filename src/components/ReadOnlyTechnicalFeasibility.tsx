import React from 'react';
import TechnicalFeasibility from './TechnicalFeasibility';

interface ReadOnlyTechnicalFeasibilityProps {
  data: any;
}

const ReadOnlyTechnicalFeasibility: React.FC<ReadOnlyTechnicalFeasibilityProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <TechnicalFeasibility
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyTechnicalFeasibility; 