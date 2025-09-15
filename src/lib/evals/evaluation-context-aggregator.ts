/**
 * Evaluation Context Aggregator
 * Builds comprehensive context for LLM-powered evaluation generation
 * Gathers guardrails, assessments, risks, and use case data
 */

import { prismaClient } from '@/utils/db';
import { GuardrailsConfig, ComprehensiveAssessment } from '@/lib/agents/types';

export interface EvaluationContext {
  useCase: {
    id: string;
    title: string;
    problemStatement: string;
    proposedSolution: string;
    currentState: string;
    desiredState: string;
    successCriteria: string[];
    keyAssumptions: string[];
    primaryStakeholders: string[];
    secondaryStakeholders: string[];
    confidenceLevel: number;
    systemCriticality: string;
    implementationComplexity: string;
  };
  guardrails: {
    configuration: GuardrailsConfig;
    totalRules: number;
    criticalRules: number;
    rulesByType: Record<string, number>;
    enforcementStrategies: string[];
  };
  assessments: {
    technical: any;
    business: any;
    ethical: any;
    risk: any;
    data: any;
    compliance: any;
  };
  risks: {
    identified: Array<{
      category: string;
      severity: string;
      description: string;
      mitigation: string;
    }>;
    criticalCount: number;
    highCount: number;
    residualRiskLevel: string;
  };
  compliance: {
    frameworks: string[];
    requirements: string[];
    jurisdictions: string[];
  };
  performance: {
    responseTimeRequirement: string;
    availabilityRequirement: string;
    concurrentUsers: number;
    expectedRequestsPerDay: number;
    latencyThreshold: number;
  };
  testingContext: {
    previousEvaluations: number;
    lastEvaluationDate?: Date;
    averagePassRate?: number;
    commonFailurePatterns?: string[];
    criticalTestGaps?: string[];
  };
  organizational: {
    riskAppetite: string;
    maturityLevel: string;
    testingBudget?: number;
    requiredCoverage: number;
  };
}

export class EvaluationContextAggregator {
  /**
   * Build complete evaluation context from multiple sources
   */
  async buildEvaluationContext(
    useCaseId: string,
    guardrailsId?: string
  ): Promise<EvaluationContext> {
    console.log('📊 Building comprehensive evaluation context...');
    
    // Fetch use case with all relations
    const useCase = await this.fetchUseCase(useCaseId);
    if (!useCase) {
      throw new Error(`Use case not found: ${useCaseId}`);
    }

    // Fetch guardrails configuration
    const guardrails = await this.fetchGuardrails(useCaseId, guardrailsId);
    if (!guardrails) {
      throw new Error(`Guardrails not found for use case: ${useCaseId}`);
    }

    // Fetch assessments
    const assessments = await this.fetchAssessments(useCaseId);

    // Analyze risks
    const risks = this.analyzeRisks(assessments);

    // Extract compliance requirements
    const compliance = this.extractCompliance(assessments);

    // Extract performance requirements
    const performance = this.extractPerformance(assessments, useCase);

    // Fetch testing context
    const testingContext = await this.fetchTestingContext(useCaseId);

    // Build organizational context
    const organizational = this.buildOrganizationalContext(assessments, useCase);

    const context: EvaluationContext = {
      useCase: {
        id: useCase.id,
        title: useCase.title,
        problemStatement: useCase.problemStatement || '',
        proposedSolution: useCase.proposedAISolution || '',
        currentState: useCase.currentState || '',
        desiredState: useCase.desiredState || '',
        successCriteria: useCase.successCriteria || [],
        keyAssumptions: useCase.keyAssumptions || [],
        primaryStakeholders: useCase.primaryStakeholders || [],
        secondaryStakeholders: useCase.secondaryStakeholders || [],
        confidenceLevel: useCase.confidenceLevel || 0,
        systemCriticality: assessments.business?.systemCriticality || 'Standard',
        implementationComplexity: useCase.implementationComplexity || 'Medium'
      },
      guardrails: this.processGuardrails(guardrails),
      assessments,
      risks,
      compliance,
      performance,
      testingContext,
      organizational
    };

    console.log(`✅ Context built with ${context.guardrails.totalRules} guardrails, ${context.risks.identified.length} risks`);
    
    return context;
  }

