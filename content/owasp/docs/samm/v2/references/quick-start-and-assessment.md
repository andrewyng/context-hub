# SAMM quick start and assessment guide

Step-by-step guidance for running a SAMM assessment, including preparation, interview questions, evidence collection, and scoring.

## Quick start overview

A single person can execute the first four phases (Prepare → Assess → Set Target → Define Plan) in 1-2 days. Implementation and rollout require more time and organizational support.

## Phase 1: Prepare

### Checklist

- [ ] Define scope: whole organization, business unit, or product line
- [ ] Secure executive sponsorship
- [ ] Assemble the assessment team (2-4 people recommended):
  - Security lead
  - Development lead / architect
  - Operations / DevOps representative
  - Business stakeholder (optional but valuable)
- [ ] Gather existing documentation:
  - Security policies and standards
  - SDLC documentation
  - Tool inventory (SAST, DAST, SCA, WAF, SIEM)
  - Training records
  - Incident response plans
  - Previous audit reports
- [ ] Schedule interview sessions (30-45 min per practice area)

### Scoping decisions

| Scope level | When to use |
|-------------|-------------|
| **Organization-wide** | Small-medium org with unified SDLC |
| **Business unit** | Large org with different dev practices per unit |
| **Application portfolio** | Assess a specific set of critical applications |
| **Single application** | Deep assessment for a specific high-risk app |

## Phase 2: Assess

### Assessment approach

For each of the 15 practices, evaluate both streams at each maturity level.

**Method:** Structured interviews + evidence review

1. For each practice, ask questions about activities, processes, and tools
2. Review documentary evidence where available
3. Score each stream on a 0-1 scale per level
4. Calculate the practice maturity score

### Scoring rubric

| Score | Interpretation |
|-------|----------------|
| 0 | No coverage — activity is not performed |
| 0.25 | Some ad-hoc activity, not consistent |
| 0.5 | Activity exists in some projects or teams |
| 0.75 | Activity is performed consistently with few exceptions |
| 1.0 | Activity is fully established and verified |

### Calculating maturity

For a given practice/stream:
- Score Level 1 activities (0-1)
- If Level 1 score >= 0.75, also score Level 2 activities
- If Level 2 score >= 0.75, also score Level 3 activities
- The maturity level is the highest level where score >= 0.75

### Interview questions by practice

#### Governance: Strategy and Metrics
- Do you have a documented software security strategy?
- How is the security strategy communicated to development teams?
- What security metrics do you collect? How often?
- Who reviews security metrics and what decisions do they drive?

#### Governance: Policy and Compliance
- Do you have documented security policies for development?
- How are security policies communicated and enforced?
- What compliance requirements apply (SOC2, PCI, HIPAA, GDPR)?
- How do you verify compliance with security policies?

#### Governance: Education and Guidance
- What security training do developers receive? How often?
- Is training tailored by role (developer, architect, tester)?
- Do you have a security champions program?
- How do you share security knowledge (wikis, guidelines, office hours)?

#### Design: Threat Assessment
- Do you maintain an application inventory with risk classifications?
- Do you perform threat modeling? For which applications?
- What methodology (STRIDE, PASTA, attack trees)?
- How are threat model results tracked and used?

#### Design: Security Requirements
- How are security requirements defined for new features?
- Do you use a standard set of security requirements (e.g., ASVS)?
- How do you assess third-party component security?
- Do you track security requirements through implementation?

#### Design: Secure Architecture
- Do you have secure architecture guidelines or reference architectures?
- Is there an architecture review process for security?
- How are technology choices vetted for security?
- Do you maintain a list of approved/banned technologies?

#### Implementation: Secure Build
- Describe your CI/CD pipeline. What security tools are integrated?
- Do you run SAST? On all projects? Who triages results?
- How do you manage third-party dependencies?
- Do you use SCA tools? Which ones?

#### Implementation: Secure Deployment
- How are deployments performed? Manual? Automated?
- What security checks happen during deployment?
- How are secrets (API keys, passwords) managed?
- How quickly can you roll back a deployment?

#### Implementation: Defect Management
- How are security defects tracked?
- Do you have SLAs for security defect remediation?
- How do you categorize and prioritize security defects?
- What metrics do you track on security defects?

#### Verification: Architecture Assessment
- Do you perform security architecture reviews?
- How often? Triggered by what?
- Who performs them (internal, external)?
- How are findings tracked?

#### Verification: Requirements-driven Testing
- Do you verify that security requirements are met in testing?
- Do you test abuse cases / negative scenarios?
- Are security test cases derived from threat models?
- How are test results reported?

