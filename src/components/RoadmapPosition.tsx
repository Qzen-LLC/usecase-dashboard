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
  const lastSent = React.useRef<any>(null);

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
    <div className="space-y-6">
      <Card className="bg-indigo-50">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Roadmap Position</h3>
          <p className="text-indigo-700">Define timeline, dependencies, and strategic positioning in the AI roadmap.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="mb-2">Priority Level</Label>
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
            <Label className="mb-2">Project Stage</Label>
            <RadioGroup value={value.projectStage} onValueChange={(newValue) => onChange({ ...value, projectStage: newValue })} className="space-y-2 mb-4">
              {PROJECT_STAGES.map((stage) => (
                <div key={stage} className="flex items-center">
                  <RadioGroupItem value={stage} id={`stage-${stage}`} className="mr-2" />
                  <Label htmlFor={`stage-${stage}`} className="text-sm">{stage}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2">Timeline Constraints</Label>
            <div className="flex flex-col gap-2 mb-4">
              {TIMELINE_CONSTRAINTS.map((constraint) => (
                <label key={constraint} className="flex items-center gap-2">
                  <Checkbox checked={value.timelineConstraints.includes(constraint)} onCheckedChange={() => onChange({ ...value, timelineConstraints: value.timelineConstraints.includes(constraint) ? value.timelineConstraints.filter(c => c !== constraint) : [...value.timelineConstraints, constraint] })} />
                  <span className="text-sm">{constraint}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2">Recommended Timeline</Label>
            <RadioGroup value={value.timeline} onValueChange={(newValue) => onChange({ ...value, timeline: newValue })} className="space-y-2">
              <div className="flex items-center">
                <RadioGroupItem value="q1" id="q1" className="mr-2" />
                <Label htmlFor="q1" className="text-sm">Q1 2025 - Immediate start</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="q2" id="q2" className="mr-2" />
                <Label htmlFor="q2" className="text-sm">Q2 2025 - After infrastructure setup</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="q3" id="q3" className="mr-2" />
                <Label htmlFor="q3" className="text-sm">Q3 2025 - Phase 2 implementation</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2">Dependencies</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={value.dependencies.dataPlatform} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, dataPlatform: !!newValue } })} />
                <span className="text-sm">Data platform upgrade</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={value.dependencies.security} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, security: !!newValue } })} />
                <span className="text-sm">Security framework implementation</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={value.dependencies.hiring} onCheckedChange={(newValue) => onChange({ ...value, dependencies: { ...value.dependencies, hiring: !!newValue } })} />
                <span className="text-sm">Team hiring and training</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2">Success Metrics</Label>
            <Textarea
              value={value.metrics}
              onChange={(e) => onChange({ ...value, metrics: e.target.value })}
              placeholder="Define key performance indicators..."
              className="w-full min-w-0"
              style={{ maxWidth: '100vw' }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Recommendation */}
      <Card className="bg-gray-50 mt-6">
        <CardContent className="p-4">
          <div className="font-semibold text-gray-800 mb-2">Roadmap Recommendation</div>
          <div className="text-gray-700 text-sm">Based on your selections, we recommend starting after infrastructure setup and prioritizing data platform upgrades for maximum impact.</div>
        </CardContent>
      </Card>
    </div>
  );
}