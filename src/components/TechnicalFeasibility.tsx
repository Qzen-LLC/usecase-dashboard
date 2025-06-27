import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function TechnicalFeasibility() {
  const [dataAvailability, setDataAvailability] = useState("excellent");
  const [technicalComplexity, setTechnicalComplexity] = useState(2);
  const [infraReadiness, setInfraReadiness] = useState({
    cloud: true,
    mlPlatform: false,
    dataPipeline: false,
  });
  const [teamExpertise, setTeamExpertise] = useState({
    dataScience: true,
    mlEngineering: true,
  });
  const [integrationReqs, setIntegrationReqs] = useState("");

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="font-semibold text-blue-800 text-lg mb-1">Technical Feasibility Assessment</div>
        <div className="text-blue-700">Evaluate the technical requirements and constraints for implementing this AI solution.</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Data Availability</label>
          <Select value={dataAvailability} onValueChange={setDataAvailability}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select data availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - Rich, clean datasets available</SelectItem>
              <SelectItem value="good">Good - Some cleaning required</SelectItem>
              <SelectItem value="limited">Limited - Data gaps exist</SelectItem>
              <SelectItem value="poor">Poor - Data not available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block font-medium mb-1">Technical Complexity</label>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Simple</span>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[technicalComplexity]}
              onValueChange={([val]) => setTechnicalComplexity(val)}
              className="w-full"
            />
            <span className="text-gray-500 text-sm">Complex</span>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Infrastructure Readiness</label>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <Checkbox checked={infraReadiness.cloud} onCheckedChange={val => setInfraReadiness(r => ({ ...r, cloud: !!val }))} />
              <span>Cloud infrastructure available</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox checked={infraReadiness.mlPlatform} onCheckedChange={val => setInfraReadiness(r => ({ ...r, mlPlatform: !!val }))} />
              <span>ML/AI platform in place</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox checked={infraReadiness.dataPipeline} onCheckedChange={val => setInfraReadiness(r => ({ ...r, dataPipeline: !!val }))} />
              <span>Data pipeline capabilities</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Team Expertise</label>
          <div className="flex items-center space-x-8">
            <label className="flex items-center space-x-2">
              <Checkbox checked={teamExpertise.dataScience} onCheckedChange={val => setTeamExpertise(r => ({ ...r, dataScience: !!val }))} />
              <span>Data Science</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox checked={teamExpertise.mlEngineering} onCheckedChange={val => setTeamExpertise(r => ({ ...r, mlEngineering: !!val }))} />
              <span>ML Engineering</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Integration Requirements</label>
          <Textarea
            value={integrationReqs}
            onChange={e => setIntegrationReqs(e.target.value)}
            placeholder="Describe integration requirements with existing systems..."
            className="w-full"
          />
        </div>

        {/* AI-Powered Recommendations */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6 w-full">
          <div className="font-semibold text-gray-800 mb-2">AI-Powered Recommendations</div>
          <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Consider using pre-trained models to reduce complexity</li>
            <li>Implement incremental data collection strategy</li>
            <li>Plan for 3-month technical proof-of-concept phase</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 