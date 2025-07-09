-- EU AI Act Control Categories Population Script
-- Run this in Supabase SQL Editor

-- Insert Control Categories
INSERT INTO "EuAiActControlCategory" (id, "categoryId", title, description, "orderIndex") VALUES
(gen_random_uuid(), '1', 'AI Literacy and Responsible AI Training', 'Ensure AI literacy and responsible AI training across the organization.', 1),
(gen_random_uuid(), '2', 'Transparency and Provision of Information to Deployers', 'Ensure transparency in AI system deployment and information provision.', 2),
(gen_random_uuid(), '3', 'Human Oversight', 'Establish effective human oversight mechanisms for AI systems.', 3),
(gen_random_uuid(), '4', 'Corrective Actions and Duty of Information', 'Implement corrective actions and maintain information duties for AI systems.', 4),
(gen_random_uuid(), '5', 'Responsibilities Along the AI Value Chain', 'Define and manage responsibilities throughout the AI value chain.', 5),
(gen_random_uuid(), '6', 'Risk Management and Compliance', 'Implement comprehensive risk management and compliance measures for AI systems.', 6),
(gen_random_uuid(), '7', 'Fundamental Rights Impact Assessment', 'Implement comprehensive fundamental rights impact assessments for AI systems.', 7),
(gen_random_uuid(), '8', 'Transparency Obligations', 'Implement transparency obligations for AI systems under the EU AI Act.', 8),
(gen_random_uuid(), '9', 'Registration and Conformity Assessment', 'Implement registration requirements and conformity assessments under the EU AI Act.', 9),
(gen_random_uuid(), '10', 'Regulatory Compliance and Documentation', 'Maintain regulatory compliance and comprehensive documentation for AI systems.', 10),
(gen_random_uuid(), '11', 'AI Lifecycle Risk Management', 'Implement comprehensive risk management throughout the AI system lifecycle.', 11),
(gen_random_uuid(), '12', 'Post-Deployment Monitoring and Incident Management', 'Implement comprehensive post-deployment monitoring and incident management for AI systems.', 12),
(gen_random_uuid(), '13', 'Continuous Monitoring and Incident Response', 'Maintain continuous monitoring and incident response capabilities for AI systems.', 13)
ON CONFLICT ("categoryId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex";

-- Insert Control Structures for Category 1
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '1.1', 'AI Literacy and Responsible AI Training', 'Establish AI literacy and responsible AI training programs', 1, '1'),
(gen_random_uuid(), '1.2', 'Regulatory Training and Response Procedures', 'Establish regulatory training and response procedures', 2, '1')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 1
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '1.1.1', 'Executive Leadership Responsibility', 'We ensure executive leadership takes responsibility for decisions related to AI risks', 1, '1.1'),
(gen_random_uuid(), '1.1.2', 'AI Literacy Training', 'We provide AI literacy and ethics training to relevant personnel', 2, '1.1'),
(gen_random_uuid(), '1.1.3', 'Communication Plan', 'We develop a clear and concise communication plan for informing workers about the use of high-risk AI systems', 3, '1.1'),
(gen_random_uuid(), '1.2.1', 'Roles and Responsibilities', 'We clearly define roles and responsibilities related to AI risk management', 1, '1.2'),
(gen_random_uuid(), '1.2.2', 'Regulatory Training', 'We train personnel on the requirements of the regulation and the process for responding to requests', 2, '1.2')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 2
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '2.1', 'Intended Use Description', 'Provide detailed descriptions of AI system intended use', 1, '2'),
(gen_random_uuid(), '2.2', 'Technical Documentation Review', 'Review and verify technical documentation', 2, '2'),
(gen_random_uuid(), '2.3', 'Record Maintenance of AI System Activities', 'Maintain accurate records of AI system activities', 3, '2'),
(gen_random_uuid(), '2.4', 'System Information Documentation', 'Document system information comprehensively', 4, '2')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 2
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '2.1.1', 'Intended Use Documentation', 'We provide detailed descriptions of the AI system''s intended use', 1, '2.1'),
(gen_random_uuid(), '2.2.1', 'Documentation Review', 'We review and verify technical documentation from providers', 1, '2.2'),
(gen_random_uuid(), '2.3.1', 'Activity Records', 'We maintain accurate records of all AI system activities, including modifications and third-party involvements', 1, '2.3'),
(gen_random_uuid(), '2.4.1', 'System Information', 'We document system information, including functionality, limitations, and risk controls', 1, '2.4'),
(gen_random_uuid(), '2.4.2', 'Forbidden Uses', 'We define and document forbidden uses and foresee potential misuse', 2, '2.4')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 3
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '3.1', 'Human Intervention Mechanisms', 'Define mechanisms for human intervention in AI operations', 1, '3'),
(gen_random_uuid(), '3.2', 'Oversight Documentation', 'Document oversight processes and limitations', 2, '3')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 3
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '3.1.1', 'Intervention Mechanisms', 'We define mechanisms for human intervention or override of AI outputs', 1, '3.1'),
(gen_random_uuid(), '3.1.2', 'Competent Oversight', 'We assign competent individuals with authority to oversee AI system usage', 2, '3.1'),
(gen_random_uuid(), '3.1.3', 'Oversight Alignment', 'We align oversight measures with provider''s instructions for use', 3, '3.1'),
(gen_random_uuid(), '3.2.1', 'Limitation Documentation', 'We document system limitations and human oversight options', 1, '3.2'),
(gen_random_uuid(), '3.2.2', 'Appeal Processes', 'We establish appeal processes related to AI system decisions', 2, '3.2')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 4
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '4.1', 'Risk Mitigation Procedures', 'Establish procedures for risk mitigation when serious incidents occur', 1, '4'),
(gen_random_uuid(), '4.2', 'Information Duties', 'Maintain information duties to relevant parties', 2, '4')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 4
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '4.1.1', 'Risk Mitigation', 'We have procedures to mitigate risks when serious incidents or malfunctions occur', 1, '4.1'),
(gen_random_uuid(), '4.1.2', 'System Suspension', 'We can suspend AI system operation when risks cannot be mitigated', 2, '4.1'),
(gen_random_uuid(), '4.2.1', 'Provider Notification', 'We inform providers about serious incidents or malfunctions', 1, '4.2'),
(gen_random_uuid(), '4.2.2', 'Authority Notification', 'We notify relevant authorities of serious incidents as required', 2, '4.2')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 5
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '5.1', 'Value Chain Responsibilities', 'Clearly define responsibilities across the AI value chain', 1, '5'),
(gen_random_uuid(), '5.2', 'Provider Cooperation', 'Maintain cooperation with AI system providers', 2, '5')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 5
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '5.1.1', 'Responsibility Documentation', 'We document responsibilities of all parties in the AI value chain', 1, '5.1'),
(gen_random_uuid(), '5.1.2', 'Contractual Agreements', 'We establish clear contractual agreements defining roles and responsibilities', 2, '5.1'),
(gen_random_uuid(), '5.2.1', 'Provider Cooperation', 'We cooperate with providers for compliance and risk management', 1, '5.2'),
(gen_random_uuid(), '5.2.2', 'Information Sharing', 'We share relevant information with providers about system use and performance', 2, '5.2')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";