# Usecase Inputs Catalog
## Complete List of User Inputs for Usecase Creation and Multi-Stage Assessment

---

## 📊 **Key Statistics & Metadata**

### **Overall Summary**
- **Total Input Fields**: 140+ unique fields
- **Assessment Stages**: 8 stages (1 creation + 7 assessment)
- **Required Fields**: 15 fields (10.7%)
- **Optional Fields**: 125+ fields (89.3%)
- **Data Collection Points**: 2 major phases

### **Phase Breakdown**
| Phase | Fields | Required | Optional | Completion Time |
|-------|--------|----------|----------|-----------------|
| **Usecase Creation** | 20+ | 15 | 5+ | 15-30 minutes |
| **Multi-Stage Assessment** | 120+ | 0 | 120+ | 45-90 minutes |
| **Total** | 140+ | 15 | 125+ | 60-120 minutes |

### **Input Type Distribution**
| Input Type | Count | Percentage | Examples |
|------------|-------|------------|----------|
| Text Fields | 25+ | 17.9% | title, problemStatement |
| Rich Text Fields | 6 | 4.3% | proposedAISolution, keyBenefits |
| Number/Slider Fields | 15+ | 10.7% | confidenceLevel, technicalComplexity |
| Select Dropdowns | 20+ | 14.3% | businessFunction, priority |
| Multi-select Fields | 15+ | 10.7% | modelTypes, dataTypes |
| Checkbox Fields | 20+ | 14.3% | biasFairness flags, dependencies |
| Radio Button Fields | 5+ | 3.6% | projectStage, automationLevel |
| Array/List Fields | 8+ | 5.7% | stakeholders, risks |
| Date Fields | 1 | 0.7% | plannedStartDate |
| Complex Objects | 10+ | 7.1% | nested assessment data |

### **Assessment Stage Complexity**
| Stage | Fields | Complexity | Estimated Time |
|-------|--------|------------|----------------|
| Technical Feasibility | 15+ | High | 10-15 minutes |
| Business Feasibility | 20+ | Medium | 8-12 minutes |
| Ethical Impact | 25+ | High | 12-18 minutes |
| Risk Assessment | 15+ | Medium | 8-12 minutes |
| Data Readiness | 15+ | Medium | 8-12 minutes |
| Roadmap Position | 8+ | Low | 5-8 minutes |
| Budget Planning | 7+ | Low | 5-8 minutes |

---

## 📋 **Complete Inputs Catalog**

### **Data Collection Scope**
This catalog covers the complete data collection lifecycle for AI usecase management:

1. **Initial Usecase Definition** - Basic project setup and business case
2. **Technical Assessment** - Feasibility and implementation details
3. **Business Validation** - Strategic alignment and financial impact
4. **Ethical Evaluation** - Bias, fairness, and governance considerations
5. **Risk Analysis** - Technical, business, and compliance risks
6. **Data Assessment** - Data readiness and governance requirements
7. **Strategic Planning** - Roadmap positioning and dependencies
8. **Financial Planning** - Budget and cost analysis

---

