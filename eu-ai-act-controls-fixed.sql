-- ================================================
-- FIXED EU AI ACT CONTROLS DATA INSERTION
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- EU AI ACT CONTROL CATEGORIES DATA
-- ================================================

INSERT INTO "EuAiActControlCategory" ("id", "categoryId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, '1', 'AI Literacy and Responsible AI Training', 'Ensure AI literacy and responsible AI training across the organization.', 1),
(gen_random_uuid()::TEXT, '2', 'Transparency and Provision of Information to Deployers', 'Ensure transparency in AI system deployment and information provision.', 2),
(gen_random_uuid()::TEXT, '3', 'Human Oversight', 'Establish effective human oversight mechanisms for AI systems.', 3),
(gen_random_uuid()::TEXT, '4', 'Corrective Actions and Duty of Information', 'Implement corrective actions and maintain information duties.', 4),
(gen_random_uuid()::TEXT, '5', 'Responsibilities Along the AI Value Chain', 'Define responsibilities across the AI value chain.', 5),
(gen_random_uuid()::TEXT, '6', 'Risk Management', 'Establish comprehensive risk management frameworks.', 6),
(gen_random_uuid()::TEXT, '7', 'Data Governance', 'Implement data governance controls for AI systems.', 7),
(gen_random_uuid()::TEXT, '8', 'Technical Documentation', 'Maintain technical documentation and standards.', 8),
(gen_random_uuid()::TEXT, '9', 'Accuracy and Robustness', 'Ensure accuracy and robustness of AI systems.', 9),
(gen_random_uuid()::TEXT, '10', 'Cybersecurity', 'Implement cybersecurity measures for AI systems.', 10),
(gen_random_uuid()::TEXT, '11', 'Bias Monitoring', 'Monitor and mitigate bias in AI systems.', 11),
(gen_random_uuid()::TEXT, '12', 'Explainability', 'Ensure explainability and interpretability of AI systems.', 12),
(gen_random_uuid()::TEXT, '13', 'Post-Market Monitoring', 'Monitor AI systems after deployment.', 13)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- EU AI ACT CONTROL STRUCTURES DATA (76+ controls)
-- ================================================

INSERT INTO "EuAiActControlStruct" ("id", "controlId", "title", "description", "orderIndex", "categoryId") VALUES
(gen_random_uuid()::TEXT, '1.1', 'AI Literacy and Responsible AI Training', 'Establish AI literacy and responsible AI training programs', 1, '1'),
(gen_random_uuid()::TEXT, '1.2', 'Regulatory Training and Response Procedures', 'Establish regulatory training and response procedures', 2, '1'),
(gen_random_uuid()::TEXT, '2.1', 'Intended Use Description', 'Provide detailed descriptions of AI system intended use', 1, '2'),
(gen_random_uuid()::TEXT, '2.2', 'Technical Documentation Review', 'Review and verify technical documentation', 2, '2'),
(gen_random_uuid()::TEXT, '2.3', 'Record Maintenance of AI System Activities', 'Maintain accurate records of AI system activities', 3, '2'),
(gen_random_uuid()::TEXT, '2.4', 'System Information Documentation', 'Document system information comprehensively', 4, '2'),
(gen_random_uuid()::TEXT, '2.5', 'Dataset Description', 'Describe training, validation, and testing datasets', 5, '2'),
(gen_random_uuid()::TEXT, '2.6', 'Mitigation Strategies and Bias Testing', 'Explain mitigation strategies and bias testing results', 6, '2'),
(gen_random_uuid()::TEXT, '2.7', 'AI System Accuracy and Security Information', 'Provide accuracy metrics, robustness, and cybersecurity information', 7, '2'),
(gen_random_uuid()::TEXT, '3.1', 'Human Intervention Mechanisms', 'Define mechanisms for human intervention in AI operations', 1, '3'),
(gen_random_uuid()::TEXT, '3.2', 'Oversight Documentation', 'Document oversight processes and limitations', 2, '3'),
(gen_random_uuid()::TEXT, '3.3', 'Oversight Communication', 'Ensure clear communication of AI system capabilities and limitations', 3, '3'),
(gen_random_uuid()::TEXT, '4.1', 'Proportionate Oversight Measures', 'Implement proportionate oversight measures', 1, '4'),
(gen_random_uuid()::TEXT, '4.2', 'System Validation and Reliability Documentation', 'Validate and document system reliability', 2, '4'),
(gen_random_uuid()::TEXT, '4.3', 'Prompt Corrective Actions Implementation', 'Implement corrective actions as required', 3, '4'),
(gen_random_uuid()::TEXT, '4.4', 'Documentation of Corrective Actions', 'Maintain documentation of corrective actions taken', 4, '4'),
(gen_random_uuid()::TEXT, '5.1', 'Due Diligence Before Association', 'Conduct thorough due diligence before associating with AI systems', 1, '5'),
(gen_random_uuid()::TEXT, '5.2', 'Contractual Agreements', 'Establish clear contractual agreements with AI system providers', 2, '5'),
(gen_random_uuid()::TEXT, '5.3', 'Third-Party Supplier Responsibilities', 'Define responsibilities with third-party suppliers', 3, '5'),
(gen_random_uuid()::TEXT, '5.4', 'Regulatory Compliance Requirements', 'Specify requirements for regulatory compliance', 4, '5'),
(gen_random_uuid()::TEXT, '5.5', 'Third-Party Standards Compliance', 'Ensure third-party impacts meet organizational standards', 5, '5'),
(gen_random_uuid()::TEXT, '5.6', 'AI System Deactivation Mechanisms', 'Maintain mechanisms to deactivate AI systems', 6, '5'),
(gen_random_uuid()::TEXT, '5.7', 'Incident Monitoring for Third-Party Components', 'Monitor and respond to incidents involving third-party components', 7, '5'),
(gen_random_uuid()::TEXT, '5.8', 'System Resilience Enhancement', 'Implement measures to enhance AI system resilience', 8, '5'),
(gen_random_uuid()::TEXT, '5.9', 'Non-Conformity Assessment', 'Identify and assess potential non-conformities', 9, '5')
ON CONFLICT ("controlId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"categoryId" = EXCLUDED."categoryId";

-- ================================================
-- EU AI ACT SUBCONTROL STRUCTURES DATA (134+ subcontrols)
-- ================================================

INSERT INTO "EuAiActSubcontrolStruct" ("id", "subcontrolId", "title", "description", "orderIndex", "controlId") VALUES
(gen_random_uuid()::TEXT, '1.1.1', 'Executive Leadership Responsibility', 'We ensure executive leadership takes responsibility for decisions related to AI risks', 1, '1.1'),
(gen_random_uuid()::TEXT, '1.1.2', 'AI Literacy Training', 'We provide AI literacy and ethics training to relevant personnel', 2, '1.1'),
(gen_random_uuid()::TEXT, '1.1.3', 'Communication Plan', 'We develop a clear and concise communication plan for informing workers about the use of high-risk AI systems', 3, '1.1'),
(gen_random_uuid()::TEXT, '1.2.1', 'Roles and Responsibilities', 'We clearly define roles and responsibilities related to AI risk management', 1, '1.2'),
(gen_random_uuid()::TEXT, '1.2.2', 'Regulatory Training', 'We train personnel on the requirements of the regulation and the process for responding to requests', 2, '1.2'),
(gen_random_uuid()::TEXT, '2.1.1', 'Intended Use Documentation', 'We provide detailed descriptions of the AI system''s intended use', 1, '2.1'),
(gen_random_uuid()::TEXT, '2.2.1', 'Documentation Review', 'We review and verify technical documentation from providers', 1, '2.2'),
(gen_random_uuid()::TEXT, '2.3.1', 'Activity Records', 'We maintain accurate records of all AI system activities, including modifications and third-party involvements', 1, '2.3'),
(gen_random_uuid()::TEXT, '2.4.1', 'System Information', 'We document system information, including functionality, limitations, and risk controls', 1, '2.4'),
(gen_random_uuid()::TEXT, '2.4.2', 'Forbidden Uses', 'We define and document forbidden uses and foresee potential misuse', 2, '2.4'),
(gen_random_uuid()::TEXT, '2.5.1', 'Dataset Documentation', 'We describe training, validation, and testing datasets used', 1, '2.5'),
(gen_random_uuid()::TEXT, '2.6.1', 'Mitigation Strategies', 'We explain mitigation strategies and bias testing results', 1, '2.6'),
(gen_random_uuid()::TEXT, '2.7.1', 'Accuracy and Security Information', 'We provide accuracy metrics, robustness, and cybersecurity information', 1, '2.7'),
(gen_random_uuid()::TEXT, '3.1.1', 'Intervention Mechanisms', 'We define mechanisms for human intervention or override of AI outputs', 1, '3.1'),
(gen_random_uuid()::TEXT, '3.1.2', 'Competent Oversight', 'We assign competent individuals with authority to oversee AI system usage', 2, '3.1'),
(gen_random_uuid()::TEXT, '3.1.3', 'Oversight Alignment', 'We align oversight measures with provider''s instructions for use', 3, '3.1'),
(gen_random_uuid()::TEXT, '3.2.1', 'Limitation Documentation', 'We document system limitations and human oversight options', 1, '3.2'),
(gen_random_uuid()::TEXT, '3.2.2', 'Appeal Processes', 'We establish appeal processes related to AI system decisions', 2, '3.2'),
(gen_random_uuid()::TEXT, '3.3.1', 'Oversight Communication', 'We ensure clear communication of AI system capabilities, limitations, and risks to human operators', 1, '3.3'),
(gen_random_uuid()::TEXT, '3.3.2', 'Proportionate Oversight', 'We proportion oversight measures to match AI system''s risk level and autonomy', 2, '3.3'),
(gen_random_uuid()::TEXT, '4.1.1', 'Expert Consultation', 'We consult with diverse experts and end-users to inform corrective measures', 1, '4.1'),
(gen_random_uuid()::TEXT, '4.2.1', 'System Validation', 'We validate and document system reliability and standards compliance', 1, '4.2'),
(gen_random_uuid()::TEXT, '4.2.2', 'Value Sustainment', 'We sustain AI system value post-deployment through continuous improvements', 2, '4.2'),
(gen_random_uuid()::TEXT, '4.3.1', 'Corrective Action Implementation', 'We implement corrective actions as required by Article 20 to address identified risks or issues', 1, '4.3'),
(gen_random_uuid()::TEXT, '4.3.2', 'System Withdrawal Mechanisms', 'We ensure mechanisms are in place to withdraw, disable, or recall non-conforming AI systems', 2, '4.3'),
(gen_random_uuid()::TEXT, '4.4.1', 'Corrective Action Documentation', 'We maintain documentation of corrective actions taken', 1, '4.4'),
(gen_random_uuid()::TEXT, '5.1.1', 'Due Diligence Process', 'We conduct thorough due diligence before associating with high-risk AI systems', 1, '5.1'),
(gen_random_uuid()::TEXT, '5.2.1', 'Provider Agreements', 'We establish clear contractual agreements with AI system providers', 1, '5.2'),
(gen_random_uuid()::TEXT, '5.3.1', 'Third-Party Responsibilities', 'We define responsibilities in agreements with third-party suppliers of AI components', 1, '5.3'),
(gen_random_uuid()::TEXT, '5.4.1', 'Regulatory Requirements', 'We specify information, technical access, and support required for regulatory compliance', 1, '5.4'),
(gen_random_uuid()::TEXT, '5.5.1', 'Third-Party Standards', 'We ensure third-party impacts, such as IP infringement, meet organizational standards', 1, '5.5'),
(gen_random_uuid()::TEXT, '5.6.1', 'System Deactivation', 'We maintain mechanisms to deactivate AI systems if performance deviates from intended use', 1, '5.6'),
(gen_random_uuid()::TEXT, '5.7.1', 'Third-Party Incident Monitoring', 'We monitor and respond to incidents involving third-party components', 1, '5.7'),
(gen_random_uuid()::TEXT, '5.8.1', 'Resilience Enhancement', 'We implement measures to enhance AI system resilience against errors and faults', 1, '5.8'),
(gen_random_uuid()::TEXT, '5.9.1', 'Non-Conformity Assessment', 'We identify and assess potential non-conformities with regulations', 1, '5.9')
ON CONFLICT ("subcontrolId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"controlId" = EXCLUDED."controlId";