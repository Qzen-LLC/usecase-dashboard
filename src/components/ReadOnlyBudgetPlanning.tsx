import React from 'react';
import BudgetPlanning from './BudgetPlanning';

interface BudgetPlanningProps {
  value: {
    initialDevCost: number;
    baseApiCost: number;
    baseInfraCost: number;
    baseOpCost: number;
    baseMonthlyValue: number;
    valueGrowthRate: number;
    budgetRange: string;
    error?: string;
    loading?: boolean;
  };
  onChange: (data: BudgetPlanningProps['value']) => void;
}

interface ReadOnlyBudgetPlanningProps {
  data: BudgetPlanningProps['value'];
}

const ReadOnlyBudgetPlanning: React.FC<ReadOnlyBudgetPlanningProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <BudgetPlanning
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyBudgetPlanning; 