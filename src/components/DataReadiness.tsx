'use client';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Database, BarChart3, FileText, Shield, Globe, Clock } from 'lucide-react';

const DATA_TYPES = [
  'Personal Identifiable Information (PII)',
  'Sensitive Personal Data (race, religion, politics)',
  'Financial Records',
  'Health/Medical Records',
  'Biometric Data',
  'Location/GPS Data',
  'Behavioral Data',
  'Communications (emails, messages)',
  'Images/Video of People',
  'Voice Recordings',
  'Genetic Data',
  "Children's Data (under 16)",
  'Criminal Records',
  'Employment Records',
  'Educational Records',
  'Publicly Available Data',
  'Proprietary Business Data',
  'Trade Secrets',
  'Third-party Data',
];

const DATA_VOLUME_OPTIONS = [
  '< 1 GB',
  '1 GB - 100 GB',
  '100 GB - 1 TB',
  '1 TB - 10 TB',
  '10 TB - 100 TB',
  '> 100 TB',
];

const GROWTH_RATE_OPTIONS = [
  '< 10%',
  '10-50%',
  '50-100%',
  '100-500%',
  '> 500%',
];

const NUM_RECORDS_OPTIONS = [
  '< 10,000',
  '10,000 - 100,000',
  '100,000 - 1 million',
  '1 million - 10 million',
  '10 million - 100 million',
  '> 100 million',
];

const PRIMARY_DATA_SOURCES = [
  'Internal Databases',
  'Customer Input Forms',
  'IoT Devices/Sensors',
  'Mobile Applications',
  'Web Applications',
  'Third-party APIs',
  'Public Datasets',
  'Social Media',
  'Partner Organizations',
  'Government Databases',
  'Purchased Data',
  'Web Scraping',
  'Manual Entry',
  'Legacy Systems',
  'Cloud Storage',
  'Edge Devices',
];

const FRESHNESS_OPTIONS = [
  'Real-time (< 1 second)',
  'Near real-time (1-60 seconds)',
  'Micro-batch (1-5 minutes)',
  'Batch (hourly)',
  'Daily',
  'Weekly or less frequent',
];

const RETENTION_OPTIONS = [
  '< 30 days',
  '30 days - 1 year',
  '1-3 years',
  '3-7 years',
  '7+ years',
  'Indefinite',
  'Varies by data type',
];

// Controlled component props
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

type Props = {
  value: DataReadinessValue;
  onChange: (data: DataReadinessValue) => void;
};

