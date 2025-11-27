/**
 * AI Incident Database (AIID) GraphQL Service
 *
 * Provides access to 800+ real-world AI failures and incidents
 * GraphQL API: https://incidentdatabase.ai/api/graphql
 */

import type {
  AiidIncident,
  AiidReport,
  AiidEntity,
  AiidClassification,
  AiidClassificationAttribute,
} from './types';

const AIID_GRAPHQL_ENDPOINT = 'https://incidentdatabase.ai/api/graphql';

/**
 * GraphQL query to fetch incidents with minimal fields
 * Note: Removed 'text' and 'plain_text' fields from reports to reduce payload size
 */
const INCIDENTS_QUERY = `
  query GetIncidents {
    incidents {
      incident_id
      title
      description
      date

      reports {
        report_number
        title
        url
        date_published
        authors
      }

      AllegedDeployerOfAISystem {
        entity_id
        name
      }

      AllegedDeveloperOfAISystem {
        entity_id
        name
      }

      AllegedHarmedOrNearlyHarmedParties {
        entity_id
        name
      }
    }
  }
`;

/**
 * GraphQL query to fetch incident by ID
 */
const INCIDENT_BY_ID_QUERY = `
  query GetIncident($incidentId: Int!) {
    incident(filter: { incident_id: { EQ: $incidentId } }) {
      incident_id
      title
      description
      date
      epoch_date_published
      editor_notes
      editor_dissimilar_incidents
      editor_similar_incidents

      reports {
        report_number
        title
        url
        date_published
        date_downloaded
        authors
        submitters
        text
        plain_text
        language
        tags
        epoch_date_published
      }

      Alleged_deployer_of_AI_system {
        entity_id
        name
      }

      Alleged_developer_of_AI_system {
        entity_id
        name
      }

      Alleged_harmed_or_nearly_harmed_parties {
        entity_id
        name
      }
    }
  }
`;

/**
 * GraphQL query for classifications
 */
const CLASSIFICATIONS_QUERY = `
  query GetClassifications($incidentId: Int!) {
    classifications(filter: { incidents: { incident_id: { EQ: $incidentId } } }) {
      namespace
      attributes {
        short_name
        value_json
      }
    }
  }
`;

/**
 * Execute GraphQL query against AIID API
 */
async function executeGraphQLQuery<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    const requestBody = {
      query,
      variables,
    };

    console.log('[AIID Service] GraphQL Request:', {
      endpoint: AIID_GRAPHQL_ENDPOINT,
      queryPreview: query.substring(0, 200) + '...',
      variables,
    });

    const response = await fetch(AIID_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[AIID Service] GraphQL Response Status:', response.status, response.statusText);

    // Read response body regardless of status
    const result = await response.json();

    console.log('[AIID Service] GraphQL Response Body:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('[AIID Service] GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        errors: result.errors,
        body: result,
      });
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    if (result.errors) {
      console.error('[AIID Service] GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  } catch (error) {
    console.error('[AIID Service] GraphQL query failed:', error);
    throw error;
  }
}

/**
 * Parse classification attributes into structured data
 */