  /**
   * Fetch use case data
   */
  private async fetchUseCase(useCaseId: string): Promise<any> {
    return await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      include: {
        assessments: true,
        guardrails: true,
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  /**
   * Fetch guardrails configuration
   */
  private async fetchGuardrails(useCaseId: string, guardrailsId?: string): Promise<GuardrailsConfig | null> {
    let guardrailRecord;
    
    if (guardrailsId) {
      guardrailRecord = await prismaClient.guardrail.findUnique({
        where: { id: guardrailsId }
      });
    } else {
      // Get the latest guardrails for the use case
      guardrailRecord = await prismaClient.guardrail.findFirst({
        where: { useCaseId },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!guardrailRecord || !guardrailRecord.configuration) {
      return null;
    }

    return guardrailRecord.configuration as GuardrailsConfig;
  }

  /**
   * Fetch all assessments for the use case
   */
  private async fetchAssessments(useCaseId: string): Promise<any> {
    const assessments = await prismaClient.assessment.findMany({
      where: { useCaseId }
    });

    const assessmentMap: any = {
      technical: null,
      business: null,
      ethical: null,
      risk: null,
      data: null,
      compliance: null
    };

    assessments.forEach(assessment => {
      const type = assessment.type.toLowerCase();
      if (type.includes('technical')) {
        assessmentMap.technical = assessment.results;
      } else if (type.includes('business')) {
        assessmentMap.business = assessment.results;
      } else if (type.includes('ethical') || type.includes('ethics')) {
        assessmentMap.ethical = assessment.results;
      } else if (type.includes('risk')) {
        assessmentMap.risk = assessment.results;
      } else if (type.includes('data')) {
        assessmentMap.data = assessment.results;
      } else if (type.includes('compliance')) {
        assessmentMap.compliance = assessment.results;
      }
    });

    return assessmentMap;
  }

  /**
   * Analyze risks from assessments
   */
  private analyzeRisks(assessments: any): EvaluationContext['risks'] {
    const risks: Array<{
      category: string;
      severity: string;
      description: string;
      mitigation: string;
    }> = [];

    // Extract risks from risk assessment
    if (assessments.risk?.technicalRisks) {
      assessments.risk.technicalRisks.forEach((risk: any) => {
        risks.push({
          category: 'Technical',
          severity: risk.impact || 'medium',
          description: risk.risk || risk.description || '',
          mitigation: risk.mitigation || ''
        });
      });
    }

    // Extract risks from ethical assessment
    if (assessments.ethical?.ethicalRisks) {
      assessments.ethical.ethicalRisks.forEach((risk: any) => {
        risks.push({
          category: 'Ethical',
          severity: risk.severity || 'medium',
          description: risk.risk || risk.description || '',
          mitigation: risk.mitigation || ''
        });
      });
    }

    // Extract model risks
    if (assessments.risk?.modelRisks) {
      Object.entries(assessments.risk.modelRisks).forEach(([key, value]: [string, any]) => {
        if (value && value !== 'Low') {
          risks.push({
            category: 'Model',
            severity: value === 'High' ? 'critical' : value === 'Medium' ? 'high' : 'medium',
            description: key,
            mitigation: `Monitor and mitigate ${key}`
          });
        }
      });
    }

    const criticalCount = risks.filter(r => r.severity === 'critical').length;
    const highCount = risks.filter(r => r.severity === 'high').length;

    return {
      identified: risks,
      criticalCount,
      highCount,
      residualRiskLevel: criticalCount > 0 ? 'High' : highCount > 2 ? 'Medium' : 'Low'
    };
  }

  /**
   * Extract compliance requirements
   */
  private extractCompliance(assessments: any): EvaluationContext['compliance'] {
    const frameworks: string[] = [];
    const requirements: string[] = [];
    const jurisdictions: string[] = [];

    // Extract from risk assessment
    if (assessments.risk?.dataProtection) {
      if (assessments.risk.dataProtection.gdprCompliant) {
        frameworks.push('GDPR');
        jurisdictions.push('EU');
      }
      if (assessments.risk.dataProtection.hipaaCompliant) {
        frameworks.push('HIPAA');
        jurisdictions.push('US');
      }
      if (assessments.risk.dataProtection.jurisdictions) {
        jurisdictions.push(...assessments.risk.dataProtection.jurisdictions);
      }
    }

    // Extract from compliance assessment
    if (assessments.compliance) {
      if (assessments.compliance.euAiAct) frameworks.push('EU AI Act');
      if (assessments.compliance.iso42001) frameworks.push('ISO 42001');
      if (assessments.compliance.uaeAi) frameworks.push('UAE AI Regulation');
      
      if (assessments.compliance.requirements) {
        requirements.push(...assessments.compliance.requirements);
      }
    }

    return {
      frameworks: [...new Set(frameworks)],
      requirements: [...new Set(requirements)],
      jurisdictions: [...new Set(jurisdictions)]
    };
  }

  /**
   * Extract performance requirements
   */
  private extractPerformance(assessments: any, useCase: any): EvaluationContext['performance'] {
    return {
      responseTimeRequirement: assessments.business?.responseTimeRequirement || '1000ms',
      availabilityRequirement: assessments.business?.availabilityRequirement || '99.9%',
      concurrentUsers: assessments.business?.concurrentUsers || 100,
      expectedRequestsPerDay: assessments.technical?.expectedRequestsPerDay || 10000,
      latencyThreshold: assessments.technical?.latencyThreshold || 1000
    };
  }

  /**
   * Fetch testing context from previous evaluations
   */
  private async fetchTestingContext(useCaseId: string): Promise<EvaluationContext['testingContext']> {
    const evaluations = await prismaClient.evaluation.findMany({
      where: { 
        useCaseId, 
        status: 'completed' 
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        results: true
      }
    });

    if (evaluations.length === 0) {
      return {
        previousEvaluations: 0,
        requiredCoverage: 80
      };
    }

    // Calculate average pass rate
    let totalTests = 0;
    let passedTests = 0;
    const failurePatterns: Map<string, number> = new Map();

    evaluations.forEach(evaluation => {
      if (evaluation.summary && typeof evaluation.summary === 'object') {
        const summary = evaluation.summary as any;
        totalTests += summary.totalTests || 0;
        passedTests += summary.passed || 0;
      }

      // Analyze failure patterns
      evaluation.results.forEach(result => {
        if (!result.passed && result.category) {
          const count = failurePatterns.get(result.category) || 0;
          failurePatterns.set(result.category, count + 1);
        }
      });
    });

    // Identify common failure patterns
    const commonFailurePatterns = Array.from(failurePatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern);

    // Identify critical test gaps based on failures
    const criticalTestGaps = this.identifyTestGaps(evaluations);

    return {
      previousEvaluations: evaluations.length,
      lastEvaluationDate: evaluations[0]?.createdAt,
      averagePassRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      commonFailurePatterns,
      criticalTestGaps,
      requiredCoverage: 80
    };
  }

  /**
   * Identify test gaps from previous evaluations
   */
  private identifyTestGaps(evaluations: any[]): string[] {
    const gaps: string[] = [];
    
    // Analyze what types of tests are missing or failing frequently
    const testCategories = ['safety', 'performance', 'compliance', 'ethics', 'security', 'cost'];
    const categoryResults: Map<string, { total: number; passed: number }> = new Map();

    evaluations.forEach(evaluation => {
      evaluation.results.forEach((result: any) => {
        const category = result.category || 'unknown';
        const current = categoryResults.get(category) || { total: 0, passed: 0 };
        current.total++;
        if (result.passed) current.passed++;
        categoryResults.set(category, current);
      });
    });

    // Identify categories with low pass rates or no tests
    testCategories.forEach(category => {
      const results = categoryResults.get(category);
      if (!results || results.total === 0) {
        gaps.push(`No ${category} tests found`);
      } else if (results.passed / results.total < 0.5) {
        gaps.push(`Low pass rate in ${category} tests`);
      }
    });

    return gaps;
  }

  /**
   * Build organizational context
   */
  private buildOrganizationalContext(assessments: any, useCase: any): EvaluationContext['organizational'] {
    const riskAppetite = assessments.risk?.riskAppetite || 
                        assessments.business?.riskTolerance || 
                        'moderate';
    
    const maturityLevel = this.assessMaturityLevel(assessments, useCase);
    
    return {
      riskAppetite,
      maturityLevel,
      testingBudget: assessments.business?.testingBudget,
      requiredCoverage: riskAppetite === 'low' ? 95 : riskAppetite === 'high' ? 70 : 85
    };
  }

  /**
   * Assess organizational AI maturity level
   */
  private assessMaturityLevel(assessments: any, useCase: any): string {
    let score = 0;
    
    // Check technical maturity
    if (assessments.technical?.existingAISystems > 0) score += 2;
    if (assessments.technical?.mlOpsCapability) score += 2;
    if (assessments.technical?.dataQuality === 'high') score += 1;
    
    // Check process maturity
    if (assessments.business?.governanceStructure) score += 2;
    if (assessments.risk?.riskManagementProcess) score += 1;
    
    // Check experience
    if (useCase.evaluations?.length > 5) score += 2;
    
    if (score >= 8) return 'Advanced';
    if (score >= 5) return 'Intermediate';
    if (score >= 2) return 'Developing';
    return 'Initial';
  }

  /**
   * Process guardrails into structured format
   */
  private processGuardrails(guardrails: GuardrailsConfig): EvaluationContext['guardrails'] {
    const allRules: any[] = [];
    const rulesByType: Record<string, number> = {};
    const enforcementStrategies: Set<string> = new Set();

    // Extract all rules
    if (guardrails.guardrails?.rules) {
      Object.entries(guardrails.guardrails.rules).forEach(([category, rules]) => {
        if (Array.isArray(rules)) {
          allRules.push(...rules);
          rules.forEach((rule: any) => {
            const type = rule.type || category;
            rulesByType[type] = (rulesByType[type] || 0) + 1;
            
            // Extract enforcement strategies
            if (rule.implementation?.enforcement) {
              enforcementStrategies.add(rule.implementation.enforcement);
            }
          });
        }
      });
    }

    const criticalRules = allRules.filter(r => r.severity === 'critical').length;

    return {
      configuration: guardrails,
      totalRules: allRules.length,
      criticalRules,
      rulesByType,
      enforcementStrategies: Array.from(enforcementStrategies)
    };
  }
}