import React from 'react';
import BusinessFeasibility from './BusinessFeasibility';

type BusinessFeasibilityProps = {
  value: {
    strategicAlignment: number;
    marketOpportunity: string;
    stakeholder: {
      exec: boolean;
      endUser: boolean;
      it: boolean;
    };
    annualSavings: string;
    efficiencyGain: number;
    paybackPeriod: number;
    availabilityRequirement: string;
    responseTimeRequirement: string;
    concurrentUsers: string;
    revenueImpactType: string;
    estimatedFinancialImpact: string;
    userCategories: string[];
    systemCriticality: string;
    failureImpact: string;
    executiveSponsorLevel: string;
    stakeholderGroups: string[];
  };
  onChange: (data: BusinessFeasibilityProps['value']) => void;
};

interface ReadOnlyBusinessFeasibilityProps {
  data: BusinessFeasibilityProps['value'];
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