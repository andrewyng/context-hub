# SAMM model overview — all practices and streams

Detailed breakdown of all 5 business functions, 15 security practices, their 2 streams each, and what each maturity level looks like.

## Governance

Governance focuses on cross-functional processes and activities that manage overall software development at the organizational level.

### Strategy and Metrics

| Stream | Focus |
|--------|-------|
| **A: Create and Promote** | Define and communicate security strategy |
| **B: Measure and Improve** | Collect and use metrics to drive improvement |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Identify organization's risk tolerance; create basic security roadmap | Define basic security metrics; ad-hoc KPI tracking |
| 2 | Align security strategy with business objectives; publish strategy | Establish regular metric collection; dashboard visibility |
| 3 | Continuously adjust strategy based on metrics and threat landscape | Metrics drive resource allocation; automated collection |

### Policy and Compliance

| Stream | Focus |
|--------|-------|
| **A: Policy Management** | Create, maintain, and enforce security policies |
| **B: Compliance Management** | Map to regulatory and standards compliance |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic security policies exist | Identify applicable regulations/standards |
| 2 | Policies are maintained, communicated, and have exceptions process | Compliance requirements mapped to controls |
| 3 | Automatic policy enforcement and regular review | Continuous compliance monitoring and audit readiness |

### Education and Guidance

| Stream | Focus |
|--------|-------|
| **A: Training and Awareness** | Security training for different roles |
| **B: Organization and Culture** | Champions network and security culture |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic security awareness training | Security is part of general awareness |
| 2 | Role-based training (developers, architects, testers) | Security champions in development teams |
| 3 | Continuous learning, advanced training, certifications | Security culture embedded, champions program mature |

## Design

Design concerns requirements gathering, high-level architecture, and detailed design decisions.

### Threat Assessment

| Stream | Focus |
|--------|-------|
| **A: Application Risk Profile** | Classify applications by risk |
| **B: Threat Modeling** | Identify and prioritize threats |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic application inventory with risk classification | Ad-hoc threat identification for high-risk apps |
| 2 | Standardized risk classification methodology | Systematic threat modeling for all significant apps |
| 3 | Continuous risk assessment integrated into development | Threat modeling automated and maintained through lifecycle |

### Security Requirements

| Stream | Focus |
|--------|-------|
| **A: Software Requirements** | Define security requirements for development |
| **B: Supplier Security** | Security requirements for third-party components |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic security requirements for high-risk features | Ad-hoc review of third-party components |
| 2 | Standardized security requirements framework | Formal vendor/component security assessment |
| 3 | Automated requirements verification; requirements reuse library | Continuous third-party monitoring; SCA integrated |

### Secure Architecture

| Stream | Focus |
|--------|-------|
| **A: Architecture Design** | Secure architecture patterns and reference architectures |
| **B: Technology Management** | Technology stack governance and security |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic secure design principles applied | Ad-hoc technology selection with some security input |
| 2 | Reference architectures and design patterns documented | Technology standards with security requirements |
| 3 | Architecture review integrated into development; auto-validation | Technology management integrated with vulnerability intelligence |

## Implementation

Implementation covers building, deploying, and managing defects in software.

### Secure Build

| Stream | Focus |
|--------|-------|
| **A: Build Process** | Secure CI/CD pipeline and build integrity |
| **B: Software Dependencies** | Third-party component management |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic build automation; SAST in some projects | Known vulnerability scanning for dependencies |
| 2 | Standardized secure build pipeline; SAST across all projects | SCA integrated into build; automated vulnerability alerts |
| 3 | Build integrity verification; reproducible builds | Continuous dependency monitoring; automated remediation |

### Secure Deployment

| Stream | Focus |
|--------|-------|
| **A: Deployment Process** | Secure deployment pipeline and verification |
| **B: Secret Management** | Secrets handling and rotation |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Deployment automation exists; basic deployment verification | Centralized secret storage |
| 2 | Deployment pipeline includes security checks | Automated secret rotation; access controls |
| 3 | Immutable deployments; deployment integrity verification | Advanced secret management; runtime secret injection |

