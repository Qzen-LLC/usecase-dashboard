# Comprehensive Risk Assessment Input Catalog

## 📊 1. Data & Information Layer

### Data Characteristics /Data Readiness
- **Data Types** *(Multi-select)*
  - [ ] Personal Identifiable Information (PII)
  - [ ] Sensitive Personal Data (race, religion, politics)
  - [ ] Financial Records
  - [ ] Health/Medical Records
  - [ ] Biometric Data
  - [ ] Location/GPS Data
  - [ ] Behavioral Data
  - [ ] Communications (emails, messages)
  - [ ] Images/Video of People
  - [ ] Voice Recordings
  - [ ] Genetic Data
  - [ ] Children's Data (under 16)
  - [ ] Criminal Records
  - [ ] Employment Records
  - [ ] Educational Records
  - [ ] Publicly Available Data
  - [ ] Proprietary Business Data
  - [ ] Trade Secrets
  - [ ] Third-party Data

### Data Volume & Scale /Data Readiness
- **Current Data Volume** *(Select one)*
  - [ ] < 1 GB
  - [ ] 1 GB - 100 GB
  - [ ] 100 GB - 1 TB
  - [ ] 1 TB - 10 TB
  - [ ] 10 TB - 100 TB
  - [ ] > 100 TB

- **Expected Growth Rate** *(Annual)*
  - [ ] < 10%
  - [ ] 10-50%
  - [ ] 50-100%
  - [ ] 100-500%
  - [ ] > 500%

- **Number of Records**
  - [ ] < 10,000
  - [ ] 10,000 - 100,000
  - [ ] 100,000 - 1 million
  - [ ] 1 million - 10 million
  - [ ] 10 million - 100 million
  - [ ] > 100 million

### Data Sources /Data Readiness
- **Primary Data Sources** *(Multi-select)*
  - [ ] Internal Databases
  - [ ] Customer Input Forms
  - [ ] IoT Devices/Sensors
  - [ ] Mobile Applications
  - [ ] Web Applications
  - [ ] Third-party APIs
  - [ ] Public Datasets
  - [ ] Social Media
  - [ ] Partner Organizations
  - [ ] Government Databases
  - [ ] Purchased Data
  - [ ] Web Scraping
  - [ ] Manual Entry
  - [ ] Legacy Systems
  - [ ] Cloud Storage
  - [ ] Edge Devices

### Data Quality & Governance /Data Readiness
- **Data Quality Score** *(1-10 slider)*
- **Data Completeness** *(Percentage)*
- **Data Accuracy Confidence** *(Percentage)*
- **Data Freshness Requirements**
  - [ ] Real-time (< 1 second)
  - [ ] Near real-time (1-60 seconds)
  - [ ] Micro-batch (1-5 minutes)
  - [ ] Batch (hourly)
  - [ ] Daily
  - [ ] Weekly or less frequent

### Geographic & Jurisdictional /Data Readiness
- **Data Subject Locations** *(Multi-select countries/regions)*
- **Data Storage Locations** *(Multi-select)*
- **Data Processing Locations** *(Multi-select)*
- **Cross-border Transfer Required** *(Yes/No)*
- **Data Localization Requirements** *(List countries)*

### Data Lifecycle /Data Readiness
- **Data Retention Period**
  - [ ] < 30 days
  - [ ] 30 days - 1 year
  - [ ] 1-3 years
  - [ ] 3-7 years
  - [ ] 7+ years
  - [ ] Indefinite
  - [ ] Varies by data type

- **Data Deletion Capabilities**
  - [ ] Automated deletion
  - [ ] Manual deletion process
  - [ ] Soft delete only
  - [ ] Hard delete available
  - [ ] Immutable/Cannot delete

