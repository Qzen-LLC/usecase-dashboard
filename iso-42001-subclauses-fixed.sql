-- ================================================
-- FIXED ISO 42001 SUBCLAUSES DATA INSERTION
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 42001 SUBCLAUSES DATA (24 subclauses)
-- ================================================

INSERT INTO "Iso42001Subclause" ("id", "subclauseId", "title", "summary", "questions", "evidenceExamples", "orderIndex", "clauseId") VALUES
-- Clause 4: Context of the Organization
(gen_random_uuid()::TEXT, '4.1', 'Understanding the Organization and Its Context', 'Determine external and internal issues relevant to the organization''s purpose and its AIMS', 
 ARRAY['What internal factors influence our AIMS?', 'What external factors influence our AIMS?', 'How does our use/development of AI align with our business strategy?'], 
 ARRAY['Context analysis document (PESTLE, SWOT focused on AI)', 'Documentation of internal/external issues', 'Strategic planning documents referencing AI'], 1, '4'),

(gen_random_uuid()::TEXT, '4.2', 'Understanding the Needs and Expectations of Interested Parties', 'Identify interested parties relevant to the AIMS and their requirements/expectations concerning AI', 
 ARRAY['Who are the interested parties for our AI systems?', 'What are their relevant needs, expectations, and requirements?', 'How do we capture and review these requirements?'], 
 ARRAY['Stakeholder analysis matrix/register', 'List of applicable legal/regulatory requirements for AI', 'Records of communication with stakeholders'], 2, '4'),

(gen_random_uuid()::TEXT, '4.3', 'Determining the Scope of the AI Management System', 'Define the boundaries and applicability of the AIMS within the organization', 
 ARRAY['What organizational units, processes, locations are included in the AIMS?', 'Which specific AI systems or applications are covered?', 'What stages of the AI lifecycle are included?'], 
 ARRAY['Documented AIMS Scope Statement'], 3, '4'),

(gen_random_uuid()::TEXT, '4.4', 'AI Management System', 'Establish, implement, maintain, and continually improve the AIMS in accordance with ISO 42001 requirements', 
 ARRAY['Do we have the necessary processes and documentation established for the AIMS?', 'Are these processes being followed?', 'Are there mechanisms for maintaining and updating the AIMS?'], 
 ARRAY['The AIMS documentation itself (policies, procedures)', 'Records of implementation activities', 'Management review records', 'Audit results'], 4, '4'),

-- Clause 5: Leadership
(gen_random_uuid()::TEXT, '5.1', 'Leadership and Commitment', 'Top management must demonstrate leadership by ensuring policy/objectives alignment, resource availability, integration, communication, and promoting improvement', 
 ARRAY['How does top management show active involvement and support for the AIMS?', 'Are AIMS objectives aligned with strategic goals?', 'Are sufficient resources allocated?'], 
 ARRAY['Management meeting minutes discussing AIMS', 'Resource allocation records (budget, staffing)', 'Internal communications from leadership'], 1, '5'),

(gen_random_uuid()::TEXT, '5.2', 'Policy', 'Establish, communicate, and maintain an AI Policy appropriate to the organization''s context', 
 ARRAY['Is there a documented AI Policy?', 'Does it include commitments to requirements and continual improvement?', 'Does it align with organizational AI principles/ethics?'], 
 ARRAY['The documented AI Policy', 'Communication records (emails, intranet posts)', 'Training materials covering the policy'], 2, '5'),

(gen_random_uuid()::TEXT, '5.3', 'Organizational Roles, Responsibilities, and Authorities', 'Assign and communicate responsibilities and authorities for roles relevant to the AIMS', 
 ARRAY['Who is ultimately accountable for the AIMS?', 'Who is responsible for specific AIMS tasks?', 'Are these roles, responsibilities, and authorities documented and communicated?'], 
 ARRAY['Organization chart showing AIMS roles', 'Documented role descriptions', 'Responsibility Assignment Matrix (RACI)'], 3, '5'),

