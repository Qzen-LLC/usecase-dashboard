/**
 * Risk Recommendation Engine
 * Orchestrates IBM, MIT, OWASP, MITRE, and AIID services
 * to provide intelligent risk recommendations based on use case assessment
 */

import type {
  RiskRecommendationInput,
  RiskRecommendations,
  ExternalRisk,
  OwaspRisk,
  MitreTechniqueData,
  AiidIncident,
} from './types';
import { ibmRiskAtlasService } from './ibm-risk-atlas.service';
import { mitRiskRepoService } from './mit-risk-repo.service';
import { owaspLLMService } from './owasp-llm.service';
import { mitreAtlasService } from './mitre-atlas.service';
import { aiidService } from './aiid.service';

// Lazy import AI agent to avoid bundling OpenAI on client side
async function findRelevantIncidents(
  input: RiskRecommendationInput,
  topN: number = 10
) {
  // Only import on server side when actually needed
  if (typeof window === 'undefined') {
    const { findRelevantIncidents: findIncidents } = await import('../ai-agent/incident-matcher');
    return findIncidents(input, topN);
  }
  // Return empty array if called on client (should never happen)
  return [];
}

/**
 * Detect if the use case involves Generative AI
 */
function detectGenAI(assessmentData: RiskRecommendationInput['assessmentData']): boolean {
  const tech = assessmentData.technicalFeasibility;
  if (!tech) return false;

  // Check model types
  if (tech.modelTypes) {
    const genAIKeywords = [
      'llm',
      'large language',
      'generative',
      'gpt',
      'claude',
      'gemini',
      'multimodal',
      'text generation',
      'chat',
    ];
    const hasGenAI = tech.modelTypes.some((mt) =>
      genAIKeywords.some((keyword) => mt.toLowerCase().includes(keyword))
    );
    if (hasGenAI) return true;
  }

  // Check model provider
  if (tech.modelProvider) {
    const genAIProviders = ['openai', 'anthropic', 'google', 'meta', 'huggingface', 'cohere'];
    if (genAIProviders.some((p) => tech.modelProvider?.toLowerCase().includes(p))) {
      return true;
    }
  }

  // Check business use case
  const business = assessmentData.businessFeasibility;
  if (business?.genAIUseCase) {
    return true;
  }

  return false;
}

/**
 * Detect if the use case involves Agentic AI
 */
function detectAgenticAI(assessmentData: RiskRecommendationInput['assessmentData']): boolean {
  const tech = assessmentData.technicalFeasibility;
  if (!tech) return false;

  // Check agent architecture
  if (tech.agentArchitecture && tech.agentArchitecture.trim().length > 0) {
    return true;
  }

  // Check agent capabilities
  if (tech.agentCapabilities && tech.agentCapabilities.length > 0) {
    return true;
  }

  // Check ethical impact agent behavior
  const ethical = assessmentData.ethicalImpact;
  if (ethical?.agentBehavior?.boundaries && ethical.agentBehavior.boundaries.length > 0) {
    return true;
  }

  return false;
}

/**
 * Detect if RAG architecture is used
 */
