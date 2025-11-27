/**
 * AI Agent for Context-Aware Incident Matching
 *
 * Analyzes use case assessment data and finds the most relevant
 * real-world AI failures from the AIID database
 */

import OpenAI from 'openai';
import { aiidService } from '../integrations/aiid.service';
import type { AiidIncident, RiskRecommendationInput } from '../integrations/types';

// Lazy initialize OpenAI client (only on server side)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Use case context extracted from assessment data
 */
interface UseCaseContext {
  aiType: string[]; // 'GenAI', 'Agentic AI', 'ML Model', 'Computer Vision', etc.
  sector: string[]; // 'Healthcare', 'Finance', 'E-commerce', etc.
  technology: string[]; // 'LLM', 'RAG', 'Fine-tuning', 'Vision Models', etc.
  useCase: string; // Primary use case description
  capabilities: string[]; // Key AI capabilities
  riskAreas: string[]; // Identified risk areas from assessment
  deployment: string; // Deployment model (cloud, on-prem, edge, etc.)
  userFacing: boolean; // Whether the system directly interacts with end users
}

/**
 * Incident match result with relevance scoring
 */
interface IncidentMatch {
  incident: AiidIncident;
  relevanceScore: number; // 0-100
  matchReasons: string[]; // Why this incident is relevant
  lessonsLearned: string; // AI-extracted lessons for this use case
}

/**
 * Extract structured context from assessment data
 */
function extractUseCaseContext(input: RiskRecommendationInput): UseCaseContext {
  const { assessmentData } = input;

  // Extract AI type
  const aiType: string[] = [];
  const technology: string[] = [];
  const capabilities: string[] = [];
  const riskAreas: string[] = [];

  // Determine AI type from model types
  if (assessmentData.technicalFeasibility?.modelTypes) {
    assessmentData.technicalFeasibility.modelTypes.forEach((type) => {
      if (type.toLowerCase().includes('llm') || type.toLowerCase().includes('language')) {
        aiType.push('GenAI');
        technology.push('LLM');
      }
      if (type.toLowerCase().includes('vision') || type.toLowerCase().includes('image')) {
        aiType.push('Computer Vision');
        technology.push('Vision Model');
      }
      if (type.toLowerCase().includes('multimodal')) {
        aiType.push('Multimodal AI');
        technology.push('Multimodal Model');
      }
    });
  }

  // Check for agentic AI
  if (
    assessmentData.technicalFeasibility?.agentArchitecture ||
    assessmentData.technicalFeasibility?.agentCapabilities
  ) {
    aiType.push('Agentic AI');
    technology.push('AI Agent');

    if (assessmentData.technicalFeasibility.agentCapabilities) {
      capabilities.push(...assessmentData.technicalFeasibility.agentCapabilities);
    }
  }

  // Extract use case
  const useCase =
    assessmentData.businessFeasibility?.genAIUseCase ||
    assessmentData.businessFeasibility?.interactionPattern ||
    'AI System';

  // Extract deployment model
  const deployment =
    assessmentData.technicalFeasibility?.deploymentModels?.[0] || 'Cloud-based';

  // Determine if user-facing
  const userFacing =
    assessmentData.businessFeasibility?.userInteractionModes &&
    assessmentData.businessFeasibility.userInteractionModes.length > 0;

  // Extract risk areas
  if (assessmentData.riskAssessment?.modelRisks) {
    riskAreas.push(...Object.keys(assessmentData.riskAssessment.modelRisks));
  }
  if (assessmentData.riskAssessment?.agentRisks) {
    riskAreas.push(...Object.keys(assessmentData.riskAssessment.agentRisks));
  }
  if (assessmentData.ethicalImpact?.contentGeneration?.risks) {
    riskAreas.push(...assessmentData.ethicalImpact.contentGeneration.risks);
  }
  if (assessmentData.ethicalImpact?.ethicalConsiderations?.potentialHarmAreas) {
    riskAreas.push(...assessmentData.ethicalImpact.ethicalConsiderations.potentialHarmAreas);
  }

  // Infer sector from use case or context (basic heuristics)
  const sector: string[] = [];
  const useCaseLower = useCase.toLowerCase();
  if (useCaseLower.includes('health') || useCaseLower.includes('medical')) {
    sector.push('Healthcare');
  }
  if (useCaseLower.includes('finance') || useCaseLower.includes('banking')) {
    sector.push('Finance');
  }
  if (useCaseLower.includes('retail') || useCaseLower.includes('commerce')) {
    sector.push('E-commerce', 'Retail');
  }
  if (useCaseLower.includes('education') || useCaseLower.includes('learning')) {
    sector.push('Education');
  }

  return {
    aiType: [...new Set(aiType)],
    sector: [...new Set(sector)],
    technology: [...new Set(technology)],
    useCase,
    capabilities,
    riskAreas: [...new Set(riskAreas)],
    deployment,
    userFacing,
  };
}

