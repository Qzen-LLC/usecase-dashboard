import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function BudgetPlanning() {
  return (
    <div className="space-y-8">
      {/* Assessment Banner */}
      <Card className="bg-yellow-50 border-yellow-400 border-l-4 shadow-none">
        <CardHeader>
          <div className="font-semibold text-yellow-800 text-lg mb-1">Budget Planning</div>
          <div className="text-yellow-700">Define resource requirements and financial projections for the project.</div>
        </CardHeader>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <Label className="font-medium">Cost Breakdown</Label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            <div className="flex justify-between items-center px-6 py-3">
              <span>Personnel (12 months)</span>
              <span className="font-semibold">$120,000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3">
              <span>Infrastructure & Tools</span>
              <span className="font-semibold">$20,000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3">
              <span>External Services</span>
              <span className="font-semibold">$10,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Budget */}
      <Card>
        <CardContent className="flex justify-between items-center px-6 py-3 font-semibold text-lg">
          <span>Total Budget</span>
          <span>$150,000</span>
        </CardContent>
      </Card>

      {/* ROI Projection */}
      <div className="space-y-4">
        <Card className="bg-green-50 shadow-none">
          <CardContent className="py-6 text-center">
            <div className="text-green-600 text-2xl font-bold">200%</div>
            <div className="text-xs text-gray-500 mt-1">Expected ROI</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 shadow-none">
          <CardContent className="py-6 text-center">
            <div className="text-blue-600 text-2xl font-bold">8 months</div>
            <div className="text-xs text-gray-500 mt-1">Payback Period</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}