function detectRAG(assessmentData: RiskRecommendationInput['assessmentData']): boolean {
  const tech = assessmentData.technicalFeasibility;
  if (!tech) return false;

  // Check if RAG architecture is configured
  if ((tech as any).ragArchitecture) {
    const rag = (tech as any).ragArchitecture;
    if (rag.vectorDatabase || rag.embeddingModel) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if system has plugins/tool integrations
 */
function detectPlugins(assessmentData: RiskRecommendationInput['assessmentData']): boolean {
  const tech = assessmentData.technicalFeasibility;
  if (!tech) return false;

  // Check tool integrations
  if ((tech as any).toolIntegrations && (tech as any).toolIntegrations.length > 0) {
    return true;
  }

  // Check function calling
  if ((tech as any).functionCalling === true) {
    return true;
  }

  return false;
}

/**
 * Determine if system is public-facing
 */
function detectPublicFacing(assessmentData: RiskRecommendationInput['assessmentData']): boolean {
  const business = assessmentData.businessFeasibility;
  if (!business) return false;

  // Check interaction patterns
  if (business.interactionPattern) {
    const publicKeywords = ['public', 'customer', 'external', 'user-facing'];
    if (publicKeywords.some((k) => business.interactionPattern?.toLowerCase().includes(k))) {
      return true;
    }
  }

  // Check user interaction modes
  if (business.userInteractionModes && business.userInteractionModes.length > 0) {
    return true;
  }

  return false;
}

/**
 * Extract data types from assessment
 */
function extractDataTypes(assessmentData: RiskRecommendationInput['assessmentData']): string[] {
  const dataReadiness = assessmentData.dataReadiness;
  if (!dataReadiness) return [];

  const types: string[] = [];
  if (dataReadiness.dataTypes) types.push(...dataReadiness.dataTypes);
  if (dataReadiness.trainingDataTypes) types.push(...dataReadiness.trainingDataTypes);

  return types;
}

/**
 * Extract ethical concerns
 */
function extractEthicalConcerns(
  assessmentData: RiskRecommendationInput['assessmentData']
): string[] {
  const ethical = assessmentData.ethicalImpact;
  if (!ethical) return [];

  const concerns: string[] = [];

  if (ethical.contentGeneration?.risks) {
    concerns.push(...ethical.contentGeneration.risks);
  }

  if (ethical.ethicalConsiderations?.potentialHarmAreas) {
    concerns.push(...ethical.ethicalConsiderations.potentialHarmAreas);
  }

  return concerns;
}

/**
 * Main recommendation function
 * @param input - Use case and assessment data
 * @param source - Which source to fetch: 'risks' (IBM, MIT, OWASP), 'security' (MITRE), 'incidents' (AIID)
 */
export async function recommendRisksFromExternalSources(
  input: RiskRecommendationInput,
  source: 'risks' | 'security' | 'incidents' = 'risks'
): Promise<RiskRecommendations> {
  const { assessmentData } = input;

  // Analyze use case characteristics
  const isGenAI = detectGenAI(assessmentData);
  const isAgenticAI = detectAgenticAI(assessmentData);
  const hasRAG = detectRAG(assessmentData);
  const hasPlugins = detectPlugins(assessmentData);
  const publicFacing = detectPublicFacing(assessmentData);
  const dataTypes = extractDataTypes(assessmentData);
  const ethicalConcerns = extractEthicalConcerns(assessmentData);

  console.log('[Risk Recommender] Analysis:', {
    isGenAI,
    isAgenticAI,
    hasRAG,
    hasPlugins,
    publicFacing,
    dataTypesCount: dataTypes.length,
    ethicalConcernsCount: ethicalConcerns.length,
    source,
  });

  // Initialize empty arrays for all sources
  let ibmRecommendations: any[] = [];
  let mitRecommendations: any[] = [];
  let owaspRecommendations: any[] = [];
  let mitreRecommendations: any[] = [];
  let aiidIncidents: any[] = [];

  // Fetch recommendations based on source
  if (source === 'risks') {
    // Step 12: AI Risk Intelligence - IBM, MIT, OWASP only
    console.log('[Risk Recommender] Fetching AI Risk Intelligence (IBM, MIT, OWASP)...');

    ibmRecommendations = ibmRiskAtlasService.recommendForUseCase({
      isGenAI,
      isAgenticAI,
      dataTypes,
      modelTypes: assessmentData.technicalFeasibility?.modelTypes,
      agentCapabilities: assessmentData.technicalFeasibility?.agentCapabilities,
    });

    mitRecommendations = mitRiskRepoService.recommendForUseCase({
      isGenAI,
      isAgenticAI,
      dataTypes,
      ethicalConcerns,
      useCaseCategory: assessmentData.businessFeasibility?.genAIUseCase,
    });

    // OWASP recommendations (only if GenAI)
    owaspRecommendations = isGenAI
      ? owaspLLMService.assessApplicableRisks({
          isGenAI,
          isAgenticAI,
          hasRAG,
          hasPlugins,
          publicFacing,
          dataTypes,
        })
      : [];
  } else if (source === 'security') {
    // Step 11: Security Assessment - MITRE ATLAS only
    console.log('[Risk Recommender] Fetching Security Assessment (MITRE ATLAS)...');

    mitreRecommendations = mitreAtlasService.recommendForUseCase({
      isGenAI,
      isAgenticAI,
      hasRAG,
      hasPlugins,
      publicFacing,
      hasTrainingPipeline: Boolean(assessmentData.dataReadiness?.trainingDataTypes?.length),
      storesModelWeights: Boolean(assessmentData.technicalFeasibility?.deploymentModels),
      allowsUserQueries: publicFacing || Boolean(assessmentData.businessFeasibility?.userInteractionModes?.length),
      hasExternalAPIs: hasPlugins,
    });
  } else if (source === 'incidents') {
    // Step 15: Incident Learning - AIID only
    console.log('[Risk Recommender] Fetching Incident Learning (AIID)...');

    const aiidMatches = await findRelevantIncidents(input, 10);
    aiidIncidents = aiidMatches.map((match) => match.incident);
    console.log(`[Risk Recommender] Found ${aiidIncidents.length} relevant AIID incidents`);
  }

  // Limit recommendations to reasonable numbers
  const limitedIBM = ibmRecommendations.slice(0, 15);
  const limitedMIT = mitRecommendations.slice(0, 20);

  return {
    ibm: limitedIBM,
    mit: limitedMIT,
    owasp: owaspRecommendations,
    mitre: mitreRecommendations,
    aiid: aiidIncidents,
    totalRecommendations:
      limitedIBM.length +
      limitedMIT.length +
      owaspRecommendations.length +
      mitreRecommendations.length +
      aiidIncidents.length,
    analysis: {
      isGenAI,
      isAgenticAI,
      primaryUseCase: assessmentData.businessFeasibility?.genAIUseCase,
      riskCategories: Array.from(
        new Set([
          ...limitedIBM.map((r) => r.RiskCategory),
          ...limitedMIT.map((r) => r.RiskCategory),
          ...(mitreRecommendations.map((m) => m.metadata?.riskCategory || 'Security').filter(Boolean)),
        ])
      ),
    },
  };
}

/**
 * Get a specific external risk by source and ID
 */
export async function getExternalRisk(
  source: 'ibm' | 'mit' | 'owasp' | 'mitre' | 'aiid',
  sourceId: string
): Promise<ExternalRisk | OwaspRisk | MitreTechniqueData | AiidIncident | undefined> {
  switch (source) {
    case 'ibm':
      return ibmRiskAtlasService.getRisk(sourceId);
    case 'mit':
      return mitRiskRepoService.getRisk(sourceId);
    case 'owasp':
      return owaspLLMService.getRisk(sourceId);
    case 'mitre':
      return mitreAtlasService.getTechnique(sourceId);
    case 'aiid':
      return await aiidService.getIncidentById(parseInt(sourceId));
    default:
      return undefined;
  }
}

/**
 * Get all risks from a specific source for manual browsing
 */
export async function getAllRisksFromSource(
  source: 'ibm' | 'mit' | 'owasp' | 'mitre' | 'aiid'
): Promise<ExternalRisk[] | OwaspRisk[] | MitreTechniqueData[] | AiidIncident[]> {
  switch (source) {
    case 'ibm':
      return ibmRiskAtlasService.getAllRisks();
    case 'mit':
      return mitRiskRepoService.getAllRisks();
    case 'owasp':
      return owaspLLMService.getAllRisks();
    case 'mitre':
      return mitreAtlasService.getAllTechniques();
    case 'aiid':
      return await aiidService.getIncidents(100, 0);
    default:
      return [];
  }
}