#### Verification: Security Testing
- What automated security testing tools do you use (SAST, DAST, IAST)?
- How are automated scan results triaged and handled?
- Do you perform manual penetration testing? How often?
- Do you do red team exercises?

#### Operations: Incident Management
- How do you detect security incidents?
- Do you have an incident response plan?
- How recently was it tested (tabletop, simulation)?
- How are incident lessons learned fed back into development?

#### Operations: Environment Management
- Do you have hardening standards for your environments?
- How do you verify configuration compliance?
- What is your patching strategy and cadence?
- How quickly can you patch a critical vulnerability?

#### Operations: Operational Management
- Do you have a data classification scheme?
- How is data protected based on classification?
- What is your process for decommissioning systems?
- How is data sanitized when systems are retired?

## Phase 3: Set targets

### Input
- Current maturity scores from assessment
- Business risk profile
- Regulatory requirements
- Available resources and budget

### Process
1. For each practice, determine the target maturity level (1, 2, or 3)
2. Consider dependencies — some Level 2 activities require Level 1 in other practices
3. Be realistic — a jump of 2+ levels in one cycle is rare
4. Prioritize practices with the highest gap × highest business impact

### Template

| Business Function | Practice | Current | Target | Gap | Priority |
|-------------------|----------|:-------:|:------:|:---:|:--------:|
| Governance | Strategy and Metrics | 0.5 | 2 | 1.5 | Medium |
| Governance | Policy and Compliance | 1.0 | 2 | 1.0 | High |
| Governance | Education and Guidance | 0.25 | 1 | 0.75 | High |
| Design | Threat Assessment | 0 | 1 | 1.0 | High |
| Design | Security Requirements | 0.5 | 2 | 1.5 | High |
| Design | Secure Architecture | 0.5 | 1 | 0.5 | Medium |
| Implementation | Secure Build | 1.0 | 2 | 1.0 | High |
| Implementation | Secure Deployment | 0.5 | 1 | 0.5 | Medium |
| Implementation | Defect Management | 0.25 | 1 | 0.75 | Medium |
| Verification | Architecture Assessment | 0 | 1 | 1.0 | Medium |
| Verification | Requirements Testing | 0.25 | 1 | 0.75 | Medium |
| Verification | Security Testing | 0.5 | 2 | 1.5 | High |
| Operations | Incident Management | 0.25 | 1 | 0.75 | High |
| Operations | Environment Management | 0.5 | 1 | 0.5 | Medium |
| Operations | Operational Management | 0.25 | 1 | 0.75 | Low |

## Phase 4: Define the plan

### Prioritization framework

1. **Quick wins** — Activities that are easy to implement and have high impact
2. **Foundation** — Level 1 activities that enable future improvement
3. **Process maturity** — Level 2 activities for consistency and repeatability
4. **Optimization** — Level 3 activities for comprehensive coverage

### Example plan

```
Quarter 1: Quick wins and foundations
  ✓ Integrate SAST into CI pipeline (Secure Build L1)
  ✓ Deploy SCA for dependency scanning (Secure Build L1)
  ✓ Create application risk inventory (Threat Assessment L1)
  ✓ Basic security awareness training (Education & Guidance L1)

Quarter 2: Process establishment
  ✓ Security requirements framework from ASVS (Security Requirements L1→L2)
  ✓ Incident response plan and first tabletop (Incident Management L1)
  ✓ Security champions nomination (Education & Guidance L1→L2)

Quarter 3: Verification and operations
  ✓ Automated DAST in staging (Security Testing L2)
  ✓ Hardening standards for environments (Environment Management L1)
  ✓ Defect SLAs and tracking (Defect Management L1)

Quarter 4: Review and iterate
  ✓ Re-assess all 15 practices
  ✓ Update targets for next cycle
  ✓ Report progress to leadership
```

## Evidence collection checklist

For each practice, collect:

| Evidence type | Examples |
|--------------|---------|
| **Documents** | Policies, standards, guidelines, runbooks |
| **Tool configs** | SAST rules, DAST configs, SCA policies |
| **Metrics** | Defect counts, training completion rates, scan coverage |
| **Records** | Meeting minutes, review notes, incident reports |
| **Screenshots** | Dashboard views, pipeline configs, tool outputs |

## Official sources

- SAMM quick start guide: https://owaspsamm.org/guidance/quick-start-guide/
- SAMM assessment guide: https://owaspsamm.org/assessment-guide/
- SAMM toolbox (Excel-based assessment): https://owaspsamm.org/assessment/
- SAMM model: https://owaspsamm.org/model/
