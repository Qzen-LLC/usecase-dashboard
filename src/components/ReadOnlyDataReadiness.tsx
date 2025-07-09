import React from 'react';
import DataReadiness from './DataReadiness';

type DataReadinessValue = {
  dataTypes: string[];
  dataVolume: string;
  growthRate: string;
  numRecords: string;
  primarySources: string[];
  dataQualityScore: number;
  dataCompleteness: number;
  dataAccuracyConfidence: number;
  dataFreshness: string;
  dataSubjectLocations: string;
  dataStorageLocations: string;
  dataProcessingLocations: string;
  crossBorderTransfer: boolean;
  dataLocalization: string;
  dataRetention: string;
};

interface ReadOnlyDataReadinessProps {
  data: DataReadinessValue;
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