'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Database,
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const assessmentSteps = [
  { id: 1, title: 'Technical Feasibility', icon: Database },
  { id: 2, title: 'Business Feasibility', icon: TrendingUp },
  { id: 3, title: 'Ethical Impact', icon: Shield },
  { id: 4, title: 'Risk Assessment', icon: AlertTriangle },
  { id: 5, title: 'Data Readiness', icon: Brain },
  { id: 6, title: 'Budget Planning', icon: DollarSign },
  { id: 7, title: 'Roadmap Position', icon: Calendar },
];

interface UseCase {
  title: string;
  department: string;
  owner: string;
}

const MONTHS = [
  'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'
];

const defaultFinOps = { apiCost: 0, infraCost: 0, opCost: 0, valueGenerated: 0 };

// Helper to normalize month keys (e.g., 'Jan 2025' <-> 'Jan2025')
function normalizeMonthKey(month: string) {
  return month.replace(' ', '');
}

export default function AssessmentPage() {
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [finops, setFinops] = useState<{ [month: string]: any }>({});
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [finopsLoading, setFinopsLoading] = useState(false);
  const [finopsAlert, setFinopsAlert] = useState('');

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-usecase?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        setUseCase(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load use case');
        setLoading(false);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!useCaseId) return;
    setFinopsLoading(true);
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        console.log('Fetched finops:', data);
        const byMonth: { [month: string]: any } = {};
        data.forEach((row: any) => {
          const key = normalizeMonthKey(row.monthYear);
          byMonth[key] = row;
        });
        console.log('Mapped byMonth:', byMonth);
        setFinops(byMonth);
        setFinopsLoading(false);
      })
      .catch(() => {
        setFinops({});
        setFinopsLoading(false);
      });
  }, [useCaseId]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === assessmentSteps.length;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    const idx = MONTHS.indexOf(month);
    for (let i = 0; i < idx; i++) {
      if (!finops[normalizeMonthKey(MONTHS[i])]) {
        setFinopsAlert('Please fill in the data for all previous months before proceeding. The graph requires continuous data.');
        return;
      }
    }
    setFinopsAlert('');
  };

  const handleFinopsFieldChange = (field: string, value: number) => {
    setFinops(prev => ({
      ...prev,
      [normalizeMonthKey(selectedMonth)]: {
        ...((prev[normalizeMonthKey(selectedMonth)]) || { ...defaultFinOps, monthYear: normalizeMonthKey(selectedMonth) }),
        [field]: value,
        monthYear: normalizeMonthKey(selectedMonth),
      }
    }));
  };

  const handleFinopsSave = async () => {
    setFinopsLoading(true);
    const data = finops[normalizeMonthKey(selectedMonth)] || { ...defaultFinOps, monthYear: normalizeMonthKey(selectedMonth) };
    try {
      await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, ...data })
      });
      setFinopsAlert('Saved!');
    } catch {
      setFinopsAlert('Failed to save.');
    }
    setFinopsLoading(false);
  };

  // Always print debug logs on every render
  console.log('currentStep:', currentStep);
  console.log('All finops keys:', Object.keys(finops));
  console.log('normalizeMonthKey(selectedMonth):', normalizeMonthKey(selectedMonth));
  console.log('Current finops for', selectedMonth, finops[normalizeMonthKey(selectedMonth)]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }
  if (error || !useCase) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error || 'Use case not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center border-b px-6 py-3 bg-white">
        <div className="flex space-x-8">
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📊</span> Pipeline
          </button>
          <button className="text-blue-700 font-semibold border-b-2 border-blue-700 flex items-center">
            <span className="mr-2">🛡️</span> Assessment
          </button>
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📁</span> Portfolio
          </button>
        </div>
        <div className="ml-auto text-xl font-bold text-gray-900">AI Strategic Enablement</div>
      </div>

      {/* Use Case Title Section */}
      <div className="px-8 py-6 border-b bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{useCase.title}</div>
          <div className="text-gray-600">{useCase.department} • {useCase.owner}</div>
        </div>
        <button className="text-blue-700 hover:underline mt-4 sm:mt-0">&larr; Back to Pipeline</button>
      </div>

      {/* Assessment Steps Navigation */}
      <div className="px-8 py-4 border-b bg-gray-50 overflow-x-auto">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-2 whitespace-nowrap">
                <div className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-8 py-10 bg-white">
        <div className="text-gray-600 text-lg font-medium">
          {/* Replace this with form for each step */}
          You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
        </div>
        {/* Budget Planning Step (step 6) */}
        {currentStep === 6 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#f5eaff] to-[#ffeafd] shadow-lg">
            <div className="mb-4">
              <label className="font-semibold mr-2">Select Month:</label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border rounded px-3 py-1"
                disabled={finopsLoading}
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {finopsAlert && <div className="mb-2 text-red-500 font-medium">{finopsAlert}</div>}
            <div className="bg-white rounded-xl shadow border p-4 mb-4">
              <table className="min-w-full text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-[#e9eafc] via-[#f5eaff] to-[#ffeafd]">
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">API Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Infra Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Operations Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Value Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={finops[normalizeMonthKey(selectedMonth)]?.apiCost ?? 0}
                        min={0}
                        onChange={e => handleFinopsFieldChange('apiCost', Number(e.target.value))}
                        disabled={finopsLoading}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={finops[normalizeMonthKey(selectedMonth)]?.infraCost ?? 0}
                        min={0}
                        onChange={e => handleFinopsFieldChange('infraCost', Number(e.target.value))}
                        disabled={finopsLoading}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={finops[normalizeMonthKey(selectedMonth)]?.opCost ?? 0}
                        min={0}
                        onChange={e => handleFinopsFieldChange('opCost', Number(e.target.value))}
                        disabled={finopsLoading}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={finops[normalizeMonthKey(selectedMonth)]?.valueGenerated ?? 0}
                        min={0}
                        onChange={e => handleFinopsFieldChange('valueGenerated', Number(e.target.value))}
                        disabled={finopsLoading}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                className="mt-6 w-full bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition"
                onClick={handleFinopsSave}
                disabled={finopsLoading}
              >Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="px-8 py-6 border-t bg-white flex justify-between items-center">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${isFirstStep ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          disabled={isFirstStep}
          onClick={handlePrev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
          Save Progress
        </button>

        <button
          className={`flex items-center px-4 py-2 rounded-md ${isLastStep ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          disabled={isLastStep}
          onClick={handleNext}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}