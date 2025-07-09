# Complete EU AI ACT and ISO 42001 Framework Documentation for VerifyWise

## Table of Contents
1. [Overview](#overview)
2. [EU AI ACT Framework](#eu-ai-act-framework)
   - [Assessment Questions](#assessment-questions)
   - [Compliance Controls](#compliance-controls)
3. [ISO 42001 Framework](#iso-42001-framework)
   - [Subclauses](#subclauses)
   - [Annex Categories](#annex-categories)
4. [Technical Implementation](#technical-implementation)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)

## Overview

VerifyWise implements two major AI governance frameworks:
- **EU AI ACT**: European Union's AI regulation framework with 14 assessment topics and 13 compliance control categories
- **ISO 42001**: International standard for AI management systems with 7 clauses and 7 annex categories

Both frameworks provide comprehensive coverage of AI governance requirements with detailed questions, controls, and implementation guidance.

## EU AI ACT Framework

### Assessment Questions

The EU AI ACT Assessment Tracker contains 14 main topics with detailed questions for AI system evaluation:

#### 1. Project Scope

**1.1 General**
- **Q1:** Describe the AI environment/application used (High Priority, Long text)
- **Q2:** Is a new form of AI technology used? (High Priority, Long text)
- **Q3:** Are personal sensitive data used? (High Priority, Long text)
- **Q4:** Project scope documents description (High Priority, Long text)

**1.2 Technology Details**
- **Q1:** What type of AI technology are you using? Explain AI and ML technologies used (High Priority, Long text)
- **Q2:** Is there ongoing monitoring of the system to ensure that the system is operating as intended? (High Priority, Long text)
- **Q3:** Have you considered unintended outcomes that could occur from the use of this system? (High Priority, Long text)
- **Q4:** Add technology documentation. You can include a data flow diagram, MLops lifecycle diagram (High Priority, Long text)

#### 2. Risk Management System

**2.1 Transparency and Provision of Information to Deployers**
- **Q1:** Will you make substantial modifications to the high-risk AI system already on the EU market? (High Priority, Long text)
- **Q2:** What business problem does the AI system solve, and what are its capabilities? (High Priority, Long text)
- **Q3:** How has your organization assessed the AI application against its ethical values? (High Priority, Long text)

**2.2 Responsibilities Along the AI Value Chain**
- **Q1:** Specify details of any third-party involvement in the design, development, deployment, and support of the AI system (High Priority, Long text)
- **Q2:** What risks were identified in the data impact assessment? (High Priority, Long text)
- **Q3:** How has the selection or development of the model been assessed with regard to fairness, explainability, and robustness? (High Priority, Long text)
- **Q4:** What strategies have been implemented to address the risks identified in the model assessment? (High Priority, Long text)

#### 3. Data Governance

**3.1 Responsibilities Along the AI Value Chain**
- **Q1:** What risks have been identified associated with the chosen deployment and serving strategies? (Medium Priority, Long text)
- **Q2:** What measures are in place to detect undesired behavior in our AI solution? (Medium Priority, Long text)
- **Q3:** How can any unforeseen effects be mitigated after deployment of the AI application? (High Priority, Long text)
- **Q4:** What is the possible harmful effect of uncertainty and error margins for different groups? (High Priority, Long text)
- **Q5:** What mechanisms are in place for reporting serious incidents and certain risks? (High Priority, Long text)
- **Q6:** What risks have been identified associated with potentially decommissioning the AI system? (Medium Priority, Long text)
- **Q7:** What data sources are being used to develop the AI application? (High Priority, Long text)
- **Q8:** Does the repository track and manage intellectual property rights and restrictions? (High Priority, Long text)

**3.2 Fundamental Rights Impact Assessments**
- **Q1:** How has your organization ensured the representativeness, relevance, accuracy, traceability, and completeness of the data? (Medium Priority, Long text)
- **Q2:** Provide details of the confidential and sensitive data processed by the AI system (High Priority, Long text)
- **Q3:** What are the legal bases for processing personal and sensitive data? (High Priority, Long text)
- **Q4:** Describe the measures in place to ensure that the AI system does not leak private or sensitive data (High Priority, Long text)
- **Q5:** How has legal compliance with respect to data protection (e.g., GDPR) been assessed and ensured? (High Priority, Long text)
- **Q6:** Provide details of the measures in place to comply with data subject requests (High Priority, Long text)
- **Q7:** Has the organization determined how the privacy of those involved is protected? (High Priority, Long text)
- **Q8:** Can the user delete their data from the system? (Medium Priority, Long text)

#### 4. Technical Documentation

**4.1 AI Model Capability Assessment**
- **Q1:** What is the source of the model being used? (High Priority, Long text)
- **Q2:** What is your strategy for validating the model? (Medium Priority, Long text)
- **Q3:** How is your organization documenting AI performance in the training environment? (High Priority, Long text)

#### 5. Record Keeping

**5.1 AI Model Capability Assessment**
- **Q1:** What performance criteria have been established for the AI application? (Medium Priority, Long text)
- **Q2:** Describe the policies and procedures in place for retaining automatically generated logs (Medium Priority, Long text)
- **Q3:** How has your organization tested the model's performance on extreme values and protected attributes? (Medium Priority, Long text)
- **Q4:** What patterns of failure have been identified in the model? (Medium Priority, Long text)

#### 6. Transparency and User Information

**6.1 User Notification of AI System Use**
- **Q1:** Have users been adequately trained on the appropriate usage of the AI system? (High Priority, Long text)
- **Q2:** In what ways has your organization communicated these AI-related values externally? (Medium Priority, Long text)
- **Q3:** If the AI system performs automated decision-making using personal data, is there meaningful information provided? (Medium Priority, Long text)
- **Q4:** Is it clear to end users what the consequences are of decision making by the AI? (Medium Priority, Long text)

#### 7. Human Oversight

**7.1 Oversight Documentation**
- **Q1:** How is the supervision of the AI system designed to ensure human oversight? (High Priority, Long text)
- **Q2:** How is the effectiveness of human oversight ensured? (High Priority, Long text)
- **Q3:** What is your organization's strategy for conducting periodic reviews of the AI application? (Medium Priority, Long text)

**7.2 Human Intervention Mechanisms**
- **Q1:** How is human oversight empowered to stop or alter the AI system's operations? (High Priority, Long text)
- **Q2:** To what extent is human deliberation replaced by automated systems? (Medium Priority, Long text)

#### 8. Accuracy, Robustness, and Cybersecurity

**8.1 System Validation and Reliability Documentation**
- **Q1:** What is your strategy for testing the model? (High Priority, Long text)
- **Q2:** How will the AI system be served to end-users? (High Priority, Long text)

**8.2 AI System Change Documentation**
- **Q1:** What monitoring systems will be in place to track the AI system's performance? (Medium Priority, Long text)
- **Q2:** Are the details of the cloud provider and secure deployment architecture clearly defined? (Medium Priority, Long text)
- **Q3:** How will your organization detect and address risks associated with changing data quality? (Medium Priority, Long text)

#### 9. Conformity Assessment

**9.1 EU Database Registration**
- **Q1:** How has your organization defined and documented the set of values that guide the development and deployment of AI systems? (High Priority, Long text)
- **Q2:** What governance framework has your organization implemented for AI projects? (Medium Priority, Long text)
- **Q3:** Internal regular schedule of self-assessment and certification (Medium Priority, Long text)

#### 10. Post-Market Monitoring

**10.1 Post-Market Monitoring by Providers**
- **Q1:** What processes have been established for users of the AI system to raise concerns? (Medium Priority, Long text)
- **Q2:** What is your organization's problem-to-resolution process for issues? (High Priority, Long text)
- **Q3:** How will your organization update the AI application on an ongoing basis? (Medium Priority, Long text)

#### 11. Bias Monitoring and Mitigation

**11.1 Bias and Fairness Evaluation**
- **Q1:** What measures have been undertaken to address bias in the AI system's training data? (High Priority, Long text)
- **Q2:** Are there specific groups that are favored or disadvantaged? (High Priority, Long text)
- **Q3:** Is your user base comprised of individuals or groups from vulnerable populations? (High Priority, Long text)

#### 12. Accountability and Governance

**12.1 System Information Documentation**
- **Q1:** Who in your organization is responsible for ensuring and demonstrating that AI systems adhere to defined organizational values? (High Priority, Long text)
- **Q2:** Are the inputs and outputs of the AI system logged? (Medium Priority, Long text)
- **Q3:** To what extent does the deployment of AI influence legal certainty and civil liberties? (High Priority, Long text)
- **Q4:** What strategies has your organization developed to address the risks associated with decommissioning the AI system? (Medium Priority, Long text)

#### 13. Explainability

**13.1 Transparency Obligations**
- **Q1:** What are the primary objectives of your AI application? (High Priority, Long text)
- **Q2:** Provide the high-level business process logic of the AI system (High Priority, Long text)
- **Q3:** To what extent can the operation of the application/algorithm be explained to end users? (Medium Priority, Long text)

#### 14. Environmental Impact

**14.1 Environmental Impact Assessment**
- **Q1:** How has your organization assessed the overall environmental impact of this AI application? (Low Priority, Long text)
- **Q2:** What are the environmental effects of the AI application? (Low Priority, Long text)

### Compliance Controls

The EU AI ACT Compliance Tracker contains 13 control categories with detailed controls and subcontrols:

#### 1. AI Literacy and Responsible AI Training

**Control 1.1: AI Literacy and Responsible AI Training**
- **Subcontrol 1.1.1:** We ensure executive leadership takes responsibility for decisions related to AI risks
- **Subcontrol 1.1.2:** We provide AI literacy and ethics training to relevant personnel
- **Subcontrol 1.1.3:** We develop a clear and concise communication plan for informing workers about the use of high-risk AI systems

**Control 1.2: Regulatory Training and Response Procedures**
- **Subcontrol 1.2.1:** We clearly define roles and responsibilities related to AI risk management
- **Subcontrol 1.2.2:** We train personnel on the requirements of the regulation and the process for responding to requests

#### 2. Transparency and Provision of Information to Deployers

**Control 2.1: Intended Use Description**
- **Subcontrol 2.1.1:** We provide detailed descriptions of the AI system's intended use

**Control 2.2: Technical Documentation Review**
- **Subcontrol 2.2.1:** We review and verify technical documentation from providers

**Control 2.3: Record Maintenance of AI System Activities**
- **Subcontrol 2.3.1:** We maintain accurate records of all AI system activities, including modifications and third-party involvements

**Control 2.4: System Information Documentation**
- **Subcontrol 2.4.1:** We document system information, including functionality, limitations, and risk controls
- **Subcontrol 2.4.2:** We define and document forbidden uses and foresee potential misuse

**Control 2.5: Dataset Description**
- **Subcontrol 2.5.1:** We describe training, validation, and testing datasets used

**Control 2.6: Mitigation Strategies and Bias Testing**
- **Subcontrol 2.6.1:** We explain mitigation strategies and bias testing results

**Control 2.7: AI System Accuracy and Security Information**
- **Subcontrol 2.7.1:** We provide accuracy metrics, robustness, and cybersecurity information

#### 3. Human Oversight

**Control 3.1: Human Intervention Mechanisms**
- **Subcontrol 3.1.1:** We define mechanisms for human intervention or override of AI outputs
- **Subcontrol 3.1.2:** We assign competent individuals with authority to oversee AI system usage
- **Subcontrol 3.1.3:** We align oversight measures with provider's instructions for use

**Control 3.2: Oversight Documentation**
- **Subcontrol 3.2.1:** We document system limitations and human oversight options
- **Subcontrol 3.2.2:** We establish appeal processes related to AI system decisions

**Control 3.3: Oversight Communication**
- **Subcontrol 3.3.1:** We ensure clear communication of AI system capabilities, limitations, and risks to human operators
- **Subcontrol 3.3.2:** We proportion oversight measures to match AI system's risk level and autonomy

#### 4. Corrective Actions and Duty of Information

**Control 4.1: Proportionate Oversight Measures**
- **Subcontrol 4.1.1:** We consult with diverse experts and end-users to inform corrective measures

**Control 4.2: System Validation and Reliability Documentation**
- **Subcontrol 4.2.1:** We validate and document system reliability and standards compliance
- **Subcontrol 4.2.2:** We sustain AI system value post-deployment through continuous improvements

**Control 4.3: Prompt Corrective Actions Implementation**
- **Subcontrol 4.3.1:** We implement corrective actions as required by Article 20 to address identified risks or issues
- **Subcontrol 4.3.2:** We ensure mechanisms are in place to withdraw, disable, or recall non-conforming AI systems

**Control 4.4: Documentation of Corrective Actions**
- **Subcontrol 4.4.1:** We maintain documentation of corrective actions taken

#### 5. Responsibilities Along the AI Value Chain

**Control 5.1: Due Diligence Before Association**
- **Subcontrol 5.1.1:** We conduct thorough due diligence before associating with high-risk AI systems

**Control 5.2: Contractual Agreements**
- **Subcontrol 5.2.1:** We establish clear contractual agreements with AI system providers

**Control 5.3: Third-Party Supplier Responsibilities**
- **Subcontrol 5.3.1:** We define responsibilities in agreements with third-party suppliers of AI components

**Control 5.4: Regulatory Compliance Requirements**
- **Subcontrol 5.4.1:** We specify information, technical access, and support required for regulatory compliance

**Control 5.5: Third-Party Standards Compliance**
- **Subcontrol 5.5.1:** We ensure third-party impacts, such as IP infringement, meet organizational standards

**Control 5.6: AI System Deactivation Mechanisms**
- **Subcontrol 5.6.1:** We maintain mechanisms to deactivate AI systems if performance deviates from intended use

**Control 5.7: Incident Monitoring for Third-Party Components**
- **Subcontrol 5.7.1:** We monitor and respond to incidents involving third-party components

**Control 5.8: System Resilience Enhancement**
- **Subcontrol 5.8.1:** We implement measures to enhance AI system resilience against errors and faults

**Control 5.9: Non-Conformity Assessment**
- **Subcontrol 5.9.1:** We identify and assess potential non-conformities with regulations

## ISO 42001 Framework

### Subclauses

The ISO 42001 framework contains 7 main clauses with detailed subclauses for AI management systems:

#### 4. Context of the Organization

**4.1 Understanding the Organization and Its Context**
- **Summary:** Determine external and internal issues relevant to the organization's purpose and its AIMS
- **Questions:** What internal factors influence our AIMS? What external factors influence our AIMS? How does our use/development of AI align with our business strategy?
- **Evidence Examples:** Context analysis document (PESTLE, SWOT focused on AI), Documentation of internal/external issues, Strategic planning documents referencing AI

**4.2 Understanding the Needs and Expectations of Interested Parties**
- **Summary:** Identify interested parties relevant to the AIMS and their requirements/expectations concerning AI
- **Questions:** Who are the interested parties for our AI systems? What are their relevant needs, expectations, and requirements? How do we capture and review these requirements?
- **Evidence Examples:** Stakeholder analysis matrix/register, List of applicable legal/regulatory requirements for AI, Records of communication with stakeholders

**4.3 Determining the Scope of the AI Management System**
- **Summary:** Define the boundaries and applicability of the AIMS within the organization
- **Questions:** What organizational units, processes, locations are included in the AIMS? Which specific AI systems or applications are covered? What stages of the AI lifecycle are included?
- **Evidence Examples:** Documented AIMS Scope Statement

**4.4 AI Management System**
- **Summary:** Establish, implement, maintain, and continually improve the AIMS in accordance with ISO 42001 requirements
- **Questions:** Do we have the necessary processes and documentation established for the AIMS? Are these processes being followed? Are there mechanisms for maintaining and updating the AIMS?
- **Evidence Examples:** The AIMS documentation itself (policies, procedures), Records of implementation activities, Management review records, Audit results

#### 5. Leadership

**5.1 Leadership and Commitment**
- **Summary:** Top management must demonstrate leadership by ensuring policy/objectives alignment, resource availability, integration, communication, and promoting improvement
- **Questions:** How does top management show active involvement and support for the AIMS? Are AIMS objectives aligned with strategic goals? Are sufficient resources allocated?
- **Evidence Examples:** Management meeting minutes discussing AIMS, Resource allocation records (budget, staffing), Internal communications from leadership

**5.2 Policy**
- **Summary:** Establish, communicate, and maintain an AI Policy appropriate to the organization's context
- **Questions:** Is there a documented AI Policy? Does it include commitments to requirements and continual improvement? Does it align with organizational AI principles/ethics?
- **Evidence Examples:** The documented AI Policy, Communication records (emails, intranet posts), Training materials covering the policy

**5.3 Organizational Roles, Responsibilities, and Authorities**
- **Summary:** Assign and communicate responsibilities and authorities for roles relevant to the AIMS
- **Questions:** Who is ultimately accountable for the AIMS? Who is responsible for specific AIMS tasks? Are these roles, responsibilities, and authorities documented and communicated?
- **Evidence Examples:** Organization chart showing AIMS roles, Documented role descriptions, Responsibility Assignment Matrix (RACI)

#### 6. Planning

**6.1 Actions to Address Risks and Opportunities**
- **Summary:** Plan actions based on context, stakeholders, risks, and opportunities. Conduct AI risk assessments, plan risk treatments, and assess AI system impacts
- **Questions:** Do we have a process for identifying risks and opportunities related to the AIMS? Is there a defined AI risk assessment methodology? Are risks related to AI systems systematically identified and assessed?
- **Evidence Examples:** Risk management framework/policy/procedure, AI Risk Assessment Methodology, Risk assessment reports per AI system, AI Risk Register, AI Risk Treatment Plan

**6.2 AI Objectives and Planning to Achieve Them**
- **Summary:** Establish measurable AIMS objectives aligned with the AI policy and plan how to achieve them
- **Questions:** What are the specific, measurable objectives for our AIMS? Are they consistent with the AI policy and organizational goals? What actions, resources, responsibilities, and timelines are defined?
- **Evidence Examples:** Documented AIMS Objectives, Action plans linked to objectives, Performance indicators (KPIs) for objectives, Management review records discussing objectives progress

#### 7. Support

**7.1 Resources**
- **Summary:** Determine and provide the resources needed for the AIMS
- **Questions:** What resources (human, financial, technological, infrastructure) are needed? Have these resources been identified and allocated?
- **Evidence Examples:** Budget approvals, Staffing plans, Technology acquisition records, Facility plans

**7.2 Competence**
- **Summary:** Ensure personnel involved in the AIMS are competent based on education, training, or experience
- **Questions:** What competencies are required for different AIMS roles? How do we ensure individuals possess these competencies? Are training needs identified and addressed?
- **Evidence Examples:** Job descriptions with competency requirements, Competency matrix, Training plans and records, Performance reviews, Certifications

**7.3 Awareness**
- **Summary:** Ensure relevant personnel are aware of the AI policy, their contribution, and the implications of non-conformance
- **Questions:** Are staff aware of the AI Policy? Do they understand how their work contributes to the AIMS and AI ethics? Are they aware of the benefits of effective AI governance?
- **Evidence Examples:** Awareness training materials and attendance logs, Internal communications (newsletters, posters), Onboarding materials

**7.4 Communication**
- **Summary:** Determine and implement internal and external communications relevant to the AIMS
- **Questions:** What needs to be communicated about the AIMS? When, how, and with whom does communication occur? Who is responsible for communication?
- **Evidence Examples:** Communication plan/matrix, Records of communications (meeting minutes, emails, public statements)

**7.5 Documented Information**
- **Summary:** Manage documented information required by the standard and necessary for AIMS effectiveness
- **Questions:** What documentation is required by ISO 42001? What other documentation do we need for our AIMS to be effective? How do we ensure documents are properly identified, formatted, reviewed, approved, version controlled?
- **Evidence Examples:** Document control procedure, Master document list / Document register, Version history in documents, Access control records, Backup procedures

#### 8. Operation

**8.1 Operational Planning and Control**
- **Summary:** Plan, implement, and control processes to meet requirements, implement actions from Clause 6, manage changes, and control outsourced processes
- **Questions:** How are operational processes (related to AI development/deployment/use) planned and controlled? How are changes to these processes or AI systems managed? How do we control processes outsourced to third parties?
- **Evidence Examples:** Standard Operating Procedures (SOPs) for AI lifecycle stages, Change management procedures and records, Supplier contracts and oversight procedures

**8.2 AI Risk Assessment (Operational)**
- **Summary:** Perform AI risk assessments operationally (at planned intervals or upon significant changes)
- **Questions:** How often are AI risk assessments reviewed and updated? What triggers an ad-hoc risk assessment?
- **Evidence Examples:** Schedule/plan for risk assessment reviews, Updated risk assessment reports

**8.3 AI Risk Treatment (Operational)**
- **Summary:** Implement the AI risk treatment plan
- **Questions:** Are the controls defined in the risk treatment plan actually implemented? Is there evidence of control operation?
- **Evidence Examples:** Records of control implementation (configuration settings, logs, procedure execution records), Completed checklists, Training records related to specific controls

**8.4 AI System Lifecycle**
- **Summary:** Define and implement processes for managing the entire AI system lifecycle consistent with policy, objectives, and impact assessments
- **Questions:** Do we have documented processes for each stage? How are AI principles embedded in these processes? How is documentation managed throughout the lifecycle?
- **Evidence Examples:** Documented AI system lifecycle process description, Project plans, Requirements specifications, Design documents, Data processing procedures

**8.5 Third-Party Relationships**
- **Summary:** Manage risks associated with third-party suppliers/partners involved in the AI lifecycle
- **Questions:** How do we identify and assess risks related to third-party AI components or services? Are AI-specific requirements included in contracts? How do we monitor third-party performance?
- **Evidence Examples:** Third-party risk management procedure, Supplier assessment questionnaires/reports, Contracts with AI clauses, Supplier audit reports

#### 9. Performance Evaluation

**9.1 Monitoring, Measurement, Analysis, and Evaluation**
- **Summary:** Determine what needs monitoring/measuring, the methods, frequency, and how results are analyzed/evaluated
- **Questions:** What aspects of the AIMS and AI systems are monitored/measured? What methods are used? How often is data collected and analyzed? Who analyzes/evaluates? How are results used?
- **Evidence Examples:** Monitoring procedure, Defined metrics/KPIs, Monitoring logs/reports, Performance dashboards, Analysis reports

**9.2 Internal Audit**
- **Summary:** Conduct internal audits at planned intervals to ensure the AIMS conforms to requirements and is effectively implemented
- **Questions:** Is there an audit program? Are audits conducted by objective auditors? Are criteria/scope defined? Are results reported? Are nonconformities addressed?
- **Evidence Examples:** Internal audit procedure, Audit programme/schedule, Audit plans/reports, Auditor competence records, Nonconformity reports

**9.3 Management Review**
- **Summary:** Top management must review the AIMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness
- **Questions:** Are reviews conducted regularly? Does review cover required inputs? Are decisions made regarding improvements/changes? Are minutes documented?
- **Evidence Examples:** Management review procedure, Review schedule/agendas/minutes, Action items tracker

#### 10. Improvement

**10.1 Nonconformity and Corrective Action**
- **Summary:** React to nonconformities, evaluate need for action, implement corrective actions, review effectiveness, and update AIMS if needed
- **Questions:** Is there a process for nonconformities? How is correction handled? Is root cause analysis performed? How are corrective actions tracked and verified? Are changes made to AIMS?
- **Evidence Examples:** Corrective action procedure, Nonconformity register, Root cause analysis records, Corrective action plans/verification

**10.2 Continual Improvement**
- **Summary:** Continually improve the suitability, adequacy, and effectiveness of the AIMS
- **Questions:** How does the organization use results to drive improvement? Is there evidence of ongoing efforts?
- **Evidence Examples:** Management review outputs, Updated policies/procedures, Improvement project records, Trend analysis

### Annex Categories

The ISO 42001 Annex A contains 7 control categories with detailed controls and guidance:

#### A.5 Organizational Policies and Governance

**A.5.1.1 Policies for AI**
- **Description:** Management direction and support for AI via policies
- **Guidance:** Management should define and endorse a set of policies to provide clear direction and support for AI development and use within the organization

**A.5.2.1 AI Governance Framework**
- **Description:** Establishment of a governance structure for AI oversight
- **Guidance:** An AI governance framework, including roles, responsibilities, processes, and oversight mechanisms, should be established and maintained

**A.5.3.1 AI Roles and Responsibilities**
- **Description:** Defining and allocating AI responsibilities
- **Guidance:** All AI system related responsibilities should be defined and allocated

**A.5.3.2 Segregation of Duties**
- **Description:** Separating conflicting duties related to AI
- **Guidance:** Conflicting duties and areas of responsibility should be segregated

**A.5.4.1 Accountability for AI Systems**
- **Description:** Assigning accountability for AI systems
- **Guidance:** Accountability should be assigned for the establishment, implementation, maintenance, monitoring, evaluation and improvement of the AIMS

**A.5.5.1 Contact with Authorities**
- **Description:** Maintaining contact with relevant authorities
- **Guidance:** Appropriate contacts with relevant authorities should be maintained

**A.5.5.2 Contact with Special Interest Groups**
- **Description:** Maintaining contact with special interest groups
- **Guidance:** Appropriate contacts with special interest groups and other specialist forums should be maintained

**A.5.6.1 AI in Project Management**
- **Description:** Integrating AI aspects into project management
- **Guidance:** AI should be integrated into the organization's project management

#### A.6 Internal Organization

**A.6.1.1 AI Roles and Responsibilities**
- **Description:** Defining and allocating AI responsibilities
- **Guidance:** All responsibilities related to the development, deployment, operation, and governance of AI systems should be clearly defined and allocated

**A.6.1.2 Segregation of Duties**
- **Description:** Separating conflicting duties related to AI
- **Guidance:** Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification

#### A.7 Resources for AI Systems

**A.7.1.1 Identification of Resources**
- **Description:** Identifying resources needed for AI
- **Guidance:** Resources necessary for the development, operation, and maintenance of AI systems should be identified and managed

**A.7.2.1 Computational Resources**
- **Description:** Managing computational resources for AI
- **Guidance:** Computational resources required for AI systems should be managed throughout their lifecycle

**A.7.3.1 Data Resources**
- **Description:** Managing data resources for AI
- **Guidance:** Data resources required for AI systems should be managed throughout their lifecycle

**A.7.4.1 System Resources**
- **Description:** Managing system resources for AI
- **Guidance:** System resources required for AI systems, including tools and infrastructure, should be managed throughout their lifecycle

**A.7.5.1 Human Resources**
- **Description:** Managing human resources for AI
- **Guidance:** Human resources required for AI systems, including roles, competencies, and training, should be managed throughout their lifecycle

#### A.8 AI System Lifecycle

**A.8.1.1 AI System Lifecycle Management**
- **Description:** Establishing and managing a defined AI lifecycle process
- **Guidance:** A defined lifecycle process should be established and managed for AI systems, covering stages from conception through retirement

**A.8.2.1 AI System Requirements Analysis**
- **Description:** Analyzing and specifying AI system requirements
- **Guidance:** Requirements for AI systems, including functional, non-functional, data, ethical, legal, and societal aspects, should be analyzed and specified

**A.8.3.1 AI System Design**
- **Description:** Designing AI systems based on requirements
- **Guidance:** AI systems should be designed based on specified requirements, considering architecture, models, data handling, and interaction mechanisms

**A.8.4.1 Data Acquisition and Preparation**
- **Description:** Acquiring and preparing data for AI systems
- **Guidance:** Data for AI systems should be acquired, pre-processed, and prepared according to requirements and quality criteria

**A.8.5.1 Model Building and Evaluation**
- **Description:** Building, training, and evaluating AI models
- **Guidance:** AI models should be built, trained, tuned, and evaluated using appropriate techniques and metrics

**A.8.6.1 AI System Verification and Validation**
- **Description:** Verifying and validating AI systems
- **Guidance:** AI systems should be verified and validated against requirements before deployment

**A.8.7.1 AI System Deployment**
- **Description:** Deploying AI systems into the operational environment
- **Guidance:** AI systems should be deployed into the operational environment according to planned procedures

**A.8.8.1 AI System Operation and Monitoring**
- **Description:** Operating and monitoring AI systems
- **Guidance:** Deployed AI systems should be operated and monitored for performance, behaviour, and compliance with requirements

**A.8.9.1 AI System Maintenance and Retirement**
- **Description:** Maintaining and retiring AI systems
- **Guidance:** AI systems should be maintained throughout their operational life and retired securely when no longer needed

#### A.9 Data for AI Systems

**A.9.1.1 Data Quality for AI Systems**
- **Description:** Processes to ensure data quality characteristics
- **Guidance:** Processes should be implemented to ensure that data used for developing and operating AI systems meets defined quality criteria

**A.9.2.1 Data Acquisition**
- **Description:** Managing the acquisition of data for AI
- **Guidance:** Data acquisition processes should ensure data is obtained legally, ethically, and according to specified requirements

**A.9.3.1 Data Preparation**
- **Description:** Preparing data for use in AI systems
- **Guidance:** Data should be prepared (cleaned, transformed, annotated) suitable for its intended use in AI system development and operation

**A.9.4.1 Data Provenance**
- **Description:** Documenting the origin and history of data
- **Guidance:** Information about the origin, history, and processing steps applied to data (provenance) should be documented and maintained

**A.9.5.1 Data Privacy**
- **Description:** Protecting privacy in data used for AI
- **Guidance:** Privacy requirements should be addressed throughout the data lifecycle, including anonymization or pseudonymization where appropriate

**A.9.6.1 Data Handling**
- **Description:** Securely handling data throughout its lifecycle
- **Guidance:** Data should be handled securely, including storage, access control, transmission, and disposal, according to its classification

#### A.10 Information and Communication Technology (ICT)

**A.10.1.1 Information Security for AI Systems**
- **Description:** Application of information security controls to AI systems
- **Guidance:** Information security requirements and controls should be applied throughout the AI system lifecycle to protect confidentiality, integrity, and availability

**A.10.2.1 Security of AI Models**
- **Description:** Protecting AI models from threats
- **Guidance:** AI models should be protected against threats such as unauthorized access, modification, theft, or poisoning

**A.10.3.1 Security of AI Data**
- **Description:** Protecting data used by AI systems
- **Guidance:** Data used in AI systems should be protected according to information security policies and data classification

**A.10.4.1 Resilience of AI Systems**
- **Description:** Ensuring AI systems are resilient to failures and attacks
- **Guidance:** AI systems should be designed and operated to be resilient against failures, errors, and attacks

#### A.11 Third-Party Relationships

**A.11.1.1 Management of Third-Party AI Related Risks**
- **Description:** Managing risks when using third-party AI systems, components, or data
- **Guidance:** Risks associated with third-party provision or use of AI systems, components, services, or data should be identified, assessed, and managed

**A.11.2.1 Supplier Agreements for AI**
- **Description:** Including AI-specific requirements in supplier agreements
- **Guidance:** Agreements with third parties supplying AI systems, components, services, or data should include relevant AI-specific requirements

**A.11.3.1 Monitoring of Third-Party AI Services**
- **Description:** Monitoring third-party compliance and performance
- **Guidance:** The performance and compliance of third parties involved in the AI system lifecycle should be monitored according to agreements

## Technical Implementation

### Database Schema

#### EU AI ACT Tables
- **`topics_struct_eu`** - 14 assessment topics
- **`subtopics_struct_eu`** - 19 subtopics within topics
- **`questions_struct_eu`** - 65+ questions with metadata
- **`answers_eu`** - User answers with evidence files
- **`controlcategories_struct_eu`** - 13 control categories
- **`controls_struct_eu`** - 76+ controls
- **`subcontrols_struct_eu`** - 134+ subcontrols
- **`controls_eu`** - Control instances per project
- **`subcontrols_eu`** - Subcontrol instances per project

#### ISO 42001 Tables
- **`clauses_struct_iso`** - 7 main clauses
- **`subclauses_struct_iso`** - 24 subclauses
- **`subclauses_iso`** - User subclause implementations
- **`annex_struct_iso`** - 7 annex categories
- **`annexcategories_struct_iso`** - 37 annex items
- **`annexcategories_iso`** - User annex implementations

### API Endpoints

#### EU AI ACT Endpoints
- **GET /api/eu-ai-act/topics** - Get all topics
- **GET /api/eu-ai-act/assessments/byProjectId/:id** - Get assessments by project
- **GET /api/eu-ai-act/assessments/progress/:id** - Get assessment progress
- **PATCH /api/eu-ai-act/saveAnswer/:id** - Save answer
- **GET /api/eu-ai-act/controlCategories** - Get control categories
- **GET /api/eu-ai-act/compliances/byProjectId/:id** - Get compliance data
- **PATCH /api/eu-ai-act/saveControls/:id** - Save controls

#### ISO 42001 Endpoints
- **GET /api/iso-42001/clauses** - Get all clauses
- **GET /api/iso-42001/clauses/byProjectId/:id** - Get clauses by project
- **GET /api/iso-42001/clauses/progress/:id** - Get clause progress
- **PATCH /api/iso-42001/saveClauses/:id** - Save clauses
- **GET /api/iso-42001/annexes** - Get all annexes
- **GET /api/iso-42001/annexes/byProjectId/:id** - Get annexes by project
- **PATCH /api/iso-42001/saveAnnexes/:id** - Save annexes

### File Structure

```
Servers/
├── structures/
│   ├── EU-AI-Act/
│   │   ├── assessment-tracker/
│   │   │   ├── topics.struct.ts
│   │   │   └── subtopics/ (14 files)
│   │   └── compliance-tracker/
│   │       ├── controlCategories.struct.ts
│   │       └── controls/ (13 files)
│   └── ISO-42001/
│       ├── clauses/
│       │   ├── clauses.struct.ts
│       │   └── subclauses/ (7 files)
│       └── annex/
│           ├── annex.struct.ts
│           └── annexcategories/ (7 files)
├── controllers/
│   ├── eu.ctrl.ts
│   └── iso42001.ctrl.ts
├── routes/
│   ├── eu.route.ts
│   └── iso42001.route.ts
├── utils/
│   ├── eu.utils.ts
│   └── iso42001.utils.ts
└── domain.layer/
    └── frameworks/
        ├── EU-AI-Act/ (9 models)
        └── ISO-42001/ (7 models)
```

## Implementation Guidelines for Offshore Team

### Key Development Tasks

1. **Frontend Components**
   - Assessment questionnaire forms with rich text editors
   - Compliance control tracking interfaces
   - Progress dashboards and reporting
   - File upload components for evidence

2. **Backend Services**
   - CRUD operations for all framework entities
   - Progress calculation algorithms
   - File management for evidence uploads
   - Reporting and export functionality

3. **Database Operations**
   - Data seeding from structure files
   - Migration management
   - Performance optimization for large datasets

4. **Integration Points**
   - Project-framework linking
   - User role-based access control
   - Multi-tenant organization support

This comprehensive documentation provides the complete blueprint for implementing both EU AI ACT and ISO 42001 frameworks in the VerifyWise platform.