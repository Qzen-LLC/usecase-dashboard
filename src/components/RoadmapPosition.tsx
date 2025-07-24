'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const PROJECT_STAGES = [
  "Ideation/Planning",
  "Proof of Concept",
  "Pilot/Testing",
  "Production Rollout",
  "Operational/Mature",
];
const TIMELINE_CONSTRAINTS = [
  "No Specific Timeline",
  "3-6 months",
  "6-12 months",
  "12-24 months",
  "> 24 months",
];

type Props = {
  value: {
    priority: string;
    projectStage: string;
    timelineConstraints: string[];
    timeline: string;
    dependencies: {
      dataPlatform: boolean;
      security: boolean;
      hiring: boolean;
    };
    metrics: string;
  };
  onChange: (data: Props['value']) => void;
};

export default function RoadmapPosition({ value, onChange }: Props) {
  const lastSent = React.useRef<Props['value'] | null>(null);

  React.useEffect(() => {
    const currentData = {
      priority: value.priority,
      projectStage: value.projectStage,
      timelineConstraints: value.timelineConstraints,
      timeline: value.timeline,
      dependencies: value.dependencies,
      metrics: value.metrics,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [value.priority, value.projectStage, value.timelineConstraints, value.timeline, value.dependencies, value.metrics, onChange]);

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] border-l-4 border-indigo-400 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-indigo-800 text-lg mb-1">Roadmap Position</div>
        <div className="text-indigo-700">Define timeline, dependencies, and strategic positioning in the AI roadmap.</div>
      </div>

      {/* Strategic Positioning Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Strategic Positioning</h3>
          <p className="text-sm text-gray-600">Define priority level and current project stage</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="block font-medium mb-3">Priority Level</Label>
            <Select value={value.priority} onValueChange={(newValue) => onChange({ ...value, priority: newValue })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Strategic imperative</SelectItem>
                <SelectItem value="medium">Medium - Important but not urgent</SelectItem>
                <SelectItem value="low">Low - Nice to have</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block font-medium mb-3">Project Stage</Label>
            <RadioGroup value={value.projectStage} onValueChange={(newValue) => onChange({ ...value, projectStage: newValue })} className="space-y-2">
              {PROJECT_STAGES.map((stage) => (
                <div key={stage} className="flex items-center hover:bg-gray-50 p-2 rounded">
                  <RadioGroupItem value={stage} id={`stage-${stage}`} className="mr-2" />
                  <Label htmlFor={`stage-${stage}`} className="text-sm cursor-pointer">{stage}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
      
      {/* Timeline Planning Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Timeline Planning</h3>
          <p className="text-sm text-gray-600">Set constraints and recommended implementation timeline</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="block font-medium mb-3">Timeline Constraints</Label>
            <div className="grid grid-cols-1 gap-2">
              {TIMELINE_CONSTRAINTS.map((constraint) => (
                <label key={constraint} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                  <Checkbox checked={value.timelineConstraints.includes(constraint)} onCheckedChange={() => onChange({ ...value, timelineConstraints: value.timelineConstraints.includes(constraint) ? value.timelineConstraints.filter(c => c !== constraint) : [...value.timelineConstraints, constraint] })} />
                  <span className="text-sm">{constraint}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-3">Recommended Timeline</Label>
            <RadioGroup value={value.timeline} onValueChange={(newValue) => onChange({ ...value, timeline: newValue })} className="space-y-2">
              <div className="flex items-center hover:bg-gray-50 p-2 rounded">
                <RadioGroupItem value="q1" id="q1" className="mr-2" />
                <Label htmlFor="q1" className="text-sm cursor-pointer">Q1 2025 - Immediate start</Label>
              </div>
              <div className="flex items-center hover:bg-gray-50 p-2 rounded">
                <RadioGroupItem value="q2" id="q2" className="mr-2" />
                <Label htmlFor="q2" className="text-sm cursor-pointer">Q2 2025 - After infrastructure setup</Label>
              </div>
              <div className="flex items-center hover:bg-gray-50 p-2 rounded">
                <RadioGroupItem value="q3" id="q3" className="mr-2" />
                <Label htmlFor="q3" className="text-sm cursor-pointer">Q3 2025 - Phase 2 implementation</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
      
      {/* Dependencies & Success Metrics Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Dependencies & Success Metrics</h3>
          <p className="text-sm text-gray-600">Define project dependencies and key performance indicators</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="block font-medium mb-3">Dependencies</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.dependencies.dataPlatform} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, dataPlatform: !!newValue } })} />
                <span className="text-sm">Data platform upgrade</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.dependencies.security} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, security: !!newValue } })} />
                <span className="text-sm">Security framework implementation</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.dependencies.hiring} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, hiring: !!newValue } })} />
                <span className="text-sm">Team hiring and training</span>
              </label>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-3">Success Metrics</Label>
            <Textarea
              value={value.metrics}
              onChange={(e) => onChange({ ...value, metrics: e.target.value })}
              // placeholder="Define key performance indicators..."
              className="w-full min-w-0 min-h-[120px]"
              style={{ maxWidth: '100vw' }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Recommendation Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-2">Roadmap Recommendation</div>
            <div className="text-blue-800 text-sm leading-relaxed">Based on your selections, we recommend starting after infrastructure setup and prioritizing data platform upgrades for maximum impact.</div>
          </div>
        </div>
      </div>
    </div>
  );
}