## 🔧 2. Technical Architecture Layer /Slider (Technical Complexity)
### AI/ML Model Specifications
- **Model Type** *(Multi-select)*
  - [ ] Large Language Model (LLM)
  - [ ] Computer Vision
  - [ ] Natural Language Processing
  - [ ] Time Series Forecasting
  - [ ] Recommendation System
  - [ ] Classification
  - [ ] Regression
  - [ ] Clustering
  - [ ] Anomaly Detection
  - [ ] Reinforcement Learning
  - [ ] Generative AI
  - [ ] Multi-modal Models
  - [ ] Custom/Proprietary

- **Model Size/Complexity**
  - [ ] < 1M parameters
  - [ ] 1M - 100M parameters
  - [ ] 100M - 1B parameters
  - [ ] 1B - 10B parameters
  - [ ] 10B - 100B parameters
  - [ ] > 100B parameters

### Infrastructure & Deployment
- **Deployment Model**
  - [ ] Public Cloud
  - [ ] Private Cloud
  - [ ] Hybrid Cloud
  - [ ] On-premise
  - [ ] Edge Computing
  - [ ] Distributed/Federated
  - [ ] Multi-cloud

- **Cloud Providers** *(If applicable)*
  - [ ] AWS
  - [ ] Azure
  - [ ] Google Cloud
  - [ ] IBM Cloud
  - [ ] Oracle Cloud
  - [ ] Alibaba Cloud
  - [ ] Other Regional Providers

- **Compute Requirements**
  - [ ] CPU only
  - [ ] GPU required
  - [ ] TPU required
  - [ ] Specialized hardware
  - [ ] Quantum computing

### System Integration
- **Integration Points** *(Multi-select)*
  - [ ] ERP Systems (SAP, Oracle, etc.)
  - [ ] CRM Systems (Salesforce, etc.)
  - [ ] Payment Systems
  - [ ] Banking/Financial Systems
  - [ ] Healthcare Systems (EHR/EMR)
  - [ ] Supply Chain Systems
  - [ ] HR Systems
  - [ ] Marketing Platforms
  - [ ] Communication Systems
  - [ ] IoT Platforms
  - [ ] Data Warehouses
  - [ ] Business Intelligence Tools
  - [ ] Custom Applications
  - [ ] Legacy Systems

- **API Specifications**
  - [ ] No API
  - [ ] Internal API only
  - [ ] Partner API
  - [ ] Public API
  - [ ] GraphQL
  - [ ] REST
  - [ ] gRPC
  - [ ] WebSocket
  - [ ] Message Queue

### Security Architecture
- **Authentication Methods** *(Multi-select)*
  - [ ] Username/Password
  - [ ] Multi-factor Authentication
  - [ ] SSO/SAML
  - [ ] OAuth
  - [ ] API Keys
  - [ ] Certificate-based
  - [ ] Biometric
  - [ ] Token-based
  - [ ] Zero Trust

- **Encryption Standards**
  - [ ] TLS 1.3
  - [ ] AES-256
  - [ ] End-to-end Encryption
  - [ ] Homomorphic Encryption
  - [ ] At-rest Encryption
  - [ ] In-transit Encryption
  - [ ] Key Management System
### end technical


### business feasibility (remove last comp)
### Performance & Reliability
- **Availability Requirements**
  - [ ] 99% (3.65 days downtime/year)
  - [ ] 99.9% (8.76 hours downtime/year)
  - [ ] 99.99% (52.56 minutes downtime/year)
  - [ ] 99.999% (5.26 minutes downtime/year)

- **Response Time Requirements**
  - [ ] < 100ms
  - [ ] 100ms - 1s
  - [ ] 1s - 5s
  - [ ] 5s - 30s
  - [ ] > 30s

- **Concurrent Users**
  - [ ] < 100
  - [ ] 100 - 1,000
  - [ ] 1,000 - 10,000
  - [ ] 10,000 - 100,000
  - [ ] 100,000 - 1 million
  - [ ] > 1 million

## 💼 3. Business Context Layer

