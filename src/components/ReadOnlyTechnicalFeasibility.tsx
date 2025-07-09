import React from 'react';
import TechnicalFeasibility from './TechnicalFeasibility';

interface ReadOnlyTechnicalFeasibilityProps {
  data: {
    modelTypes: string[];
    modelSizes: string[];
    deploymentModels: string[];
    cloudProviders: string[];
    computeRequirements: string[];
    integrationPoints: string[];
    apiSpecs: string[];
    authMethods: string[];
    encryptionStandards: string[];
    technicalComplexity: number;
    outputTypes: string[];
    confidenceScore: string;
    modelUpdateFrequency: string;
  };
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