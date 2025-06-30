// This file will be replaced by a dynamic [useCaseId] route for individual financial assessment pages.
'use client';
import React, { useEffect, useState } from "react";
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface FinOpsData {
  useCaseId: string;
  ROI: number;
  netValue: number;
  apiCostBase: number;
  cumOpCost: number;
  cumValue: number;
  devCostBase: number;
  infraCostBase: number;
  opCostBase: number;
  totalInvestment: number;
  valueBase: number;
  valueGrowthRate: number;
  budgetRange?: string;
  useCase?: {
    title: string;
    owner?: string;
    stage?: string;
  };
}

const STAGE_ORDER = [
  'discovery',
  'business-case',
  'proof-of-value',
  'backlog',
  'in-progress',
  'solution-validation',
  'pilot',
  'deployment',
];

function isAfterOrAtBacklog(stage?: string) {
  if (!stage) return false;
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= STAGE_ORDER.indexOf('backlog');
}

const FinOpsDashboardPage = () => {
  const [finops, setFinops] = useState<FinOpsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const usecasesRes = await fetch('/api/read-usecases');
        const usecases = await usecasesRes.json();
        const filtered = (usecases || []).filter((uc: any) => isAfterOrAtBacklog(uc.stage));
        const finopsArr: FinOpsData[] = [];
        for (const uc of filtered) {
          const res = await fetch(`/api/get-finops?id=${uc.id}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            finopsArr.push({ ...data[0], useCase: { title: uc.title, owner: uc.primaryStakeholders?.[0] || '', stage: uc.stage } });
          }
        }
        setFinops(finopsArr);
      } catch (e) {
        setError('Failed to load FinOps data');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredFinops = finops.filter(f =>
    f.useCase?.title.toLowerCase().includes(search.toLowerCase()) ||
    (f.useCase?.owner || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#23235b]">FinOps Dashboard</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
        <Input
          type="text"
          placeholder="Search by use case or owner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs border border-gray-300"
        />
      </div>
      {loading ? (
        <div className="text-gray-500 text-lg">Loading FinOps data...</div>
      ) : error ? (
        <div className="text-red-500 text-lg">{error}</div>
      ) : filteredFinops.length === 0 ? (
        <div className="text-gray-500 text-lg">No FinOps data found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-[#e9eafc] via-[#fbeaff] to-[#ffeafd] text-[#23235b]">
                <th className="py-3 px-4 text-left">Use Case</th>
                <th className="py-3 px-4 text-left">Owner</th>
                <th className="py-3 px-4 text-left">Stage</th>
                <th className="py-3 px-4 text-left">Budget Range</th>
                <th className="py-3 px-4 text-left">Dev Cost</th>
                <th className="py-3 px-4 text-left">API Cost</th>
                <th className="py-3 px-4 text-left">Infra Cost</th>
                <th className="py-3 px-4 text-left">Op Cost</th>
                <th className="py-3 px-4 text-left">Total Investment</th>
                <th className="py-3 px-4 text-left">Value Base</th>
                <th className="py-3 px-4 text-left">Value Growth Rate</th>
                <th className="py-3 px-4 text-left">Cumulative Value</th>
                <th className="py-3 px-4 text-left">Cumulative Op Cost</th>
                <th className="py-3 px-4 text-left">Net Value</th>
                <th className="py-3 px-4 text-left">ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinops.map((f, idx) => (
                <tr
                  key={f.useCaseId}
                  className={(idx % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' cursor-pointer hover:bg-blue-50 transition'}
                  onClick={() => window.location.href = `/dashboard/finops-dashboard/${f.useCaseId}`}
                >
                  <td className="py-2 px-4 font-semibold text-[#23235b]">{f.useCase?.title}</td>
                  <td className="py-2 px-4">{f.useCase?.owner}</td>
                  <td className="py-2 px-4">{f.useCase?.stage}</td>
                  <td className="py-2 px-4">{f.budgetRange || '-'}</td>
                  <td className="py-2 px-4">${f.devCostBase.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.apiCostBase.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.infraCostBase.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.opCostBase.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.totalInvestment.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.valueBase.toLocaleString()}</td>
                  <td className="py-2 px-4">{(f.valueGrowthRate * 100).toFixed(1)}%</td>
                  <td className="py-2 px-4">${f.cumValue.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.cumOpCost.toLocaleString()}</td>
                  <td className="py-2 px-4">${f.netValue.toLocaleString()}</td>
                  <td className="py-2 px-4">{f.ROI.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinOpsDashboardPage; 