-- Clause 6: Planning
(gen_random_uuid()::TEXT, '6.1', 'Actions to Address Risks and Opportunities', 'Plan actions based on context, stakeholders, risks, and opportunities. Conduct AI risk assessments, plan risk treatments, and assess AI system impacts', 
 ARRAY['Do we have a process for identifying risks and opportunities related to the AIMS?', 'Is there a defined AI risk assessment methodology?', 'Are risks related to AI systems systematically identified and assessed?'], 
 ARRAY['Risk management framework/policy/procedure', 'AI Risk Assessment Methodology', 'Risk assessment reports per AI system', 'AI Risk Register', 'AI Risk Treatment Plan'], 1, '6'),

(gen_random_uuid()::TEXT, '6.2', 'AI Objectives and Planning to Achieve Them', 'Establish measurable AIMS objectives aligned with the AI policy and plan how to achieve them', 
 ARRAY['What are the specific, measurable objectives for our AIMS?', 'Are they consistent with the AI policy and organizational goals?', 'What actions, resources, responsibilities, and timelines are defined?'], 
 ARRAY['Documented AIMS Objectives', 'Action plans linked to objectives', 'Performance indicators (KPIs) for objectives', 'Management review records discussing objectives progress'], 2, '6'),

-- Clause 7: Support
(gen_random_uuid()::TEXT, '7.1', 'Resources', 'Determine and provide the resources needed for the AIMS', 
 ARRAY['What resources (human, financial, technological, infrastructure) are needed?', 'Have these resources been identified and allocated?'], 
 ARRAY['Budget approvals', 'Staffing plans', 'Technology acquisition records', 'Facility plans'], 1, '7'),

(gen_random_uuid()::TEXT, '7.2', 'Competence', 'Ensure personnel involved in the AIMS are competent based on education, training, or experience', 
 ARRAY['What competencies are required for different AIMS roles?', 'How do we ensure individuals possess these competencies?', 'Are training needs identified and addressed?'], 
 ARRAY['Job descriptions with competency requirements', 'Competency matrix', 'Training plans and records', 'Performance reviews', 'Certifications'], 2, '7'),

(gen_random_uuid()::TEXT, '7.3', 'Awareness', 'Ensure relevant personnel are aware of the AI policy, their contribution, and the implications of non-conformance', 
 ARRAY['Are staff aware of the AI Policy?', 'Do they understand how their work contributes to the AIMS and AI ethics?', 'Are they aware of the benefits of effective AI governance?'], 
 ARRAY['Awareness training materials and attendance logs', 'Internal communications (newsletters, posters)', 'Onboarding materials'], 3, '7'),

(gen_random_uuid()::TEXT, '7.4', 'Communication', 'Determine and implement internal and external communications relevant to the AIMS', 
 ARRAY['What needs to be communicated about the AIMS?', 'When, how, and with whom does communication occur?', 'Who is responsible for communication?'], 
 ARRAY['Communication plan/matrix', 'Records of communications (meeting minutes, emails, public statements)'], 4, '7'),

(gen_random_uuid()::TEXT, '7.5', 'Documented Information', 'Manage documented information required by the standard and necessary for AIMS effectiveness', 
 ARRAY['What documentation is required by ISO 42001?', 'What other documentation do we need for our AIMS to be effective?', 'How do we ensure documents are properly identified, formatted, reviewed, approved, version controlled?'], 
 ARRAY['Document control procedure', 'Master document list / Document register', 'Version history in documents', 'Access control records', 'Backup procedures'], 5, '7'),

-- Clause 8: Operation
(gen_random_uuid()::TEXT, '8.1', 'Operational Planning and Control', 'Plan, implement, and control processes to meet requirements, implement actions from Clause 6, manage changes, and control outsourced processes', 
 ARRAY['How are operational processes (related to AI development/deployment/use) planned and controlled?', 'How are changes to these processes or AI systems managed?', 'How do we control processes outsourced to third parties?'], 
 ARRAY['Standard Operating Procedures (SOPs) for AI lifecycle stages', 'Change management procedures and records', 'Supplier contracts and oversight procedures'], 1, '8'),

(gen_random_uuid()::TEXT, '8.2', 'AI Risk Assessment (Operational)', 'Perform AI risk assessments operationally (at planned intervals or upon significant changes)', 
 ARRAY['How often are AI risk assessments reviewed and updated?', 'What triggers an ad-hoc risk assessment?'], 
 ARRAY['Schedule/plan for risk assessment reviews', 'Updated risk assessment reports'], 2, '8'),

