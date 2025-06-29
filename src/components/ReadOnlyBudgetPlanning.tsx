import React from 'react';
import BudgetPlanning from './BudgetPlanning';

interface ReadOnlyBudgetPlanningProps {
  data: any;
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