'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, Shield, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface RiskCategory {
  name: string;
  level: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend?: 'increasing' | 'decreasing' | 'stable';
}

interface TopRiskCategoriesProps {
  categories: string[];
  className?: string;
}

const getRiskIcon = (index: number) => {
  const icons = [Zap, AlertTriangle, Shield, Activity, TrendingUp];
  return icons[index % icons.length];
};

const getRiskColor = (index: number) => {
  if (index === 0) return 'text-destructive bg-destructive/10 border-destructive/20';
  if (index === 1) return 'text-warning bg-warning/10 border-warning/20';
  if (index === 2) return 'text-primary bg-primary/10 border-primary/20';
  return 'text-secondary-foreground bg-secondary/10 border-secondary/20';
};

const getRiskSeverity = (index: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (index === 0) return 'critical';
  if (index === 1) return 'high';
  if (index === 2) return 'medium';
  return 'low';
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
  switch (severity) {
    case 'critical':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'high':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'medium':
      return 'text-primary bg-primary/10 border-primary/20';
    case 'low':
      return 'text-success bg-success/10 border-success/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

export default function TopRiskCategories({ categories, className = '' }: TopRiskCategoriesProps) {
  return (
    <Card className={`bg-card border border-border ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <CardTitle className="text-xl font-semibold text-foreground">Top Risk Categories</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Most critical risk areas requiring immediate attention
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category, index) => {
            const Icon = getRiskIcon(index);
            const severity = getRiskSeverity(index);
            const riskColor = getRiskColor(index);
            const severityColor = getSeverityColor(severity);
            
            return (
              <div 
                key={category} 
                className="group flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Risk Rank Icon */}
                  <div className={`w-10 h-10 ${riskColor} rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Risk Information */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 rounded-full border ${severityColor}`}
                      >
                        {severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Risk Level</span>
                      <span className="font-medium text-foreground">#{index + 1}</span>
                    </div>
                  </div>
                </div>
                
                
              </div>
            );
          })}
        </div>
        
        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {categories.length} risk categories identified
            </span>
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
