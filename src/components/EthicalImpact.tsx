'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, Shield, Settings, Heart } from 'lucide-react';

type Props = {
  value: {
    biasFairness: {
      historicalBias: boolean;
      demographicGaps: boolean;
      geographicBias: boolean;
      selectionBias: boolean;
      confirmationBias: boolean;
      temporalBias: boolean;
    };
    privacySecurity: {
      dataMinimization: boolean;
      consentManagement: boolean;
      dataAnonymization: boolean;
    };
    decisionMaking: {
      automationLevel: string;
      decisionTypes: string[];
    };
    modelCharacteristics: {
      explainabilityLevel: string;
      biasTesting: string;
    };
    aiGovernance: {
      humanOversightLevel: string;
      performanceMonitoring: string[];
    };
    ethicalConsiderations: {
      potentialHarmAreas: string[];
      vulnerablePopulations: string[];
    };
  };
  onChange: (data: Props['value']) => void;
};

const _initialEthicalImpact = {
  biasFairness: { /* ... */ },
  privacySecurity: { /* ... */ },
  decisionMaking: { automationLevel: '', decisionTypes: [] },
  modelCharacteristics: { explainabilityLevel: '', biasTesting: '' },
  aiGovernance: { humanOversightLevel: '', performanceMonitoring: [] },
  ethicalConsiderations: {
    potentialHarmAreas: [],
    vulnerablePopulations: []
  }
};

export default function EthicalImpact({ value, onChange }: Props) {
  const lastSent = React.useRef<Props['value'] | null>(null);

  React.useEffect(() => {
    const currentData = {
      ...value,
    };
 
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [value, onChange]);

  const handleDecisionTypeChange = (decisionType: string, checked: boolean) => {
    const currentTypes = value.decisionMaking.decisionTypes || [];
    const newTypes = checked 
      ? [...currentTypes, decisionType]
      : currentTypes.filter(type => type !== decisionType);
    
    onChange({
      ...value,
      decisionMaking: {
        ...value.decisionMaking,
        decisionTypes: newTypes
      }
    });
  };

  const handlePerformanceMonitoringChange = (metric: string, checked: boolean) => {
    const currentMetrics = value.aiGovernance.performanceMonitoring || [];
    const newMetrics = checked 
      ? [...currentMetrics, metric]
      : currentMetrics.filter(m => m !== metric);
    
    onChange({
      ...value,
      aiGovernance: {
        ...value.aiGovernance,
        performanceMonitoring: newMetrics
      }
    });
  };

  const handlePotentialHarmChange = (harmArea: string, checked: boolean) => {
    const currentAreas = value.ethicalConsiderations?.potentialHarmAreas || [];
    const newAreas = checked 
      ? [...currentAreas, harmArea]
      : currentAreas.filter(area => area !== harmArea);
    
    onChange({
      ...value,
      ethicalConsiderations: {
        ...value.ethicalConsiderations,
        potentialHarmAreas: newAreas
      }
    });
  };

  const handleVulnerablePopulationChange = (population: string, checked: boolean) => {
    const currentPopulations = value.ethicalConsiderations?.vulnerablePopulations || [];
    const newPopulations = checked 
      ? [...currentPopulations, population]
      : currentPopulations.filter(p => p !== population);
    
    onChange({
      ...value,
      ethicalConsiderations: {
        ...value.ethicalConsiderations,
        vulnerablePopulations: newPopulations
      }
    });
  };

  return (
    <div className="space-y-10">
             <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-400 dark:border-purple-300 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
         <div className="font-semibold text-purple-800 dark:text-purple-200 text-lg mb-1">Ethical Impact Assessment</div>
         <div className="text-purple-700 dark:text-purple-300">
           Evaluate potential ethical implications and ensure responsible AI implementation.
         </div>
       </div>

      {/* Decision Making Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Decision Making</h3>
              <p className="text-sm text-muted-foreground">Define the level of automation and types of decisions your AI system will make</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Decision Automation Level</Label>
            <RadioGroup
              value={value.decisionMaking?.automationLevel || ''}
              onValueChange={(val) =>
                onChange({
                  ...value,
                  decisionMaking: {
                    ...value.decisionMaking,
                    automationLevel: val
                  }
                })
              }
              className="mt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="information-only" id="info-only" />
                  <Label htmlFor="info-only" className="text-sm cursor-pointer text-foreground">Information Only (No decisions)</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="decision-support" id="decision-support" />
                  <Label htmlFor="decision-support" className="text-sm cursor-pointer text-foreground">Decision Support (Human decides)</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="assisted-decision" id="assisted-decision" />
                  <Label htmlFor="assisted-decision" className="text-sm cursor-pointer text-foreground">Assisted Decision (AI recommends)</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="automated-override" id="automated-override" />
                  <Label htmlFor="automated-override" className="text-sm cursor-pointer text-foreground">Automated with Override</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="fully-automated" id="fully-automated" />
                  <Label htmlFor="fully-automated" className="text-sm cursor-pointer text-foreground">Fully Automated</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="autonomous" id="autonomous" />
                  <Label htmlFor="autonomous" className="text-sm cursor-pointer text-foreground">Autonomous</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Decision Types (Multi-select)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('credit-lending') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('credit-lending', !!val)}
                />
                <span className="text-sm text-foreground">Credit/Lending Decisions</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('employment') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('employment', !!val)}
                />
                <span className="text-sm text-foreground">Employment Decisions</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('insurance') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('insurance', !!val)}
                />
                <span className="text-sm text-foreground">Insurance Underwriting</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('medical') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('medical', !!val)}
                />
                <span className="text-sm text-foreground">Medical Diagnosis/Treatment</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('legal') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('legal', !!val)}
                />
                <span className="text-sm text-foreground">Legal Judgments</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('pricing') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('pricing', !!val)}
                />
                <span className="text-sm text-foreground">Pricing Decisions</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('access-control') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('access-control', !!val)}
                />
                <span className="text-sm text-foreground">Access Control</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('content-moderation') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('content-moderation', !!val)}
                />
                <span className="text-sm text-foreground">Content Moderation</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('fraud-detection') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('fraud-detection', !!val)}
                />
                <span className="text-sm text-foreground">Fraud Detection</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('risk-scoring') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('risk-scoring', !!val)}
                />
                <span className="text-sm text-foreground">Risk Scoring</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('resource-allocation') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('resource-allocation', !!val)}
                />
                <span className="text-sm text-foreground">Resource Allocation</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.decisionMaking?.decisionTypes?.includes('predictive-maintenance') || false}
                  onCheckedChange={(val) => handleDecisionTypeChange('predictive-maintenance', !!val)}
                />
                <span className="text-sm text-foreground">Predictive Maintenance</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Model Characteristics Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Model Characteristics</h3>
              <p className="text-sm text-muted-foreground">Define explainability requirements and bias testing approaches</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Explainability Level</Label>
            <RadioGroup
              value={value.modelCharacteristics?.explainabilityLevel || ''}
              onValueChange={(val) =>
                onChange({
                  ...value,
                  modelCharacteristics: {
                    ...value.modelCharacteristics,
                    explainabilityLevel: val
                  }
                })
              }
              className="mt-2"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="black-box" id="black-box" />
                  <Label htmlFor="black-box" className="text-sm cursor-pointer text-foreground">Black Box (No explanation)</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="basic-feature" id="basic-feature" />
                  <Label htmlFor="basic-feature" className="text-sm cursor-pointer text-foreground">Basic Feature Importance</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="partial-explanations" id="partial-explanations" />
                  <Label htmlFor="partial-explanations" className="text-sm cursor-pointer text-foreground">Partial Explanations</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="full-explainability" id="full-explainability" />
                  <Label htmlFor="full-explainability" className="text-sm cursor-pointer text-foreground">Full Explainability</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="human-interpretable" id="human-interpretable" />
                  <Label htmlFor="human-interpretable" className="text-sm cursor-pointer text-foreground">Human-interpretable Rules</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Bias Testing</Label>
            <RadioGroup
              value={value.modelCharacteristics?.biasTesting || ''}
              onValueChange={(val) =>
                onChange({
                  ...value,
                  modelCharacteristics: {
                    ...value.modelCharacteristics,
                    biasTesting: val
                  }
                })
              }
              className="mt-2"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="no-testing" id="no-testing" />
                  <Label htmlFor="no-testing" className="text-sm cursor-pointer text-foreground">No Testing Planned</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="basic-statistical" id="basic-statistical" />
                  <Label htmlFor="basic-statistical" className="text-sm cursor-pointer text-foreground">Basic Statistical Testing</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="comprehensive-audit" id="comprehensive-audit" />
                  <Label htmlFor="comprehensive-audit" className="text-sm cursor-pointer text-foreground">Comprehensive Bias Audit</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="continuous-monitoring" id="continuous-monitoring" />
                  <Label htmlFor="continuous-monitoring" className="text-sm cursor-pointer text-foreground">Continuous Monitoring</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="third-party-audit" id="third-party-audit" />
                  <Label htmlFor="third-party-audit" className="text-sm cursor-pointer text-foreground">Third-party Audit</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* AI Governance Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">AI Governance</h3>
              <p className="text-sm text-muted-foreground">Configure human oversight levels and performance monitoring requirements</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Human Oversight Level</Label>
            <RadioGroup
              value={value.aiGovernance?.humanOversightLevel || ''}
              onValueChange={(val) =>
                onChange({
                  ...value,
                  aiGovernance: {
                    ...value.aiGovernance,
                    humanOversightLevel: val
                  }
                })
              }
              className="mt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="fully-autonomous" id="fully-autonomous-gov" />
                  <Label htmlFor="fully-autonomous-gov" className="text-sm cursor-pointer text-foreground">Fully Autonomous</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="periodic-review" id="periodic-review" />
                  <Label htmlFor="periodic-review" className="text-sm cursor-pointer text-foreground">Periodic Review</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="regular-monitoring" id="regular-monitoring" />
                  <Label htmlFor="regular-monitoring" className="text-sm cursor-pointer text-foreground">Regular Monitoring</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="active-supervision" id="active-supervision" />
                  <Label htmlFor="active-supervision" className="text-sm cursor-pointer text-foreground">Active Supervision</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="human-in-loop" id="human-in-loop" />
                  <Label htmlFor="human-in-loop" className="text-sm cursor-pointer text-foreground">Human-in-the-loop</Label>
                </div>
                <div className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <RadioGroupItem value="human-approval" id="human-approval" />
                  <Label htmlFor="human-approval" className="text-sm cursor-pointer text-foreground">Human Approval Required</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Performance Monitoring</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('accuracy-precision') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('accuracy-precision', !!val)}
                />
                <span className="text-sm text-foreground">Accuracy/Precision</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('fairness-metrics') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('fairness-metrics', !!val)}
                />
                <span className="text-sm text-foreground">Fairness Metrics</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('drift-detection') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('drift-detection', !!val)}
                />
                <span className="text-sm text-foreground">Drift Detection</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('resource-usage') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('resource-usage', !!val)}
                />
                <span className="text-sm text-foreground">Resource Usage</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('latency-tracking') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('latency-tracking', !!val)}
                />
                <span className="text-sm text-foreground">Latency Tracking</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('error-analysis') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('error-analysis', !!val)}
                />
                <span className="text-sm text-foreground">Error Analysis</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.aiGovernance?.performanceMonitoring?.includes('ab-testing') || false}
                  onCheckedChange={(val) => handlePerformanceMonitoringChange('ab-testing', !!val)}
                />
                <span className="text-sm text-foreground">A/B Testing</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Considerations Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Ethical Considerations</h3>
              <p className="text-sm text-muted-foreground">Identify potential harm areas and vulnerable populations that may be affected</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Potential Harm Areas (Multi-select)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('discrimination-bias') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('discrimination-bias', !!val)}
                />
                <span className="text-sm text-foreground">Discrimination/Bias</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('privacy-violation') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('privacy-violation', !!val)}
                />
                <span className="text-sm text-foreground">Privacy Violation</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('manipulation-deception') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('manipulation-deception', !!val)}
                />
                <span className="text-sm text-foreground">Manipulation/Deception</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('physical-harm') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('physical-harm', !!val)}
                />
                <span className="text-sm text-foreground">Physical Harm</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('economic-harm') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('economic-harm', !!val)}
                />
                <span className="text-sm text-foreground">Economic Harm</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('psychological-harm') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('psychological-harm', !!val)}
                />
                <span className="text-sm text-foreground">Psychological Harm</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('environmental-impact') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('environmental-impact', !!val)}
                />
                <span className="text-sm text-foreground">Environmental Impact</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('misinformation') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('misinformation', !!val)}
                />
                <span className="text-sm text-foreground">Misinformation</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('addiction-overuse') || false}
                  onCheckedChange={(val) => handlePotentialHarmChange('addiction-overuse', !!val)}
                />
                <span className="text-sm text-foreground">Addiction/Overuse</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block text-foreground">Vulnerable Populations (Multi-select)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('children-minors') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('children-minors', !!val)}
                />
                <span className="text-sm text-foreground">Children/Minors</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('elderly') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('elderly', !!val)}
                />
                <span className="text-sm text-foreground">Elderly</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('disabled-individuals') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('disabled-individuals', !!val)}
                />
                <span className="text-sm text-foreground">Disabled Individuals</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('minorities') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('minorities', !!val)}
                />
                <span className="text-sm text-foreground">Minorities</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('low-income-groups') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('low-income-groups', !!val)}
                />
                <span className="text-sm text-foreground">Low-income Groups</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('non-native-speakers') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('non-native-speakers', !!val)}
                />
                <span className="text-sm text-foreground">Non-native Speakers</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('specific-medical-conditions') || false}
                  onCheckedChange={(val) => handleVulnerablePopulationChange('specific-medical-conditions', !!val)}
                />
                <span className="text-sm text-foreground">Specific Medical Conditions</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bias and Fairness Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Bias and Fairness Analysis</h3>
          <p className="text-sm text-muted-foreground">Identify potential bias sources and privacy considerations</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Bias Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.historicalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, historicalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Historical bias in training data</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.demographicGaps}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, demographicGaps: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Demographic representation gaps</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.geographicBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, geographicBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Geographic bias</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.selectionBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, selectionBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Selection bias</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.confirmationBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, confirmationBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Confirmation bias</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.biasFairness.temporalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, temporalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Temporal bias</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Privacy and Security</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.privacySecurity.dataMinimization}
                  onCheckedChange={(val) =>
                    onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataMinimization: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Data minimization principle</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.privacySecurity.consentManagement}
                  onCheckedChange={(val) =>
                    onChange({ ...value, privacySecurity: { ...value.privacySecurity, consentManagement: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Consent management</span>
              </label>
              <label className="flex items-center space-x-2 hover:bg-accent p-2 rounded border border-border transition-colors">
                <Checkbox
                  checked={value.privacySecurity.dataAnonymization}
                  onCheckedChange={(val) =>
                    onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataAnonymization: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm text-foreground">Data anonymization</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}