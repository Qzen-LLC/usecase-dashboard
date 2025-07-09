-- ================================================
-- COMPLETE ISO 42001 DATA INSERTION FOR SUPABASE
-- ================================================

-- ================================================
-- ISO 42001 CLAUSES DATA (7 main clauses)
-- ================================================

INSERT INTO "Iso42001Clause" ("clauseId", "title", "description", "orderIndex") VALUES
('4', 'Context of the Organization', 'Understand the organization''s context and establish the scope of the AI Management System.', 1),
('5', 'Leadership', 'Establish leadership commitment and organizational structure for AI management.', 2),
('6', 'Planning', 'Plan actions based on context, stakeholders, risks, and opportunities for AI systems.', 3),
('7', 'Support', 'Provide necessary resources, competence, awareness, communication, and documentation for the AIMS.', 4),
('8', 'Operation', 'Implement and control processes for AI system lifecycle management and risk treatment.', 5),
('9', 'Performance Evaluation', 'Monitor, measure, analyze, evaluate, audit, and review the AIMS performance.', 6),
('10', 'Improvement', 'Implement nonconformity management and continual improvement processes.', 7)
ON CONFLICT ("clauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- ISO 42001 SUBCLAUSES DATA (24 subclauses)
-- ================================================

INSERT INTO "Iso42001Subclause" ("subclauseId", "title", "summary", "questions", "evidenceExamples", "orderIndex", "clauseId") VALUES
-- Clause 4: Context of the Organization
('4.1', 'Understanding the Organization and Its Context', 'Determine external and internal issues relevant to the organization''s purpose and its AIMS', 
 ARRAY['What internal factors influence our AIMS?', 'What external factors influence our AIMS?', 'How does our use/development of AI align with our business strategy?'], 
 ARRAY['Context analysis document (PESTLE, SWOT focused on AI)', 'Documentation of internal/external issues', 'Strategic planning documents referencing AI'], 1, '4'),

('4.2', 'Understanding the Needs and Expectations of Interested Parties', 'Identify interested parties relevant to the AIMS and their requirements/expectations concerning AI', 
 ARRAY['Who are the interested parties for our AI systems?', 'What are their relevant needs, expectations, and requirements?', 'How do we capture and review these requirements?'], 
 ARRAY['Stakeholder analysis matrix/register', 'List of applicable legal/regulatory requirements for AI', 'Records of communication with stakeholders'], 2, '4'),

('4.3', 'Determining the Scope of the AI Management System', 'Define the boundaries and applicability of the AIMS within the organization', 
 ARRAY['What organizational units, processes, locations are included in the AIMS?', 'Which specific AI systems or applications are covered?', 'What stages of the AI lifecycle are included?'], 
 ARRAY['Documented AIMS Scope Statement'], 3, '4'),

('4.4', 'AI Management System', 'Establish, implement, maintain, and continually improve the AIMS in accordance with ISO 42001 requirements', 
 ARRAY['Do we have the necessary processes and documentation established for the AIMS?', 'Are these processes being followed?', 'Are there mechanisms for maintaining and updating the AIMS?'], 
 ARRAY['The AIMS documentation itself (policies, procedures)', 'Records of implementation activities', 'Management review records', 'Audit results'], 4, '4'),

-- Clause 5: Leadership
('5.1', 'Leadership and Commitment', 'Top management must demonstrate leadership by ensuring policy/objectives alignment, resource availability, integration, communication, and promoting improvement', 
 ARRAY['How does top management show active involvement and support for the AIMS?', 'Are AIMS objectives aligned with strategic goals?', 'Are sufficient resources allocated?'], 
 ARRAY['Management meeting minutes discussing AIMS', 'Resource allocation records (budget, staffing)', 'Internal communications from leadership'], 1, '5'),

('5.2', 'Policy', 'Establish, communicate, and maintain an AI Policy appropriate to the organization''s context', 
 ARRAY['Is there a documented AI Policy?', 'Does it include commitments to requirements and continual improvement?', 'Does it align with organizational AI principles/ethics?'], 
 ARRAY['The documented AI Policy', 'Communication records (emails, intranet posts)', 'Training materials covering the policy'], 2, '5'),

('5.3', 'Organizational Roles, Responsibilities, and Authorities', 'Assign and communicate responsibilities and authorities for roles relevant to the AIMS', 
 ARRAY['Who is ultimately accountable for the AIMS?', 'Who is responsible for specific AIMS tasks?', 'Are these roles, responsibilities, and authorities documented and communicated?'], 
 ARRAY['Organization chart showing AIMS roles', 'Documented role descriptions', 'Responsibility Assignment Matrix (RACI)'], 3, '5'),

-- Clause 6: Planning
('6.1', 'Actions to Address Risks and Opportunities', 'Plan actions based on context, stakeholders, risks, and opportunities. Conduct AI risk assessments, plan risk treatments, and assess AI system impacts', 
 ARRAY['Do we have a process for identifying risks and opportunities related to the AIMS?', 'Is there a defined AI risk assessment methodology?', 'Are risks related to AI systems systematically identified and assessed?'], 
 ARRAY['Risk management framework/policy/procedure', 'AI Risk Assessment Methodology', 'Risk assessment reports per AI system', 'AI Risk Register', 'AI Risk Treatment Plan'], 1, '6'),

('6.2', 'AI Objectives and Planning to Achieve Them', 'Establish measurable AIMS objectives aligned with the AI policy and plan how to achieve them', 
 ARRAY['What are the specific, measurable objectives for our AIMS?', 'Are they consistent with the AI policy and organizational goals?', 'What actions, resources, responsibilities, and timelines are defined?'], 
 ARRAY['Documented AIMS Objectives', 'Action plans linked to objectives', 'Performance indicators (KPIs) for objectives', 'Management review records discussing objectives progress'], 2, '6'),

-- Clause 7: Support
('7.1', 'Resources', 'Determine and provide the resources needed for the AIMS', 
 ARRAY['What resources (human, financial, technological, infrastructure) are needed?', 'Have these resources been identified and allocated?'], 
 ARRAY['Budget approvals', 'Staffing plans', 'Technology acquisition records', 'Facility plans'], 1, '7'),

('7.2', 'Competence', 'Ensure personnel involved in the AIMS are competent based on education, training, or experience', 
 ARRAY['What competencies are required for different AIMS roles?', 'How do we ensure individuals possess these competencies?', 'Are training needs identified and addressed?'], 
 ARRAY['Job descriptions with competency requirements', 'Competency matrix', 'Training plans and records', 'Performance reviews', 'Certifications'], 2, '7'),

('7.3', 'Awareness', 'Ensure relevant personnel are aware of the AI policy, their contribution, and the implications of non-conformance', 
 ARRAY['Are staff aware of the AI Policy?', 'Do they understand how their work contributes to the AIMS and AI ethics?', 'Are they aware of the benefits of effective AI governance?'], 
 ARRAY['Awareness training materials and attendance logs', 'Internal communications (newsletters, posters)', 'Onboarding materials'], 3, '7'),

('7.4', 'Communication', 'Determine and implement internal and external communications relevant to the AIMS', 
 ARRAY['What needs to be communicated about the AIMS?', 'When, how, and with whom does communication occur?', 'Who is responsible for communication?'], 
 ARRAY['Communication plan/matrix', 'Records of communications (meeting minutes, emails, public statements)'], 4, '7'),

('7.5', 'Documented Information', 'Manage documented information required by the standard and necessary for AIMS effectiveness', 
 ARRAY['What documentation is required by ISO 42001?', 'What other documentation do we need for our AIMS to be effective?', 'How do we ensure documents are properly identified, formatted, reviewed, approved, version controlled?'], 
 ARRAY['Document control procedure', 'Master document list / Document register', 'Version history in documents', 'Access control records', 'Backup procedures'], 5, '7'),

-- Clause 8: Operation
('8.1', 'Operational Planning and Control', 'Plan, implement, and control processes to meet requirements, implement actions from Clause 6, manage changes, and control outsourced processes', 
 ARRAY['How are operational processes (related to AI development/deployment/use) planned and controlled?', 'How are changes to these processes or AI systems managed?', 'How do we control processes outsourced to third parties?'], 
 ARRAY['Standard Operating Procedures (SOPs) for AI lifecycle stages', 'Change management procedures and records', 'Supplier contracts and oversight procedures'], 1, '8'),

('8.2', 'AI Risk Assessment (Operational)', 'Perform AI risk assessments operationally (at planned intervals or upon significant changes)', 
 ARRAY['How often are AI risk assessments reviewed and updated?', 'What triggers an ad-hoc risk assessment?'], 
 ARRAY['Schedule/plan for risk assessment reviews', 'Updated risk assessment reports'], 2, '8'),

('8.3', 'AI Risk Treatment (Operational)', 'Implement the AI risk treatment plan', 
 ARRAY['Are the controls defined in the risk treatment plan actually implemented?', 'Is there evidence of control operation?'], 
 ARRAY['Records of control implementation (configuration settings, logs, procedure execution records)', 'Completed checklists', 'Training records related to specific controls'], 3, '8'),

('8.4', 'AI System Lifecycle', 'Define and implement processes for managing the entire AI system lifecycle consistent with policy, objectives, and impact assessments', 
 ARRAY['Do we have documented processes for each stage?', 'How are AI principles embedded in these processes?', 'How is documentation managed throughout the lifecycle?'], 
 ARRAY['Documented AI system lifecycle process description', 'Project plans', 'Requirements specifications', 'Design documents', 'Data processing procedures'], 4, '8'),

('8.5', 'Third-Party Relationships', 'Manage risks associated with third-party suppliers/partners involved in the AI lifecycle', 
 ARRAY['How do we identify and assess risks related to third-party AI components or services?', 'Are AI-specific requirements included in contracts?', 'How do we monitor third-party performance?'], 
 ARRAY['Third-party risk management procedure', 'Supplier assessment questionnaires/reports', 'Contracts with AI clauses', 'Supplier audit reports'], 5, '8'),

-- Clause 9: Performance Evaluation
('9.1', 'Monitoring, Measurement, Analysis, and Evaluation', 'Determine what needs monitoring/measuring, the methods, frequency, and how results are analyzed/evaluated', 
 ARRAY['What aspects of the AIMS and AI systems are monitored/measured?', 'What methods are used?', 'How often is data collected and analyzed?', 'Who analyzes/evaluates?', 'How are results used?'], 
 ARRAY['Monitoring procedure', 'Defined metrics/KPIs', 'Monitoring logs/reports', 'Performance dashboards', 'Analysis reports'], 1, '9'),

('9.2', 'Internal Audit', 'Conduct internal audits at planned intervals to ensure the AIMS conforms to requirements and is effectively implemented', 
 ARRAY['Is there an audit program?', 'Are audits conducted by objective auditors?', 'Are criteria/scope defined?', 'Are results reported?', 'Are nonconformities addressed?'], 
 ARRAY['Internal audit procedure', 'Audit programme/schedule', 'Audit plans/reports', 'Auditor competence records', 'Nonconformity reports'], 2, '9'),

('9.3', 'Management Review', 'Top management must review the AIMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness', 
 ARRAY['Are reviews conducted regularly?', 'Does review cover required inputs?', 'Are decisions made regarding improvements/changes?', 'Are minutes documented?'], 
 ARRAY['Management review procedure', 'Review schedule/agendas/minutes', 'Action items tracker'], 3, '9'),

-- Clause 10: Improvement
('10.1', 'Nonconformity and Corrective Action', 'React to nonconformities, evaluate need for action, implement corrective actions, review effectiveness, and update AIMS if needed', 
 ARRAY['Is there a process for nonconformities?', 'How is correction handled?', 'Is root cause analysis performed?', 'How are corrective actions tracked and verified?', 'Are changes made to AIMS?'], 
 ARRAY['Corrective action procedure', 'Nonconformity register', 'Root cause analysis records', 'Corrective action plans/verification'], 1, '10'),

('10.2', 'Continual Improvement', 'Continually improve the suitability, adequacy, and effectiveness of the AIMS', 
 ARRAY['How does the organization use results to drive improvement?', 'Is there evidence of ongoing efforts?'], 
 ARRAY['Management review outputs', 'Updated policies/procedures', 'Improvement project records', 'Trend analysis'], 2, '10')
ON CONFLICT ("subclauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"summary" = EXCLUDED."summary",
"questions" = EXCLUDED."questions",
"evidenceExamples" = EXCLUDED."evidenceExamples",
"orderIndex" = EXCLUDED."orderIndex",
"clauseId" = EXCLUDED."clauseId";

-- ================================================
-- ISO 42001 ANNEX CATEGORIES DATA (7 categories)
-- ================================================

INSERT INTO "Iso42001AnnexCategory" ("categoryId", "title", "description", "orderIndex") VALUES
('A.5', 'Organizational Policies and Governance', 'Establish organizational policies and governance frameworks for AI systems.', 1),
('A.6', 'Internal Organization', 'Define internal organizational structure and roles for AI management.', 2),
('A.7', 'Resources for AI Systems', 'Manage human, computational, data, and system resources for AI systems.', 3),
('A.8', 'AI System Lifecycle', 'Implement comprehensive AI system lifecycle management processes.', 4),
('A.9', 'Data for AI Systems', 'Establish data management practices for AI systems throughout their lifecycle.', 5),
('A.10', 'Information and Communication Technology (ICT)', 'Implement ICT security and resilience measures for AI systems.', 6),
('A.11', 'Third-Party Relationships', 'Manage risks and requirements in third-party AI relationships.', 7)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- ISO 42001 ANNEX ITEMS DATA (37 items)
-- ================================================

INSERT INTO "Iso42001AnnexItem" ("itemId", "title", "description", "guidance", "orderIndex", "categoryId") VALUES
-- A.5: Organizational Policies and Governance
('A.5.1.1', 'Policies for AI', 'Management direction and support for AI via policies', 'Management should define and endorse a set of policies to provide clear direction and support for AI development and use within the organization', 1, 'A.5'),
('A.5.2.1', 'AI Governance Framework', 'Establishment of a governance structure for AI oversight', 'An AI governance framework, including roles, responsibilities, processes, and oversight mechanisms, should be established and maintained', 2, 'A.5'),
('A.5.3.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All AI system related responsibilities should be defined and allocated', 3, 'A.5'),
('A.5.3.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated', 4, 'A.5'),
('A.5.4.1', 'Accountability for AI Systems', 'Assigning accountability for AI systems', 'Accountability should be assigned for the establishment, implementation, maintenance, monitoring, evaluation and improvement of the AIMS', 5, 'A.5'),
('A.5.5.1', 'Contact with Authorities', 'Maintaining contact with relevant authorities', 'Appropriate contacts with relevant authorities should be maintained', 6, 'A.5'),
('A.5.5.2', 'Contact with Special Interest Groups', 'Maintaining contact with special interest groups', 'Appropriate contacts with special interest groups and other specialist forums should be maintained', 7, 'A.5'),
('A.5.6.1', 'AI in Project Management', 'Integrating AI aspects into project management', 'AI should be integrated into the organization''s project management', 8, 'A.5'),

-- A.6: Internal Organization
('A.6.1.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All responsibilities related to the development, deployment, operation, and governance of AI systems should be clearly defined and allocated', 1, 'A.6'),
('A.6.1.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification', 2, 'A.6'),

-- A.7: Resources for AI Systems
('A.7.1.1', 'Identification of Resources', 'Identifying resources needed for AI', 'Resources necessary for the development, operation, and maintenance of AI systems should be identified and managed', 1, 'A.7'),
('A.7.2.1', 'Computational Resources', 'Managing computational resources for AI', 'Computational resources required for AI systems should be managed throughout their lifecycle', 2, 'A.7'),
('A.7.3.1', 'Data Resources', 'Managing data resources for AI', 'Data resources required for AI systems should be managed throughout their lifecycle', 3, 'A.7'),
('A.7.4.1', 'System Resources', 'Managing system resources for AI', 'System resources required for AI systems, including tools and infrastructure, should be managed throughout their lifecycle', 4, 'A.7'),
('A.7.5.1', 'Human Resources', 'Managing human resources for AI', 'Human resources required for AI systems, including roles, competencies, and training, should be managed throughout their lifecycle', 5, 'A.7'),

-- A.8: AI System Lifecycle
('A.8.1.1', 'AI System Lifecycle Management', 'Establishing and managing a defined AI lifecycle process', 'A defined lifecycle process should be established and managed for AI systems, covering stages from conception through retirement', 1, 'A.8'),
('A.8.2.1', 'AI System Requirements Analysis', 'Analyzing and specifying AI system requirements', 'Requirements for AI systems, including functional, non-functional, data, ethical, legal, and societal aspects, should be analyzed and specified', 2, 'A.8'),
('A.8.3.1', 'AI System Design', 'Designing AI systems based on requirements', 'AI systems should be designed based on specified requirements, considering architecture, models, data handling, and interaction mechanisms', 3, 'A.8'),
('A.8.4.1', 'Data Acquisition and Preparation', 'Acquiring and preparing data for AI systems', 'Data for AI systems should be acquired, pre-processed, and prepared according to requirements and quality criteria', 4, 'A.8'),
('A.8.5.1', 'Model Building and Evaluation', 'Building, training, and evaluating AI models', 'AI models should be built, trained, tuned, and evaluated using appropriate techniques and metrics', 5, 'A.8'),
('A.8.6.1', 'AI System Verification and Validation', 'Verifying and validating AI systems', 'AI systems should be verified and validated against requirements before deployment', 6, 'A.8'),
('A.8.7.1', 'AI System Deployment', 'Deploying AI systems into the operational environment', 'AI systems should be deployed into the operational environment according to planned procedures', 7, 'A.8'),
('A.8.8.1', 'AI System Operation and Monitoring', 'Operating and monitoring AI systems', 'Deployed AI systems should be operated and monitored for performance, behaviour, and compliance with requirements', 8, 'A.8'),
('A.8.9.1', 'AI System Maintenance and Retirement', 'Maintaining and retiring AI systems', 'AI systems should be maintained throughout their operational life and retired securely when no longer needed', 9, 'A.8'),

-- A.9: Data for AI Systems
('A.9.1.1', 'Data Quality for AI Systems', 'Processes to ensure data quality characteristics', 'Processes should be implemented to ensure that data used for developing and operating AI systems meets defined quality criteria', 1, 'A.9'),
('A.9.2.1', 'Data Acquisition', 'Managing the acquisition of data for AI', 'Data acquisition processes should ensure data is obtained legally, ethically, and according to specified requirements', 2, 'A.9'),
('A.9.3.1', 'Data Preparation', 'Preparing data for use in AI systems', 'Data should be prepared (cleaned, transformed, annotated) suitable for its intended use in AI system development and operation', 3, 'A.9'),
('A.9.4.1', 'Data Provenance', 'Documenting the origin and history of data', 'Information about the origin, history, and processing steps applied to data (provenance) should be documented and maintained', 4, 'A.9'),
('A.9.5.1', 'Data Privacy', 'Protecting privacy in data used for AI', 'Privacy requirements should be addressed throughout the data lifecycle, including anonymization or pseudonymization where appropriate', 5, 'A.9'),
('A.9.6.1', 'Data Handling', 'Securely handling data throughout its lifecycle', 'Data should be handled securely, including storage, access control, transmission, and disposal, according to its classification', 6, 'A.9'),

-- A.10: Information and Communication Technology (ICT)
('A.10.1.1', 'Information Security for AI Systems', 'Application of information security controls to AI systems', 'Information security requirements and controls should be applied throughout the AI system lifecycle to protect confidentiality, integrity, and availability', 1, 'A.10'),
('A.10.2.1', 'Security of AI Models', 'Protecting AI models from threats', 'AI models should be protected against threats such as unauthorized access, modification, theft, or poisoning', 2, 'A.10'),
('A.10.3.1', 'Security of AI Data', 'Protecting data used by AI systems', 'Data used in AI systems should be protected according to information security policies and data classification', 3, 'A.10'),
('A.10.4.1', 'Resilience of AI Systems', 'Ensuring AI systems are resilient to failures and attacks', 'AI systems should be designed and operated to be resilient against failures, errors, and attacks', 4, 'A.10'),

-- A.11: Third-Party Relationships
('A.11.1.1', 'Management of Third-Party AI Related Risks', 'Managing risks when using third-party AI systems, components, or data', 'Risks associated with third-party provision or use of AI systems, components, services, or data should be identified, assessed, and managed', 1, 'A.11'),
('A.11.2.1', 'Supplier Agreements for AI', 'Including AI-specific requirements in supplier agreements', 'Agreements with third parties supplying AI systems, components, services, or data should include relevant AI-specific requirements', 2, 'A.11'),
('A.11.3.1', 'Monitoring of Third-Party AI Services', 'Monitoring third-party compliance and performance', 'The performance and compliance of third parties involved in the AI system lifecycle should be monitored according to agreements', 3, 'A.11')
ON CONFLICT ("itemId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"guidance" = EXCLUDED."guidance",
"orderIndex" = EXCLUDED."orderIndex",
"categoryId" = EXCLUDED."categoryId";