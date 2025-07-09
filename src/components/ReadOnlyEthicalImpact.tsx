import React from 'react';
import EthicalImpact from './EthicalImpact';

type EthicalImpactValue = {
  biasFairness: {
    historicalBias: boolean;
    demographicGaps: boolean;
    geographicBias: boolean;
    selectionBias: boolean;
    confirmationBias: boolean;
    temporalBias: boolean;
  };
  privacySecurity: {
    dataMinimization: boolean;
    consentManagement: boolean;
    dataAnonymization: boolean;
  };
  decisionMaking: {
    automationLevel: string;
    decisionTypes: string[];
  };
  modelCharacteristics: {
    explainabilityLevel: string;
    biasTesting: string;
  };
  aiGovernance: {
    humanOversightLevel: string;
    performanceMonitoring: string[];
  };
  ethicalConsiderations: {
    potentialHarmAreas: string[];
    vulnerablePopulations: string[];
  };
};

interface ReadOnlyEthicalImpactProps {
  data: EthicalImpactValue;
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