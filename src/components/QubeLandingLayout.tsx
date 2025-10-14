import React from 'react';
import Image from 'next/image';
import { QubeFeatureBox } from './QubeFeatureBox';
import { QubeValuePillars } from './QubeValuePillars';
import { 
  Brain, 
  BarChart3, 
  Shield, 
  DollarSign, 
  AlertTriangle, 
  Building2,
  Target,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface QubeLandingLayoutProps {
  children: React.ReactNode;
  subtitleOverride?: string;
}

export function QubeLandingLayout({ children, subtitleOverride }: QubeLandingLayoutProps) {
  const features = [
    {
      icon: Brain,
      title: "AI Use‑Case Assessment",
      description: "Structured scoring with feasibility & ethics checks."
    },
    {
      icon: BarChart3,
      title: "Executive Dashboard",
      description: "Portfolio KPIs, risk analytics & ROI."
    },
    {
      icon: Shield,
      title: "Regulatory Compliance",
      description: "EU AI Act & ISO 42001 etc mapping with evidence."
    },
    {
      icon: DollarSign,
      title: "FinOps Projections",
      description: "Cost/ROI models, budgets & forecasts."
    },
    {
      icon: AlertTriangle,
      title: "Risk Management",
      description: "Multi‑dimensional scoring & monitoring."
    },
    {
      icon: Building2,
      title: "Vendor Assessment",
      description: "Third‑party diligence & contracts."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Vertical Layout - All content stacked vertically */}
      <div className="flex flex-col items-center justify-center p-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="mr-4">
              <Image src="https://vgwacd4qotpurdv6.public.blob.vercel-storage.com/logo/logo.png" alt="QUBE Logo" width={48} height={48} className="rounded-lg object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">QUBE™</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            AI Command Center
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {subtitleOverride ?? 'For AI leaders Managing Risk, Compliance, and ROI at Scale.'}
          </p>
        </div>

        {/* Authentication Section */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Horizontal Divider */}
        <div className="w-full max-w-4xl">
          <div className="border-t border-gray-300"></div>
        </div>

        {/* Feature Grid Section */}
        <div className="w-full max-w-4xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why QUBE?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <QubeFeatureBox
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* Value Pillars Section */}
        <div className="w-full max-w-4xl">
          <QubeValuePillars />
        </div>
      </div>
    </div>
  );
}