function parseClassificationAttributes(
  attributes: Array<{ short_name: string; value_json?: string }>
): AiidClassificationAttribute[] {
  return attributes.map((attr) => {
    const parsed: AiidClassificationAttribute = {
      short_name: attr.short_name,
      value_json: attr.value_json,
    };

    // Parse value_json if present
    if (attr.value_json) {
      try {
        const value = JSON.parse(attr.value_json);

        // Map specific classification fields
        if (attr.short_name === 'Harm Severity' && typeof value === 'number') {
          parsed.harm_severity = value;
        } else if (attr.short_name === 'Harm Type' && Array.isArray(value)) {
          parsed.harm_type = value;
        } else if (attr.short_name === 'Failure Cause' && Array.isArray(value)) {
          parsed.failure_cause = value;
        } else if (attr.short_name === 'Risk Domain' && Array.isArray(value)) {
          parsed.risk_domain = value;
        } else if (attr.short_name === 'Sector' && Array.isArray(value)) {
          parsed.sector = value;
        } else if (attr.short_name === 'Technology' && Array.isArray(value)) {
          parsed.technology = value;
        } else {
          // Store other fields dynamically
          parsed[attr.short_name.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      } catch (e) {
        // If parsing fails, keep as string
        console.warn(`[AIID Service] Failed to parse classification value: ${attr.short_name}`);
      }
    }

    return parsed;
  });
}

/**
 * Transform raw GraphQL response to AiidIncident
 */
function transformToAiidIncident(rawIncident: any, classifications?: AiidClassification[]): AiidIncident {
  const incident: AiidIncident = {
    incidentId: rawIncident.incident_id,
    title: rawIncident.title || 'Untitled Incident',
    description: rawIncident.description || '',
    date: rawIncident.date,
    reports: (rawIncident.reports || []).map((r: any) => ({
      report_number: r.report_number,
      title: r.title,
      url: r.url,
      date_published: r.date_published,
      authors: r.authors || [],
    })),
    deployers: rawIncident.AllegedDeployerOfAISystem || [],
    developers: rawIncident.AllegedDeveloperOfAISystem || [],
    harmedParties: rawIncident.AllegedHarmedOrNearlyHarmedParties || [],
    classifications: classifications || [],
  };

  // Extract computed fields from classifications
  if (classifications && classifications.length > 0) {
    const csetClassification = classifications.find((c) => c.namespace === 'CSET');
    const gmfClassification = classifications.find((c) => c.namespace === 'GMF');
    const mitClassification = classifications.find((c) => c.namespace === 'MIT');

    if (csetClassification) {
      const harmSeverityAttr = csetClassification.attributes.find((a) => a.short_name === 'Harm Severity');
      const harmTypeAttr = csetClassification.attributes.find((a) => a.short_name === 'Harm Type');

      if (harmSeverityAttr?.harm_severity !== undefined) {
        incident.harmSeverity = harmSeverityAttr.harm_severity;
      }

      if (harmTypeAttr?.harm_type) {
        incident.harmType = harmTypeAttr.harm_type;
      }
    }

    if (gmfClassification) {
      const failureCauseAttr = gmfClassification.attributes.find((a) => a.short_name === 'Failure Cause');
      if (failureCauseAttr?.failure_cause) {
        incident.failureCause = failureCauseAttr.failure_cause;
      }
    }

    if (mitClassification) {
      const riskDomainAttr = mitClassification.attributes.find((a) => a.short_name === 'Risk Domain');
      if (riskDomainAttr?.risk_domain) {
        incident.sector = riskDomainAttr.risk_domain;
      }
    }

    // Extract technology and sector from any classification
    for (const classification of classifications) {
      const techAttr = classification.attributes.find((a) => a.short_name === 'Technology');
      const sectorAttr = classification.attributes.find((a) => a.short_name === 'Sector');

      if (techAttr?.technology && !incident.technology) {
        incident.technology = techAttr.technology;
      }

      if (sectorAttr?.sector && !incident.sector) {
        incident.sector = sectorAttr.sector;
      }
    }
  }

  return incident;
}

/**
 * AIID Service Class
 */
export class AiidService {
  /**
   * Fetch all incidents with pagination
   */
  async getIncidents(limit: number = 50, skip: number = 0): Promise<AiidIncident[]> {
    try {
      console.log('[AIID Service] getIncidents called - fetching all incidents');

      const data = await executeGraphQLQuery<{ incidents: any[] }>(INCIDENTS_QUERY);

      console.log(`[AIID Service] GraphQL returned ${data?.incidents?.length || 0} incidents`);

      // Apply client-side pagination
      const paginatedIncidents = data.incidents.slice(skip, skip + limit);

      console.log(`[AIID Service] After pagination (skip: ${skip}, limit: ${limit}): ${paginatedIncidents.length} incidents`);

      // Fetch classifications for each incident (limited to paginated set)
      const incidentsWithClassifications = await Promise.all(
        paginatedIncidents.map(async (incident) => {
          const classifications = await this.getClassifications(incident.incident_id);
          return transformToAiidIncident(incident, classifications);
        })
      );

      return incidentsWithClassifications;
    } catch (error) {
      console.error('[AIID Service] Failed to fetch incidents:', error);
      return [];
    }
  }

  /**
   * Fetch incident by ID
   */
  async getIncidentById(incidentId: number): Promise<AiidIncident | null> {
    try {
      const data = await executeGraphQLQuery<{ incident: any }>(INCIDENT_BY_ID_QUERY, {
        incidentId,
      });

      if (!data.incident) {
        return null;
      }

      const classifications = await this.getClassifications(incidentId);
      return transformToAiidIncident(data.incident, classifications);
    } catch (error) {
      console.error(`[AIID Service] Failed to fetch incident ${incidentId}:`, error);
      return null;
    }
  }

  /**
   * Fetch classifications for an incident
   */
  async getClassifications(incidentId: number): Promise<AiidClassification[]> {
    try {
      const data = await executeGraphQLQuery<{ classifications: any[] }>(CLASSIFICATIONS_QUERY, {
        incidentId,
      });

      return (data.classifications || []).map((c) => ({
        namespace: c.namespace,
        attributes: parseClassificationAttributes(c.attributes),
      }));
    } catch (error) {
      console.error(`[AIID Service] Failed to fetch classifications for incident ${incidentId}:`, error);
      return [];
    }
  }

  /**
   * Search incidents by keyword
   */
  async searchIncidents(keyword: string, limit: number = 20): Promise<AiidIncident[]> {
    try {
      console.log('[AIID Service] searchIncidents called with:', { keyword, limit });

      // For now, fetch recent incidents and filter client-side
      // AIID GraphQL API may have limited search capabilities
      console.log('[AIID Service] Fetching 100 incidents from AIID...');
      const incidents = await this.getIncidents(100, 0);
      console.log('[AIID Service] Fetched ${incidents.length} incidents, filtering by keyword:', keyword);

      const filtered = incidents.filter(
        (incident) =>
          incident.title.toLowerCase().includes(keyword.toLowerCase()) ||
          incident.description.toLowerCase().includes(keyword.toLowerCase()) ||
          incident.reports.some((r) => r.title.toLowerCase().includes(keyword.toLowerCase()))
      );

      console.log('[AIID Service] Filtered to ${filtered.length} incidents matching keyword:', keyword);
      return filtered.slice(0, limit);
    } catch (error) {
      console.error('[AIID Service] Failed to search incidents:', error);
      return [];
    }
  }

  /**
   * Filter incidents by classification
   */
  async filterIncidentsByClassification(
    namespace: string,
    attributeName: string,
    attributeValue: any,
    limit: number = 20
  ): Promise<AiidIncident[]> {
    try {
      const incidents = await this.getIncidents(100, 0);

      const filtered = incidents.filter((incident) => {
        const classification = incident.classifications?.find((c) => c.namespace === namespace);
        if (!classification) return false;

        const attribute = classification.attributes.find((a) => a.short_name === attributeName);
        if (!attribute) return false;

        // Check if attribute matches value
        const attrKey = attributeName.toLowerCase().replace(/\s+/g, '_');
        const attrValue = (attribute as any)[attrKey];

        if (Array.isArray(attrValue)) {
          return attrValue.includes(attributeValue);
        }

        return attrValue === attributeValue;
      });

      return filtered.slice(0, limit);
    } catch (error) {
      console.error('[AIID Service] Failed to filter incidents:', error);
      return [];
    }
  }

  /**
   * Get statistics about AIID database
   */
  async getStatistics() {
    const incidents = await this.getIncidents(1000, 0);

    const harmSeverityCounts = new Map<number, number>();
    const sectorCounts = new Map<string, number>();
    const techCounts = new Map<string, number>();
    const failureCauseCounts = new Map<string, number>();

    incidents.forEach((incident) => {
      // Count harm severity
      if (incident.harmSeverity !== undefined) {
        harmSeverityCounts.set(
          incident.harmSeverity,
          (harmSeverityCounts.get(incident.harmSeverity) || 0) + 1
        );
      }

      // Count sectors
      incident.sector?.forEach((s) => {
        sectorCounts.set(s, (sectorCounts.get(s) || 0) + 1);
      });

      // Count technologies
      incident.technology?.forEach((t) => {
        techCounts.set(t, (techCounts.get(t) || 0) + 1);
      });

      // Count failure causes
      incident.failureCause?.forEach((f) => {
        failureCauseCounts.set(f, (failureCauseCounts.get(f) || 0) + 1);
      });
    });

    return {
      totalIncidents: incidents.length,
      harmSeverity: Object.fromEntries(harmSeverityCounts),
      topSectors: Array.from(sectorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topTechnologies: Array.from(techCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topFailureCauses: Array.from(failureCauseCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }
}

// Singleton instance
export const aiidService = new AiidService();
