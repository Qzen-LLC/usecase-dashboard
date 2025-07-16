"use client"


import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis, Tooltip } from "recharts"
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A radar chart with dots"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartRadarDots({ chartData }: { chartData: Array<{ month: string; desktop: number }> }) {
  // Helper to determine color based on risk value
  const getRiskColor = (value: number) => {
    if (value >= 8) return '#ef4444'; // High
    if (value >= 4) return '#fde047'; // Medium
    return '#22c55e'; // Low
  };
  // Find top risk
  const topRisk = chartData.reduce((max, curr) => curr.desktop > max.desktop ? curr : max, chartData[0]);
  // Custom dot component (smaller)
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = getRiskColor(payload.desktop);
    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill={color} stroke={color} strokeWidth={1.5} />
        {/* Value label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="12" fill={color} fontWeight="bold">{payload.desktop}</text>
      </g>
    );
  };
  return (
    <Card>
      <CardHeader className="items-center">
        {/* Top Risk Callout */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-base text-gray-700">Top Risk:</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: getRiskColor(topRisk.desktop), color: '#fff' }}>{topRisk.month} ({topRisk.desktop}/10)</span>
        </div>
        <CardTitle>Risk Radar Chart</CardTitle>
        <CardDescription>
        A 6-month risk profile across critical categories: Data Privacy, Security, Compliance, Ethics, and Operations.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[600px] h-[400px]"
        >
          <RadarChart data={chartData} outerRadius={120}>
            <Tooltip formatter={(value, name, props) => [`${value}/10`, `${props && props.payload ? props.payload.month : name}`]} />
            <PolarGrid />
            <PolarAngleAxis dataKey="month" tick={{ fontSize: 14 }} />
            <PolarRadiusAxis domain={[0, 10]} />
            <Radar
              dataKey="desktop"
              fill="#fb923c"
              fillOpacity={0.6}
              dot={<CustomDot />}
              stroke="#fb923c"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* Add a legend for color coding */}
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> High Risk</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> Medium Risk</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Low Risk</span>
        </div>
      </CardFooter>
    </Card>
  )
}
