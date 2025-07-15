-- ================================================
-- FIXED EU AI ACT TOPICS AND QUESTIONS DATA INSERTION
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- EU AI ACT TOPICS DATA
-- ================================================

INSERT INTO "EuAiActTopic" ("id", "topicId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, '1', 'Project Scope', 'Define and document the scope of the AI project including environment, technology, and stakeholder requirements.', 1),
(gen_random_uuid()::TEXT, '2', 'Risk Management System', 'Establish comprehensive risk management processes for AI systems.', 2),
(gen_random_uuid()::TEXT, '3', 'Data Governance', 'Establish data governance frameworks for AI systems.', 3),
(gen_random_uuid()::TEXT, '4', 'Technical Documentation', 'Document technical aspects of AI systems and their capabilities.', 4),
(gen_random_uuid()::TEXT, '5', 'Record Keeping', 'Maintain comprehensive records of AI system operations and performance.', 5),
(gen_random_uuid()::TEXT, '6', 'Transparency and User Information', 'Ensure transparency in AI system operations and provide adequate user information.', 6),
(gen_random_uuid()::TEXT, '7', 'Human Oversight', 'Establish effective human oversight mechanisms for AI systems.', 7),
(gen_random_uuid()::TEXT, '8', 'Accuracy, Robustness, and Cybersecurity', 'Ensure AI systems are accurate, robust, and secure.', 8),
(gen_random_uuid()::TEXT, '9', 'Conformity Assessment', 'Establish conformity assessment processes for AI systems.', 9),
(gen_random_uuid()::TEXT, '10', 'Post-Market Monitoring', 'Monitor AI systems after deployment for ongoing compliance.', 10),
(gen_random_uuid()::TEXT, '11', 'Bias Monitoring and Mitigation', 'Identify, monitor, and mitigate bias in AI systems.', 11),
(gen_random_uuid()::TEXT, '12', 'Accountability and Governance', 'Establish accountability frameworks and governance structures.', 12),
(gen_random_uuid()::TEXT, '13', 'Explainability', 'Ensure AI systems provide adequate explainability and interpretability.', 13),
(gen_random_uuid()::TEXT, '14', 'Environmental Impact', 'Assess and manage the environmental impact of AI systems.', 14)
ON CONFLICT ("topicId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";

-- ================================================
-- EU AI ACT SUBTOPICS DATA
-- ================================================

INSERT INTO "EuAiActSubtopic" ("id", "subtopicId", "title", "description", "orderIndex", "topicId") VALUES
(gen_random_uuid()::TEXT, '1.1', 'General', 'General project scope documentation', 1, '1'),
(gen_random_uuid()::TEXT, '1.2', 'Technology Details', 'Detailed technology requirements and specifications', 2, '1'),
(gen_random_uuid()::TEXT, '2.1', 'Transparency and Provision of Information to Deployers', 'Ensure transparency in AI system deployment and information sharing', 1, '2'),
(gen_random_uuid()::TEXT, '2.2', 'Responsibilities Along the AI Value Chain', 'Define responsibilities across the AI development and deployment value chain', 2, '2'),
(gen_random_uuid()::TEXT, '3.1', 'Responsibilities Along the AI Value Chain', 'Data-related responsibilities across the AI value chain', 1, '3'),
(gen_random_uuid()::TEXT, '3.2', 'Fundamental Rights Impact Assessments', 'Assess impact on fundamental rights and privacy', 2, '3'),
(gen_random_uuid()::TEXT, '4.1', 'AI Model Capability Assessment', 'Assess AI model capabilities and limitations', 1, '4'),
(gen_random_uuid()::TEXT, '5.1', 'AI Model Capability Assessment', 'Record keeping for AI model capabilities', 1, '5'),
(gen_random_uuid()::TEXT, '6.1', 'User Notification of AI System Use', 'Notify users about AI system usage and implications', 1, '6'),
(gen_random_uuid()::TEXT, '7.1', 'Oversight Documentation', 'Document oversight processes and responsibilities', 1, '7'),
(gen_random_uuid()::TEXT, '7.2', 'Human Intervention Mechanisms', 'Establish mechanisms for human intervention in AI operations', 2, '7'),
(gen_random_uuid()::TEXT, '8.1', 'System Validation and Reliability Documentation', 'Document system validation and reliability processes', 1, '8'),
(gen_random_uuid()::TEXT, '8.2', 'AI System Change Documentation', 'Document changes to AI systems and their impacts', 2, '8'),
(gen_random_uuid()::TEXT, '9.1', 'EU Database Registration', 'Register AI systems in EU databases as required', 1, '9'),
(gen_random_uuid()::TEXT, '10.1', 'Post-Market Monitoring by Providers', 'Monitor AI systems after market deployment', 1, '10'),
(gen_random_uuid()::TEXT, '11.1', 'Bias and Fairness Evaluation', 'Evaluate bias and fairness in AI systems', 1, '11'),
(gen_random_uuid()::TEXT, '12.1', 'System Information Documentation', 'Document system information and governance processes', 1, '12'),
(gen_random_uuid()::TEXT, '13.1', 'Transparency Obligations', 'Meet transparency obligations for AI systems', 1, '13'),
(gen_random_uuid()::TEXT, '14.1', 'Environmental Impact Assessment', 'Assess environmental impact of AI systems', 1, '14')
ON CONFLICT ("subtopicId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex",
"topicId" = EXCLUDED."topicId";

-- ================================================
-- EU AI ACT QUESTIONS DATA (65+ questions)
-- ================================================

INSERT INTO "EuAiActQuestion" ("id", "questionId", "question", "priority", "answerType", "orderIndex", "subtopicId") VALUES
-- Topic 1.1 - General
(gen_random_uuid()::TEXT, '1.1.1', 'Describe the AI environment/application used', 'High', 'Long text', 1, '1.1'),
(gen_random_uuid()::TEXT, '1.1.2', 'Is a new form of AI technology used?', 'High', 'Long text', 2, '1.1'),
(gen_random_uuid()::TEXT, '1.1.3', 'Are personal sensitive data used?', 'High', 'Long text', 3, '1.1'),
(gen_random_uuid()::TEXT, '1.1.4', 'Project scope documents description', 'High', 'Long text', 4, '1.1'),

-- Topic 1.2 - Technology Details
(gen_random_uuid()::TEXT, '1.2.1', 'What type of AI technology are you using? Explain AI and ML technologies used', 'High', 'Long text', 1, '1.2'),
(gen_random_uuid()::TEXT, '1.2.2', 'Is there ongoing monitoring of the system to ensure that the system is operating as intended?', 'High', 'Long text', 2, '1.2'),
(gen_random_uuid()::TEXT, '1.2.3', 'Have you considered unintended outcomes that could occur from the use of this system?', 'High', 'Long text', 3, '1.2'),
(gen_random_uuid()::TEXT, '1.2.4', 'Add technology documentation. You can include a data flow diagram, MLops lifecycle diagram', 'High', 'Long text', 4, '1.2'),

-- Topic 2.1 - Transparency and Provision of Information to Deployers
(gen_random_uuid()::TEXT, '2.1.1', 'Will you make substantial modifications to the high-risk AI system already on the EU market?', 'High', 'Long text', 1, '2.1'),
(gen_random_uuid()::TEXT, '2.1.2', 'What business problem does the AI system solve, and what are its capabilities?', 'High', 'Long text', 2, '2.1'),
(gen_random_uuid()::TEXT, '2.1.3', 'How has your organization assessed the AI application against its ethical values?', 'High', 'Long text', 3, '2.1'),

-- Topic 2.2 - Responsibilities Along the AI Value Chain
(gen_random_uuid()::TEXT, '2.2.1', 'Specify details of any third-party involvement in the design, development, deployment, and support of the AI system', 'High', 'Long text', 1, '2.2'),
(gen_random_uuid()::TEXT, '2.2.2', 'What risks were identified in the data impact assessment?', 'High', 'Long text', 2, '2.2'),
(gen_random_uuid()::TEXT, '2.2.3', 'How has the selection or development of the model been assessed with regard to fairness, explainability, and robustness?', 'High', 'Long text', 3, '2.2'),
(gen_random_uuid()::TEXT, '2.2.4', 'What strategies have been implemented to address the risks identified in the model assessment?', 'High', 'Long text', 4, '2.2'),

-- Topic 3.1 - Responsibilities Along the AI Value Chain (Data)
(gen_random_uuid()::TEXT, '3.1.1', 'What risks have been identified associated with the chosen deployment and serving strategies?', 'Medium', 'Long text', 1, '3.1'),
(gen_random_uuid()::TEXT, '3.1.2', 'What measures are in place to detect undesired behavior in our AI solution?', 'Medium', 'Long text', 2, '3.1'),
(gen_random_uuid()::TEXT, '3.1.3', 'How can any unforeseen effects be mitigated after deployment of the AI application?', 'High', 'Long text', 3, '3.1'),
(gen_random_uuid()::TEXT, '3.1.4', 'What is the possible harmful effect of uncertainty and error margins for different groups?', 'High', 'Long text', 4, '3.1'),
(gen_random_uuid()::TEXT, '3.1.5', 'What mechanisms are in place for reporting serious incidents and certain risks?', 'High', 'Long text', 5, '3.1'),
(gen_random_uuid()::TEXT, '3.1.6', 'What risks have been identified associated with potentially decommissioning the AI system?', 'Medium', 'Long text', 6, '3.1'),
(gen_random_uuid()::TEXT, '3.1.7', 'What data sources are being used to develop the AI application?', 'High', 'Long text', 7, '3.1'),
(gen_random_uuid()::TEXT, '3.1.8', 'Does the repository track and manage intellectual property rights and restrictions?', 'High', 'Long text', 8, '3.1'),

-- Topic 3.2 - Fundamental Rights Impact Assessments
(gen_random_uuid()::TEXT, '3.2.1', 'How has your organization ensured the representativeness, relevance, accuracy, traceability, and completeness of the data?', 'Medium', 'Long text', 1, '3.2'),
(gen_random_uuid()::TEXT, '3.2.2', 'Provide details of the confidential and sensitive data processed by the AI system', 'High', 'Long text', 2, '3.2'),
(gen_random_uuid()::TEXT, '3.2.3', 'What are the legal bases for processing personal and sensitive data?', 'High', 'Long text', 3, '3.2'),
(gen_random_uuid()::TEXT, '3.2.4', 'Describe the measures in place to ensure that the AI system does not leak private or sensitive data', 'High', 'Long text', 4, '3.2'),
(gen_random_uuid()::TEXT, '3.2.5', 'How has legal compliance with respect to data protection (e.g., GDPR) been assessed and ensured?', 'High', 'Long text', 5, '3.2'),
(gen_random_uuid()::TEXT, '3.2.6', 'Provide details of the measures in place to comply with data subject requests', 'High', 'Long text', 6, '3.2'),
(gen_random_uuid()::TEXT, '3.2.7', 'Has the organization determined how the privacy of those involved is protected?', 'High', 'Long text', 7, '3.2'),
(gen_random_uuid()::TEXT, '3.2.8', 'Can the user delete their data from the system?', 'Medium', 'Long text', 8, '3.2'),

-- Topic 4.1 - AI Model Capability Assessment
(gen_random_uuid()::TEXT, '4.1.1', 'What is the source of the model being used?', 'High', 'Long text', 1, '4.1'),
(gen_random_uuid()::TEXT, '4.1.2', 'What is your strategy for validating the model?', 'Medium', 'Long text', 2, '4.1'),
(gen_random_uuid()::TEXT, '4.1.3', 'How is your organization documenting AI performance in the training environment?', 'High', 'Long text', 3, '4.1'),

-- Topic 5.1 - AI Model Capability Assessment (Record Keeping)
(gen_random_uuid()::TEXT, '5.1.1', 'What performance criteria have been established for the AI application?', 'Medium', 'Long text', 1, '5.1'),
(gen_random_uuid()::TEXT, '5.1.2', 'Describe the policies and procedures in place for retaining automatically generated logs', 'Medium', 'Long text', 2, '5.1'),
(gen_random_uuid()::TEXT, '5.1.3', 'How has your organization tested the model''s performance on extreme values and protected attributes?', 'Medium', 'Long text', 3, '5.1'),
(gen_random_uuid()::TEXT, '5.1.4', 'What patterns of failure have been identified in the model?', 'Medium', 'Long text', 4, '5.1'),

-- Topic 6.1 - User Notification of AI System Use
(gen_random_uuid()::TEXT, '6.1.1', 'Have users been adequately trained on the appropriate usage of the AI system?', 'High', 'Long text', 1, '6.1'),
(gen_random_uuid()::TEXT, '6.1.2', 'In what ways has your organization communicated these AI-related values externally?', 'Medium', 'Long text', 2, '6.1'),
(gen_random_uuid()::TEXT, '6.1.3', 'If the AI system performs automated decision-making using personal data, is there meaningful information provided?', 'Medium', 'Long text', 3, '6.1'),
(gen_random_uuid()::TEXT, '6.1.4', 'Is it clear to end users what the consequences are of decision making by the AI?', 'Medium', 'Long text', 4, '6.1'),

-- Topic 7.1 - Oversight Documentation
(gen_random_uuid()::TEXT, '7.1.1', 'How is the supervision of the AI system designed to ensure human oversight?', 'High', 'Long text', 1, '7.1'),
(gen_random_uuid()::TEXT, '7.1.2', 'How is the effectiveness of human oversight ensured?', 'High', 'Long text', 2, '7.1'),
(gen_random_uuid()::TEXT, '7.1.3', 'What is your organization''s strategy for conducting periodic reviews of the AI application?', 'Medium', 'Long text', 3, '7.1'),

-- Topic 7.2 - Human Intervention Mechanisms
(gen_random_uuid()::TEXT, '7.2.1', 'How is human oversight empowered to stop or alter the AI system''s operations?', 'High', 'Long text', 1, '7.2'),
(gen_random_uuid()::TEXT, '7.2.2', 'To what extent is human deliberation replaced by automated systems?', 'Medium', 'Long text', 2, '7.2'),

-- Topic 8.1 - System Validation and Reliability Documentation
(gen_random_uuid()::TEXT, '8.1.1', 'What is your strategy for testing the model?', 'High', 'Long text', 1, '8.1'),
(gen_random_uuid()::TEXT, '8.1.2', 'How will the AI system be served to end-users?', 'High', 'Long text', 2, '8.1'),

-- Topic 8.2 - AI System Change Documentation
(gen_random_uuid()::TEXT, '8.2.1', 'What monitoring systems will be in place to track the AI system''s performance?', 'Medium', 'Long text', 1, '8.2'),
(gen_random_uuid()::TEXT, '8.2.2', 'Are the details of the cloud provider and secure deployment architecture clearly defined?', 'Medium', 'Long text', 2, '8.2'),
(gen_random_uuid()::TEXT, '8.2.3', 'How will your organization detect and address risks associated with changing data quality?', 'Medium', 'Long text', 3, '8.2'),

-- Topic 9.1 - EU Database Registration
(gen_random_uuid()::TEXT, '9.1.1', 'How has your organization defined and documented the set of values that guide the development and deployment of AI systems?', 'High', 'Long text', 1, '9.1'),
(gen_random_uuid()::TEXT, '9.1.2', 'What governance framework has your organization implemented for AI projects?', 'Medium', 'Long text', 2, '9.1'),
(gen_random_uuid()::TEXT, '9.1.3', 'Internal regular schedule of self-assessment and certification', 'Medium', 'Long text', 3, '9.1'),

-- Topic 10.1 - Post-Market Monitoring by Providers
(gen_random_uuid()::TEXT, '10.1.1', 'What processes have been established for users of the AI system to raise concerns?', 'Medium', 'Long text', 1, '10.1'),
(gen_random_uuid()::TEXT, '10.1.2', 'What is your organization''s problem-to-resolution process for issues?', 'High', 'Long text', 2, '10.1'),
(gen_random_uuid()::TEXT, '10.1.3', 'How will your organization update the AI application on an ongoing basis?', 'Medium', 'Long text', 3, '10.1'),

-- Topic 11.1 - Bias and Fairness Evaluation
(gen_random_uuid()::TEXT, '11.1.1', 'What measures have been undertaken to address bias in the AI system''s training data?', 'High', 'Long text', 1, '11.1'),
(gen_random_uuid()::TEXT, '11.1.2', 'Are there specific groups that are favored or disadvantaged?', 'High', 'Long text', 2, '11.1'),
(gen_random_uuid()::TEXT, '11.1.3', 'Is your user base comprised of individuals or groups from vulnerable populations?', 'High', 'Long text', 3, '11.1'),

-- Topic 12.1 - System Information Documentation
(gen_random_uuid()::TEXT, '12.1.1', 'Who in your organization is responsible for ensuring and demonstrating that AI systems adhere to defined organizational values?', 'High', 'Long text', 1, '12.1'),
(gen_random_uuid()::TEXT, '12.1.2', 'Are the inputs and outputs of the AI system logged?', 'Medium', 'Long text', 2, '12.1'),
(gen_random_uuid()::TEXT, '12.1.3', 'To what extent does the deployment of AI influence legal certainty and civil liberties?', 'High', 'Long text', 3, '12.1'),
(gen_random_uuid()::TEXT, '12.1.4', 'What strategies has your organization developed to address the risks associated with decommissioning the AI system?', 'Medium', 'Long text', 4, '12.1'),

-- Topic 13.1 - Transparency Obligations
(gen_random_uuid()::TEXT, '13.1.1', 'What are the primary objectives of your AI application?', 'High', 'Long text', 1, '13.1'),
(gen_random_uuid()::TEXT, '13.1.2', 'Provide the high-level business process logic of the AI system', 'High', 'Long text', 2, '13.1'),
(gen_random_uuid()::TEXT, '13.1.3', 'To what extent can the operation of the application/algorithm be explained to end users?', 'Medium', 'Long text', 3, '13.1'),

-- Topic 14.1 - Environmental Impact Assessment
(gen_random_uuid()::TEXT, '14.1.1', 'How has your organization assessed the overall environmental impact of this AI application?', 'Low', 'Long text', 1, '14.1'),
(gen_random_uuid()::TEXT, '14.1.2', 'What are the environmental effects of the AI application?', 'Low', 'Long text', 2, '14.1')

ON CONFLICT ("questionId") DO UPDATE SET
"question" = EXCLUDED."question",
"priority" = EXCLUDED."priority",
"answerType" = EXCLUDED."answerType",
"orderIndex" = EXCLUDED."orderIndex",
"subtopicId" = EXCLUDED."subtopicId";