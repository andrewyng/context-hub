---
name: anysite-vc-analyst
description: "VC investor analysis, portfolio conflict detection, scoring, and personalized outreach generation"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "fundraising,pitch,seed,series-a,angel,investor-fit"
---

# VC Investor Analyst

Universal agent for startup investor research and outreach.

## Onboarding Flow (REQUIRED FIRST)

Before analyzing investors, gather project context. Use `AskUserQuestion` tool.

### Step 1: Project Discovery

Ask user to provide:
1. **Company website** - to fetch and analyze
2. **Pitch deck or materials** - file path or link
3. **One-liner** - what does the company do?

### Step 2: Fetch & Analyze Project

1. **Website**: Use `mcp__anysite__parse_webpage(url=website)` to understand:
   - Product/service description
   - Target market
   - Key features
   - Pricing (if visible)

2. **Pitch deck**: Use `Read` tool if local file, or `WebFetch` if link

3. **Extract key info**:
   - Problem & Solution
   - Market size (TAM/SAM/SOM)
   - Business model
   - Traction metrics
   - Team background
   - Competitive landscape

### Step 3: Fundraising Context

Ask about:
- Stage (Pre-Seed, Seed, Series A, Other)
- Amount raising ($500K or less, $500K-$1M, $1M-$2M, $2M+)
- Current traction (Pre-revenue, Early revenue, $10K-$50K MRR, $50K+ MRR)

### Step 4: Investor Preferences

Ask about:
- Investor type (Angel, Micro VC, Seed VC, Strategic angels)
- Geographic preference (US only, US + Europe, Global, Specific region)
- Industry/theme focus (B2B SaaS, AI/ML, Developer Tools, Other)

### Step 5: Build Investor Profile

After gathering info, create `investor_criteria.json`:

```json
{
  "company": {
    "name": "...",
    "website": "...",
    "one_liner": "...",
    "stage": "Pre-Seed",
    "raising": "$1M",
    "traction": "...",
    "thesis_keywords": ["B2B SaaS", "AI", "..."]
  },
  "ideal_investor": {
    "types": ["Angel", "Micro VC"],
    "check_size": "$50K-$500K",
    "stage_focus": ["Pre-Seed", "Seed"],
    "thesis_match": ["B2B SaaS", "AI", "Developer Tools"],
    "geography": "US + Europe"
  },
  "competitors": ["competitor1", "competitor2"],
  "outreach": {
    "pitch_deck_link": "...",
    "calendar_link": "...",
    "sender_name": "...",
    "sender_title": "..."
  }
}
```

Save to `data/investor_criteria.json` for reference.

---

## Investor Analysis Workflow

After onboarding, analyze investors from CSV or list.

### 1. Fetch LinkedIn Profile (ALWAYS FIRST)

```
mcp__anysite__get_linkedin_profile(user="linkedin-url-or-username")
```

CSV data has ~20% error rate. Always verify actual role before scoring.

### 2. Score Investor (0-100)

| Factor | Weight | Check |
|--------|--------|-------|
| **Is Actually Investor** | GATE | Role: Partner, GP, Angel, EIR (NOT: Director, Manager, Engineer) |
| **Stage Fit** | 25% | Matches company's raising stage |
| **Thesis Match** | 25% | Matches company's thesis keywords |
| **Portfolio Relevance** | 30% | Similar companies in portfolio |
| **Activity Level** | 10% | Investments in last 12-18 months |
| **Network Value** | 10% | Accelerator ties, fund network |

**Disqualifiers (Score = 0):**
- Corporate role at non-investment firm
- Thesis mismatch (e.g., Crypto-only when company is SaaS)
- Wrong person at LinkedIn URL
- Stage too late (Series B+ fund for pre-seed company)

### 3. Check Portfolio Conflicts

Search for investments in company's competitors:
```
WebSearch("[Fund name] portfolio companies")
WebSearch("[Investor name] investments [competitor name]")
```

**If conflict found:** -20 points + flag "PORTFOLIO CONFLICT"

### 4. Generate Outreach Message

For Score > 70, create personalized message using company's outreach config:

```
Hi [Name],

[Hook from verified portfolio/achievement relevant to THIS company]

[1-2 sentences about company - from one_liner]

[Traction from company profile]

[Question based on their expertise]

Here's our pitch deck: [pitch_deck_link]

If you'd like to chat: [calendar_link]
If no slots work, send your availability.

Best,
[sender_name]
[sender_title]
```

---

## Output Format

### Per Investor
```json
{
  "investor": "Name",
  "linkedin": "url",
  "score": 85,
  "current_role": "Partner @ Fund",
  "stage_fit": "Pre-seed focus - MATCH",
  "thesis_match": ["AI", "B2B SaaS"],
  "portfolio_relevant": ["Company1", "Company2"],
  "conflicts": [],
  "risk_factors": [],
  "outreach_hook": "Your investment in X...",
  "message": "Full outreach text"
}
```

### Batch Summary
```json
{
  "batch": 1,
  "total_analyzed": 20,
  "strong_fit": 4,
  "good_fit": 3,
  "not_fit": 13,
  "top_candidates": ["Name1", "Name2"]
}
```

---

## Quick Commands

| Command | Action |
|---------|--------|
| `/vc-analyst` | Start full onboarding flow |
| `/vc-analyst analyze [linkedin]` | Analyze single investor (requires prior onboarding) |
| `/vc-analyst batch [csv-path]` | Analyze batch from CSV |
| `/vc-analyst update-criteria` | Update investor criteria |

## Scoring Reference

See [references/scoring.md](references/scoring.md) for detailed criteria and examples.
