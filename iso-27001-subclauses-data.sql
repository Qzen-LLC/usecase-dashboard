-- ================================================
-- ISO 27001 SUBCLAUSES DATA INSERTION
-- Inserts all 21 subclauses with questions and evidence examples
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 27001 SUBCLAUSES DATA (21 subclauses)
-- ================================================

INSERT INTO "Iso27001Subclause" ("id", "subclauseId", "title", "summary", "questions", "evidenceExamples", "orderIndex", "clauseId") VALUES
-- Clause 4: Context of the Organization
(gen_random_uuid()::TEXT, '4.1', 'Understanding the Organization and Its Context', 'Determine external and internal issues relevant to the organization''s purpose and its ISMS', 
 ARRAY['What business goals or challenges impact our information security?', 'Which external factors, such as laws, suppliers, or technology trends, change how we protect data?', 'Do these factors affect decisions about risk and security measures?'], 
 ARRAY['Context analysis document', 'SWOT or PESTLE analysis', 'Meeting notes or planning documents'], 1, '4'),

(gen_random_uuid()::TEXT, '4.2', 'Understanding the Needs and Expectations of Interested Parties', 'Identify interested parties relevant to the ISMS and their requirements/expectations concerning information security', 
 ARRAY['Who are our stakeholders, such as customers, regulators, partners, and suppliers?', 'What specific security requirements or expectations do they have?'], 
 ARRAY['Stakeholder list', 'Contracts or SLAs mentioning security', 'Customer requirement tracking sheet'], 2, '4'),

(gen_random_uuid()::TEXT, '4.3', 'Determining the Scope of the ISMS', 'Define the boundaries and applicability of the ISMS within the organization', 
 ARRAY['What systems, locations, and processes are included in our ISMS scope?', 'Are exclusions documented and justified?'], 
 ARRAY['Scope statement', 'ISMS boundaries document', 'Exclusion list with rationale'], 3, '4'),

(gen_random_uuid()::TEXT, '4.4', 'Information Security Management System', 'Establish, implement, maintain, and continually improve the ISMS', 
 ARRAY['Do we have a defined ISMS process?', 'Does it include continuous improvement steps?'], 
 ARRAY['ISMS process documentation', 'Improvement plans', 'Tracking reports for ISMS activities'], 4, '4'),

-- Clause 5: Leadership
(gen_random_uuid()::TEXT, '5.1', 'Leadership and Commitment', 'Top management shall demonstrate leadership and commitment with respect to the ISMS', 
 ARRAY['Are managers setting priorities for security?', 'Do they allocate enough resources to security?'], 
 ARRAY['Meeting minutes showing leadership involvement', 'Budget and resource allocation documents'], 1, '5'),

(gen_random_uuid()::TEXT, '5.2', 'Information Security Policy', 'Top management shall establish an information security policy', 
 ARRAY['Do we have a signed and approved security policy?', 'Has the policy been communicated to all relevant staff?'], 
 ARRAY['Policy document', 'Communication records or intranet posts'], 2, '5'),

(gen_random_uuid()::TEXT, '5.3', 'Organizational Roles, Responsibilities, and Authorities', 'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated', 
 ARRAY['Are security roles and responsibilities defined in job descriptions?', 'Do staff know whom to contact for security issues?'], 
 ARRAY['Organizational chart', 'Responsibility matrix', 'Job description documents'], 3, '5'),

-- Clause 6: Planning
(gen_random_uuid()::TEXT, '6.1', 'Information Security Risk Assessment', 'The organization shall define and apply an information security risk assessment process', 
 ARRAY['Do we follow a documented process for spotting risks?', 'Are risk levels (high, medium, low) defined clearly?', 'Do we update the risk register regularly?'], 
 ARRAY['Risk assessment methodology', 'Risk register', 'Recent risk assessment reports'], 1, '6'),

(gen_random_uuid()::TEXT, '6.2', 'Information Security Risk Treatment', 'The organization shall define and apply an information security risk treatment process', 
 ARRAY['Do we have treatment plans for significant risks?', 'Are chosen controls linked to risk priorities and documented?'], 
 ARRAY['Risk treatment plans', 'Control selection documents', 'Approval records'], 2, '6'),

(gen_random_uuid()::TEXT, '6.3', 'Information Security Objectives', 'The organization shall establish information security objectives at relevant functions and levels', 
 ARRAY['Do we have measurable security objectives?', 'Are they aligned with our security policy?'], 
 ARRAY['Objective setting documentation', 'Performance measurement records'], 3, '6'),

-- Clause 7: Support
(gen_random_uuid()::TEXT, '7.1', 'Resources', 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance, and continual improvement of the ISMS', 
 ARRAY['Do we have sufficient resources allocated to ISMS tasks?', 'Are tools and infrastructure adequate for security requirements?'], 
 ARRAY['Resource allocation plan', 'Budget approvals', 'Tool purchase records'], 1, '7'),

