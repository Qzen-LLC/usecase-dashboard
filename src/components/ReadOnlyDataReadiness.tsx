import React from 'react';
import DataReadiness from './DataReadiness';

interface ReadOnlyDataReadinessProps {
  data: any;
}

const ReadOnlyDataReadiness: React.FC<ReadOnlyDataReadinessProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <DataReadiness
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyDataReadiness; 