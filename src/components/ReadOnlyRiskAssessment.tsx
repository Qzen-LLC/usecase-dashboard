import React from 'react';
import RiskAssessment from './RiskAssessment';

interface ReadOnlyRiskAssessmentProps {
  data: any;
}

const ReadOnlyRiskAssessment: React.FC<ReadOnlyRiskAssessmentProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <RiskAssessment
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyRiskAssessment; 