/**
 * Use AI to generate search queries for incident matching
 */
async function generateSearchQueries(context: UseCaseContext): Promise<string[]> {
  const prompt = `You are an AI safety expert analyzing a new AI system to find relevant real-world AI failures and incidents.

Use Case Context:
- AI Type: ${context.aiType.join(', ') || 'Not specified'}
- Technology: ${context.technology.join(', ') || 'Not specified'}
- Primary Use Case: ${context.useCase}
- Sector: ${context.sector.join(', ') || 'General'}
- Capabilities: ${context.capabilities.join(', ') || 'Not specified'}
- Risk Areas: ${context.riskAreas.join(', ') || 'Not specified'}
- Deployment: ${context.deployment}
- User-Facing: ${context.userFacing ? 'Yes' : 'No'}

Generate 5-7 search queries to find the most relevant AI incidents and failures from a database of 800+ incidents. Focus on:
1. Similar AI technologies and use cases
2. Same or related industries/sectors
3. Common failure modes and risks
4. Similar deployment scenarios
5. User-facing vs internal systems

Return ONLY a JSON array of search query strings, no additional text.
Example: ["LLM hallucination healthcare", "chatbot misinformation", "AI bias hiring"]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI safety expert. Return only valid JSON arrays of search queries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const queries = JSON.parse(content);
    return Array.isArray(queries) ? queries : [];
  } catch (error) {
    console.error('[Incident Matcher] Failed to generate search queries:', error);

    // Fallback to basic queries based on context
    const fallbackQueries = [];
    if (context.technology.length > 0) {
      fallbackQueries.push(context.technology[0]);
    }
    if (context.useCase) {
      fallbackQueries.push(context.useCase);
    }
    if (context.sector.length > 0) {
      fallbackQueries.push(`${context.sector[0]} AI`);
    }
    return fallbackQueries.slice(0, 5);
  }
}

/**
 * Score incident relevance based on context matching
 */
function scoreIncidentRelevance(incident: AiidIncident, context: UseCaseContext): number {
  let score = 0;
  const matchReasons: string[] = [];

  // Technology match (40 points max)
  if (incident.technology && context.technology.length > 0) {
    const techMatches = incident.technology.filter((t) =>
      context.technology.some((ct) => t.toLowerCase().includes(ct.toLowerCase()))
    );
    if (techMatches.length > 0) {
      score += Math.min(40, techMatches.length * 15);
      matchReasons.push(`Technology: ${techMatches.join(', ')}`);
    }
  }

  // Sector match (30 points max)
  if (incident.sector && context.sector.length > 0) {
    const sectorMatches = incident.sector.filter((s) =>
      context.sector.some((cs) => s.toLowerCase().includes(cs.toLowerCase()))
    );
    if (sectorMatches.length > 0) {
      score += Math.min(30, sectorMatches.length * 15);
      matchReasons.push(`Sector: ${sectorMatches.join(', ')}`);
    }
  }

  // Harm severity boost (10 points for high severity)
  if (incident.harmSeverity !== undefined && incident.harmSeverity >= 3) {
    score += 10;
    matchReasons.push(`High harm severity (${incident.harmSeverity}/5)`);
  }

  // Recent incidents get a boost (10 points for last 3 years)
  if (incident.date) {
    const incidentYear = new Date(incident.date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - incidentYear <= 3) {
      score += 10;
      matchReasons.push(`Recent incident (${incidentYear})`);
    }
  }

  // Case studies and detailed reports boost (10 points)
  if (incident.reports && incident.reports.length >= 3) {
    score += 10;
    matchReasons.push(`Well-documented (${incident.reports.length} reports)`);
  }

  return Math.min(100, score); // Cap at 100
}

/**
 * Extract lessons learned using AI
 */
async function extractLessonsLearned(
  incident: AiidIncident,
  context: UseCaseContext
): Promise<string> {
  const prompt = `You are an AI safety expert extracting actionable lessons from an AI incident.

Incident: ${incident.title}
Description: ${incident.description}
Harm Type: ${incident.harmType?.join(', ') || 'Not specified'}
Failure Cause: ${incident.failureCause?.join(', ') || 'Not specified'}

Target Use Case Context:
- AI Type: ${context.aiType.join(', ')}
- Technology: ${context.technology.join(', ')}
- Use Case: ${context.useCase}
- Sector: ${context.sector.join(', ') || 'General'}

Extract 2-3 key actionable lessons this incident provides for the target use case. Focus on:
1. What went wrong and why
2. How to prevent similar failures
3. Specific mitigations or safeguards

Return a concise paragraph (3-5 sentences) suitable for display in a dashboard.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI safety expert. Provide concise, actionable lessons from AI incidents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content?.trim() || 'No lessons extracted.';
  } catch (error) {
    console.error('[Incident Matcher] Failed to extract lessons:', error);
    return `This incident demonstrates potential risks in ${incident.harmType?.join(', ') || 'AI systems'}. Review the full incident details for mitigation strategies.`;
  }
}

