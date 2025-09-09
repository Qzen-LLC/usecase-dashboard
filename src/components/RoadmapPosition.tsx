'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Target, Calendar, Link, TrendingUp } from "lucide-react";

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
const TIMELINE_OPTIONS = ["Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"];

// Gen AI Specific Constants
const AI_MATURITY_LEVELS = [
  "No AI/Traditional Systems",
  "Rule-based Automation",
  "Basic ML Models",
  "Advanced ML",
  "Basic Gen AI",
  "Advanced Gen AI",
  "Agentic AI",
];

const EVOLUTION_PATHS = [
  "Increase Autonomy Gradually",
  "Expand Tool Access",
  "Add Multi-agent Coordination",
  "Enhance Memory Systems",
  "Improve Reasoning Capabilities",
  "Add Human-in-the-loop Features",
  "Implement Continuous Learning",
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
    // Gen AI specific fields
    currentAIMaturity?: string;
    targetAIMaturity?: string;
    evolutionPath?: string[];
  };
  onChange: (data: Props['value']) => void;
};

export default function RoadmapPosition({ value, onChange }: Props) {
  const lastSent = React.useRef<Props['value'] | null>(null);

  // Debug logging to see what data is being received
  React.useEffect(() => {
    console.log('🛣️ [ROADMAP] Component received value:', {
      priority: value.priority,
      projectStage: value.projectStage,
      timelineConstraints: value.timelineConstraints,
      timeline: value.timeline,
      dependencies: value.dependencies,
      metrics: value.metrics,
      currentAIMaturity: value.currentAIMaturity,
      targetAIMaturity: value.targetAIMaturity,
      evolutionPath: value.evolutionPath,
    });
  }, [value]);

  React.useEffect(() => {
    const currentData = {
      priority: value.priority,
      projectStage: value.projectStage,
      timelineConstraints: value.timelineConstraints,
      timeline: value.timeline,
      dependencies: value.dependencies,
      metrics: value.metrics,
      // Include Gen AI specific fields
      currentAIMaturity: value.currentAIMaturity,
      targetAIMaturity: value.targetAIMaturity,
      evolutionPath: value.evolutionPath,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [value.priority, value.projectStage, value.timelineConstraints, value.timeline, value.dependencies, value.metrics, value.currentAIMaturity, value.targetAIMaturity, value.evolutionPath, onChange]);

  const handleMultiSelectChange = (key: string, itemValue: string) => {
    if (key === 'timelineConstraints') {
      const currentConstraints = value.timelineConstraints || [];
      const newConstraints = currentConstraints.includes(itemValue) 
        ? currentConstraints.filter((c: string) => c !== itemValue)
        : [...currentConstraints, itemValue];
      
      onChange({
        ...value,
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
                    checked={value.timelineConstraints?.includes(constraint) || false}
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

      {/* AI Maturity Progression Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">AI Maturity Progression</h3>
              <p className="text-sm text-muted-foreground">Define your current and target AI maturity levels</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Current AI Maturity</Label>
            <RadioGroup 
              value={value.currentAIMaturity || ''} 
              onValueChange={(newValue) => onChange({ ...value, currentAIMaturity: newValue })} 
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {AI_MATURITY_LEVELS.map((level) => (
                <Label key={level} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={level} />
                  <span className="text-sm text-foreground">{level}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="block font-medium mb-4 text-foreground">Target AI Maturity</Label>
            <RadioGroup 
              value={value.targetAIMaturity || ''} 
              onValueChange={(newValue) => onChange({ ...value, targetAIMaturity: newValue })} 
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {AI_MATURITY_LEVELS.map((level) => (
                <Label key={level} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={level} />
                  <span className="text-sm text-foreground">{level}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="block font-medium mb-4 text-foreground">Evolution Path</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EVOLUTION_PATHS.map((path) => (
                <label key={path} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <Checkbox
                    checked={value.evolutionPath?.includes(path) || false}
                    onCheckedChange={(checked) => {
                      const currentPath = value.evolutionPath || [];
                      const newPath = checked 
                        ? [...currentPath, path]
                        : currentPath.filter(p => p !== path);
                      onChange({ ...value, evolutionPath: newPath });
                    }}
                  />
                  <span className="text-sm text-foreground">{path}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Removed Roadmap Recommendation block */}
    </div>
  );
}