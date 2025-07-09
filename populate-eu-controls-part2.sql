-- EU AI Act Control Categories Population Script - Part 2 (Categories 6-13)
-- Run this in Supabase SQL Editor after running part 1

-- Insert Control Structures for Category 6
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '6.1', 'AI Act Compliance Policies and Guidelines', 'Establish policies and guidelines for EU AI Act compliance', 1, '6'),
(gen_random_uuid(), '6.2', 'AI Risk Response Planning', 'Plan and implement responses to AI system risks', 2, '6'),
(gen_random_uuid(), '6.3', 'Compliance with AI System Instructions', 'Ensure compliance with AI system instructions for use', 3, '6'),
(gen_random_uuid(), '6.4', 'System Risk Controls Documentation', 'Document and manage system risk controls comprehensively', 4, '6'),
(gen_random_uuid(), '6.5', 'Transparency and Explainability Evaluation', 'Ensure transparency and explainability of AI systems', 5, '6'),
(gen_random_uuid(), '6.6', 'AI Model Explainability', 'Maintain explainability and documentation of AI models', 6, '6'),
(gen_random_uuid(), '6.7', 'Technical Documentation Maintenance', 'Maintain up-to-date technical documentation', 7, '6'),
(gen_random_uuid(), '6.8', 'Data Assessment and Validation', 'Assess and validate input data quality', 8, '6'),
(gen_random_uuid(), '6.9', 'AI System Logging Implementation', 'Implement comprehensive logging for AI systems', 9, '6')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 6
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '6.1.1', 'Roles and Responsibilities Documentation', 'We document roles, responsibilities, and communication lines for AI risk management', 1, '6.1'),
(gen_random_uuid(), '6.1.2', 'Compliance Policies Development', 'We develop policies and guidelines for AI Act compliance', 2, '6.1'),
(gen_random_uuid(), '6.2.1', 'Risk Response Planning', 'We plan responses to AI system risks, including defining risk tolerance and mitigation strategies', 1, '6.2'),
(gen_random_uuid(), '6.3.1', 'Technical and Organizational Measures', 'We implement technical and organizational measures to adhere to AI system instructions for use', 1, '6.3'),
(gen_random_uuid(), '6.3.2', 'System Evaluation', 'We regularly evaluate safety, transparency, accountability, security, and resilience of AI systems', 2, '6.3'),
(gen_random_uuid(), '6.4.1', 'Legal Review', 'We conduct thorough legal reviews relevant to AI system deployment', 1, '6.4'),
(gen_random_uuid(), '6.4.2', 'Risk Prioritization', 'We prioritize risk responses based on impact, likelihood, and resources', 2, '6.4'),
(gen_random_uuid(), '6.4.3', 'Residual Risk Identification', 'We identify residual risks to users and stakeholders', 3, '6.4'),
(gen_random_uuid(), '6.4.4', 'Deployment Decision Evaluation', 'We evaluate if AI systems meet objectives and decide on deployment continuation', 4, '6.4'),
(gen_random_uuid(), '6.4.5', 'Cybersecurity Controls', 'We implement cybersecurity controls to protect AI models', 5, '6.4'),
(gen_random_uuid(), '6.4.6', 'Risk Controls Documentation', 'We document system risk controls, including third-party components', 6, '6.4'),
(gen_random_uuid(), '6.5.1', 'Compliance Updates', 'We regularly update compliance measures based on system or regulatory changes', 1, '6.5'),
(gen_random_uuid(), '6.6.1', 'Model Explanation and Repository', 'We explain AI models to ensure responsible use and maintain an AI systems repository', 1, '6.6'),
(gen_random_uuid(), '6.7.1', 'Documentation Updates', 'We maintain and update technical documentation reflecting system changes', 1, '6.7'),
(gen_random_uuid(), '6.8.1', 'Data Relevance Assessment', 'We assess input data relevance and representativeness', 1, '6.8'),
(gen_random_uuid(), '6.9.1', 'Automatic Logging', 'We implement automatic logging of AI system operations and retain logs appropriately', 1, '6.9')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 7
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '7.1', 'Fundamental Rights Impact Assessment Process Development', 'Develop comprehensive processes for fundamental rights impact assessments', 1, '7'),
(gen_random_uuid(), '7.2', 'AI System Usage Process Description', 'Document AI system usage processes and intended purposes', 2, '7'),
(gen_random_uuid(), '7.3', 'Impacted Groups Identification', 'Identify all groups potentially affected by AI systems', 3, '7'),
(gen_random_uuid(), '7.4', 'Data Assessment', 'Assess data compliance with legal frameworks', 4, '7'),
(gen_random_uuid(), '7.5', 'Impact Measurement Strategy', 'Develop strategies for measuring AI system impacts', 5, '7'),
(gen_random_uuid(), '7.6', 'Bias and Fairness Evaluation', 'Evaluate bias, fairness, and other critical issues', 6, '7'),
(gen_random_uuid(), '7.7', 'Risk Documentation', 'Document risks to health, safety, and fundamental rights', 7, '7'),
(gen_random_uuid(), '7.8', 'Assessment Documentation Maintenance', 'Maintain comprehensive assessment documentation', 8, '7'),
(gen_random_uuid(), '7.9', 'Assessment Integration', 'Integrate assessments with existing data protection frameworks', 9, '7'),
(gen_random_uuid(), '7.10', 'Dataset Documentation and Evaluation', 'Document datasets and ensure representative evaluations', 10, '7')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 7
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '7.1.1', 'Assessment Process Development', 'We develop a comprehensive process for fundamental rights impact assessments', 1, '7.1'),
(gen_random_uuid(), '7.2.1', 'Usage Process Documentation', 'We describe deployer processes for using high-risk AI systems, outlining intended purposes', 1, '7.2'),
(gen_random_uuid(), '7.3.1', 'Affected Groups Identification', 'We identify all natural persons and groups potentially affected by AI system usage', 1, '7.3'),
(gen_random_uuid(), '7.4.1', 'Legal Data Assessment', 'We assess data used by AI systems based on legal definitions (e.g., GDPR Article 3 (32))', 1, '7.4'),
(gen_random_uuid(), '7.5.1', 'Impact Measurement Development', 'We create and periodically re-evaluate strategies for measuring AI system impacts', 1, '7.5'),
(gen_random_uuid(), '7.6.1', 'Comprehensive Evaluation', 'We regularly evaluate bias, fairness, privacy, and environmental issues related to AI systems', 1, '7.6'),
(gen_random_uuid(), '7.7.1', 'Risk Documentation Process', 'We document known or foreseeable risks to health, safety, or fundamental rights', 1, '7.7'),
(gen_random_uuid(), '7.8.1', 'Documentation Maintenance', 'We maintain assessment documentation, including dates, results, and actions taken', 1, '7.8'),
(gen_random_uuid(), '7.9.1', 'DPIA Integration', 'We integrate fundamental rights impact assessments with existing data protection assessments', 1, '7.9'),
(gen_random_uuid(), '7.10.1', 'Dataset Specification', 'We specify input data and details about training, validation, and testing datasets', 1, '7.10'),
(gen_random_uuid(), '7.10.2', 'Human Subject Evaluation', 'We ensure representative evaluations when using human subjects', 2, '7.10')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 8
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '8.1', 'User Notification of AI System Use', 'Design AI systems to clearly notify users of AI interaction', 1, '8'),
(gen_random_uuid(), '8.2', 'Clear AI Indication for Users', 'Ensure clear communication when users are subject to AI systems', 2, '8'),
(gen_random_uuid(), '8.3', 'AI System Scope and Impact Definition', 'Define and document AI system scope, goals, and impacts', 3, '8'),
(gen_random_uuid(), '8.4', 'AI System Activity Records', 'Maintain comprehensive records of AI system activities', 4, '8')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 8
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '8.1.1', 'AI Interaction Design', 'We design AI systems to clearly indicate user interaction with AI', 1, '8.1'),
(gen_random_uuid(), '8.2.1', 'User Information', 'We inform users when they are subject to AI system usage', 1, '8.2'),
(gen_random_uuid(), '8.2.2', 'Clear Communication', 'We ensure AI indications are clear and understandable for reasonably informed users', 2, '8.2'),
(gen_random_uuid(), '8.3.1', 'Scope and Impact Documentation', 'We define and document AI system scope, goals, methods, and potential impacts', 1, '8.3'),
(gen_random_uuid(), '8.4.1', 'Activity Record Maintenance', 'We maintain accurate records of AI system activities, modifications, and third-party involvements', 1, '8.4')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 9
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '9.1', 'EU Database Registration', 'Complete conformity assessment and CE marking requirements', 1, '9'),
(gen_random_uuid(), '9.2', 'EU Database System Registration', 'Ensure AI systems are registered in the EU database', 2, '9'),
(gen_random_uuid(), '9.3', 'Technical Standards Identification', 'Identify necessary technical standards and certifications', 3, '9'),
(gen_random_uuid(), '9.4', 'Common Specifications Compliance', 'Comply with Commission-established specifications', 4, '9'),
(gen_random_uuid(), '9.5', 'Registration Records Management', 'Maintain records of registration activities', 5, '9'),
(gen_random_uuid(), '9.6', 'Database Entry Management', 'Ensure accurate and timely database entries', 6, '9'),
(gen_random_uuid(), '9.7', 'Registration Information Maintenance', 'Maintain current registration and conformity documentation', 7, '9')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 9
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '9.1.1', 'Conformity Assessment Procedures', 'We complete the relevant conformity assessment procedures', 1, '9.1'),
(gen_random_uuid(), '9.1.2', 'CE Marking Verification', 'We verify that high-risk AI systems have the required CE marking', 2, '9.1'),
(gen_random_uuid(), '9.2.1', 'Article 71 Registration', 'We ensure AI systems are registered in the EU database per Article 71', 1, '9.2'),
(gen_random_uuid(), '9.3.1', 'Standards and Certifications', 'We identify necessary technical standards and certifications for AI systems', 1, '9.3'),
(gen_random_uuid(), '9.4.1', 'Commission Specifications', 'We comply with common specifications established by the Commission', 1, '9.4'),
(gen_random_uuid(), '9.5.1', 'Registration Record Keeping', 'We keep records of all registration activities and updates', 1, '9.5'),
(gen_random_uuid(), '9.6.1', 'Data Entry Accuracy', 'We ensure timely and accurate data entry into the EU database', 1, '9.6'),
(gen_random_uuid(), '9.7.1', 'Information Currency', 'We maintain up-to-date registration information and comprehensive conformity documentation', 1, '9.7')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";