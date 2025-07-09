-- ================================================
-- SUPABASE DATA INSERTION FOR EU AI ACT & ISO 42001 FRAMEWORKS
-- ================================================

-- ================================================
-- EU AI ACT TOPICS DATA
-- ================================================

INSERT INTO "EuAiActTopic" ("topicId", "title", "description", "orderIndex") VALUES
('1', 'Project Scope', 'Define and document the scope of the AI project including environment, technology, and stakeholder requirements.', 1),
('2', 'Risk Management System', 'Establish comprehensive risk management processes for AI systems.', 2),
('3', 'Data Governance', 'Establish data governance frameworks for AI systems.', 3),
('4', 'Technical Documentation', 'Document technical aspects of AI systems and their capabilities.', 4),
('5', 'Record Keeping', 'Maintain comprehensive records of AI system operations and performance.', 5),
('6', 'Transparency and User Information', 'Ensure transparency in AI system operations and provide adequate user information.', 6),
('7', 'Human Oversight', 'Establish effective human oversight mechanisms for AI systems.', 7),
('8', 'Accuracy, Robustness, and Cybersecurity', 'Ensure AI systems are accurate, robust, and secure.', 8),
('9', 'Conformity Assessment', 'Establish conformity assessment processes for AI systems.', 9),
('10', 'Post-Market Monitoring', 'Monitor AI systems after deployment for ongoing compliance.', 10),
('11', 'Bias Monitoring and Mitigation', 'Identify, monitor, and mitigate bias in AI systems.', 11),
('12', 'Accountability and Governance', 'Establish accountability frameworks and governance structures.', 12),
('13', 'Explainability', 'Ensure AI systems provide adequate explainability and interpretability.', 13),
('14', 'Environmental Impact', 'Assess and manage the environmental impact of AI systems.', 14)
ON CONFLICT ("topicId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- EU AI ACT SUBTOPICS DATA
-- ================================================

INSERT INTO "EuAiActSubtopic" ("subtopicId", "title", "description", "orderIndex", "topicId") VALUES
('1.1', 'General', 'General project scope documentation', 1, '1'),
('1.2', 'Technology Details', 'Detailed technology requirements and specifications', 2, '1'),
('2.1', 'Transparency and Provision of Information to Deployers', 'Ensure transparency in AI system deployment and information sharing', 1, '2'),
('2.2', 'Responsibilities Along the AI Value Chain', 'Define responsibilities across the AI development and deployment value chain', 2, '2'),
('3.1', 'Responsibilities Along the AI Value Chain', 'Data-related responsibilities across the AI value chain', 1, '3'),
('3.2', 'Fundamental Rights Impact Assessments', 'Assess impact on fundamental rights and privacy', 2, '3'),
('4.1', 'AI Model Capability Assessment', 'Assess AI model capabilities and limitations', 1, '4'),
('5.1', 'AI Model Capability Assessment', 'Record keeping for AI model capabilities', 1, '5'),
('6.1', 'User Notification of AI System Use', 'Notify users about AI system usage and implications', 1, '6'),
('7.1', 'Oversight Documentation', 'Document oversight processes and responsibilities', 1, '7'),
('7.2', 'Human Intervention Mechanisms', 'Establish mechanisms for human intervention in AI operations', 2, '7'),
('8.1', 'System Validation and Reliability Documentation', 'Document system validation and reliability processes', 1, '8'),
('8.2', 'AI System Change Documentation', 'Document changes to AI systems and their impacts', 2, '8'),
('9.1', 'EU Database Registration', 'Register AI systems in EU databases as required', 1, '9'),
('10.1', 'Post-Market Monitoring by Providers', 'Monitor AI systems after market deployment', 1, '10'),
('11.1', 'Bias and Fairness Evaluation', 'Evaluate bias and fairness in AI systems', 1, '11'),
('12.1', 'System Information Documentation', 'Document system information and governance processes', 1, '12'),
('13.1', 'Transparency Obligations', 'Meet transparency obligations for AI systems', 1, '13'),
('14.1', 'Environmental Impact Assessment', 'Assess environmental impact of AI systems', 1, '14')
ON CONFLICT ("subtopicId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"topicId" = EXCLUDED."topicId";

-- ================================================
-- EU AI ACT QUESTIONS DATA (Sample - Full set would be 65+ questions)
-- ================================================

INSERT INTO "EuAiActQuestion" ("questionId", "question", "priority", "answerType", "orderIndex", "subtopicId") VALUES
-- Topic 1.1 - General
('1.1.1', 'Describe the AI environment/application used', 'High', 'Long text', 1, '1.1'),
('1.1.2', 'Is a new form of AI technology used?', 'High', 'Long text', 2, '1.1'),
('1.1.3', 'Are personal sensitive data used?', 'High', 'Long text', 3, '1.1'),
('1.1.4', 'Project scope documents description', 'High', 'Long text', 4, '1.1'),

-- Topic 1.2 - Technology Details
('1.2.1', 'What type of AI technology are you using? Explain AI and ML technologies used', 'High', 'Long text', 1, '1.2'),
('1.2.2', 'Is there ongoing monitoring of the system to ensure that the system is operating as intended?', 'High', 'Long text', 2, '1.2'),
('1.2.3', 'Have you considered unintended outcomes that could occur from the use of this system?', 'High', 'Long text', 3, '1.2'),
('1.2.4', 'Add technology documentation. You can include a data flow diagram, MLops lifecycle diagram', 'High', 'Long text', 4, '1.2'),

-- Topic 2.1 - Transparency and Provision of Information to Deployers
('2.1.1', 'Will you make substantial modifications to the high-risk AI system already on the EU market?', 'High', 'Long text', 1, '2.1'),
('2.1.2', 'What business problem does the AI system solve, and what are its capabilities?', 'High', 'Long text', 2, '2.1'),
('2.1.3', 'How has your organization assessed the AI application against its ethical values?', 'High', 'Long text', 3, '2.1'),

-- Topic 2.2 - Responsibilities Along the AI Value Chain
('2.2.1', 'Specify details of any third-party involvement in the design, development, deployment, and support of the AI system', 'High', 'Long text', 1, '2.2'),
('2.2.2', 'What risks were identified in the data impact assessment?', 'High', 'Long text', 2, '2.2'),
('2.2.3', 'How has the selection or development of the model been assessed with regard to fairness, explainability, and robustness?', 'High', 'Long text', 3, '2.2'),
('2.2.4', 'What strategies have been implemented to address the risks identified in the model assessment?', 'High', 'Long text', 4, '2.2'),

-- Topic 3.1 - Responsibilities Along the AI Value Chain (Data)
('3.1.1', 'What risks have been identified associated with the chosen deployment and serving strategies?', 'Medium', 'Long text', 1, '3.1'),
('3.1.2', 'What measures are in place to detect undesired behavior in our AI solution?', 'Medium', 'Long text', 2, '3.1'),
('3.1.3', 'How can any unforeseen effects be mitigated after deployment of the AI application?', 'High', 'Long text', 3, '3.1'),
('3.1.4', 'What is the possible harmful effect of uncertainty and error margins for different groups?', 'High', 'Long text', 4, '3.1'),
('3.1.5', 'What mechanisms are in place for reporting serious incidents and certain risks?', 'High', 'Long text', 5, '3.1'),
('3.1.6', 'What risks have been identified associated with potentially decommissioning the AI system?', 'Medium', 'Long text', 6, '3.1'),
('3.1.7', 'What data sources are being used to develop the AI application?', 'High', 'Long text', 7, '3.1'),
('3.1.8', 'Does the repository track and manage intellectual property rights and restrictions?', 'High', 'Long text', 8, '3.1'),

-- Topic 3.2 - Fundamental Rights Impact Assessments
('3.2.1', 'How has your organization ensured the representativeness, relevance, accuracy, traceability, and completeness of the data?', 'Medium', 'Long text', 1, '3.2'),
('3.2.2', 'Provide details of the confidential and sensitive data processed by the AI system', 'High', 'Long text', 2, '3.2'),
('3.2.3', 'What are the legal bases for processing personal and sensitive data?', 'High', 'Long text', 3, '3.2'),
('3.2.4', 'Describe the measures in place to ensure that the AI system does not leak private or sensitive data', 'High', 'Long text', 4, '3.2'),
('3.2.5', 'How has legal compliance with respect to data protection (e.g., GDPR) been assessed and ensured?', 'High', 'Long text', 5, '3.2'),
('3.2.6', 'Provide details of the measures in place to comply with data subject requests', 'High', 'Long text', 6, '3.2'),
('3.2.7', 'Has the organization determined how the privacy of those involved is protected?', 'High', 'Long text', 7, '3.2'),
('3.2.8', 'Can the user delete their data from the system?', 'Medium', 'Long text', 8, '3.2'),

-- Additional questions for remaining topics (4-14) would continue here...
-- Topic 4.1 - AI Model Capability Assessment
('4.1.1', 'What is the source of the model being used?', 'High', 'Long text', 1, '4.1'),
('4.1.2', 'What is your strategy for validating the model?', 'Medium', 'Long text', 2, '4.1'),
('4.1.3', 'How is your organization documenting AI performance in the training environment?', 'High', 'Long text', 3, '4.1'),

-- Topic 5.1 - AI Model Capability Assessment (Record Keeping)
('5.1.1', 'What performance criteria have been established for the AI application?', 'Medium', 'Long text', 1, '5.1'),
('5.1.2', 'Describe the policies and procedures in place for retaining automatically generated logs', 'Medium', 'Long text', 2, '5.1'),
('5.1.3', 'How has your organization tested the model''s performance on extreme values and protected attributes?', 'Medium', 'Long text', 3, '5.1'),
('5.1.4', 'What patterns of failure have been identified in the model?', 'Medium', 'Long text', 4, '5.1'),

-- Topic 6.1 - User Notification of AI System Use
('6.1.1', 'Have users been adequately trained on the appropriate usage of the AI system?', 'High', 'Long text', 1, '6.1'),
('6.1.2', 'In what ways has your organization communicated these AI-related values externally?', 'Medium', 'Long text', 2, '6.1'),
('6.1.3', 'If the AI system performs automated decision-making using personal data, is there meaningful information provided?', 'Medium', 'Long text', 3, '6.1'),
('6.1.4', 'Is it clear to end users what the consequences are of decision making by the AI?', 'Medium', 'Long text', 4, '6.1'),

-- Topic 7.1 - Oversight Documentation
('7.1.1', 'How is the supervision of the AI system designed to ensure human oversight?', 'High', 'Long text', 1, '7.1'),
('7.1.2', 'How is the effectiveness of human oversight ensured?', 'High', 'Long text', 2, '7.1'),
('7.1.3', 'What is your organization''s strategy for conducting periodic reviews of the AI application?', 'Medium', 'Long text', 3, '7.1'),

-- Topic 7.2 - Human Intervention Mechanisms
('7.2.1', 'How is human oversight empowered to stop or alter the AI system''s operations?', 'High', 'Long text', 1, '7.2'),
('7.2.2', 'To what extent is human deliberation replaced by automated systems?', 'Medium', 'Long text', 2, '7.2'),

-- Topic 8.1 - System Validation and Reliability Documentation
('8.1.1', 'What is your strategy for testing the model?', 'High', 'Long text', 1, '8.1'),
('8.1.2', 'How will the AI system be served to end-users?', 'High', 'Long text', 2, '8.1'),

-- Topic 8.2 - AI System Change Documentation
('8.2.1', 'What monitoring systems will be in place to track the AI system''s performance?', 'Medium', 'Long text', 1, '8.2'),
('8.2.2', 'Are the details of the cloud provider and secure deployment architecture clearly defined?', 'Medium', 'Long text', 2, '8.2'),
('8.2.3', 'How will your organization detect and address risks associated with changing data quality?', 'Medium', 'Long text', 3, '8.2'),

-- Topic 9.1 - EU Database Registration
('9.1.1', 'How has your organization defined and documented the set of values that guide the development and deployment of AI systems?', 'High', 'Long text', 1, '9.1'),
('9.1.2', 'What governance framework has your organization implemented for AI projects?', 'Medium', 'Long text', 2, '9.1'),
('9.1.3', 'Internal regular schedule of self-assessment and certification', 'Medium', 'Long text', 3, '9.1'),

-- Topic 10.1 - Post-Market Monitoring by Providers
('10.1.1', 'What processes have been established for users of the AI system to raise concerns?', 'Medium', 'Long text', 1, '10.1'),
('10.1.2', 'What is your organization''s problem-to-resolution process for issues?', 'High', 'Long text', 2, '10.1'),
('10.1.3', 'How will your organization update the AI application on an ongoing basis?', 'Medium', 'Long text', 3, '10.1'),

-- Topic 11.1 - Bias and Fairness Evaluation
('11.1.1', 'What measures have been undertaken to address bias in the AI system''s training data?', 'High', 'Long text', 1, '11.1'),
('11.1.2', 'Are there specific groups that are favored or disadvantaged?', 'High', 'Long text', 2, '11.1'),
('11.1.3', 'Is your user base comprised of individuals or groups from vulnerable populations?', 'High', 'Long text', 3, '11.1'),

-- Topic 12.1 - System Information Documentation
('12.1.1', 'Who in your organization is responsible for ensuring and demonstrating that AI systems adhere to defined organizational values?', 'High', 'Long text', 1, '12.1'),
('12.1.2', 'Are the inputs and outputs of the AI system logged?', 'Medium', 'Long text', 2, '12.1'),
('12.1.3', 'To what extent does the deployment of AI influence legal certainty and civil liberties?', 'High', 'Long text', 3, '12.1'),
('12.1.4', 'What strategies has your organization developed to address the risks associated with decommissioning the AI system?', 'Medium', 'Long text', 4, '12.1'),

-- Topic 13.1 - Transparency Obligations
('13.1.1', 'What are the primary objectives of your AI application?', 'High', 'Long text', 1, '13.1'),
('13.1.2', 'Provide the high-level business process logic of the AI system', 'High', 'Long text', 2, '13.1'),
('13.1.3', 'To what extent can the operation of the application/algorithm be explained to end users?', 'Medium', 'Long text', 3, '13.1'),

-- Topic 14.1 - Environmental Impact Assessment
('14.1.1', 'How has your organization assessed the overall environmental impact of this AI application?', 'Low', 'Long text', 1, '14.1'),
('14.1.2', 'What are the environmental effects of the AI application?', 'Low', 'Long text', 2, '14.1')

ON CONFLICT ("questionId") DO UPDATE SET
"question" = EXCLUDED."question",
"priority" = EXCLUDED."priority",
"answerType" = EXCLUDED."answerType",
"orderIndex" = EXCLUDED."orderIndex",
"subtopicId" = EXCLUDED."subtopicId";

-- ================================================
-- EU AI ACT CONTROL CATEGORIES DATA
-- ================================================

INSERT INTO "EuAiActControlCategory" ("categoryId", "title", "description", "orderIndex") VALUES
('1', 'AI Literacy and Responsible AI Training', 'Ensure AI literacy and responsible AI training across the organization.', 1),
('2', 'Transparency and Provision of Information to Deployers', 'Ensure transparency in AI system deployment and information provision.', 2),
('3', 'Human Oversight', 'Establish effective human oversight mechanisms for AI systems.', 3),
('4', 'Corrective Actions and Duty of Information', 'Implement corrective actions and maintain information duties.', 4),
('5', 'Responsibilities Along the AI Value Chain', 'Define responsibilities across the AI value chain.', 5),
('6', 'Risk Management', 'Establish comprehensive risk management frameworks.', 6),
('7', 'Data Governance', 'Implement data governance controls for AI systems.', 7),
('8', 'Technical Documentation', 'Maintain technical documentation and standards.', 8),
('9', 'Accuracy and Robustness', 'Ensure accuracy and robustness of AI systems.', 9),
('10', 'Cybersecurity', 'Implement cybersecurity measures for AI systems.', 10),
('11', 'Bias Monitoring', 'Monitor and mitigate bias in AI systems.', 11),
('12', 'Explainability', 'Ensure explainability and interpretability of AI systems.', 12),
('13', 'Post-Market Monitoring', 'Monitor AI systems after deployment.', 13)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- EU AI ACT CONTROL STRUCTURES DATA (Sample - Full set would be 76+ controls)
-- ================================================

INSERT INTO "EuAiActControlStruct" ("controlId", "title", "description", "orderIndex", "categoryId") VALUES
('1.1', 'AI Literacy and Responsible AI Training', 'Establish AI literacy and responsible AI training programs', 1, '1'),
('1.2', 'Regulatory Training and Response Procedures', 'Establish regulatory training and response procedures', 2, '1'),
('2.1', 'Intended Use Description', 'Provide detailed descriptions of AI system intended use', 1, '2'),
('2.2', 'Technical Documentation Review', 'Review and verify technical documentation', 2, '2'),
('2.3', 'Record Maintenance of AI System Activities', 'Maintain accurate records of AI system activities', 3, '2'),
('2.4', 'System Information Documentation', 'Document system information comprehensively', 4, '2'),
('2.5', 'Dataset Description', 'Describe training, validation, and testing datasets', 5, '2'),
('2.6', 'Mitigation Strategies and Bias Testing', 'Explain mitigation strategies and bias testing results', 6, '2'),
('2.7', 'AI System Accuracy and Security Information', 'Provide accuracy metrics, robustness, and cybersecurity information', 7, '2'),
('3.1', 'Human Intervention Mechanisms', 'Define mechanisms for human intervention in AI operations', 1, '3'),
('3.2', 'Oversight Documentation', 'Document oversight processes and limitations', 2, '3'),
('3.3', 'Oversight Communication', 'Ensure clear communication of AI system capabilities and limitations', 3, '3'),
('4.1', 'Proportionate Oversight Measures', 'Implement proportionate oversight measures', 1, '4'),
('4.2', 'System Validation and Reliability Documentation', 'Validate and document system reliability', 2, '4'),
('4.3', 'Prompt Corrective Actions Implementation', 'Implement corrective actions as required', 3, '4'),
('4.4', 'Documentation of Corrective Actions', 'Maintain documentation of corrective actions taken', 4, '4'),
('5.1', 'Due Diligence Before Association', 'Conduct thorough due diligence before associating with AI systems', 1, '5'),
('5.2', 'Contractual Agreements', 'Establish clear contractual agreements with AI system providers', 2, '5'),
('5.3', 'Third-Party Supplier Responsibilities', 'Define responsibilities with third-party suppliers', 3, '5'),
('5.4', 'Regulatory Compliance Requirements', 'Specify requirements for regulatory compliance', 4, '5'),
('5.5', 'Third-Party Standards Compliance', 'Ensure third-party impacts meet organizational standards', 5, '5'),
('5.6', 'AI System Deactivation Mechanisms', 'Maintain mechanisms to deactivate AI systems', 6, '5'),
('5.7', 'Incident Monitoring for Third-Party Components', 'Monitor and respond to incidents involving third-party components', 7, '5'),
('5.8', 'System Resilience Enhancement', 'Implement measures to enhance AI system resilience', 8, '5'),
('5.9', 'Non-Conformity Assessment', 'Identify and assess potential non-conformities', 9, '5')
ON CONFLICT ("controlId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"categoryId" = EXCLUDED."categoryId";

-- ================================================
-- EU AI ACT SUBCONTROL STRUCTURES DATA (Sample - Full set would be 134+ subcontrols)
-- ================================================

INSERT INTO "EuAiActSubcontrolStruct" ("subcontrolId", "title", "description", "orderIndex", "controlId") VALUES
('1.1.1', 'Executive Leadership Responsibility', 'We ensure executive leadership takes responsibility for decisions related to AI risks', 1, '1.1'),
('1.1.2', 'AI Literacy Training', 'We provide AI literacy and ethics training to relevant personnel', 2, '1.1'),
('1.1.3', 'Communication Plan', 'We develop a clear and concise communication plan for informing workers about the use of high-risk AI systems', 3, '1.1'),
('1.2.1', 'Roles and Responsibilities', 'We clearly define roles and responsibilities related to AI risk management', 1, '1.2'),
('1.2.2', 'Regulatory Training', 'We train personnel on the requirements of the regulation and the process for responding to requests', 2, '1.2'),
('2.1.1', 'Intended Use Documentation', 'We provide detailed descriptions of the AI system''s intended use', 1, '2.1'),
('2.2.1', 'Documentation Review', 'We review and verify technical documentation from providers', 1, '2.2'),
('2.3.1', 'Activity Records', 'We maintain accurate records of all AI system activities, including modifications and third-party involvements', 1, '2.3'),
('2.4.1', 'System Information', 'We document system information, including functionality, limitations, and risk controls', 1, '2.4'),
('2.4.2', 'Forbidden Uses', 'We define and document forbidden uses and foresee potential misuse', 2, '2.4'),
('2.5.1', 'Dataset Documentation', 'We describe training, validation, and testing datasets used', 1, '2.5'),
('2.6.1', 'Mitigation Strategies', 'We explain mitigation strategies and bias testing results', 1, '2.6'),
('2.7.1', 'Accuracy and Security Information', 'We provide accuracy metrics, robustness, and cybersecurity information', 1, '2.7'),
('3.1.1', 'Intervention Mechanisms', 'We define mechanisms for human intervention or override of AI outputs', 1, '3.1'),
('3.1.2', 'Competent Oversight', 'We assign competent individuals with authority to oversee AI system usage', 2, '3.1'),
('3.1.3', 'Oversight Alignment', 'We align oversight measures with provider''s instructions for use', 3, '3.1'),
('3.2.1', 'Limitation Documentation', 'We document system limitations and human oversight options', 1, '3.2'),
('3.2.2', 'Appeal Processes', 'We establish appeal processes related to AI system decisions', 2, '3.2'),
('3.3.1', 'Oversight Communication', 'We ensure clear communication of AI system capabilities, limitations, and risks to human operators', 1, '3.3'),
('3.3.2', 'Proportionate Oversight', 'We proportion oversight measures to match AI system''s risk level and autonomy', 2, '3.3'),
('4.1.1', 'Expert Consultation', 'We consult with diverse experts and end-users to inform corrective measures', 1, '4.1'),
('4.2.1', 'System Validation', 'We validate and document system reliability and standards compliance', 1, '4.2'),
('4.2.2', 'Value Sustainment', 'We sustain AI system value post-deployment through continuous improvements', 2, '4.2'),
('4.3.1', 'Corrective Action Implementation', 'We implement corrective actions as required by Article 20 to address identified risks or issues', 1, '4.3'),
('4.3.2', 'System Withdrawal Mechanisms', 'We ensure mechanisms are in place to withdraw, disable, or recall non-conforming AI systems', 2, '4.3'),
('4.4.1', 'Corrective Action Documentation', 'We maintain documentation of corrective actions taken', 1, '4.4'),
('5.1.1', 'Due Diligence Process', 'We conduct thorough due diligence before associating with high-risk AI systems', 1, '5.1'),
('5.2.1', 'Provider Agreements', 'We establish clear contractual agreements with AI system providers', 1, '5.2'),
('5.3.1', 'Third-Party Responsibilities', 'We define responsibilities in agreements with third-party suppliers of AI components', 1, '5.3'),
('5.4.1', 'Regulatory Requirements', 'We specify information, technical access, and support required for regulatory compliance', 1, '5.4'),
('5.5.1', 'Third-Party Standards', 'We ensure third-party impacts, such as IP infringement, meet organizational standards', 1, '5.5'),
('5.6.1', 'System Deactivation', 'We maintain mechanisms to deactivate AI systems if performance deviates from intended use', 1, '5.6'),
('5.7.1', 'Third-Party Incident Monitoring', 'We monitor and respond to incidents involving third-party components', 1, '5.7'),
('5.8.1', 'Resilience Enhancement', 'We implement measures to enhance AI system resilience against errors and faults', 1, '5.8'),
('5.9.1', 'Non-Conformity Assessment', 'We identify and assess potential non-conformities with regulations', 1, '5.9')
ON CONFLICT ("subcontrolId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"controlId" = EXCLUDED."controlId";

-- ================================================
-- ISO 42001 CLAUSES DATA
-- ================================================

INSERT INTO "Iso42001Clause" ("clauseId", "title", "description", "orderIndex") VALUES
('4', 'Context of the Organization', 'Understand the organization''s context and establish the scope of the AI Management System.', 1),
('5', 'Leadership', 'Establish leadership commitment and organizational structure for AI management.', 2),
('6', 'Planning', 'Plan actions to address risks and opportunities and establish AI objectives.', 3),
('7', 'Support', 'Provide necessary resources, competence, awareness, and communication for the AIMS.', 4),
('8', 'Operation', 'Implement operational processes for AI management and control.', 5),
('9', 'Performance Evaluation', 'Monitor, measure, analyze, and evaluate AI management system performance.', 6),
('10', 'Improvement', 'Continually improve the AI management system effectiveness.', 7)
ON CONFLICT ("clauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- ISO 42001 SUBCLAUSES DATA
-- ================================================

INSERT INTO "Iso42001Subclause" ("subclauseId", "title", "summary", "questions", "evidenceExamples", "orderIndex", "clauseId") VALUES
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

('5.1', 'Leadership and Commitment', 'Top management must demonstrate leadership by ensuring policy/objectives alignment, resource availability, integration, communication, and promoting improvement', 
ARRAY['How does top management show active involvement and support for the AIMS?', 'Are AIMS objectives aligned with strategic goals?', 'Are sufficient resources allocated?'], 
ARRAY['Management meeting minutes discussing AIMS', 'Resource allocation records (budget, staffing)', 'Internal communications from leadership'], 1, '5'),

('5.2', 'Policy', 'Establish, communicate, and maintain an AI Policy appropriate to the organization''s context', 
ARRAY['Is there a documented AI Policy?', 'Does it include commitments to requirements and continual improvement?', 'Does it align with organizational AI principles/ethics?'], 
ARRAY['The documented AI Policy', 'Communication records (emails, intranet posts)', 'Training materials covering the policy'], 2, '5'),

('5.3', 'Organizational Roles, Responsibilities, and Authorities', 'Assign and communicate responsibilities and authorities for roles relevant to the AIMS', 
ARRAY['Who is ultimately accountable for the AIMS?', 'Who is responsible for specific AIMS tasks?', 'Are these roles, responsibilities, and authorities documented and communicated?'], 
ARRAY['Organization chart showing AIMS roles', 'Documented role descriptions', 'Responsibility Assignment Matrix (RACI)'], 3, '5'),

('6.1', 'Actions to Address Risks and Opportunities', 'Plan actions based on context, stakeholders, risks, and opportunities. Conduct AI risk assessments, plan risk treatments, and assess AI system impacts', 
ARRAY['Do we have a process for identifying risks and opportunities related to the AIMS?', 'Is there a defined AI risk assessment methodology?', 'Are risks related to AI systems systematically identified and assessed?'], 
ARRAY['Risk management framework/policy/procedure', 'AI Risk Assessment Methodology', 'Risk assessment reports per AI system', 'AI Risk Register', 'AI Risk Treatment Plan'], 1, '6'),

('6.2', 'AI Objectives and Planning to Achieve Them', 'Establish measurable AIMS objectives aligned with the AI policy and plan how to achieve them', 
ARRAY['What are the specific, measurable objectives for our AIMS?', 'Are they consistent with the AI policy and organizational goals?', 'What actions, resources, responsibilities, and timelines are defined?'], 
ARRAY['Documented AIMS Objectives', 'Action plans linked to objectives', 'Performance indicators (KPIs) for objectives', 'Management review records discussing objectives progress'], 2, '6'),

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

('9.1', 'Monitoring, Measurement, Analysis, and Evaluation', 'Determine what needs monitoring/measuring, the methods, frequency, and how results are analyzed/evaluated', 
ARRAY['What aspects of the AIMS and AI systems are monitored/measured?', 'What methods are used?', 'How often is data collected and analyzed?', 'Who analyzes/evaluates?', 'How are results used?'], 
ARRAY['Monitoring procedure', 'Defined metrics/KPIs', 'Monitoring logs/reports', 'Performance dashboards', 'Analysis reports'], 1, '9'),

('9.2', 'Internal Audit', 'Conduct internal audits at planned intervals to ensure the AIMS conforms to requirements and is effectively implemented', 
ARRAY['Is there an audit program?', 'Are audits conducted by objective auditors?', 'Are criteria/scope defined?', 'Are results reported?', 'Are nonconformities addressed?'], 
ARRAY['Internal audit procedure', 'Audit programme/schedule', 'Audit plans/reports', 'Auditor competence records', 'Nonconformity reports'], 2, '9'),

('9.3', 'Management Review', 'Top management must review the AIMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness', 
ARRAY['Are reviews conducted regularly?', 'Does review cover required inputs?', 'Are decisions made regarding improvements/changes?', 'Are minutes documented?'], 
ARRAY['Management review procedure', 'Review schedule/agendas/minutes', 'Action items tracker'], 3, '9'),

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
-- ISO 42001 ANNEX CATEGORIES DATA
-- ================================================

INSERT INTO "Iso42001AnnexCategory" ("categoryId", "title", "description", "orderIndex") VALUES
('A.5', 'Organizational Policies and Governance', 'Establish organizational policies and governance frameworks for AI systems.', 1),
('A.6', 'Internal Organization', 'Establish internal organizational structures for AI management.', 2),
('A.7', 'Resources for AI Systems', 'Manage resources required for AI system development and operation.', 3),
('A.8', 'AI System Lifecycle', 'Manage the complete lifecycle of AI systems from conception to retirement.', 4),
('A.9', 'Data for AI Systems', 'Manage data quality, acquisition, and handling for AI systems.', 5),
('A.10', 'Information and Communication Technology (ICT)', 'Establish ICT security and resilience for AI systems.', 6),
('A.11', 'Third-Party Relationships', 'Manage third-party relationships and associated risks for AI systems.', 7)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- ISO 42001 ANNEX ITEMS DATA
-- ================================================

INSERT INTO "Iso42001AnnexItem" ("itemId", "title", "description", "guidance", "orderIndex", "categoryId") VALUES
-- A.5 Organizational Policies and Governance
('A.5.1.1', 'Policies for AI', 'Management direction and support for AI via policies', 'Management should define and endorse a set of policies to provide clear direction and support for AI development and use within the organization', 1, 'A.5'),
('A.5.2.1', 'AI Governance Framework', 'Establishment of a governance structure for AI oversight', 'An AI governance framework, including roles, responsibilities, processes, and oversight mechanisms, should be established and maintained', 2, 'A.5'),
('A.5.3.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All AI system related responsibilities should be defined and allocated', 3, 'A.5'),
('A.5.3.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated', 4, 'A.5'),
('A.5.4.1', 'Accountability for AI Systems', 'Assigning accountability for AI systems', 'Accountability should be assigned for the establishment, implementation, maintenance, monitoring, evaluation and improvement of the AIMS', 5, 'A.5'),
('A.5.5.1', 'Contact with Authorities', 'Maintaining contact with relevant authorities', 'Appropriate contacts with relevant authorities should be maintained', 6, 'A.5'),
('A.5.5.2', 'Contact with Special Interest Groups', 'Maintaining contact with special interest groups', 'Appropriate contacts with special interest groups and other specialist forums should be maintained', 7, 'A.5'),
('A.5.6.1', 'AI in Project Management', 'Integrating AI aspects into project management', 'AI should be integrated into the organization''s project management', 8, 'A.5'),

-- A.6 Internal Organization
('A.6.1.1', 'AI Roles and Responsibilities', 'Defining and allocating AI responsibilities', 'All responsibilities related to the development, deployment, operation, and governance of AI systems should be clearly defined and allocated', 1, 'A.6'),
('A.6.1.2', 'Segregation of Duties', 'Separating conflicting duties related to AI', 'Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification', 2, 'A.6'),

-- A.7 Resources for AI Systems
('A.7.1.1', 'Identification of Resources', 'Identifying resources needed for AI', 'Resources necessary for the development, operation, and maintenance of AI systems should be identified and managed', 1, 'A.7'),
('A.7.2.1', 'Computational Resources', 'Managing computational resources for AI', 'Computational resources required for AI systems should be managed throughout their lifecycle', 2, 'A.7'),
('A.7.3.1', 'Data Resources', 'Managing data resources for AI', 'Data resources required for AI systems should be managed throughout their lifecycle', 3, 'A.7'),
('A.7.4.1', 'System Resources', 'Managing system resources for AI', 'System resources required for AI systems, including tools and infrastructure, should be managed throughout their lifecycle', 4, 'A.7'),
('A.7.5.1', 'Human Resources', 'Managing human resources for AI', 'Human resources required for AI systems, including roles, competencies, and training, should be managed throughout their lifecycle', 5, 'A.7'),

-- A.8 AI System Lifecycle
('A.8.1.1', 'AI System Lifecycle Management', 'Establishing and managing a defined AI lifecycle process', 'A defined lifecycle process should be established and managed for AI systems, covering stages from conception through retirement', 1, 'A.8'),
('A.8.2.1', 'AI System Requirements Analysis', 'Analyzing and specifying AI system requirements', 'Requirements for AI systems, including functional, non-functional, data, ethical, legal, and societal aspects, should be analyzed and specified', 2, 'A.8'),
('A.8.3.1', 'AI System Design', 'Designing AI systems based on requirements', 'AI systems should be designed based on specified requirements, considering architecture, models, data handling, and interaction mechanisms', 3, 'A.8'),
('A.8.4.1', 'Data Acquisition and Preparation', 'Acquiring and preparing data for AI systems', 'Data for AI systems should be acquired, pre-processed, and prepared according to requirements and quality criteria', 4, 'A.8'),
('A.8.5.1', 'Model Building and Evaluation', 'Building, training, and evaluating AI models', 'AI models should be built, trained, tuned, and evaluated using appropriate techniques and metrics', 5, 'A.8'),
('A.8.6.1', 'AI System Verification and Validation', 'Verifying and validating AI systems', 'AI systems should be verified and validated against requirements before deployment', 6, 'A.8'),
('A.8.7.1', 'AI System Deployment', 'Deploying AI systems into the operational environment', 'AI systems should be deployed into the operational environment according to planned procedures', 7, 'A.8'),
('A.8.8.1', 'AI System Operation and Monitoring', 'Operating and monitoring AI systems', 'Deployed AI systems should be operated and monitored for performance, behaviour, and compliance with requirements', 8, 'A.8'),
('A.8.9.1', 'AI System Maintenance and Retirement', 'Maintaining and retiring AI systems', 'AI systems should be maintained throughout their operational life and retired securely when no longer needed', 9, 'A.8'),

-- A.9 Data for AI Systems
('A.9.1.1', 'Data Quality for AI Systems', 'Processes to ensure data quality characteristics', 'Processes should be implemented to ensure that data used for developing and operating AI systems meets defined quality criteria', 1, 'A.9'),
('A.9.2.1', 'Data Acquisition', 'Managing the acquisition of data for AI', 'Data acquisition processes should ensure data is obtained legally, ethically, and according to specified requirements', 2, 'A.9'),
('A.9.3.1', 'Data Preparation', 'Preparing data for use in AI systems', 'Data should be prepared (cleaned, transformed, annotated) suitable for its intended use in AI system development and operation', 3, 'A.9'),
('A.9.4.1', 'Data Provenance', 'Documenting the origin and history of data', 'Information about the origin, history, and processing steps applied to data (provenance) should be documented and maintained', 4, 'A.9'),
('A.9.5.1', 'Data Privacy', 'Protecting privacy in data used for AI', 'Privacy requirements should be addressed throughout the data lifecycle, including anonymization or pseudonymization where appropriate', 5, 'A.9'),
('A.9.6.1', 'Data Handling', 'Securely handling data throughout its lifecycle', 'Data should be handled securely, including storage, access control, transmission, and disposal, according to its classification', 6, 'A.9'),

-- A.10 Information and Communication Technology (ICT)
('A.10.1.1', 'Information Security for AI Systems', 'Application of information security controls to AI systems', 'Information security requirements and controls should be applied throughout the AI system lifecycle to protect confidentiality, integrity, and availability', 1, 'A.10'),
('A.10.2.1', 'Security of AI Models', 'Protecting AI models from threats', 'AI models should be protected against threats such as unauthorized access, modification, theft, or poisoning', 2, 'A.10'),
('A.10.3.1', 'Security of AI Data', 'Protecting data used by AI systems', 'Data used in AI systems should be protected according to information security policies and data classification', 3, 'A.10'),
('A.10.4.1', 'Resilience of AI Systems', 'Ensuring AI systems are resilient to failures and attacks', 'AI systems should be designed and operated to be resilient against failures, errors, and attacks', 4, 'A.10'),

-- A.11 Third-Party Relationships
('A.11.1.1', 'Management of Third-Party AI Related Risks', 'Managing risks when using third-party AI systems, components, or data', 'Risks associated with third-party provision or use of AI systems, components, services, or data should be identified, assessed, and managed', 1, 'A.11'),
('A.11.2.1', 'Supplier Agreements for AI', 'Including AI-specific requirements in supplier agreements', 'Agreements with third parties supplying AI systems, components, services, or data should include relevant AI-specific requirements', 2, 'A.11'),
('A.11.3.1', 'Monitoring of Third-Party AI Services', 'Monitoring third-party compliance and performance', 'The performance and compliance of third parties involved in the AI system lifecycle should be monitored according to agreements', 3, 'A.11')

ON CONFLICT ("itemId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"guidance" = EXCLUDED."guidance",
"orderIndex" = EXCLUDED."orderIndex",
"categoryId" = EXCLUDED."categoryId";

-- ================================================
-- FINAL CONFIRMATION
-- ================================================

-- Verify data insertion
SELECT 
    'EU AI ACT Topics' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActTopic"
UNION ALL
SELECT 
    'EU AI ACT Subtopics' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActSubtopic"
UNION ALL
SELECT 
    'EU AI ACT Questions' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActQuestion"
UNION ALL
SELECT 
    'EU AI ACT Control Categories' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActControlCategory"
UNION ALL
SELECT 
    'EU AI ACT Controls' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActControlStruct"
UNION ALL
SELECT 
    'EU AI ACT Subcontrols' as table_name, 
    COUNT(*) as record_count 
FROM "EuAiActSubcontrolStruct"
UNION ALL
SELECT 
    'ISO 42001 Clauses' as table_name, 
    COUNT(*) as record_count 
FROM "Iso42001Clause"
UNION ALL
SELECT 
    'ISO 42001 Subclauses' as table_name, 
    COUNT(*) as record_count 
FROM "Iso42001Subclause"
UNION ALL
SELECT 
    'ISO 42001 Annex Categories' as table_name, 
    COUNT(*) as record_count 
FROM "Iso42001AnnexCategory"
UNION ALL
SELECT 
    'ISO 42001 Annex Items' as table_name, 
    COUNT(*) as record_count 
FROM "Iso42001AnnexItem"
ORDER BY table_name;