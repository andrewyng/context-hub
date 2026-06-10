---
name: anysite-competitor-analyzer
description: "Deep competitive intelligence: leadership analysis, product comparison, and strategic assessment"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "swot,leadership,pricing,product-comparison,glassdoor"
---

# Competitor Analyzer

Systematic framework for gathering and analyzing competitive intelligence using Anysite MCP tools.

## When to Use This Skill

Trigger this skill when users ask to:
- "Analyze [competitor name]"
- "Research our competitors"
- "Create a competitive analysis of [company]"
- "How does [competitor] position themselves?"
- "What are [competitor]'s strengths and weaknesses?"
- "Compare our product with [competitor]"
- "Build a battle card for [competitor]"

## Analysis Workflow

### Phase 1: Foundation (15-20 min)

**Step 1: Initialize Analysis Structure**
```bash
python scripts/analyze_competitor.py "Competitor Name" "https://competitor.com" > /tmp/analysis.json
```

**Step 2: Web Presence Reconnaissance**

Scrape key pages to understand positioning:
```python
# Homepage - core messaging
Anysite:parse_webpage({"url": "https://competitor.com", "only_main_content": true, "strip_all_tags": true})

# Pricing - cost structure
Anysite:parse_webpage({"url": "https://competitor.com/pricing", "only_main_content": true})

# About - company background
Anysite:parse_webpage({"url": "https://competitor.com/about", "only_main_content": true, "extract_contacts": true})
```

**Extract from homepage:** H1/H2 headlines -> positioning, feature bullets -> core_features, customer logos, value prop
**Extract from pricing:** Tier names/prices, cost per unit, free tier limits, entry price
**Extract from about:** Company description, location, team size hints

### Phase 2: LinkedIn Intelligence (10-15 min)

**Step 3: Find Company Profile**
```python
Anysite:search_linkedin_companies({"keywords": "competitor name", "count": 5})
Anysite:get_linkedin_company({"company": "company-slug-from-search"})
```

Extract: `follower_count`, `employee_count`, `description`, `headquarters`, `specialties`

**Step 4: Analyze Team & Growth**
```python
Anysite:get_linkedin_company_employees({"companies": ["company-slug"], "keywords": "engineer developer", "count": 50})
Anysite:get_linkedin_company_employees({"companies": ["company-slug"], "keywords": "CEO founder", "count": 10})
```

Assess: Team size, eng:sales ratio (GTM strategy signal), recent hires (growth phase indicator)

**Step 5: Content Strategy**
```python
Anysite:get_linkedin_company_posts({"urn": "company-urn-from-profile", "count": 20})
```

Analyze posts for: Frequency, themes, engagement, tone of voice

### Phase 3: Deep Social & Community Research (20-30 min)

**Step 6: Twitter Deep Dive** - Analyze company account, founder accounts, brand mentions, sentiment
**Step 7: Reddit Community Intelligence** - Brand presence, competitive discussions, deep thread analysis
**Step 7.5: Cross-Platform Insight Synthesis** - Compare Twitter vs Reddit for authentic signals

See **[references/DEEP_ANALYSIS.md](references/DEEP_ANALYSIS.md)** for detailed Twitter sentiment scoring, Reddit mining workflows, and cross-platform synthesis methodology.

### Phase 4: Leadership & Founders Intelligence (15-20 min)

**Step 8:** Identify key leaders via LinkedIn search
**Step 9:** Analyze leadership activity (posts, comments, reactions)
**Step 10:** Twitter leadership presence analysis

### Phase 5: Technical & Data Discovery (10-15 min)

**Step 11:** Documentation quality assessment
**Step 12:** GitHub presence (stars, forks, commit frequency)
**Step 13:** Alternative data sources (Glassdoor reviews)
**Step 14:** Integration ecosystem analysis

### Phase 6: Synthesis (15-20 min)

**Step 15: Competitive Analysis**

Compare findings against your own product:
- **Strengths**: 3-5 clear advantages (features, pricing, market position, execution)
- **Weaknesses**: 3-5 clear gaps (missing features, high prices, poor UX)
- **Opportunities**: Their weaknesses you can capitalize on, underserved segments
- **Threats**: Their strengths that could hurt you, recent funding or growth

**Step 16: Strategic Insights**

- **Key Takeaways** (3-5 bullets): Most important findings, clear and actionable
- **Competitive Threats** (2-3 bullets): What they could do to hurt your position
- **Opportunities to Exploit** (3-5 bullets): How to position against them, their vulnerabilities
- **Watch Areas**: Things to monitor quarterly, signals of strategic shifts

**Step 17: Generate Final Report**

Update JSON template with findings, generate markdown report.

## Common Patterns

### Pattern 1: Rapid Assessment (30-45 min)
Homepage + pricing scrape, LinkedIn company profile, 20 recent social posts, brief summary (1 page)

### Pattern 2: Deep Intelligence (2-3 hours)
Full web presence (7-10 pages), complete LinkedIn intelligence, 50-100 social posts/mentions, community sentiment, technical documentation review, full report

### Pattern 3: Pricing Focus
All pricing pages, unit economics calculation, tier structure mapping, market comparison, pricing strategy identification

### Pattern 4: Leadership Focus
All founders and C-level identified, deep LinkedIn profiles, 50+ personal posts analyzed, Twitter presence mapped, previous company experience tracked

## Tips for Effective Analysis

- **Be Systematic:** Follow the phase order, don't skip LinkedIn (best growth signals), always check pricing
- **Think Strategically:** Not just "what" but "why", look for patterns, consider constraints
- **Verify Claims:** Marketing copy != reality, cross-reference sources, note confidence levels
- **Focus on Actionable Insights:** Analyze implications, recommend actions, identify immediate threats
- **Document Data Freshness:** Always note analysis date, mark recent vs stale data

## Troubleshooting

**"Can't find LinkedIn company":** Try name variations, search for CEO and find company from profile
**"Pricing page missing":** Check /plans, /buy, /subscribe; note "Contact Sales" as enterprise signal
**"No social media presence":** Document the absence (itself a signal), check founder personal accounts
**"Too much data":** Start with Phase 1 & 2 only, generate partial report, add depth if needed

## Reference Documentation

- **[DEEP_ANALYSIS.md](references/DEEP_ANALYSIS.md)** - Detailed social media analysis, leadership intelligence, technical discovery, and advanced techniques
