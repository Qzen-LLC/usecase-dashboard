import React from 'react';
import RoadmapPosition from './RoadmapPosition';

interface ReadOnlyRoadmapPositionProps {
  data: any;
}

const ReadOnlyRoadmapPosition: React.FC<ReadOnlyRoadmapPositionProps> = ({ data }) => {
  // Create a no-op onChange function that does nothing
  const noOpOnChange = () => {
    // This function does nothing - prevents any changes
  };

  return (
    <div className="read-only-mode">
      <RoadmapPosition
        value={data}
        onChange={noOpOnChange}
      />
    </div>
  );
};

export default ReadOnlyRoadmapPosition; 