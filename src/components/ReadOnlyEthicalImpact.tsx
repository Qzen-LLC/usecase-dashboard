import React from 'react';
import EthicalImpact from './EthicalImpact';

interface ReadOnlyEthicalImpactProps {
  data: any;
}

const ReadOnlyEthicalImpact: React.FC<ReadOnlyEthicalImpactProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <EthicalImpact
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyEthicalImpact; 