### Organizational Scope (main form)
- **Business Function** *(Primary)*
  - [ ] Finance & Accounting
  - [ ] Human Resources
  - [ ] Sales & Marketing
  - [ ] Operations
  - [ ] Customer Service
  - [ ] IT/Technology
  - [ ] Legal & Compliance
  - [ ] R&D/Innovation
  - [ ] Supply Chain
  - [ ] Risk Management
  - [ ] Executive/Strategic
# bfr bussiness function
- **Industry Sector**
  - [ ] Financial Services
  - [ ] Healthcare
  - [ ] Retail/E-commerce
  - [ ] Manufacturing
  - [ ] Technology
  - [ ] Telecommunications
  - [ ] Energy/Utilities
  - [ ] Government/Public Sector
  - [ ] Education
  - [ ] Transportation/Logistics
  - [ ] Media/Entertainment
  - [ ] Real Estate
  - [ ] Agriculture
  - [ ] Pharmaceuticals

### Business Impact /Assessment-business feasibility
- **Revenue Impact Type**
  - [ ] Direct Revenue Generation
  - [ ] Cost Reduction
  - [ ] Risk Mitigation
  - [ ] Compliance/Regulatory
  - [ ] Customer Experience
  - [ ] Operational Efficiency
  - [ ] No Direct Impact

- **Estimated Financial Impact**
  - [ ] < $100K annually
  - [ ] $100K - $1M
  - [ ] $1M - $10M
  - [ ] $10M - $100M
  - [ ] > $100M

- **User Categories** *(Multi-select)*
  - [ ] Internal Employees
  - [ ] Customers
  - [ ] Partners/Vendors
  - [ ] General Public
  - [ ] Regulators
  - [ ] Executives
  - [ ] Developers/IT
  - [ ] Analysts
  - [ ] Minors/Children

### Decision Making /ethical impact
- **Decision Automation Level**
  - [ ] Information Only (No decisions)
  - [ ] Decision Support (Human decides)
  - [ ] Assisted Decision (AI recommends)
  - [ ] Automated with Override
  - [ ] Fully Automated
  - [ ] Autonomous

- **Decision Types** *(Multi-select)*
  - [ ] Credit/Lending Decisions
  - [ ] Employment Decisions
  - [ ] Insurance Underwriting
  - [ ] Medical Diagnosis/Treatment
  - [ ] Legal Judgments
  - [ ] Pricing Decisions
  - [ ] Access Control
  - [ ] Content Moderation
  - [ ] Fraud Detection
  - [ ] Risk Scoring
  - [ ] Resource Allocation
  - [ ] Predictive Maintenance

### Business Criticality /business feasibility
- **System Criticality**
  - [ ] Non-critical (Experimental)
  - [ ] Low (Convenience)
  - [ ] Medium (Important)
  - [ ] High (Business Critical)
  - [ ] Mission Critical

- **Failure Impact**
  - [ ] Minimal/No Impact
  - [ ] Minor Inconvenience
  - [ ] Moderate Business Impact
  - [ ] Severe Business Impact
  - [ ] Catastrophic/Life Safety

## ⚖️ 4. Regulatory & Compliance Layer

### Jurisdictional Requirements /risk assessment
- **Operating Jurisdictions** *(Multi-select)*
  - Americas
    - [ ] United States (Federal)
    - [ ] US State-specific (list states)
    - [ ] Canada
    - [ ] Mexico
    - [ ] Brazil
    - [ ] Argentina
  - Europe
    - [ ] European Union
    - [ ] United Kingdom
    - [ ] Switzerland
    - [ ] Norway
    - [ ] Russia
  - Asia-Pacific
    - [ ] China
    - [ ] Japan
    - [ ] Singapore
    - [ ] Australia
    - [ ] India
    - [ ] South Korea
  - Middle East & Africa
    - [ ] UAE
    - [ ] Saudi Arabia
    - [ ] Israel
    - [ ] South Africa

