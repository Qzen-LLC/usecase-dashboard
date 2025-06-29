import React from 'react';
import BusinessFeasibility from './BusinessFeasibility';

interface ReadOnlyBusinessFeasibilityProps {
  data: any;
}

const ReadOnlyBusinessFeasibility: React.FC<ReadOnlyBusinessFeasibilityProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <BusinessFeasibility
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyBusinessFeasibility; 