## Table of Contents
1. [Usecase Creation Inputs](#usecase-creation-inputs)
2. [Multi-Stage Assessment Inputs](#multi-stage-assessment-inputs)
   - [Technical Feasibility](#technical-feasibility)
   - [Business Feasibility](#business-feasibility)
   - [Ethical Impact](#ethical-impact)
   - [Risk Assessment](#risk-assessment)
   - [Data Readiness](#data-readiness)
   - [Roadmap Position](#roadmap-position)
   - [Budget Planning](#budget-planning)
3. [Input Categories Summary](#input-categories-summary)
4. [Data Flow & Processing](#data-flow--processing)
5. [Compliance & Privacy](#compliance--privacy)

---

## Usecase Creation Inputs

### Step 1: Use Case Documentation
| Field | Type | Required | Description | Options/Constraints |
|-------|------|----------|-------------|-------------------|
| `title` | Text | ✓ | Use Case Title | Free text |
| `problemStatement` | Rich Text | ✓ | Problem Statement | Rich text editor |
| `proposedAISolution` | Rich Text | | Proposed AI Solution | Rich text editor |
| `keyBenefits` | Rich Text | | Key Benefits | Rich text editor |
| `successCriteria` | Rich Text | | Success Criteria | Rich text editor |
| `keyAssumptions` | Rich Text | | Key Assumptions | Rich text editor |

### Step 2: Lean Business Case
| Field | Type | Required | Description | Options/Constraints |
|-------|------|----------|-------------|-------------------|
| `primaryStakeholders` | Array | | Primary Stakeholders | Array of strings |
| `secondaryStakeholders` | Array | | Secondary Stakeholders | Array of strings |
| `initialCost` | Text | | Initial Cost | Free text |
| `initialROI` | Text | | Initial ROI | Free text |
| `plannedStartDate` | Date | | Planned Start Date | Date picker |
| `estimatedTimelineMonths` | Text | | Estimated Timeline (months) | Free text |

### Step 3: Multi-Dimensional Scoring
| Field | Type | Required | Description | Range/Options |
|-------|------|----------|-------------|---------------|
| `confidenceLevel` | Slider | ✓ | Confidence Level | 1-10 |
| `operationalImpactScore` | Slider | ✓ | Operational Impact Score | 1-10 |
| `productivityImpactScore` | Slider | ✓ | Productivity Impact Score | 1-10 |
| `revenueImpactScore` | Slider | ✓ | Revenue Impact Score | 1-10 |
| `implementationComplexity` | Slider | ✓ | Implementation Complexity | 1-10 |
| `requiredResources` | Text | | Required Resources | Free text |
| `businessFunction` | Select | | Business Function | Dropdown options |
| `priority` | Select | | Priority | HIGH, MEDIUM, LOW |

---

## Multi-Stage Assessment Inputs

### Technical Feasibility

#### Model Configuration
| Field | Type | Options |
|-------|------|---------|
| `modelTypes` | Multi-select | Large Language Model (LLM), Computer Vision, Natural Language Processing, Time Series Forecasting, Recommendation System, Classification, Regression, Clustering, Anomaly Detection, Reinforcement Learning, Generative AI, Multi-modal Models, Custom/Proprietary |
| `modelSizes` | Multi-select | < 1M parameters, 1M - 100M parameters, 100M - 1B parameters, 1B - 10B parameters, 10B - 100B parameters, > 100B parameters |
| `deploymentModels` | Multi-select | Public Cloud, Private Cloud, Hybrid Cloud, On-premise, Edge Computing, Distributed/Federated, Multi-cloud |
| `cloudProviders` | Multi-select | AWS, Azure, Google Cloud, IBM Cloud, Oracle Cloud, Alibaba Cloud, Other Regional Providers |
| `computeRequirements` | Multi-select | CPU only, GPU required, TPU required, Specialized hardware, Quantum computing |

#### Integration & Security
| Field | Type | Options |
|-------|------|---------|
| `integrationPoints` | Multi-select | ERP Systems (SAP, Oracle, etc.), CRM Systems (Salesforce, etc.), Payment Systems, Banking/Financial Systems, Healthcare Systems (EHR/EMR), Supply Chain Systems, HR Systems, Marketing Platforms, Communication Systems, IoT Platforms, Data Warehouses, Business Intelligence Tools, Custom Applications, Legacy Systems |
| `apiSpecs` | Multi-select | No API, Internal API only, Partner API, Public API, GraphQL, REST, gRPC, WebSocket, Message Queue |
| `authMethods` | Multi-select | Username/Password, Multi-factor Authentication, SSO/SAML, OAuth, API Keys, Certificate-based, Biometric, Token-based, Zero Trust |
| `encryptionStandards` | Multi-select | TLS 1.3, AES-256, RSA-4096, ECC, ChaCha20, Argon2, bcrypt, PBKDF2, Hardware Security Modules (HSM), End-to-end encryption |

#### Technical Metrics
| Field | Type | Range/Options |
|-------|------|---------------|
| `technicalComplexity` | Slider | 1-10 |
| `outputTypes` | Multi-select | Text, Images, Audio, Video, Structured Data, Predictions, Recommendations, Classifications, Anomalies, Insights |
| `confidenceScore` | Text | Free text |

### Business Feasibility

#### Strategic Alignment
| Field | Type | Options |
|-------|------|---------|
| `strategicAlignment` | Slider | 1-10 |
| `marketOpportunity` | Select | small, medium, large |
| `stakeholder` | Checkboxes | exec, endUser, it |
| `annualSavings` | Text | Free text |
| `efficiencyGain` | Number | Percentage |
| `paybackPeriod` | Number | Months |

#### System Requirements
| Field | Type | Options |
|-------|------|---------|
| `availabilityRequirement` | Select | 99% (3.65 days downtime/year), 99.9% (8.76 hours downtime/year), 99.99% (52.56 minutes downtime/year), 99.999% (5.26 minutes downtime/year) |
| `responseTimeRequirement` | Select | < 100ms, 100ms - 1s, 1s - 5s, 5s - 30s, > 30s |
| `concurrentUsers` | Select | < 100, 100 - 1,000, 1,000 - 10,000, 10,000 - 100,000, 100,000 - 1 million, > 1 million |

#### Financial Impact
| Field | Type | Options |
|-------|------|---------|
| `revenueImpactType` | Select | Direct Revenue Generation, Cost Reduction, Risk Mitigation, Compliance/Regulatory, Customer Experience, Operational Efficiency, No Direct Impact |
| `estimatedFinancialImpact` | Select | < $100K annually, $100K - $1M, $1M - $10M, $10M - $100M, > $100M |

#### User & System Criticality
| Field | Type | Options |
|-------|------|---------|
| `userCategories` | Multi-select | Internal Employees, Customers, Partners/Vendors, General Public, Regulators, Executives, Developers/IT, Analysts, Minors/Children |
| `systemCriticality` | Select | Non-critical (Experimental), Low (Convenience), Medium (Important), High (Business Critical), Mission Critical |
| `failureImpact` | Select | Minimal/No Impact, Minor Inconvenience, Moderate Business Impact, Severe Business Impact, Catastrophic/Life Safety |
| `executiveSponsorLevel` | Select | C-Suite, VP/Director, Manager, Team Lead |
| `stakeholderGroups` | Multi-select | Board of Directors, Executive Team, Legal/Compliance, IT/Security, Business Users, Customers, Regulators, Partners, Public/Media |

### Ethical Impact

#### Bias & Fairness
| Field | Type | Options |
|-------|------|---------|
| `historicalBias` | Checkbox | true/false |
| `demographicGaps` | Checkbox | true/false |
| `geographicBias` | Checkbox | true/false |
| `selectionBias` | Checkbox | true/false |
| `confirmationBias` | Checkbox | true/false |
| `temporalBias` | Checkbox | true/false |

#### Privacy & Security
| Field | Type | Options |
|-------|------|---------|
| `dataMinimization` | Checkbox | true/false |
| `consentManagement` | Checkbox | true/false |
| `dataAnonymization` | Checkbox | true/false |

#### Decision Making
| Field | Type | Options |
|-------|------|---------|
| `automationLevel` | Select | Fully Automated, Semi-automated with Human Review, Human-in-the-loop, Human Decision Support, Manual Process |
| `decisionTypes` | Multi-select | Credit/Lending, Hiring/Employment, Healthcare Diagnosis, Criminal Justice, Insurance, Education, Housing, Financial Services, Content Moderation, Product Recommendations |

#### Model Characteristics
| Field | Type | Options |
|-------|------|---------|
| `explainabilityLevel` | Select | Black Box, Limited Explainability, Partial Explainability, High Explainability, Fully Explainable |
| `biasTesting` | Select | No Testing, Basic Testing, Comprehensive Testing, Continuous Monitoring, Third-party Auditing |

#### AI Governance
| Field | Type | Options |
|-------|------|---------|
| `humanOversightLevel` | Select | No Oversight, Minimal Oversight, Regular Review, Continuous Monitoring, Full Human Control |
| `performanceMonitoring` | Multi-select | Accuracy Metrics, Bias Detection, Drift Detection, Fairness Metrics, Explainability Scores, User Feedback, A/B Testing, Continuous Evaluation |

#### Ethical Considerations
| Field | Type | Options |
|-------|------|---------|
| `potentialHarmAreas` | Multi-select | Privacy Violations, Discrimination, Manipulation, Surveillance, Job Displacement, Social Isolation, Mental Health, Physical Safety, Economic Inequality, Environmental Impact |
| `vulnerablePopulations` | Multi-select | Children/Minors, Elderly, Disabled Individuals, Low-income Communities, Minority Groups, Refugees/Immigrants, Rural Populations, Digital Divide, Non-English Speakers, Elderly |

### Risk Assessment

#### Technical Risks
| Field | Type | Options |
|-------|------|---------|
| `technicalRisks` | Array of Risk Objects | Each risk has: risk (string), probability (None/Low/Medium/High), impact (None/Low/Medium/High) |
| Default Risks | | Model accuracy degradation, Data quality issues, Integration failures |

#### Business Risks
| Field | Type | Options |
|-------|------|---------|
| `businessRisks` | Array of Risk Objects | Each risk has: risk (string), probability (None/Low/Medium/High), impact (None/Low/Medium/High) |
| Default Risks | | User adoption resistance, Regulatory changes, Competitive response |

#### Operating Jurisdictions
| Field | Type | Options |
|-------|------|---------|
| `operatingJurisdictions` | Nested Checkboxes | Americas: United States (Federal), US State-specific, Canada, Mexico, Brazil, Argentina<br>Europe: European Union, United Kingdom, Switzerland, Norway, Russia<br>Asia-Pacific: China, Japan, Singapore, Australia, India, South Korea<br>Middle East & Africa: UAE, Saudi Arabia, Israel, South Africa |

#### Data Protection & Compliance
| Field | Type | Options |
|-------|------|---------|
| `dataProtection` | Multi-select | GDPR (EU), CCPA/CPRA (California), LGPD (Brazil), PIPEDA (Canada), POPI (South Africa), APPI (Japan), Privacy Act (Australia), PDPA (Singapore), Other State Privacy Laws |
| `sectorSpecific` | Multi-select | HIPAA (Healthcare), PCI-DSS (Payment Cards), SOX (Financial Reporting), GLBA (Financial Privacy), FCRA (Credit Reporting), FERPA (Education), COPPA (Children's Privacy), CAN-SPAM (Email), TCPA (Communications) |
| `aiSpecific` | Multi-select | AI-specific regulations and frameworks |
| `certifications` | Multi-select | Various compliance certifications |
| `auditRequirements` | Select | Audit requirement options |
| `complianceReporting` | Select | Compliance reporting options |
| `riskTolerance` | Select | Risk tolerance levels |
| `aiExperience` | Select | AI experience levels |

### Data Readiness

#### Data Types & Volume
| Field | Type | Options |
|-------|------|---------|
| `dataTypes` | Multi-select | Personal Identifiable Information (PII), Sensitive Personal Data (race, religion, politics), Financial Records, Health/Medical Records, Biometric Data, Location/GPS Data, Behavioral Data, Communications (emails, messages), Images/Video of People, Voice Recordings, Genetic Data, Children's Data (under 16), Criminal Records, Employment Records, Educational Records, Publicly Available Data, Proprietary Business Data, Trade Secrets, Third-party Data |
| `dataVolume` | Select | < 1 GB, 1 GB - 100 GB, 100 GB - 1 TB, 1 TB - 10 TB, 10 TB - 100 TB, > 100 TB |
| `growthRate` | Select | < 10%, 10-50%, 50-100%, 100-500%, > 500% |
| `numRecords` | Select | < 10,000, 10,000 - 100,000, 100,000 - 1 million, 1 million - 10 million, 10 million - 100 million, > 100 million |

#### Data Sources & Quality
| Field | Type | Options |
|-------|------|---------|
| `primarySources` | Multi-select | Internal Databases, Customer Input Forms, IoT Devices/Sensors, Mobile Applications, Web Applications, Third-party APIs, Public Datasets, Social Media, Partner Organizations, Government Databases, Purchased Data, Web Scraping, Manual Entry, Legacy Systems, Cloud Storage, Edge Devices |
| `dataQualityScore` | Slider | 1-10 |
| `dataCompleteness` | Slider | 0-100% |
| `dataAccuracyConfidence` | Slider | 0-100% |
| `dataFreshness` | Select | Real-time (< 1 second), Near real-time (1-60 seconds), Micro-batch (1-5 minutes), Batch (hourly), Daily, Weekly or less frequent |

#### Data Governance
| Field | Type | Options |
|-------|------|---------|
| `dataSubjectLocations` | Text | Free text |
| `dataStorageLocations` | Text | Free text |
| `dataProcessingLocations` | Text | Free text |
| `crossBorderTransfer` | Checkbox | true/false |
| `dataLocalization` | Text | Free text |
| `dataRetention` | Select | < 30 days, 30 days - 1 year, 1-3 years, 3-7 years, 7+ years, Indefinite, Varies by data type |

### Roadmap Position

#### Strategic Positioning
| Field | Type | Options |
|-------|------|---------|
| `priority` | Select | high, medium, low |
| `projectStage` | Radio | Ideation/Planning, Proof of Concept, Pilot/Testing, Production Rollout, Operational/Mature |
| `timelineConstraints` | Multi-select | No Specific Timeline, 3-6 months, 6-12 months, 12-24 months, > 24 months |
| `timeline` | Select | q1, q2, q3, q4 |

#### Dependencies
| Field | Type | Options |
|-------|------|---------|
| `dependencies` | Checkboxes | dataPlatform, security, hiring |
| `metrics` | Text | Free text |

### Budget Planning

#### Financial Inputs
| Field | Type | Description |
|-------|------|-------------|
| `initialDevCost` | Number | Initial development cost |
| `baseApiCost` | Number | Base API cost per month |
| `baseInfraCost` | Number | Base infrastructure cost per month |
| `baseOpCost` | Number | Base operational cost per month |
| `baseMonthlyValue` | Number | Base monthly value generated |
| `valueGrowthRate` | Number | Value growth rate percentage |
| `budgetRange` | Select | < $100K, $100K - $500K, $500K - $1M, $1M - $5M, > $5M |

---

## Input Categories Summary

### By Input Type
- **Text Fields**: 25+ fields
- **Rich Text Fields**: 6 fields
- **Number/Slider Fields**: 15+ fields
- **Select Dropdowns**: 20+ fields
- **Multi-select Fields**: 15+ fields
- **Checkbox Fields**: 20+ fields
- **Radio Button Fields**: 5+ fields
- **Array/List Fields**: 8+ fields
- **Date Fields**: 1 field
- **Complex Objects**: 10+ nested objects

### By Assessment Stage
1. **Usecase Creation**: 20+ fields across 3 steps
2. **Technical Feasibility**: 15+ fields
3. **Business Feasibility**: 20+ fields
4. **Ethical Impact**: 25+ fields
5. **Risk Assessment**: 15+ fields
6. **Data Readiness**: 15+ fields
7. **Roadmap Position**: 8+ fields
8. **Budget Planning**: 7+ fields

### Total Input Count
- **Usecase Creation**: ~20 fields
- **Multi-Stage Assessment**: ~120 fields
- **Total**: ~140 unique input fields

### Required vs Optional
- **Required Fields**: ~15 fields (mainly in usecase creation)
- **Optional Fields**: ~125 fields (most assessment fields are optional but recommended)

---

## Data Flow & Processing

### **Data Collection Workflow**
1. **Usecase Creation** → Database storage (UseCase table)
2. **Assessment Data** → Database storage (Assess table)
3. **Risk Calculations** → Real-time processing
4. **Financial Analysis** → Automated calculations
5. **Compliance Mapping** → Dynamic inference

### **Data Processing Pipeline**
```
User Input → Validation → Storage → Analysis → Risk Calculation → Dashboard Display
```

### **Data Storage Schema**
- **Primary Tables**: UseCase, Assess, FinOps, Approval
- **Related Tables**: EuAiActAssessment, Iso42001Assessment, UaeAiAssessment, Risk
- **User Data**: User, Organization (with Clerk integration)

### **Real-time Processing**
- Risk score calculations
- Financial projections
- Compliance mapping
- Dashboard metrics
- AI insights generation

---

## Compliance & Privacy

### **Data Protection Regulations**
The system collects data that may be subject to:
- **GDPR** (EU) - Personal data processing
- **CCPA/CPRA** (California) - Consumer privacy
- **LGPD** (Brazil) - General data protection
- **PIPEDA** (Canada) - Personal information protection
- **POPI** (South Africa) - Protection of personal information
- **APPI** (Japan) - Act on protection of personal information
- **Privacy Act** (Australia) - Privacy regulation
- **PDPA** (Singapore) - Personal data protection

### **Sector-Specific Compliance**
- **HIPAA** (Healthcare) - Health information privacy
- **PCI-DSS** (Payment Cards) - Payment card security
- **SOX** (Financial Reporting) - Financial accountability
- **GLBA** (Financial Privacy) - Financial services privacy
- **FCRA** (Credit Reporting) - Credit information
- **FERPA** (Education) - Educational records
- **COPPA** (Children's Privacy) - Children's online privacy
- **CAN-SPAM** (Email) - Commercial email
- **TCPA** (Communications) - Telephone communications

### **Data Minimization**
- Only essential fields are required
- Optional fields can be skipped
- Data is used only for intended purposes
- Users can update/delete their data

### **Security Measures**
- Encrypted data transmission
- Secure database storage
- Role-based access control
- Audit logging
- Regular security assessments

---

## Technical Implementation

### **Frontend Components**
- React components for each assessment stage
- Form validation and error handling
- Real-time data saving
- Progress tracking
- Responsive design

### **Backend APIs**
- RESTful API endpoints
- Prisma ORM for database operations
- Real-time calculations
- Data validation
- Error handling

### **Database Schema**
- PostgreSQL with Prisma
- Relational data model
- Indexed for performance
- Backup and recovery
- Migration management

### **Integration Points**
- Clerk authentication
- Supabase database
- Vercel deployment
- GitHub version control
- CI/CD pipeline

---

## Usage Guidelines

### **For Users**
- Complete required fields for basic functionality
- Fill optional fields for comprehensive assessment
- Save progress regularly
- Review data before submission
- Update information as needed

### **For Developers**
- Follow the input schema strictly
- Validate all user inputs
- Handle missing data gracefully
- Implement proper error handling
- Maintain data consistency

### **For Administrators**
- Monitor data quality
- Review compliance requirements
- Update field options as needed
- Maintain system performance
- Ensure data security

---

*This catalog represents all user inputs collected during the complete usecase lifecycle from creation through comprehensive assessment.*

*Last updated: January 2025*
*Project: usecase-dashboard*
*Version: 1.0*
*Total Fields: 140+*
*Assessment Stages: 8*