/**
 * Main AI Agent: Find most relevant incidents for a use case
 */
export async function findRelevantIncidents(
  input: RiskRecommendationInput,
  topN: number = 10
): Promise<IncidentMatch[]> {
  console.log('[Incident Matcher] Starting AI-powered incident matching...');

  // Step 1: Extract use case context
  const context = extractUseCaseContext(input);
  console.log('[Incident Matcher] Use case context:', {
    aiType: context.aiType,
    technology: context.technology,
    useCase: context.useCase,
    sector: context.sector,
  });

  // Step 2: Generate search queries using AI
  const searchQueries = await generateSearchQueries(context);
  console.log('[Incident Matcher] Generated search queries:', searchQueries);

  // Step 3: Search AIID for incidents matching queries
  const allIncidents: AiidIncident[] = [];
  for (const query of searchQueries) {
    console.log('[Incident Matcher] Searching AIID with query:', query);
    const results = await aiidService.searchIncidents(query, 20);
    console.log('[Incident Matcher] Found ${results.length} incidents for query:', query);
    allIncidents.push(...results);
  }

  // Remove duplicates
  const uniqueIncidents = Array.from(
    new Map(allIncidents.map((inc) => [inc.incidentId, inc])).values()
  );

  console.log('[Incident Matcher] Found ${uniqueIncidents.length} unique incidents from searches');

  // Step 4: Score each incident by relevance
  const scoredIncidents = uniqueIncidents.map((incident) => {
    const score = scoreIncidentRelevance(incident, context);
    const matchReasons: string[] = [];

    // Collect match reasons based on scoring logic
    if (incident.technology && context.technology.length > 0) {
      const techMatches = incident.technology.filter((t) =>
        context.technology.some((ct) => t.toLowerCase().includes(ct.toLowerCase()))
      );
      if (techMatches.length > 0) {
        matchReasons.push(`Technology: ${techMatches.join(', ')}`);
      }
    }

    if (incident.sector && context.sector.length > 0) {
      const sectorMatches = incident.sector.filter((s) =>
        context.sector.some((cs) => s.toLowerCase().includes(cs.toLowerCase()))
      );
      if (sectorMatches.length > 0) {
        matchReasons.push(`Sector: ${sectorMatches.join(', ')}`);
      }
    }

    if (incident.harmSeverity !== undefined && incident.harmSeverity >= 3) {
      matchReasons.push(`High harm severity (${incident.harmSeverity}/5)`);
    }

    return {
      incident: { ...incident, relevanceScore: score },
      relevanceScore: score,
      matchReasons,
      lessonsLearned: '', // Will be filled in next step
    };
  });

  // Step 5: Sort by relevance and take top N
  const topIncidents = scoredIncidents
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topN);

  console.log('[Incident Matcher] Top incidents by relevance:', {
    count: topIncidents.length,
    scores: topIncidents.map((m) => m.relevanceScore),
  });

  // Step 6: Extract lessons learned for top incidents (parallel processing)
  const incidentsWithLessons = await Promise.all(
    topIncidents.map(async (match) => {
      const lessons = await extractLessonsLearned(match.incident, context);
      return {
        ...match,
        lessonsLearned: lessons,
      };
    })
  );

  console.log('[Incident Matcher] Completed incident matching with lessons learned');

  return incidentsWithLessons;
}
