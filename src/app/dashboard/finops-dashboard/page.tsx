// This file will be replaced by a dynamic [useCaseId] route for individual financial assessment pages.
'use client';
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

interface UseCase {
  title: string;
  owner: string;
  stage: string;
  aiucId: number;
}

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
  useCase?: UseCase;
}

const FinOpsDashboardPage = () => {
  const router = useRouter();
  const [finops, setFinops] = useState<FinOpsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/finops-dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch FinOps data');
        }
        const data = await response.json();
        setFinops(data.finops || []);
      } catch (err) {
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

  const handleRowClick = (useCaseId: string) => {
    router.push(`/dashboard/finops-dashboard/${useCaseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
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
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* Header */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b border-blue-200">
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-left">Use Case</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-left">Owner</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-left">Stage</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-left">Budget Range</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Dev Cost</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">API Cost</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Infra Cost</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Op Cost</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Total Investment</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Value Base</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Value Growth Rate</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Cumulative Value</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Cumulative Op Cost</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">Net Value</th>
                  <th className="px-8 py-4 text-sm font-semibold text-blue-900 text-right">ROI (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredFinops.map((item, index) => (
                  <tr 
                    key={index} 
                    className="bg-white hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleRowClick(item.useCaseId)}
                  >
                    <td className="px-8 py-4 text-sm">
                      <div className="flex flex-col">
                        <div className="font-mono text-gray-500 mb-1">AIUC-{item.useCase?.aiucId}</div>
                        <div className="font-medium text-gray-900">{item.useCase?.title}</div>
                        <div className="text-sm text-gray-500">{item.useCase?.owner}</div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600">{item.useCase?.owner}</td>
                    <td className="px-8 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {item.useCase?.stage}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600">{item.budgetRange || '-'}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.devCostBase)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.apiCostBase)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.infraCostBase)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.opCostBase)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-blue-900">{formatCurrency(item.totalInvestment)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.valueBase)}</td>
                    <td className="px-8 py-4 text-sm text-right text-gray-900">{(item.valueGrowthRate * 100).toFixed(1)}%</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(item.cumValue)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-red-600">{formatCurrency(item.cumOpCost)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(item.netValue)}</td>
                    <td className="px-8 py-4 text-sm text-right font-medium text-green-600">{item.ROI.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinOpsDashboardPage; 