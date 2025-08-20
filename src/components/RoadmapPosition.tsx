'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Target, Calendar, Link } from "lucide-react";

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
const PRIORITY_LEVELS = ["high", "medium", "low"];
const TIMELINE_OPTIONS = ["Q1 2025 - Immediate start", "Q2 2025 - After infrastructure setup", "Q3 2025 - Phase 2 implementation"];

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

  const handleMultiSelectChange = (key: string, value: string) => {
    const currentValue = value as any;
    if (key === 'timelineConstraints') {
      const newConstraints = currentValue.timelineConstraints.includes(value) 
        ? currentValue.timelineConstraints.filter((c: string) => c !== value)
        : [...currentValue.timelineConstraints, value];
      
      onChange({
        ...currentValue,
        timelineConstraints: newConstraints,
      });
    }
  };

  const handleDependencyChange = (key: string, checked: boolean) => {
    onChange({
      ...value,
      dependencies: {
        ...value.dependencies,
        [key]: checked,
      },
    });
  };

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-l-4 border-indigo-400 dark:border-indigo-300 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-indigo-800 dark:text-indigo-200 text-lg mb-1">Roadmap Position</div>
        <div className="text-indigo-700 dark:text-indigo-300">Define timeline, dependencies, and strategic positioning in the AI roadmap.</div>
      </div>

      {/* Strategic Positioning Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Strategic Positioning</h3>
              <p className="text-sm text-muted-foreground">Define priority level and current project stage</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Project Priority</Label>
            <RadioGroup value={value.priority} onValueChange={(newValue) => onChange({ ...value, priority: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIORITY_LEVELS.map((priority) => (
                <Label key={priority} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={priority} />
                  <span className="text-sm text-foreground capitalize">{priority}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Current Project Stage</Label>
            <RadioGroup value={value.projectStage} onValueChange={(newValue) => onChange({ ...value, projectStage: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROJECT_STAGES.map((stage) => (
                <div key={stage} className="flex items-center hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={stage} id={`stage-${stage}`} />
                  <Label htmlFor={`stage-${stage}`} className="text-sm text-foreground cursor-pointer">{stage}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Timeline Planning Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Timeline Planning</h3>
              <p className="text-sm text-muted-foreground">Set constraints and recommended implementation timeline</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Timeline Constraints</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TIMELINE_CONSTRAINTS.map((constraint) => (
                <label key={constraint} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <Checkbox
                    checked={value.timelineConstraints.includes(constraint)}
                    onCheckedChange={(checked) => handleMultiSelectChange('timelineConstraints', constraint)}
                  />
                  <span className="text-sm text-foreground">{constraint}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Recommended Timeline</Label>
            <RadioGroup value={value.timeline} onValueChange={(newValue) => onChange({ ...value, timeline: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TIMELINE_OPTIONS.map((timeline) => (
                <div key={timeline} className="flex items-center hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={timeline} id={`timeline-${timeline}`} />
                  <Label htmlFor={`timeline-${timeline}`} className="text-sm text-foreground cursor-pointer">{timeline}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Dependencies & Success Metrics Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Dependencies & Success Metrics</h3>
              <p className="text-sm text-muted-foreground">Define project dependencies and key performance indicators</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Project Dependencies</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                <Checkbox
                  checked={value.dependencies.dataPlatform}
                  onCheckedChange={(checked) => handleDependencyChange('dataPlatform', !!checked)}
                />
                <span className="text-sm text-foreground">Data Platform Ready</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                <Checkbox
                  checked={value.dependencies.security}
                  onCheckedChange={(checked) => handleDependencyChange('security', !!checked)}
                />
                <span className="text-sm text-foreground">Security Framework</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                <Checkbox
                  checked={value.dependencies.hiring}
                  onCheckedChange={(checked) => handleDependencyChange('hiring', !!checked)}
                />
                <span className="text-sm text-foreground">Team Hiring</span>
              </label>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Success Metrics</Label>
            <Textarea
              placeholder="Define key performance indicators and success criteria for your AI project..."
              value={value.metrics}
              onChange={(e) => onChange({ ...value, metrics: e.target.value })}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Roadmap Recommendation Section
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Roadmap Recommendation</div>
        <div className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">Based on your selections, we recommend starting after infrastructure setup and prioritizing data platform upgrades for maximum impact.</div>
          </div>
        </div>
      </div> */}
    </div>
  );
}