(gen_random_uuid()::TEXT, '7.2', 'Competence', 'The organization shall ensure that persons doing work under its control are competent on the basis of appropriate education, training, or experience', 
 ARRAY['Have we identified required competencies for security roles?', 'Do we offer relevant training or certifications?'], 
 ARRAY['Training matrix', 'Employee certifications', 'Skill assessment records'], 2, '7'),

(gen_random_uuid()::TEXT, '7.3', 'Awareness', 'Persons doing work under the organization''s control shall be aware of the information security policy and their contribution to the effectiveness of the ISMS', 
 ARRAY['Have all employees received security awareness training?', 'Do they know how to report incidents?'], 
 ARRAY['Training attendance records', 'Awareness posters or guides'], 3, '7'),

(gen_random_uuid()::TEXT, '7.4', 'Communication', 'The organization shall determine the need for internal and external communications relevant to the ISMS', 
 ARRAY['Do we have a communication plan for security messages?', 'Do we inform stakeholders about incidents promptly?'], 
 ARRAY['Communication plan', 'Incident notification logs', 'Emails to stakeholders'], 4, '7'),

(gen_random_uuid()::TEXT, '7.5', 'Documented Information', 'The organization''s ISMS shall include documented information required by this document and documented information determined by the organization as being necessary for the effectiveness of the ISMS', 
 ARRAY['Do we version-control security documents?', 'Are sensitive records protected properly?'], 
 ARRAY['Document register', 'Access-controlled folders', 'Record logs'], 5, '7'),

-- Clause 8: Operation
(gen_random_uuid()::TEXT, '8.1', 'Operational Planning and Control', 'The organization shall plan, implement, and control the processes needed to meet information security requirements', 
 ARRAY['Do we have documented procedures for operational tasks?', 'Are controls applied consistently?'], 
 ARRAY['Operational plans', 'Checklists or logs of daily security checks'], 1, '8'),

(gen_random_uuid()::TEXT, '8.2', 'Risk Assessment During Operations', 'The organization shall perform risk assessments at planned intervals or when significant changes occur', 
 ARRAY['Do we assess risks for all major changes?', 'Are decisions documented based on updated risk findings?'], 
 ARRAY['Change risk logs', 'Updated risk register entries'], 2, '8'),

(gen_random_uuid()::TEXT, '8.3', 'Risk Treatment During Operations', 'The organization shall implement the risk treatment plan', 
 ARRAY['Do we track results of risk treatments?', 'Are failed treatments escalated quickly?'], 
 ARRAY['Risk treatment reports', 'Incident follow-up records'], 3, '8'),

-- Clause 9: Performance Evaluation
(gen_random_uuid()::TEXT, '9.1', 'Monitoring, Measurement, Analysis, and Evaluation', 'The organization shall evaluate the information security performance and the effectiveness of the ISMS', 
 ARRAY['Do we have defined KPIs for security?', 'Are results reviewed periodically?'], 
 ARRAY['Monitoring reports', 'Performance dashboards'], 1, '9'),

(gen_random_uuid()::TEXT, '9.2', 'Internal Audit', 'The organization shall conduct internal audits at planned intervals to provide information on whether the ISMS conforms to planned arrangements', 
 ARRAY['Is there a documented audit plan?', 'Are findings recorded and resolved promptly?'], 
 ARRAY['Audit schedules', 'Audit reports', 'Corrective action tracking logs'], 2, '9'),

(gen_random_uuid()::TEXT, '9.3', 'Management Review', 'Top management shall review the organization''s ISMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness', 
 ARRAY['Are reviews held regularly with documented outputs?', 'Are improvement decisions tracked and implemented?'], 
 ARRAY['Meeting minutes', 'Improvement action logs'], 3, '9'),

-- Clause 10: Improvement
(gen_random_uuid()::TEXT, '10.1', 'Nonconformity and Corrective Action', 'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it', 
 ARRAY['Do we track nonconformities in a register?', 'Are corrective actions tested and verified?'], 
 ARRAY['Nonconformity logs', 'Corrective action plans', 'Verification records'], 1, '10'),

(gen_random_uuid()::TEXT, '10.2', 'Continual Improvement', 'The organization shall continually improve the suitability, adequacy, and effectiveness of the ISMS', 
 ARRAY['Do we have a process for suggesting and implementing improvements?', 'Are improvements reviewed by leadership?'], 
 ARRAY['Improvement plan document', 'Lessons learned reports', 'Approval records'], 2, '10')

ON CONFLICT ("subclauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"summary" = EXCLUDED."summary",
"questions" = EXCLUDED."questions",
"evidenceExamples" = EXCLUDED."evidenceExamples",
"orderIndex" = EXCLUDED."orderIndex",
"clauseId" = EXCLUDED."clauseId";
