---
name: samm
description: "OWASP SAMM v2.0 — Software Assurance Maturity Model with 5 business functions, 15 security practices, assessment workflow, and roadmap planning."
metadata:
  languages: "http"
  versions: "2.0"
  revision: 1
  updated-on: "2026-03-22"
  source: community
  tags: "owasp,samm,security,maturity,sdlc,appsec,governance"
---

# OWASP SAMM v2 for agents

OWASP SAMM (Software Assurance Maturity Model) is a framework for assessing, formulating, and implementing a software security strategy. It works with any SDLC approach (waterfall, agile, DevOps) and for organizations that develop, outsource, or acquire software.

## Model overview

SAMM v2.0 has **5 business functions**, each containing **3 security practices**, for a total of **15 practices**. Each practice has **2 streams** with **3 maturity levels** (1–3).

```
Business Function → Security Practice → Stream → Maturity Level (1-3)
```

### The 5 business functions and 15 practices

| Business Function | Practice 1 | Practice 2 | Practice 3 |
|-------------------|-----------|-----------|-----------|
| **Governance** | Strategy and Metrics | Policy and Compliance | Education and Guidance |
| **Design** | Threat Assessment | Security Requirements | Secure Architecture |
| **Implementation** | Secure Build | Secure Deployment | Defect Management |
| **Verification** | Architecture Assessment | Requirements-driven Testing | Security Testing |
| **Operations** | Incident Management | Environment Management | Operational Management |

### Business function descriptions

**Governance** — Cross-functional processes: security strategy, policies, compliance, and security education across the organization.

**Design** — Activities during project inception: threat modeling, security requirements gathering, and secure architecture decisions.

**Implementation** — Building and deploying software: secure build practices, secure deployment, and tracking/managing defects.

**Verification** — Testing and reviewing: architecture assessment, requirements-driven testing, and security testing (SAST/DAST/etc).

**Operations** — Post-deployment: incident management, environment hardening, and operational management throughout the application lifecycle.

## Maturity levels

Each practice has 3 maturity levels:

| Level | Characteristics |
|-------|----------------|
| **1** | Ad-hoc, initial understanding. Basic activities that are easy to implement. Low formalization. |
| **2** | Defined process, increased efficiency. Activities are repeatable and consistent. Moderate formalization. |
| **3** | Comprehensive mastery, continuous improvement. Advanced activities with full organizational integration. High formalization. |

**Important:** SAMM does NOT insist all organizations reach level 3 everywhere. You determine the target maturity level for each practice based on your risk profile and needs.

## Assessment workflow

The typical SAMM cycle: **Prepare → Assess → Set Target → Define Plan → Implement → Roll Out**

This cycle is executed continuously, typically in 3-12 month periods.

### 1. Prepare

- Identify the scope (whole organization or specific business line)
- Get executive sponsorship
- Assemble the assessment team (security lead, architects, developers, operations)
- Gather existing documentation (policies, procedures, tool inventory)

### 2. Assess

For each of the 15 practices, evaluate current maturity:

- Interview stakeholders (architects, developers, QA, ops)
- Review evidence (documentation, tool configurations, training records)
- Score each practice stream on the 0-3 scale
- Calculate the overall maturity score per practice

**Scoring guide:**

| Score | Meaning |
|-------|---------|
| 0 | Practice is not performed |
| 0.25 | Some ad-hoc activity exists |
| 0.5 | Activity exists but is inconsistent |
| 0.75 | Activity is mostly consistent |
| 1.0 | Activity is fully established for this level |

Multiply the raw score (0-1) by the level being assessed to get the maturity score.

### 3. Set the target

- Define target maturity levels for each practice (not all need to be 3)
- Base targets on risk tolerance, business criticality, and regulatory requirements
- Consider a 1-2 year horizon for ambitious targets

### 4. Define the plan

- Identify the gap between current and target maturity for each practice
- Prioritize practices with the largest gaps or highest business impact
- Create a phased roadmap (quick wins first, then deeper improvements)
- Assign ownership and resources

### 5. Implement

- Execute the roadmap activities
- Start with practices that have the broadest impact
- Document processes and controls as you implement them
- Train staff on new practices

### 6. Roll out

- Deploy improved practices across the organization
- Monitor adoption and compliance
- Collect metrics to validate improvements
- Feed lessons learned into the next assessment cycle

## Setting targets and roadmap

### Risk-based target setting

| Application criticality | Governance | Design | Implementation | Verification | Operations |
|------------------------|:----------:|:------:|:--------------:|:------------:|:----------:|
| **Critical** (financial, health) | 3 | 3 | 3 | 3 | 3 |
| **High** (customer-facing, PII) | 2 | 2-3 | 2-3 | 2-3 | 2 |
| **Medium** (internal tools) | 1-2 | 2 | 2 | 2 | 1-2 |
| **Low** (static sites, demos) | 1 | 1 | 1-2 | 1 | 1 |

### Roadmap template

```
Phase 1 (Months 1-3): Foundation
  - Governance: Establish security policy (Policy & Compliance L1)
  - Design: Begin threat modeling (Threat Assessment L1)
  - Implementation: Integrate SAST into CI (Secure Build L1)

Phase 2 (Months 4-6): Process
  - Governance: Security training program (Education & Guidance L2)
  - Verification: Automated security testing (Security Testing L2)
  - Operations: Incident response plan (Incident Management L1)

Phase 3 (Months 7-12): Maturity
  - Design: Security requirements in all projects (Security Requirements L2)
  - Implementation: Secure deployment automation (Secure Deployment L2)
  - Verification: Architecture review process (Architecture Assessment L2)
```

## Common pitfalls

1. **Trying to reach L3 in everything.** Maturity L3 requires significant investment. Target L3 only for practices critical to your risk profile.
2. **Assessment without buy-in.** Executive sponsorship is essential. Without it, recommendations won't be funded or enforced.
3. **Skipping the assessment.** Don't jump to implementation without understanding your current posture. The assessment reveals where effort will have the most impact.
4. **One-time use.** SAMM is designed for continuous improvement. Run the cycle every 3-12 months to track progress and adjust targets.
5. **Ignoring organizational context.** A startup and a bank need different maturity targets. Tailor to your organization's size, industry, and risk tolerance.
6. **Confusing SAMM with ASVS.** SAMM measures organizational maturity (process-oriented). ASVS measures application security (requirement-oriented). They complement each other.

## Official sources

- SAMM model overview: https://owaspsamm.org/model/
- Quick start guide: https://owaspsamm.org/guidance/quick-start-guide/
- Assessment guide: https://owaspsamm.org/assessment-guide/
- SAMM project page: https://owasp.org/www-project-samm/
- PDF version: https://drive.google.com/file/d/1cI3Qzfrly_X89z7StLWI5p_Jfqs0-OZv/view
- GitHub: https://github.com/owaspsamm

## Reference files

- `references/model-overview.md` — Detailed breakdown of all 5 business functions, 15 practices, and their streams
- `references/quick-start-and-assessment.md` — Step-by-step assessment guide with interview questions, evidence collection, and scoring