### Defect Management

| Stream | Focus |
|--------|-------|
| **A: Defect Tracking** | Track and manage security defects |
| **B: Metrics and Feedback** | Defect metrics feed back into development |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Security defects tracked in issue tracker | Basic defect counts and aging |
| 2 | SLA-driven defect management; severity-based prioritization | Defect trend analysis; root cause categories |
| 3 | Defect management integrated across all tools; auto-triage | Predictive analysis; metrics drive process improvement |

## Verification

Verification covers testing, assessment, and quality assurance for security.

### Architecture Assessment

| Stream | Focus |
|--------|-------|
| **A: Architecture Validation** | Verify architecture meets security requirements |
| **B: Architecture Mitigation** | Identify and address architectural weaknesses |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Ad-hoc security review of architecture for high-risk apps | Known architectural weaknesses documented |
| 2 | Standardized architecture review process | Systematic mitigation of architectural risks |
| 3 | Automated architecture compliance checking | Architecture risk treatment integrated into design |

### Requirements-driven Testing

| Stream | Focus |
|--------|-------|
| **A: Control Verification** | Verify security controls work as designed |
| **B: Misuse/Abuse Testing** | Test for abuse cases and negative scenarios |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic functional security testing | Ad-hoc abuse case testing |
| 2 | Systematic verification of security requirements | Standardized abuse case testing from threat models |
| 3 | Automated requirements verification in CI/CD | Comprehensive abuse testing including business logic |

### Security Testing

| Stream | Focus |
|--------|-------|
| **A: Scalable Baseline** | Automated security testing (SAST, DAST) |
| **B: Deep Understanding** | Manual security testing and pen testing |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic automated scanning (SAST/DAST) | Ad-hoc penetration testing |
| 2 | Customized scanning rules; integrated into CI/CD | Regular pen testing with defined methodology |
| 3 | Advanced automated testing; custom rules; correlation | Expert-driven testing; red teaming; continuous assessment |

## Operations

Operations covers activities ensuring CIA throughout the operational lifetime.

### Incident Management

| Stream | Focus |
|--------|-------|
| **A: Incident Detection** | Detect security incidents |
| **B: Incident Response** | Respond to and recover from incidents |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic logging and monitoring; ad-hoc incident detection | Basic incident response process exists |
| 2 | Centralized log management; correlation and alerting | Defined incident response playbooks; regular drills |
| 3 | Advanced detection (behavioral, anomaly); automated response | Mature IR capability; lessons learned feed back into development |

### Environment Management

| Stream | Focus |
|--------|-------|
| **A: Configuration Hardening** | Harden runtime environments |
| **B: Patching and Updating** | Keep systems patched and current |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Basic hardening standards exist | Ad-hoc patching process |
| 2 | Automated configuration compliance checking | Risk-based patch management with SLAs |
| 3 | Continuous configuration monitoring and auto-remediation | Automated patching; zero-day response process |

### Operational Management

| Stream | Focus |
|--------|-------|
| **A: Data Protection** | Protect data in operational environments |
| **B: System Decomissioning** | Secure end-of-life processes |

| Level | Stream A | Stream B |
|-------|----------|----------|
| 1 | Data classification exists; basic data handling procedures | Ad-hoc system retirement |
| 2 | Data protection controls aligned with classification | Defined decommissioning process with security steps |
| 3 | Automated data lifecycle management | Comprehensive decommissioning; data sanitization verified |

## Official sources

- Business functions: https://owaspsamm.org/model/governance/, /design/, /implementation/, /verification/, /operations/
- SAMM model overview: https://owaspsamm.org/model/
- PDF version: https://drive.google.com/file/d/1cI3Qzfrly_X89z7StLWI5p_Jfqs0-OZv/view
