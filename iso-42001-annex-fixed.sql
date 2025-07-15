-- ================================================
-- FIXED ISO 42001 ANNEX DATA INSERTION
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 42001 ANNEX CATEGORIES DATA (7 categories)
-- ================================================

INSERT INTO "Iso42001AnnexCategory" ("id", "categoryId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, 'A.5', 'Organizational Policies and Governance', 'Establish organizational policies and governance frameworks for AI systems.', 1),
(gen_random_uuid()::TEXT, 'A.6', 'Internal Organization', 'Define internal organizational structure and roles for AI management.', 2),
(gen_random_uuid()::TEXT, 'A.7', 'Resources for AI Systems', 'Manage human, computational, data, and system resources for AI systems.', 3),
(gen_random_uuid()::TEXT, 'A.8', 'AI System Lifecycle', 'Implement comprehensive AI system lifecycle management processes.', 4),
(gen_random_uuid()::TEXT, 'A.9', 'Data for AI Systems', 'Establish data management practices for AI systems throughout their lifecycle.', 5),
(gen_random_uuid()::TEXT, 'A.10', 'Information and Communication Technology (ICT)', 'Implement ICT security and resilience measures for AI systems.', 6),
(gen_random_uuid()::TEXT, 'A.11', 'Third-Party Relationships', 'Manage risks and requirements in third-party AI relationships.', 7)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- ISO 42001 ANNEX ITEMS DATA (37 items)
-- ================================================

INSERT INTO "Iso42001AnnexItem" ("id", "itemId", "title", "description", "guidance", "orderIndex", "categoryId") VALUES
-- A.5: Organizational Policies and Governance
(gen_random_uuid()::TEXT, 'A.5.1.1', 'Policies for AI', 'Management direction and support for AI via policies', 'Management should define and endorse a set of policies to provide clear direction and support for AI development and use within the organization', 1, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.2.1', 'AI Governance Framework', 'Establishment of a governance structure for AI oversight', 'An AI governance framework, including roles, responsibilities, processes, and oversight mechanisms, should be established and maintained', 2, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.3.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All AI system related responsibilities should be defined and allocated', 3, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.3.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated', 4, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.4.1', 'Accountability for AI Systems', 'Assigning accountability for AI systems', 'Accountability should be assigned for the establishment, implementation, maintenance, monitoring, evaluation and improvement of the AIMS', 5, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.5.1', 'Contact with Authorities', 'Maintaining contact with relevant authorities', 'Appropriate contacts with relevant authorities should be maintained', 6, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.5.2', 'Contact with Special Interest Groups', 'Maintaining contact with special interest groups', 'Appropriate contacts with special interest groups and other specialist forums should be maintained', 7, 'A.5'),
(gen_random_uuid()::TEXT, 'A.5.6.1', 'AI in Project Management', 'Integrating AI aspects into project management', 'AI should be integrated into the organization''s project management', 8, 'A.5'),

-- A.6: Internal Organization
(gen_random_uuid()::TEXT, 'A.6.1.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All responsibilities related to the development, deployment, operation, and governance of AI systems should be clearly defined and allocated', 1, 'A.6'),
(gen_random_uuid()::TEXT, 'A.6.1.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification', 2, 'A.6'),

-- A.7: Resources for AI Systems
(gen_random_uuid()::TEXT, 'A.7.1.1', 'Identification of Resources', 'Identifying resources needed for AI', 'Resources necessary for the development, operation, and maintenance of AI systems should be identified and managed', 1, 'A.7'),
(gen_random_uuid()::TEXT, 'A.7.2.1', 'Computational Resources', 'Managing computational resources for AI', 'Computational resources required for AI systems should be managed throughout their lifecycle', 2, 'A.7'),
(gen_random_uuid()::TEXT, 'A.7.3.1', 'Data Resources', 'Managing data resources for AI', 'Data resources required for AI systems should be managed throughout their lifecycle', 3, 'A.7'),
(gen_random_uuid()::TEXT, 'A.7.4.1', 'System Resources', 'Managing system resources for AI', 'System resources required for AI systems, including tools and infrastructure, should be managed throughout their lifecycle', 4, 'A.7'),
(gen_random_uuid()::TEXT, 'A.7.5.1', 'Human Resources', 'Managing human resources for AI', 'Human resources required for AI systems, including roles, competencies, and training, should be managed throughout their lifecycle', 5, 'A.7'),

-- A.8: AI System Lifecycle
(gen_random_uuid()::TEXT, 'A.8.1.1', 'AI System Lifecycle Management', 'Establishing and managing a defined AI lifecycle process', 'A defined lifecycle process should be established and managed for AI systems, covering stages from conception through retirement', 1, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.2.1', 'AI System Requirements Analysis', 'Analyzing and specifying AI system requirements', 'Requirements for AI systems, including functional, non-functional, data, ethical, legal, and societal aspects, should be analyzed and specified', 2, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.3.1', 'AI System Design', 'Designing AI systems based on requirements', 'AI systems should be designed based on specified requirements, considering architecture, models, data handling, and interaction mechanisms', 3, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.4.1', 'Data Acquisition and Preparation', 'Acquiring and preparing data for AI systems', 'Data for AI systems should be acquired, pre-processed, and prepared according to requirements and quality criteria', 4, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.5.1', 'Model Building and Evaluation', 'Building, training, and evaluating AI models', 'AI models should be built, trained, tuned, and evaluated using appropriate techniques and metrics', 5, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.6.1', 'AI System Verification and Validation', 'Verifying and validating AI systems', 'AI systems should be verified and validated against requirements before deployment', 6, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.7.1', 'AI System Deployment', 'Deploying AI systems into the operational environment', 'AI systems should be deployed into the operational environment according to planned procedures', 7, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.8.1', 'AI System Operation and Monitoring', 'Operating and monitoring AI systems', 'Deployed AI systems should be operated and monitored for performance, behaviour, and compliance with requirements', 8, 'A.8'),
(gen_random_uuid()::TEXT, 'A.8.9.1', 'AI System Maintenance and Retirement', 'Maintaining and retiring AI systems', 'AI systems should be maintained throughout their operational life and retired securely when no longer needed', 9, 'A.8'),

-- A.9: Data for AI Systems
(gen_random_uuid()::TEXT, 'A.9.1.1', 'Data Quality for AI Systems', 'Processes to ensure data quality characteristics', 'Processes should be implemented to ensure that data used for developing and operating AI systems meets defined quality criteria', 1, 'A.9'),
(gen_random_uuid()::TEXT, 'A.9.2.1', 'Data Acquisition', 'Managing the acquisition of data for AI', 'Data acquisition processes should ensure data is obtained legally, ethically, and according to specified requirements', 2, 'A.9'),
(gen_random_uuid()::TEXT, 'A.9.3.1', 'Data Preparation', 'Preparing data for use in AI systems', 'Data should be prepared (cleaned, transformed, annotated) suitable for its intended use in AI system development and operation', 3, 'A.9'),
(gen_random_uuid()::TEXT, 'A.9.4.1', 'Data Provenance', 'Documenting the origin and history of data', 'Information about the origin, history, and processing steps applied to data (provenance) should be documented and maintained', 4, 'A.9'),
(gen_random_uuid()::TEXT, 'A.9.5.1', 'Data Privacy', 'Protecting privacy in data used for AI', 'Privacy requirements should be addressed throughout the data lifecycle, including anonymization or pseudonymization where appropriate', 5, 'A.9'),
(gen_random_uuid()::TEXT, 'A.9.6.1', 'Data Handling', 'Securely handling data throughout its lifecycle', 'Data should be handled securely, including storage, access control, transmission, and disposal, according to its classification', 6, 'A.9'),

-- A.10: Information and Communication Technology (ICT)
(gen_random_uuid()::TEXT, 'A.10.1.1', 'Information Security for AI Systems', 'Application of information security controls to AI systems', 'Information security requirements and controls should be applied throughout the AI system lifecycle to protect confidentiality, integrity, and availability', 1, 'A.10'),
(gen_random_uuid()::TEXT, 'A.10.2.1', 'Security of AI Models', 'Protecting AI models from threats', 'AI models should be protected against threats such as unauthorized access, modification, theft, or poisoning', 2, 'A.10'),
(gen_random_uuid()::TEXT, 'A.10.3.1', 'Security of AI Data', 'Protecting data used by AI systems', 'Data used in AI systems should be protected according to information security policies and data classification', 3, 'A.10'),
(gen_random_uuid()::TEXT, 'A.10.4.1', 'Resilience of AI Systems', 'Ensuring AI systems are resilient to failures and attacks', 'AI systems should be designed and operated to be resilient against failures, errors, and attacks', 4, 'A.10'),

-- A.11: Third-Party Relationships
(gen_random_uuid()::TEXT, 'A.11.1.1', 'Management of Third-Party AI Related Risks', 'Managing risks when using third-party AI systems, components, or data', 'Risks associated with third-party provision or use of AI systems, components, services, or data should be identified, assessed, and managed', 1, 'A.11'),
(gen_random_uuid()::TEXT, 'A.11.2.1', 'Supplier Agreements for AI', 'Including AI-specific requirements in supplier agreements', 'Agreements with third parties supplying AI systems, components, services, or data should include relevant AI-specific requirements', 2, 'A.11'),
(gen_random_uuid()::TEXT, 'A.11.3.1', 'Monitoring of Third-Party AI Services', 'Monitoring third-party compliance and performance', 'The performance and compliance of third parties involved in the AI system lifecycle should be monitored according to agreements', 3, 'A.11')
ON CONFLICT ("itemId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"guidance" = EXCLUDED."guidance",
"orderIndex" = EXCLUDED."orderIndex",
"categoryId" = EXCLUDED."categoryId";