(gen_random_uuid()::TEXT, '8.3', 'AI Risk Treatment (Operational)', 'Implement the AI risk treatment plan', 
 ARRAY['Are the controls defined in the risk treatment plan actually implemented?', 'Is there evidence of control operation?'], 
 ARRAY['Records of control implementation (configuration settings, logs, procedure execution records)', 'Completed checklists', 'Training records related to specific controls'], 3, '8'),

(gen_random_uuid()::TEXT, '8.4', 'AI System Lifecycle', 'Define and implement processes for managing the entire AI system lifecycle consistent with policy, objectives, and impact assessments', 
 ARRAY['Do we have documented processes for each stage?', 'How are AI principles embedded in these processes?', 'How is documentation managed throughout the lifecycle?'], 
 ARRAY['Documented AI system lifecycle process description', 'Project plans', 'Requirements specifications', 'Design documents', 'Data processing procedures'], 4, '8'),

(gen_random_uuid()::TEXT, '8.5', 'Third-Party Relationships', 'Manage risks associated with third-party suppliers/partners involved in the AI lifecycle', 
 ARRAY['How do we identify and assess risks related to third-party AI components or services?', 'Are AI-specific requirements included in contracts?', 'How do we monitor third-party performance?'], 
 ARRAY['Third-party risk management procedure', 'Supplier assessment questionnaires/reports', 'Contracts with AI clauses', 'Supplier audit reports'], 5, '8'),

-- Clause 9: Performance Evaluation
(gen_random_uuid()::TEXT, '9.1', 'Monitoring, Measurement, Analysis, and Evaluation', 'Determine what needs monitoring/measuring, the methods, frequency, and how results are analyzed/evaluated', 
 ARRAY['What aspects of the AIMS and AI systems are monitored/measured?', 'What methods are used?', 'How often is data collected and analyzed?', 'Who analyzes/evaluates?', 'How are results used?'], 
 ARRAY['Monitoring procedure', 'Defined metrics/KPIs', 'Monitoring logs/reports', 'Performance dashboards', 'Analysis reports'], 1, '9'),

(gen_random_uuid()::TEXT, '9.2', 'Internal Audit', 'Conduct internal audits at planned intervals to ensure the AIMS conforms to requirements and is effectively implemented', 
 ARRAY['Is there an audit program?', 'Are audits conducted by objective auditors?', 'Are criteria/scope defined?', 'Are results reported?', 'Are nonconformities addressed?'], 
 ARRAY['Internal audit procedure', 'Audit programme/schedule', 'Audit plans/reports', 'Auditor competence records', 'Nonconformity reports'], 2, '9'),

(gen_random_uuid()::TEXT, '9.3', 'Management Review', 'Top management must review the AIMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness', 
 ARRAY['Are reviews conducted regularly?', 'Does review cover required inputs?', 'Are decisions made regarding improvements/changes?', 'Are minutes documented?'], 
 ARRAY['Management review procedure', 'Review schedule/agendas/minutes', 'Action items tracker'], 3, '9'),

-- Clause 10: Improvement
(gen_random_uuid()::TEXT, '10.1', 'Nonconformity and Corrective Action', 'React to nonconformities, evaluate need for action, implement corrective actions, review effectiveness, and update AIMS if needed', 
 ARRAY['Is there a process for nonconformities?', 'How is correction handled?', 'Is root cause analysis performed?', 'How are corrective actions tracked and verified?', 'Are changes made to AIMS?'], 
 ARRAY['Corrective action procedure', 'Nonconformity register', 'Root cause analysis records', 'Corrective action plans/verification'], 1, '10'),

(gen_random_uuid()::TEXT, '10.2', 'Continual Improvement', 'Continually improve the suitability, adequacy, and effectiveness of the AIMS', 
 ARRAY['How does the organization use results to drive improvement?', 'Is there evidence of ongoing efforts?'], 
 ARRAY['Management review outputs', 'Updated policies/procedures', 'Improvement project records', 'Trend analysis'], 2, '10')
ON CONFLICT ("subclauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"summary" = EXCLUDED."summary",
"questions" = EXCLUDED."questions",
"evidenceExamples" = EXCLUDED."evidenceExamples",
"orderIndex" = EXCLUDED."orderIndex",
"clauseId" = EXCLUDED."clauseId";