/**
 * Evaluation Context Aggregator
 * Builds comprehensive context for LLM-powered evaluation generation
 * Gathers guardrails, assessments, risks, and use case data
 */

import { prismaClient } from '@/utils/db';
import { GuardrailsConfig, ComprehensiveAssessment } from '@/lib/agents/types';
import { cleanAssessmentData } from '@/lib/utils/assessment-cleaner';

export interface EvaluationContext {
  useCase: {
    id: string;
    title: string;
    problemStatement: string;
    proposedSolution: string;
    keyBenefits: string;
    currentState: string;
    desiredState: string;
    successCriteria: string[];
    keyAssumptions: string[];
    primaryStakeholders: string[];
    secondaryStakeholders: string[];
    confidenceLevel: number;
    operationalImpact: number;
    productivityImpact: number;
    revenueImpact: number;
    systemCriticality: string;
    implementationComplexity: number;
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
    console.log(`🔍 Fetching guardrails for use case: ${useCaseId}, guardrailsId: ${guardrailsId}`);
    const guardrails = await this.fetchGuardrails(useCaseId, guardrailsId);
    if (!guardrails) {
      console.error(`❌ No guardrails found for use case: ${useCaseId}`);
      throw new Error(
        `No guardrails configuration found for use case: ${useCaseId}. ` +
        `Please go to the "AI Guardrails" tab and generate guardrails first before creating evaluations. ` +
        `If you already generated guardrails, try regenerating them to ensure they are properly saved.`
      );
    }

    const guardrailsInfo = this.getGuardrailsInfo(guardrails);
    console.log(`✅ Found guardrails:`, guardrailsInfo);

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
        keyBenefits: useCase.keyBenefits || '',
        currentState: useCase.currentState || '',
        desiredState: useCase.desiredState || '',
        successCriteria: useCase.successCriteria || [],
        keyAssumptions: useCase.keyAssumptions || [],
        primaryStakeholders: useCase.primaryStakeholders || [],
        secondaryStakeholders: useCase.secondaryStakeholders || [],
        confidenceLevel: useCase.confidenceLevel || 0,
        operationalImpact: useCase.operationalImpact || 0,
        productivityImpact: useCase.productivityImpact || 0,
        revenueImpact: useCase.revenueImpact || 0,
        systemCriticality: assessments.business?.systemCriticality || 'Standard',
        implementationComplexity: useCase.implementationComplexity || 0
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
        // assessData removed; modern flows use template/question answers elsewhere
      }
    });
  }

  /**
   * Fetch guardrails configuration
   */
  private async fetchGuardrails(useCaseId: string, guardrailsId?: string): Promise<GuardrailsConfig | null> {
    let guardrailRecord;

    if (guardrailsId) {
      console.log(`Fetching guardrails by ID: ${guardrailsId}`);
      guardrailRecord = await prismaClient.guardrail.findUnique({
        where: { id: guardrailsId },
        include: { rules: true }
      });
    }

    // If no ID provided or not found by ID, get the latest guardrails for the use case
    if (!guardrailRecord) {
      console.log(`Fetching latest guardrails for use case: ${useCaseId}`);
      guardrailRecord = await prismaClient.guardrail.findFirst({
        where: { useCaseId },
        orderBy: { createdAt: 'desc' },
        include: { rules: true }
      });

      if (guardrailRecord) {
        console.log(`Found guardrail record with ID: ${guardrailRecord.id}`);
      } else {
        console.log(`No guardrail records found for use case: ${useCaseId}`);

        // Try to list all guardrails to debug
        const allGuardrails = await prismaClient.guardrail.findMany({
          select: { id: true, useCaseId: true }
        });
        console.log(`All guardrails in database:`, allGuardrails);
      }
    }

    if (!guardrailRecord) {
      console.log(`❌ No guardrail record found`);
      return null;
    }

    // Check what data we have
    console.log(`📊 Guardrail record analysis:`, {
      id: guardrailRecord.id,
      hasConfiguration: !!guardrailRecord.configuration,
      configType: typeof guardrailRecord.configuration,
      hasRules: !!guardrailRecord.rules,
      rulesCount: guardrailRecord.rules?.length || 0
    });

    // If we have a valid configuration, return it
    if (guardrailRecord.configuration && typeof guardrailRecord.configuration === 'object') {
      console.log(`✅ Using configuration from database`);
      return guardrailRecord.configuration as GuardrailsConfig;
    }

    // Fallback: If configuration is missing but we have rules, reconstruct it
    if (guardrailRecord.rules && guardrailRecord.rules.length > 0) {
      console.log(`⚙️ Configuration missing, reconstructing from ${guardrailRecord.rules.length} rules`);

      const reconstructedConfig = this.reconstructConfigFromRules(guardrailRecord.rules);

      // Optionally update the database with the reconstructed config
      try {
        await prismaClient.guardrail.update({
          where: { id: guardrailRecord.id },
          data: { configuration: reconstructedConfig }
        });
        console.log(`💾 Saved reconstructed configuration to database`);
      } catch (updateError) {
        console.warn(`⚠️ Could not save reconstructed config:`, updateError);
      }

      return reconstructedConfig;
    }

    // Neither configuration nor rules exist
    console.log(`❌ Guardrail record has neither configuration nor rules`);
    return null;
  }

  /**
   * Reconstruct GuardrailsConfig from database rules
   */
  private reconstructConfigFromRules(rules: any[]): GuardrailsConfig {
    const rulesByCategory: Record<string, any[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      operational: [],
      ethical: [],
      economic: [],
      evolutionary: []
    };

    // Group rules by severity and type
    rules.forEach(rule => {
      const guardrail = {
        id: rule.id,
        type: rule.type,
        severity: rule.severity,
        rule: rule.rule,
        description: rule.description,
        rationale: rule.rationale,
        implementation: rule.implementation || {
          platform: ['all'],
          configuration: {},
          monitoring: []
        },
        conditions: rule.conditions,
        exceptions: rule.exceptions,
        status: rule.status
      };

      // Add to severity category
      if (rule.severity && rulesByCategory[rule.severity]) {
        rulesByCategory[rule.severity].push(guardrail);
      }

      // Also add to type-based categories
      if (['performance', 'cost_control', 'operational', 'integration'].includes(rule.type)) {
        rulesByCategory.operational.push(guardrail);
      }
      if (['ethical', 'bias_mitigation', 'bias_testing'].includes(rule.type)) {
        rulesByCategory.ethical.push(guardrail);
      }
      if (rule.type === 'cost_control') {
        rulesByCategory.economic.push(guardrail);
      }
    });

    return {
      guardrails: {
        version: '2.0.0',
        platform: 'multi-platform',
        rules: rulesByCategory,
        deployment: {
          stages: ['development', 'staging', 'production'],
          rollback: {
            triggers: ['error_rate > 5%'],
            strategy: 'gradual'
          }
        },
        monitoring: [],
        documentation: {
          rationale: 'Reconstructed from database rules',
          tradeoffs: [],
          assumptions: []
        }
      },
      reasoning: {
        timestamp: new Date().toISOString(),
        agentContributions: [],
        conflictsResolved: [],
        assumptions: ['Configuration reconstructed from saved rules']
      },
      confidence: {
        overall: 0.8,
        breakdown: {
          dataCompleteness: 0.8,
          regulatoryAlignment: 0.8,
          technicalFeasibility: 0.8,
          businessViability: 0.8
        },
        uncertainties: ['Configuration was reconstructed from rules']
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        agents: ['database-reconstruction'],
        contextComplexity: 5
      }
    } as GuardrailsConfig;
  }

  /**
   * Fetch all assessments for the use case
   */
  private async fetchAssessments(useCaseId: string): Promise<any> {
    // Legacy assess table removed from dependency. Return empty buckets; higher layers use answers/templates directly.
    return {
      technical: null,
      business: null,
      ethical: null,
      risk: null,
      data: null,
      compliance: null
    };
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
    // Note: evaluations relationship doesn't exist in schema,
    // would need separate query if needed
    // if (useCase.evaluations?.length > 5) score += 2;
    
    if (score >= 8) return 'Advanced';
    if (score >= 5) return 'Intermediate';
    if (score >= 2) return 'Developing';
    return 'Initial';
  }

  /**
   * Get summary info about guardrails for logging
   */
  private getGuardrailsInfo(guardrails: GuardrailsConfig): any {
    const rulesObject = this.extractRulesObject(guardrails);
    let totalRules = 0;
    const categories: string[] = [];

    if (rulesObject) {
      Object.entries(rulesObject).forEach(([category, rules]) => {
        if (Array.isArray(rules) && rules.length > 0) {
          categories.push(`${category}(${rules.length})`);
          totalRules += rules.length;
        }
      });
    }

    return {
      totalRules,
      categories: categories.join(', '),
      structure: guardrails?.guardrails?.rules ? 'nested' : guardrails?.rules ? 'direct' : 'unknown'
    };
  }

  /**
   * Extract rules object from guardrails config (handles multiple formats)
   */
  private extractRulesObject(guardrails: GuardrailsConfig): any {
    // The guardrails configuration can be in different formats depending on the source
    // Check for nested structure first (from API), then direct structure (from DB)

    if (guardrails?.guardrails?.rules) {
      // Structure from API: { guardrails: { rules: {...} } }
      return guardrails.guardrails.rules;
    }

    if (guardrails?.rules) {
      // Direct structure from DB: { rules: {...} }
      return guardrails.rules;
    }

    if ((guardrails as any)?.guardrails && typeof (guardrails as any).guardrails === 'object') {
      // Sometimes the configuration is { guardrails: {...} } without nested rules
      const g = (guardrails as any).guardrails;
      if (g.rules) {
        return g.rules;
      }
    }

    return null;
  }

  /**
   * Process guardrails into structured format
   */
  private processGuardrails(guardrails: GuardrailsConfig): EvaluationContext['guardrails'] {
    const allRules: any[] = [];
    const rulesByType: Record<string, number> = {};
    const enforcementStrategies: Set<string> = new Set();

    // Debug log the guardrails structure
    console.log('📋 Processing guardrails structure:', JSON.stringify(Object.keys(guardrails || {})));

    const rulesObject = this.extractRulesObject(guardrails);

    // Extract all rules
    if (rulesObject) {
      console.log('📂 Rules categories found:', Object.keys(rulesObject));
      Object.entries(rulesObject).forEach(([category, rules]) => {
        if (Array.isArray(rules)) {
          console.log(`  └─ ${category}: ${rules.length} rules`);
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
    } else {
      console.warn('⚠️ No rules found in guardrails configuration');
      console.log('Configuration keys:', Object.keys(guardrails || {}));

      // If guardrails were reconstructed, they should have rules
      // This might indicate a deeper issue
      if (guardrails?.metadata?.agents?.includes('database-reconstruction')) {
        console.warn('⚠️ Guardrails were reconstructed but have no rules - this is unexpected');
      }
    }

    const criticalRules = allRules.filter(r => r.severity === 'critical').length;

    console.log(`✅ Processed ${allRules.length} total rules (${criticalRules} critical)`);

    return {
      configuration: guardrails,
      totalRules: allRules.length,
      criticalRules,
      rulesByType,
      enforcementStrategies: Array.from(enforcementStrategies)
    };
  }
}