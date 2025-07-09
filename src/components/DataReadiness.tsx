'use client';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md border-l-4 border-cyan-400">
        <div className="font-semibold text-cyan-800 text-lg mb-1">Data Readiness Assessment</div>
        <div className="text-cyan-700">Comprehensive data characteristics, quality, and governance inputs.</div>
      </div>

      {/* Data Classification Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Classification</h3>
          <p className="text-sm text-gray-600">Identify the types of data that will be used in your AI system</p>
        </div>
        
        <div>
          <label className="block font-medium mb-4">Data Types (multi-select)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DATA_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.dataTypes.includes(type)} onCheckedChange={() => handleMultiSelect('dataTypes', type)} />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Data Volume & Scale Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Volume & Scale</h3>
          <p className="text-sm text-gray-600">Define the current and expected data volume characteristics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-3">Current Data Volume</label>
            <Select value={value.dataVolume} onValueChange={(v) => onChange({ ...value, dataVolume: v })}>
              <SelectTrigger><SelectValue placeholder="Select volume" /></SelectTrigger>
              <SelectContent>
                {DATA_VOLUME_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-3">Expected Growth Rate (Annual)</label>
            <Select value={value.growthRate} onValueChange={(v) => onChange({ ...value, growthRate: v })}>
              <SelectTrigger><SelectValue placeholder="Select growth" /></SelectTrigger>
              <SelectContent>
                {GROWTH_RATE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-3">Number of Records</label>
            <Select value={value.numRecords} onValueChange={(v) => onChange({ ...value, numRecords: v })}>
              <SelectTrigger><SelectValue placeholder="Select records" /></SelectTrigger>
              <SelectContent>
                {NUM_RECORDS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Sources</h3>
          <p className="text-sm text-gray-600">Identify where your data will be sourced from</p>
        </div>
        
        <div>
          <label className="block font-medium mb-4">Primary Data Sources (multi-select)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRIMARY_DATA_SOURCES.map((src) => (
              <label key={src} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.primarySources.includes(src)} onCheckedChange={() => handleMultiSelect('primarySources', src)} />
                <span className="text-sm">{src}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Data Quality & Governance Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Quality & Governance</h3>
          <p className="text-sm text-gray-600">Assess data quality metrics and freshness requirements</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-medium mb-3">Data Quality Score</label>
              <Slider value={[value.dataQualityScore]} min={1} max={10} step={1} onValueChange={([v]) => onChange({ ...value, dataQualityScore: v })} className="mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor (1)</span>
                <span className="font-semibold text-blue-600">{value.dataQualityScore}/10</span>
                <span>Excellent (10)</span>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-3">Data Completeness (%)</label>
              <Input type="number" min={0} max={100} value={value.dataCompleteness} onChange={e => onChange({ ...value, dataCompleteness: Number(e.target.value) })} placeholder="0-100" />
            </div>
            <div>
              <label className="block font-medium mb-3">Data Accuracy Confidence (%)</label>
              <Input type="number" min={0} max={100} value={value.dataAccuracyConfidence} onChange={e => onChange({ ...value, dataAccuracyConfidence: Number(e.target.value) })} placeholder="0-100" />
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-3">Data Freshness Requirement</label>
            <Select value={value.dataFreshness} onValueChange={v => onChange({ ...value, dataFreshness: v })}>
              <SelectTrigger><SelectValue placeholder="Select freshness" /></SelectTrigger>
              <SelectContent>
                {FRESHNESS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Geographic & Jurisdictional Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Geographic & Jurisdictional</h3>
          <p className="text-sm text-gray-600">Define data subject locations, storage, processing, and cross-border requirements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-3">Data Subject Locations (countries/regions)</label>
            <Input value={value.dataSubjectLocations} onChange={e => onChange({ ...value, dataSubjectLocations: e.target.value })} placeholder="e.g. US, EU, India" />
          </div>
          <div>
            <label className="block font-medium mb-3">Data Storage Locations</label>
            <Input value={value.dataStorageLocations} onChange={e => onChange({ ...value, dataStorageLocations: e.target.value })} placeholder="e.g. AWS eu-west-1, on-premise" />
          </div>
          <div>
            <label className="block font-medium mb-3">Data Processing Locations</label>
            <Input value={value.dataProcessingLocations} onChange={e => onChange({ ...value, dataProcessingLocations: e.target.value })} placeholder="e.g. US, Singapore" />
          </div>
          <div>
            <label className="block font-medium mb-3">Cross-border Transfer Required</label>
            <div className="flex items-center gap-2 p-2 border border-gray-100 rounded hover:bg-gray-50">
              <Checkbox checked={value.crossBorderTransfer} onCheckedChange={v => onChange({ ...value, crossBorderTransfer: !!v })} />
              <span className="text-sm">Cross-border data transfer is required</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-3">Data Localization Requirements (countries)</label>
            <Input value={value.dataLocalization} onChange={e => onChange({ ...value, dataLocalization: e.target.value })} placeholder="e.g. Russia, China" />
          </div>
        </div>
      </div>

      {/* Data Lifecycle Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Lifecycle</h3>
          <p className="text-sm text-gray-600">Define data retention and lifecycle management requirements</p>
        </div>
        
        <div>
          <label className="block font-medium mb-3">Data Retention Period</label>
          <Select value={value.dataRetention} onValueChange={v => onChange({ ...value, dataRetention: v })}>
            <SelectTrigger><SelectValue placeholder="Select retention" /></SelectTrigger>
            <SelectContent>
              {RETENTION_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
