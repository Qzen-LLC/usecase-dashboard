-- EU AI Act Control Categories Population Script - Part 3 (Categories 10-13)
-- Run this in Supabase SQL Editor after running parts 1 and 2

-- Insert Control Structures for Category 10
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '10.1', 'Conformity Assessment Engagement', 'Engage with notified bodies or conduct internal assessments', 1, '10'),
(gen_random_uuid(), '10.2', 'Authority Response Processes', 'Establish processes for responding to authorities', 2, '10'),
(gen_random_uuid(), '10.3', 'Conformity Documentation Management', 'Maintain comprehensive conformity documentation and records', 3, '10'),
(gen_random_uuid(), '10.4', 'EU Database Data Entry Timeliness', 'Ensure timely and accurate database entries', 4, '10')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 10
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '10.1.1', 'Assessment Engagement', 'We engage with notified bodies or conduct internal conformity assessments', 1, '10.1'),
(gen_random_uuid(), '10.2.1', 'Authority Request Response', 'We establish processes to respond to national authority requests', 1, '10.2'),
(gen_random_uuid(), '10.3.1', 'Conformity Documentation', 'We maintain thorough documentation of AI system conformity', 1, '10.3'),
(gen_random_uuid(), '10.3.2', 'Registration Records', 'We keep records of registration and any subsequent updates', 2, '10.3'),
(gen_random_uuid(), '10.4.1', 'Timely Data Entry', 'We ensure timely and accurate data entry into the EU database', 1, '10.4')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 11
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '11.1', 'Impact Measurement Methodology', 'Define methods and tools for measuring AI system impacts', 1, '11'),
(gen_random_uuid(), '11.2', 'AI System Operations Monitoring', 'Monitor AI system operations according to usage instructions', 2, '11'),
(gen_random_uuid(), '11.3', 'Error and Incident Response', 'Track and respond to errors and incidents systematically', 3, '11'),
(gen_random_uuid(), '11.4', 'Expert and User Consultation', 'Consult with experts and end-users for risk management', 4, '11'),
(gen_random_uuid(), '11.5', 'AI System Change Documentation', 'Document and manage AI system changes and compliance', 5, '11')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 11
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '11.1.1', 'Impact Measurement Definition', 'We define methods and tools for measuring AI system impacts', 1, '11.1'),
(gen_random_uuid(), '11.2.1', 'Operations Monitoring', 'We monitor AI system operations based on usage instructions', 1, '11.2'),
(gen_random_uuid(), '11.3.1', 'Error Response Tracking', 'We track and respond to errors and incidents through measurable activities', 1, '11.3'),
(gen_random_uuid(), '11.4.1', 'Risk Management Consultation', 'We consult with experts and end-users to inform risk management', 1, '11.4'),
(gen_random_uuid(), '11.5.1', 'Objective Evaluation', 'We continuously evaluate if AI systems meet objectives and decide on ongoing deployment', 1, '11.5'),
(gen_random_uuid(), '11.5.2', 'Change and Metrics Documentation', 'We document pre-determined changes and performance metrics', 2, '11.5'),
(gen_random_uuid(), '11.5.3', 'Regulatory Compliance Updates', 'We regularly review and update AI systems to maintain regulatory compliance', 3, '11.5'),
(gen_random_uuid(), '11.5.4', 'Change Assessment Documentation', 'We ensure that any system changes are documented and assessed for compliance', 4, '11.5')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 12
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '12.1', 'Unexpected Impact Integration', 'Capture and integrate unexpected impact inputs', 1, '12'),
(gen_random_uuid(), '12.2', 'AI Model Capability Assessment', 'Assess AI model capabilities using appropriate tools', 2, '12'),
(gen_random_uuid(), '12.3', 'Post-Deployment Incident Monitoring', 'Monitor and respond to incidents after deployment', 3, '12'),
(gen_random_uuid(), '12.4', 'AI System Logging Implementation', 'Implement comprehensive logging systems for AI operations', 4, '12'),
(gen_random_uuid(), '12.5', 'Serious Incident Immediate Reporting', 'Ensure immediate reporting of serious incidents to relevant parties', 5, '12')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 12
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '12.1.1', 'Impact Input Integration', 'We implement processes to capture and integrate unexpected impact inputs', 1, '12.1'),
(gen_random_uuid(), '12.2.1', 'Capability Assessment', 'We assess AI model capabilities using appropriate tools', 1, '12.2'),
(gen_random_uuid(), '12.3.1', 'Unexpected Risk Planning', 'We develop plans to address unexpected risks as they arise', 1, '12.3'),
(gen_random_uuid(), '12.3.2', 'Incident Response Monitoring', 'We monitor and respond to incidents post-deployment', 2, '12.3'),
(gen_random_uuid(), '12.4.1', 'Log Capture and Storage', 'We ensure providers implement systems for capturing and storing AI system logs', 1, '12.4'),
(gen_random_uuid(), '12.5.1', 'Immediate Incident Reporting', 'We immediately report serious incidents to providers, importers, distributors, and relevant authorities', 1, '12.5')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Insert Control Structures for Category 13
INSERT INTO "EuAiActControlStruct" (id, "controlId", title, description, "orderIndex", "categoryId") VALUES
(gen_random_uuid(), '13.1', 'Unexpected Impact Integration', 'Capture and integrate unexpected impact inputs', 1, '13'),
(gen_random_uuid(), '13.2', 'AI Model Capability Assessment', 'Assess AI model capabilities using appropriate tools', 2, '13'),
(gen_random_uuid(), '13.3', 'Post-Deployment Incident Monitoring', 'Monitor and respond to incidents after deployment', 3, '13'),
(gen_random_uuid(), '13.4', 'AI System Logging Implementation', 'Implement comprehensive logging systems for AI operations', 4, '13'),
(gen_random_uuid(), '13.5', 'Serious Incident Immediate Reporting', 'Ensure immediate reporting of serious incidents to relevant parties', 5, '13')
ON CONFLICT ("controlId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "categoryId" = EXCLUDED."categoryId";

-- Insert Subcontrol Structures for Category 13
INSERT INTO "EuAiActSubcontrolStruct" (id, "subcontrolId", title, description, "orderIndex", "controlId") VALUES
(gen_random_uuid(), '13.1.1', 'Impact Input Integration', 'We implement processes to capture and integrate unexpected impact inputs', 1, '13.1'),
(gen_random_uuid(), '13.2.1', 'Capability Assessment', 'We assess AI model capabilities using appropriate tools', 1, '13.2'),
(gen_random_uuid(), '13.3.1', 'Unexpected Risk Planning', 'We develop plans to address unexpected risks as they arise', 1, '13.3'),
(gen_random_uuid(), '13.3.2', 'Incident Response Monitoring', 'We monitor and respond to incidents post-deployment', 2, '13.3'),
(gen_random_uuid(), '13.4.1', 'Log Capture and Storage', 'We ensure providers implement systems for capturing and storing AI system logs', 1, '13.4'),
(gen_random_uuid(), '13.5.1', 'Immediate Incident Reporting', 'We immediately report serious incidents to providers, importers, distributors, and relevant authorities', 1, '13.5')
ON CONFLICT ("subcontrolId") DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "orderIndex" = EXCLUDED."orderIndex",
  "controlId" = EXCLUDED."controlId";

-- Verification Query - Run this to check the data was inserted correctly
SELECT 
  cc.title as category_title,
  COUNT(DISTINCT cs."controlId") as control_count,
  COUNT(sc."subcontrolId") as subcontrol_count
FROM "EuAiActControlCategory" cc
LEFT JOIN "EuAiActControlStruct" cs ON cc."categoryId" = cs."categoryId"
LEFT JOIN "EuAiActSubcontrolStruct" sc ON cs."controlId" = sc."controlId"
GROUP BY cc."categoryId", cc.title, cc."orderIndex"
ORDER BY cc."orderIndex";