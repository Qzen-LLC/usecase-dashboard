// Build StepsData from formatted QnA (shape from /api/get-assess-questions or /api/get-assess-question-templates)
export interface QnAItem {
  id: string;
  text: string;
  type: string;
  stage: string;
  options: Array<{ id: string; text: string; questionId: string }>;
  answers: Array<{ id: string; value: string; questionId: string; optionId?: string }>;
}

export interface StepsData {
  dataReadiness?: any;
  riskAssessment?: any;
  technicalFeasibility?: any;
  businessFeasibility?: any;
  ethicalImpact?: any;
  vendorAssessment?: any;
}

const norm = (s: any) => String(s || '').trim();

export function buildStepsDataFromQnA(items: QnAItem[]): StepsData {
  const steps: StepsData = {
    dataReadiness: {},
    riskAssessment: { dataProtection: {}, operatingJurisdictions: {} },
    technicalFeasibility: {},
    businessFeasibility: {},
    ethicalImpact: {},
    vendorAssessment: {}
  };

  const setIfMatch = (src: any, key: string, value: string, patterns: string[]) => {
    if (patterns.some(p => value.toLowerCase().includes(p))) src[key] = value;
  };

  for (const q of items || []) {
    const stage = String(q.stage || '').toUpperCase();
    const qText = norm(q.text).toLowerCase();
    const labels: string[] = (q.answers || []).map(a => norm(a.value));

    if (stage === 'DATA_READINESS') {
      for (const label of labels) {
        (steps.dataReadiness as any).dataTypes = (steps.dataReadiness as any).dataTypes || [];
        if (/record|biometric|child|financial|health|pii|personal/i.test(label)) (steps.dataReadiness as any).dataTypes.push(label);
        if (/cross\s*-?border|cross border|international transfer/i.test(label) || qText.includes('cross-border')) (steps.dataReadiness as any).crossBorderTransfer = true;
        setIfMatch(steps.dataReadiness, 'dataVolume', label, ['record', 'volume', 'gb', 'tb', 'mb']);
        setIfMatch(steps.dataReadiness, 'dataUpdate', label, ['real-time', 'realtime', 'batch', 'daily', 'weekly', 'hourly']);
        setIfMatch(steps.dataReadiness, 'dataRetention', label, ['year', 'month', 'retention']);
      }
    }

    if (stage === 'RISK_ASSESSMENT') {
      for (const label of labels) {
        if (/eu\b|europe|us\b|usa|uae|gcc|apac|emea|apj|gdpr|uk|india|singapore|canada/i.test(label) || qText.includes('jurisdiction')) {
          const region = 'General';
          (steps.riskAssessment as any).operatingJurisdictions[region] = (steps.riskAssessment as any).operatingJurisdictions[region] || [];
          (steps.riskAssessment as any).operatingJurisdictions[region].push(label);
        }
        setIfMatch(steps.riskAssessment, 'complianceReporting', label, ['minimal', 'basic', 'enhanced', 'comprehensive', 'reporting']);
        setIfMatch(steps.riskAssessment, 'riskTolerance', label, ['low', 'medium', 'high']);
        if (/gdpr|hipaa|finra|pci/i.test(label)) {
          (steps.riskAssessment as any).dataProtection = (steps.riskAssessment as any).dataProtection || {};
          (steps.riskAssessment as any).dataProtection.jurisdictions = (steps.riskAssessment as any).dataProtection.jurisdictions || [];
          (steps.riskAssessment as any).dataProtection.jurisdictions.push(label);
        }
      }
    }

    if (stage === 'TECHNICAL_FEASIBILITY') {
      for (const label of labels) {
        setIfMatch(steps.technicalFeasibility, 'authentication', label, ['basic', 'oauth', 'none', 'mfa', 'sso']);
        setIfMatch(steps.technicalFeasibility, 'encryption', label, ['encryption', 'none', 'aes', 'tls', 'at rest', 'in transit']);
        setIfMatch(steps.technicalFeasibility, 'accessControl', label, ['public', 'private', 'role', 'rbac']);
        setIfMatch(steps.technicalFeasibility, 'incidentResponse', label, ['incident', 'ir plan', 'none']);
        setIfMatch(steps.technicalFeasibility, 'apiSecurity', label, ['api']);
        // Extract Model Type for GenAI detection
        if (/model\s*type|generative|llm|large language|multi-modal/i.test(qText)) {
          (steps.technicalFeasibility as any).modelTypes = (steps.technicalFeasibility as any).modelTypes || [];
          if (!(steps.technicalFeasibility as any).modelTypes.includes(label)) {
            (steps.technicalFeasibility as any).modelTypes.push(label);
          }
        }
      }
    }

    if (stage === 'BUSINESS_FEASIBILITY') {
      for (const label of labels) {
        setIfMatch(steps.businessFeasibility, 'businessCriticality', label, ['mission critical', 'business critical', 'critical']);
        setIfMatch(steps.businessFeasibility, 'sla', label, ['99.999', '99.99', '99.9', 'sla']);
        setIfMatch(steps.businessFeasibility, 'disasterRecovery', label, ['dr', 'disaster', 'none', 'rpo', 'rto']);
        setIfMatch(steps.businessFeasibility, 'changeManagement', label, ['change', 'ad-hoc', 'structured', 'itil']);
      }
    }

    if (stage === 'ETHICAL_IMPACT') {
      for (const label of labels) {
        setIfMatch(steps.ethicalImpact, 'biasDetection', label, ['bias', 'none']);
        setIfMatch(steps.ethicalImpact, 'humanOversight', label, ['oversight', 'none', 'human-in-the-loop']);
        setIfMatch(steps.ethicalImpact, 'transparencyLevel', label, ['transparency', 'low', 'medium', 'high']);
        setIfMatch(steps.ethicalImpact, 'appealProcess', label, ['appeal', 'none']);
      }
    }

    if (/vendor|third[-\s]?party/i.test(qText)) {
      const count = labels.map(l => parseInt(l, 10)).find(n => !isNaN(n));
      if (typeof count === 'number') (steps.vendorAssessment as any).vendorCount = count;
    }
  }

  return steps;
}


