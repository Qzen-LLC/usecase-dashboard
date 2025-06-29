import React from 'react';
import ReadOnlyTechnicalFeasibility from './ReadOnlyTechnicalFeasibility';
import ReadOnlyBusinessFeasibility from './ReadOnlyBusinessFeasibility';
import ReadOnlyEthicalImpact from './ReadOnlyEthicalImpact';
import ReadOnlyRiskAssessment from './ReadOnlyRiskAssessment';
import ReadOnlyDataReadiness from './ReadOnlyDataReadiness';
import ReadOnlyRoadmapPosition from './ReadOnlyRoadmapPosition';
import ReadOnlyBudgetPlanning from './ReadOnlyBudgetPlanning';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, DollarSign, Shield, AlertTriangle, FileText, Calendar, TrendingUp } from 'lucide-react';

interface ReadOnlyAssessmentDisplayProps {
  assessData: {
    stepsData: {
      technicalFeasibility?: any;
      businessFeasibility?: any;
      ethicalImpact?: any;
      riskAssessment?: any;
      dataReadiness?: any;
      roadmapPosition?: any;
      budgetPlanning?: any;
    };
  };
}

const ReadOnlyAssessmentDisplay: React.FC<ReadOnlyAssessmentDisplayProps> = ({ assessData }) => {
  if (!assessData?.stepsData) {
    return <div className="text-gray-500 italic">No assessment data available</div>;
  }

  const { stepsData } = assessData;

  return (
    <div className="space-y-8">
      {/* Technical Feasibility */}
      {stepsData.technicalFeasibility && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <CardTitle>Technical Feasibility Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyTechnicalFeasibility data={stepsData.technicalFeasibility} />
          </CardContent>
        </Card>
      )}

      {/* Business Feasibility */}
      {stepsData.businessFeasibility && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <CardTitle>Business Feasibility Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyBusinessFeasibility data={stepsData.businessFeasibility} />
          </CardContent>
        </Card>
      )}

      {/* Ethical Impact */}
      {stepsData.ethicalImpact && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-purple-500" />
            <CardTitle>Ethical Impact Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyEthicalImpact data={stepsData.ethicalImpact} />
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {stepsData.riskAssessment && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyRiskAssessment data={stepsData.riskAssessment} />
          </CardContent>
        </Card>
      )}

      {/* Data Readiness */}
      {stepsData.dataReadiness && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-cyan-500" />
            <CardTitle>Data Readiness Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyDataReadiness data={stepsData.dataReadiness} />
          </CardContent>
        </Card>
      )}

      {/* Roadmap Position */}
      {stepsData.roadmapPosition && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <CardTitle>Roadmap Position Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyRoadmapPosition data={stepsData.roadmapPosition} />
          </CardContent>
        </Card>
      )}

      {/* Budget Planning */}
      {stepsData.budgetPlanning && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-yellow-500" />
            <CardTitle>Budget Planning Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyBudgetPlanning data={stepsData.budgetPlanning} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReadOnlyAssessmentDisplay; 