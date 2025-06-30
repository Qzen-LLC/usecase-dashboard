'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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

const initialEthicalImpact = {
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
  const lastSent = React.useRef<any>(null);

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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] border-l-4 border-purple-400 p-4 mb-6 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-purple-800 text-lg mb-1">Ethical Impact Assessment</div>
        <div className="text-purple-700">
          Evaluate potential ethical implications and ensure responsible AI implementation.
        </div>
      </div>

      {/* Decision Making */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 mb-2">Decision Making</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Decision Automation Level</Label>
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
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="information-only" id="info-only" />
                  <Label htmlFor="info-only" className="text-sm">Information Only (No decisions)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decision-support" id="decision-support" />
                  <Label htmlFor="decision-support" className="text-sm">Decision Support (Human decides)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="assisted-decision" id="assisted-decision" />
                  <Label htmlFor="assisted-decision" className="text-sm">Assisted Decision (AI recommends)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automated-override" id="automated-override" />
                  <Label htmlFor="automated-override" className="text-sm">Automated with Override</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fully-automated" id="fully-automated" />
                  <Label htmlFor="fully-automated" className="text-sm">Fully Automated</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autonomous" id="autonomous" />
                  <Label htmlFor="autonomous" className="text-sm">Autonomous</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Decision Types (Multi-select)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('credit-lending') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('credit-lending', !!val)}
                  />
                  <span className="text-sm">Credit/Lending Decisions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('employment') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('employment', !!val)}
                  />
                  <span className="text-sm">Employment Decisions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('insurance') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('insurance', !!val)}
                  />
                  <span className="text-sm">Insurance Underwriting</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('medical') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('medical', !!val)}
                  />
                  <span className="text-sm">Medical Diagnosis/Treatment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('legal') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('legal', !!val)}
                  />
                  <span className="text-sm">Legal Judgments</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('pricing') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('pricing', !!val)}
                  />
                  <span className="text-sm">Pricing Decisions</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('access-control') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('access-control', !!val)}
                  />
                  <span className="text-sm">Access Control</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('content-moderation') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('content-moderation', !!val)}
                  />
                  <span className="text-sm">Content Moderation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('fraud-detection') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('fraud-detection', !!val)}
                  />
                  <span className="text-sm">Fraud Detection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('risk-scoring') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('risk-scoring', !!val)}
                  />
                  <span className="text-sm">Risk Scoring</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('resource-allocation') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('resource-allocation', !!val)}
                  />
                  <span className="text-sm">Resource Allocation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.decisionMaking?.decisionTypes?.includes('predictive-maintenance') || false}
                    onCheckedChange={(val) => handleDecisionTypeChange('predictive-maintenance', !!val)}
                  />
                  <span className="text-sm">Predictive Maintenance</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Characteristics */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 mb-2">Model Characteristics</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Explainability Level</Label>
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black-box" id="black-box" />
                  <Label htmlFor="black-box" className="text-sm">Black Box (No explanation)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic-feature" id="basic-feature" />
                  <Label htmlFor="basic-feature" className="text-sm">Basic Feature Importance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial-explanations" id="partial-explanations" />
                  <Label htmlFor="partial-explanations" className="text-sm">Partial Explanations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-explainability" id="full-explainability" />
                  <Label htmlFor="full-explainability" className="text-sm">Full Explainability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="human-interpretable" id="human-interpretable" />
                  <Label htmlFor="human-interpretable" className="text-sm">Human-interpretable Rules</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Bias Testing</Label>
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-testing" id="no-testing" />
                  <Label htmlFor="no-testing" className="text-sm">No Testing Planned</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic-statistical" id="basic-statistical" />
                  <Label htmlFor="basic-statistical" className="text-sm">Basic Statistical Testing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comprehensive-audit" id="comprehensive-audit" />
                  <Label htmlFor="comprehensive-audit" className="text-sm">Comprehensive Bias Audit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="continuous-monitoring" id="continuous-monitoring" />
                  <Label htmlFor="continuous-monitoring" className="text-sm">Continuous Monitoring</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="third-party-audit" id="third-party-audit" />
                  <Label htmlFor="third-party-audit" className="text-sm">Third-party Audit</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* AI Governance */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 mb-2">AI Governance</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Human Oversight Level</Label>
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
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fully-autonomous" id="fully-autonomous-gov" />
                  <Label htmlFor="fully-autonomous-gov" className="text-sm">Fully Autonomous</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="periodic-review" id="periodic-review" />
                  <Label htmlFor="periodic-review" className="text-sm">Periodic Review</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular-monitoring" id="regular-monitoring" />
                  <Label htmlFor="regular-monitoring" className="text-sm">Regular Monitoring</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active-supervision" id="active-supervision" />
                  <Label htmlFor="active-supervision" className="text-sm">Active Supervision</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="human-in-loop" id="human-in-loop" />
                  <Label htmlFor="human-in-loop" className="text-sm">Human-in-the-loop</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="human-approval" id="human-approval" />
                  <Label htmlFor="human-approval" className="text-sm">Human Approval Required</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Performance Monitoring</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('accuracy-precision') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('accuracy-precision', !!val)}
                  />
                  <span className="text-sm">Accuracy/Precision</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('fairness-metrics') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('fairness-metrics', !!val)}
                  />
                  <span className="text-sm">Fairness Metrics</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('drift-detection') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('drift-detection', !!val)}
                  />
                  <span className="text-sm">Drift Detection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('resource-usage') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('resource-usage', !!val)}
                  />
                  <span className="text-sm">Resource Usage</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('latency-tracking') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('latency-tracking', !!val)}
                  />
                  <span className="text-sm">Latency Tracking</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('error-analysis') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('error-analysis', !!val)}
                  />
                  <span className="text-sm">Error Analysis</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.aiGovernance?.performanceMonitoring?.includes('ab-testing') || false}
                    onCheckedChange={(val) => handlePerformanceMonitoringChange('ab-testing', !!val)}
                  />
                  <span className="text-sm">A/B Testing</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Considerations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 mb-2">Ethical Considerations</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Potential Harm Areas (Multi-select)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('discrimination-bias') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('discrimination-bias', !!val)}
                  />
                  <span className="text-sm">Discrimination/Bias</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('privacy-violation') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('privacy-violation', !!val)}
                  />
                  <span className="text-sm">Privacy Violation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('manipulation-deception') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('manipulation-deception', !!val)}
                  />
                  <span className="text-sm">Manipulation/Deception</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('physical-harm') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('physical-harm', !!val)}
                  />
                  <span className="text-sm">Physical Harm</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('economic-harm') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('economic-harm', !!val)}
                  />
                  <span className="text-sm">Economic Harm</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('psychological-harm') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('psychological-harm', !!val)}
                  />
                  <span className="text-sm">Psychological Harm</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('environmental-impact') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('environmental-impact', !!val)}
                  />
                  <span className="text-sm">Environmental Impact</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('misinformation') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('misinformation', !!val)}
                  />
                  <span className="text-sm">Misinformation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.potentialHarmAreas?.includes('addiction-overuse') || false}
                    onCheckedChange={(val) => handlePotentialHarmChange('addiction-overuse', !!val)}
                  />
                  <span className="text-sm">Addiction/Overuse</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Vulnerable Populations (Multi-select)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('children-minors') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('children-minors', !!val)}
                  />
                  <span className="text-sm">Children/Minors</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('elderly') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('elderly', !!val)}
                  />
                  <span className="text-sm">Elderly</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('disabled-individuals') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('disabled-individuals', !!val)}
                  />
                  <span className="text-sm">Disabled Individuals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('minorities') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('minorities', !!val)}
                  />
                  <span className="text-sm">Minorities</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('low-income-groups') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('low-income-groups', !!val)}
                  />
                  <span className="text-sm">Low-income Groups</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('non-native-speakers') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('non-native-speakers', !!val)}
                  />
                  <span className="text-sm">Non-native Speakers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={value.ethicalConsiderations?.vulnerablePopulations?.includes('specific-medical-conditions') || false}
                    onCheckedChange={(val) => handleVulnerablePopulationChange('specific-medical-conditions', !!val)}
                  />
                  <span className="text-sm">Specific Medical Conditions</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bias and Fairness */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Bias and Fairness Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.historicalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, historicalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Historical bias in training data</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.demographicGaps}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, demographicGaps: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Demographic representation gaps</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.geographicBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, geographicBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Geographic bias</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.selectionBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, selectionBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Selection bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.confirmationBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, confirmationBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Confirmation bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.temporalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, temporalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Temporal bias</span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy and Security */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Privacy and Security</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.dataMinimization}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataMinimization: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Data minimization principle</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.consentManagement}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, consentManagement: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Consent management</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.dataAnonymization}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataAnonymization: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Data anonymization</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}