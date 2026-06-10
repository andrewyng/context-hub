---
name: anysite-market-research
description: "Analyze tech markets, startup ecosystems, public companies, and industry dynamics"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "industry,opportunity,tam,landscape,investment,due-diligence"
---

# anysite Market Research

Comprehensive market research using Y Combinator, SEC, social media, and web data through anysite MCP. Analyze tech markets, research startups, and study competitive landscapes.

## Overview

- **Research startup ecosystems** via Y Combinator data
- **Analyze public companies** through SEC filings
- **Gather market intelligence** from social platforms
- **Study industry trends** across communities
- **Identify market opportunities** through data analysis

**Coverage**: 70% - Excellent for tech/startup markets; pivoted from local business to tech focus

## Supported Platforms

- Y Combinator: Startup research, batch analysis, founder discovery, funding data
- SEC: Public company filings, financial data, disclosures
- Reddit: Market sentiment, community insights, product discussions
- LinkedIn: Industry trends, company intelligence, professional discussions
- Twitter/X: Market pulse, news, influencer opinions
- Web Scraping: Company websites, industry reports, market data

## Quick Start

**Step 1: Define Research Scope**

Choose focus:
- Startup ecosystem: `search_yc_companies`
- Public companies: `sec_search_companies`
- Industry sentiment: `search_reddit_posts`, `search_twitter_posts`
- Company intelligence: `search_linkedin_companies`

**Step 2: Gather Data**

Execute searches:
```
# Startup research
search_yc_companies(industries=["fintech"], batches=["W24", "S23"])

# Public company research
sec_search_companies(entity_name="tech company", forms=["10-K"])

# Market sentiment
search_reddit_posts(query="fintech trends", count=100)
```

**Step 3: Analyze Results**

Extract insights:
- Market size indicators
- Competitive landscape
- Technology trends
- Consumer sentiment
- Funding patterns

**Step 4: Synthesize Findings**

Deliver:
- Market opportunity assessment
- Competitive analysis
- Trend identification
- Strategic recommendations

## Common Workflows

### Workflow 1: Startup Ecosystem Analysis

**Scenario**: Analyze fintech startup landscape

**Steps**:

1. **Find Startups**
```
search_yc_companies(
  industries=["fintech"],
  batches=["W24", "S23", "W23", "S22"],
  count=100
)
```

2. **Categorize by Focus**
```
For each startup:
  get_yc_company(company)

Group by:
- Payments
- Lending
- Investment/Trading
- Banking
- Insurance
- B2B fintech tools
```

3. **Analyze Patterns**
```
Identify:
- Hot subcategories (most startups)
- Team size distribution
- Geographic concentration
- Common tech stacks (from job postings)
```

4. **Research Traction**
```
For promising startups:
  search_linkedin_companies(keywords=startup_name)
  search_twitter_posts(query=startup_name)
  parse_webpage(startup_website)
```

5. **Identify White Spaces**
```
Compare:
- Overcrowded categories
- Underserved segments
- Emerging opportunities
- Geographic gaps
```

### Workflow 2: Public Company Competitive Analysis

**Scenario**: Research public competitors in cloud infrastructure

1. Find companies via `sec_search_companies`
2. Get financial data from SEC documents
3. Analyze strategy from 10-K filings
4. Track year-over-year changes
5. Supplement with LinkedIn and social intel

### Workflow 3: Industry Trend Analysis

**Scenario**: Understand AI/ML market evolution

1. YC startup trends by batch
2. Public market signals from SEC
3. Community sentiment from Reddit
4. Professional discussion on LinkedIn
5. Web intelligence from company blogs

## MCP Tools Reference

### Y Combinator Research
- `search_yc_companies` - Find startups by industry, batch, filters
- `get_yc_company` - Get detailed company profile
- `search_yc_founders` - Research founders

### SEC Research
- `sec_search_companies` - Find public companies and filings
- `sec_document` - Get full document content

### Social Intelligence
- `search_reddit_posts` - Community insights and sentiment
- `search_twitter_posts` - Real-time market pulse
- `search_linkedin_posts` - Professional trends

### Company Intelligence
- `search_linkedin_companies` - Find companies
- `get_linkedin_company` - Company details
- `parse_webpage` - Extract website data

### Market Discovery
- `duckduckgo_search` - General web research
- `get_sitemap` - Comprehensive website analysis

## Market Analysis Frameworks

**TAM/SAM/SOM Analysis**:
```
Total Addressable Market (TAM):
- Count YC companies in category x avg market size
- SEC filing market size mentions
- Industry reports (web scraping)

Serviceable Addressable Market (SAM):
- Filter by geography, segment
- LinkedIn company search by ICP
- YC companies by batch/stage

Serviceable Obtainable Market (SOM):
- Realistic capture based on competition
- Competitive analysis via LinkedIn/social
- Market share indicators
```

**Porter's Five Forces**:
```
Using anysite data:

1. Competitive Rivalry:
   - YC startups in space
   - LinkedIn company counts
   - Social mention volume

2. Threat of New Entrants:
   - Recent YC batches
   - Funding announcements
   - Talent movement (LinkedIn)

3. Supplier Power:
   - Technology dependencies
   - Integration partners

4. Buyer Power:
   - Customer reviews (Reddit)
   - Pricing transparency
   - Switching costs mentioned

5. Threat of Substitutes:
   - Alternative solutions
   - Adjacent markets
```

## Output Formats

**Chat Summary**: Key market insights, competitive landscape, opportunities, recommendations
**CSV Export**: Company list with metrics, market segmentation, trend indicators
**JSON Export**: Complete research data, time-series analysis, cross-platform correlations

## Reference Documentation

- **[RESEARCH_METHODS.md](references/RESEARCH_METHODS.md)** - Market research methodologies, analysis frameworks, and data synthesis techniques