export default function DataReadiness({ value, onChange }: Props) {
  // Multi-select checkbox handler
  function handleMultiSelect(field: keyof DataReadinessValue, option: string) {
    const arr = value[field] as string[];
    if (arr.includes(option)) {
      onChange({ ...value, [field]: arr.filter((x) => x !== option) });
    } else {
      onChange({ ...value, [field]: [...arr, option] });
    }
  }

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md border-l-4 border-cyan-400 dark:border-cyan-300">
        <div className="font-semibold text-cyan-800 dark:text-cyan-200 text-lg mb-1">Data Readiness Assessment</div>
        <div className="text-cyan-700 dark:text-cyan-300">Comprehensive data characteristics, quality, and governance inputs.</div>
      </div>

      {/* Data Classification Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Data Classification</h3>
              <p className="text-sm text-muted-foreground">Identify the types of data that will be used in your AI system</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATA_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
              <Checkbox
                checked={value.dataTypes.includes(type)}
                onCheckedChange={(checked) => handleMultiSelect('dataTypes', type)}
              />
              <span className="text-sm text-foreground">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Volume & Scale Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Data Volume & Scale</h3>
              <p className="text-sm text-muted-foreground">Define the current and expected data volume characteristics</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Volume</Label>
            <RadioGroup value={value.dataVolume} onValueChange={(newValue) => onChange({ ...value, dataVolume: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DATA_VOLUME_OPTIONS.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Growth Rate</Label>
            <RadioGroup value={value.growthRate} onValueChange={(newValue) => onChange({ ...value, growthRate: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {GROWTH_RATE_OPTIONS.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Number of Records</Label>
            <RadioGroup value={value.numRecords} onValueChange={(newValue) => onChange({ ...value, numRecords: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {NUM_RECORDS_OPTIONS.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Data Sources</h3>
              <p className="text-sm text-muted-foreground">Identify where your data will be sourced from</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRIMARY_DATA_SOURCES.map((src) => (
            <label key={src} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
              <Checkbox
                checked={value.primarySources.includes(src)}
                onCheckedChange={(checked) => handleMultiSelect('primarySources', src)}
              />
              <span className="text-sm text-foreground">{src}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Quality & Governance Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Data Quality & Governance</h3>
              <p className="text-sm text-muted-foreground">Assess data quality metrics and freshness requirements</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Quality Score</Label>
            <div className="flex items-center w-full">
              <span className="text-muted-foreground text-sm mr-4">Poor</span>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[value.dataQualityScore]}
                onValueChange={([val]) => onChange({ ...value, dataQualityScore: val })}
                className="w-full"
              />
              <span className="text-muted-foreground text-sm ml-4">Excellent</span>
              <span className="ml-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">{value.dataQualityScore}</span>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Completeness</Label>
            <div className="flex items-center w-full">
              <span className="text-muted-foreground text-sm mr-4">0%</span>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[value.dataCompleteness]}
                onValueChange={([val]) => onChange({ ...value, dataCompleteness: val })}
                className="w-full"
              />
              <span className="text-muted-foreground text-sm ml-4">100%</span>
              <span className="ml-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">{value.dataCompleteness}%</span>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Accuracy Confidence</Label>
            <div className="flex items-center w-full">
              <span className="text-muted-foreground text-sm mr-4">0%</span>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[value.dataAccuracyConfidence]}
                onValueChange={([val]) => onChange({ ...value, dataAccuracyConfidence: val })}
                className="w-full"
              />
              <span className="text-muted-foreground text-sm ml-4">100%</span>
              <span className="ml-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">{value.dataAccuracyConfidence}%</span>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Freshness</Label>
            <RadioGroup value={value.dataFreshness} onValueChange={(newValue) => onChange({ ...value, dataFreshness: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FRESHNESS_OPTIONS.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Geographic & Jurisdictional Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Geographic & Jurisdictional</h3>
              <p className="text-sm text-muted-foreground">Define data subject locations, storage, processing, and cross-border requirements</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Subject Locations</Label>
            <RadioGroup value={value.dataSubjectLocations} onValueChange={(newValue) => onChange({ ...value, dataSubjectLocations: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIMARY_DATA_SOURCES.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Storage Locations</Label>
            <RadioGroup value={value.dataStorageLocations} onValueChange={(newValue) => onChange({ ...value, dataStorageLocations: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIMARY_DATA_SOURCES.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Processing Locations</Label>
            <RadioGroup value={value.dataProcessingLocations} onValueChange={(newValue) => onChange({ ...value, dataProcessingLocations: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIMARY_DATA_SOURCES.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Cross-Border Data Transfer</Label>
            <div className="flex items-center gap-2 p-2 border border-border rounded hover:bg-accent">
              <Checkbox
                checked={value.crossBorderTransfer}
                onCheckedChange={(checked) => onChange({ ...value, crossBorderTransfer: !!checked })}
              />
              <span className="text-sm text-foreground">Data will be transferred across international borders</span>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Data Localization Requirements</Label>
            <RadioGroup value={value.dataLocalization} onValueChange={(newValue) => onChange({ ...value, dataLocalization: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIMARY_DATA_SOURCES.map((option) => (
                <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span className="text-sm text-foreground">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Data Lifecycle Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Data Lifecycle</h3>
              <p className="text-sm text-muted-foreground">Define data retention and lifecycle management requirements</p>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="block font-medium mb-4 text-foreground">Data Retention Period</Label>
          <RadioGroup value={value.dataRetention} onValueChange={(newValue) => onChange({ ...value, dataRetention: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RETENTION_OPTIONS.map((option) => (
              <Label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                <RadioGroupItem value={option} />
                <span className="text-sm text-foreground">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
