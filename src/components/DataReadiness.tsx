'use client';
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

export default function DataReadinessAssessment() {
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({
    completeness: 85,
    accuracy: 92,
    consistency: 78,
    timeliness: 95,
  });

  const [sources, setSources] = useState<Record<string, boolean>>({
    internal: true,
    logs: true,
    external: false,
    thirdParty: false,
  });

  const [pipeline, setPipeline] = useState<Record<string, boolean>>({
    'Data Extraction': false,
    'Data Transformation': false,
    'Data Loading/Storage': false,
    'Real-time Processing': false,
  });

  const [governance, setGovernance] = useState<Record<string, boolean>>({
    'Data Catalog': true,
    'Lineage Tracking': true,
    'Quality Monitoring': false,
    'Privacy Controls': true,
  });

  const getSliderColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <div className="bg-cyan-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-800 mb-2">Data Readiness Assessment</h3>
        <p className="text-cyan-700">Evaluate data availability, quality, and preparedness for AI model development.</p>
      </div>

      <div className="space-y-6">
        <h4 className="font-semibold text-gray-800 text-md">Data Availability & Quality</h4>

        {/* Dropdowns */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800">Data Volume Assessment</label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Training Data Volume</span>
              <select className="text-sm border rounded px-2 py-1 w-64">
                <option>Sufficient (100K+ records)</option>
                <option>Moderate (10K-100K records)</option>
                <option>Limited (1K-10K records)</option>
                <option>Insufficient (&lt;1K records)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Historical Data Depth</span>
              <select className="text-sm border rounded px-2 py-1 w-64">
                <option>3+ years</option>
                <option>1-3 years</option>
                <option>6-12 months</option>
                <option>&lt;6 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Data Quality Metrics</label>
          <div className="space-y-4">
            {Object.entries(qualityScores).map(([metric, value]) => (
              <div key={metric} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize w-32">{metric}</span>
                <div className="flex items-center space-x-2 w-full max-w-md">
                  <div className="w-full relative">
                    <Slider
                      defaultValue={[value]}
                      max={100}
                      step={1}
                      onValueChange={(val) =>
                        setQualityScores((prev) => ({ ...prev, [metric]: val[0] }))
                      }
                      className={`h-2 ${getSliderColor(value)} rounded-full`}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data Sources</label>
          <div className="space-y-2">
            {Object.entries(sources).map(([key, val]) => (
              <label key={key} className="flex items-center space-x-2">
                <Checkbox
                  checked={val}
                  onCheckedChange={(v) =>
                    setSources((prev) => ({ ...prev, [key]: !!v }))
                  }
                />
                <span className="text-sm capitalize">
                  {{
                    internal: 'Internal databases (CRM, ERP)',
                    logs: 'Customer interaction logs',
                    external: 'External data feeds',
                    thirdParty: 'Third-party datasets',
                  }[key]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline and Governance */}
      <div className="space-y-6">
        <h4 className="font-semibold text-gray-800 text-md">Data Infrastructure & Governance</h4>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Data Pipeline Readiness</label>
          {Object.entries(pipeline).map(([key, val]) => (
            <label key={key} className="flex items-center space-x-2">
              <Checkbox
                checked={val}
                onCheckedChange={(v) =>
                  setPipeline((prev) => ({ ...prev, [key]: !!v }))
                }
              />
              <span className="text-sm">{key}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Data Governance</label>
          {Object.entries(governance).map(([key, val]) => (
            <label key={key} className="flex items-center space-x-2">
              <Checkbox
                checked={val}
                onCheckedChange={(v) =>
                  setGovernance((prev) => ({ ...prev, [key]: !!v }))
                }
              />
              <span className="text-sm">{key}</span>
            </label>
          ))}
        </div>

        {/* Feature Engineering */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feature Engineering Requirements
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe required data transformations and feature engineering needs..."
          />
        </div>
      </div>

      {/* Data Gaps & Action Plan */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Data Gaps & Action Plan</h4>
        <div className="space-y-4">
          {['Critical Data Gaps', 'Data Collection Strategy', 'Data Readiness Timeline'].map((label) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Final Score */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Overall Data Readiness Score</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Data Readiness: <span className="font-semibold text-green-600">Good (7.5/10)</span>
          </span>
          <span className="text-sm">
            Estimated Prep Time: <span className="font-semibold text-blue-600">8-12 weeks</span>
          </span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