### Regulatory Frameworks
- **Data Protection** *(Multi-select)*
  - [ ] GDPR (EU)
  - [ ] CCPA/CPRA (California)
  - [ ] LGPD (Brazil)
  - [ ] PIPEDA (Canada)
  - [ ] POPI (South Africa)
  - [ ] APPI (Japan)
  - [ ] Privacy Act (Australia)
  - [ ] PDPA (Singapore)
  - [ ] Other State Privacy Laws

- **Sector-Specific** *(Multi-select)*
  - [ ] HIPAA (Healthcare)
  - [ ] PCI-DSS (Payment Cards)
  - [ ] SOX (Financial Reporting)
  - [ ] GLBA (Financial Privacy)
  - [ ] FCRA (Credit Reporting)
  - [ ] FERPA (Education)
  - [ ] COPPA (Children's Privacy)
  - [ ] CAN-SPAM (Email)
  - [ ] TCPA (Communications)

- **AI-Specific Regulations**
  - [ ] EU AI Act
  - [ ] US AI Bill of Rights
  - [ ] China AI Regulations
  - [ ] UK AI Framework
  - [ ] Canada AIDA
  - [ ] Singapore Model AI Governance

### Industry Standards
- **Certifications/Standards** *(Multi-select)*
  - [ ] ISO 27001 (Information Security)
  - [ ] ISO 27701 (Privacy)
  - [ ] ISO/IEC 23053 (AI)
  - [ ] ISO/IEC 23894 (AI Risk)
  - [ ] SOC 2
  - [ ] FedRAMP
  - [ ] NIST Frameworks
  - [ ] AICPA AI Auditing
  - [ ] IEEE AI Standards

### Audit & Compliance
- **Audit Requirements**
  - [ ] No Audit Required
  - [ ] Annual Audit
  - [ ] Quarterly Audit
  - [ ] Continuous Monitoring
  - [ ] Regulatory Examination

- **Compliance Reporting**
  - [ ] None Required
  - [ ] Annual Reports
  - [ ] Quarterly Reports
  - [ ] Monthly Reports
  - [ ] Real-time Dashboards
  - [ ] Incident-based

## 🤖 5. AI-Specific Layer

### Model Development /data readiness
- **Training Data Source**
  - [ ] Internal Historical Data
  - [ ] Public Datasets
  - [ ] Synthetic Data
  - [ ] Third-party Data
  - [ ] Real-time Data
  - [ ] Crowdsourced Data
  - [ ] Combined Sources

- **Training Data Volume**
  - [ ] < 1GB
  - [ ] 1GB - 100GB
  - [ ] 100GB - 1TB
  - [ ] 1TB - 10TB
  - [ ] > 10TB
# technical feasibility
- **Model Development Approach**
  - [ ] Built from Scratch
  - [ ] Fine-tuned Pre-trained
  - [ ] Transfer Learning
  - [ ] Few-shot Learning
  - [ ] Zero-shot Learning
  - [ ] Federated Learning
  - [ ] Continuous Learning

### Model Characteristics 
# ethical
- **Explainability Level**
  - [ ] Black Box (No explanation)
  - [ ] Basic Feature Importance
  - [ ] Partial Explanations
  - [ ] Full Explainability
  - [ ] Human-interpretable Rules
# ethical
- **Bias Testing**
  - [ ] No Testing Planned
  - [ ] Basic Statistical Testing
  - [ ] Comprehensive Bias Audit
  - [ ] Continuous Monitoring
  - [ ] Third-party Audit
# technical
- **Model Update Frequency**
  - [ ] Static (No updates)
  - [ ] Annual
  - [ ] Quarterly
  - [ ] Monthly
  - [ ] Weekly
  - [ ] Daily
  - [ ] Real-time/Continuous

### AI Governance /ethical
- **Human Oversight Level**
  - [ ] Fully Autonomous
  - [ ] Periodic Review
  - [ ] Regular Monitoring
  - [ ] Active Supervision
  - [ ] Human-in-the-loop
  - [ ] Human Approval Required
# ethical
- **Performance Monitoring**
  - [ ] Accuracy/Precision
  - [ ] Fairness Metrics
  - [ ] Drift Detection
  - [ ] Resource Usage
  - [ ] Latency Tracking
  - [ ] Error Analysis
  - [ ] A/B Testing

### Ethical Considerations /ethical
- **Potential Harm Areas** *(Multi-select)*
  - [ ] Discrimination/Bias
  - [ ] Privacy Violation
  - [ ] Manipulation/Deception
  - [ ] Physical Harm
  - [ ] Economic Harm
  - [ ] Psychological Harm
  - [ ] Environmental Impact
  - [ ] Misinformation
  - [ ] Addiction/Overuse

- **Vulnerable Populations** *(Multi-select)*
  - [ ] Children/Minors
  - [ ] Elderly
  - [ ] Disabled Individuals
  - [ ] Minorities
  - [ ] Low-income Groups
  - [ ] Non-native Speakers
  - [ ] Specific Medical Conditions

### AI Output Characteristics /technical
- **Output Type**
  - [ ] Predictions/Scores
  - [ ] Classifications
  - [ ] Recommendations
  - [ ] Generated Content
  - [ ] Automated Actions
  - [ ] Insights/Analytics
# technical
- **Confidence Scores**
  - [ ] Not Provided
  - [ ] Binary (Yes/No)
  - [ ] Percentage/Probability
  - [ ] Multi-level Categories
  - [ ] Detailed Explanations

## 📋 Additional Contextual Inputs

### Project Metadata /roadmap
- **Project Stage**
  - [ ] Ideation/Planning
  - [ ] Proof of Concept
  - [ ] Pilot/Testing
  - [ ] Production Rollout
  - [ ] Operational/Mature
# roadmap
- **Timeline Constraints**
  - [ ] No Specific Timeline
  - [ ] 3-6 months
  - [ ] 6-12 months
  - [ ] 12-24 months
  - [ ] > 24 months
# budget
- **Budget Range**
  - [ ] < $100K
  - [ ] $100K - $500K
  - [ ] $500K - $1M
  - [ ] $1M - $5M
  - [ ] > $5M

### Stakeholder Information /business
- **Executive Sponsor Level**
  - [ ] C-Suite
  - [ ] VP/Director
  - [ ] Manager
  - [ ] Team Lead
# business
- **Stakeholder Groups** *(Multi-select)*
  - [ ] Board of Directors
  - [ ] Executive Team
  - [ ] Legal/Compliance
  - [ ] IT/Security
  - [ ] Business Users
  - [ ] Customers
  - [ ] Regulators
  - [ ] Partners
  - [ ] Public/Media

### Risk Appetite /risk assessment
- **Organization Risk Tolerance**
  - [ ] Risk Averse
  - [ ] Conservative
  - [ ] Moderate
  - [ ] Aggressive
  - [ ] Risk Seeking
# risk assessment
- **Previous AI Experience**
  - [ ] First AI Project
  - [ ] Limited Experience
  - [ ] Moderate Experience
  - [ ] Extensive Experience
  - [ ] AI-First Organization

## 🎯 Input Collection Best Practices

1. **Progressive Disclosure**: Start with essential fields, reveal advanced options as needed
2. **Smart Defaults**: Pre-populate based on industry and use case type
3. **Contextual Help**: Provide tooltips and examples for each input
4. **Validation Rules**: Ensure data quality with real-time validation
5. **Conditional Logic**: Show/hide fields based on previous selections
6. **Save Progress**: Allow users to save and return to incomplete assessments
7. **Templates**: Provide pre-filled templates for common use cases
8. **Bulk Import**: Allow CSV/JSON import for multiple assessments
9. **API Integration**: Pull data from existing systems where possible
10. **Version Control**: Track changes to inputs over time