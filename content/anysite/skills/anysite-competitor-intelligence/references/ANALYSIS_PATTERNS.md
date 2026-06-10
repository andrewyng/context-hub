# Competitive Analysis Patterns

Frameworks and templates for analyzing competitors using anysite MCP data.

## SWOT Analysis Framework

### Data Collection for SWOT

**Strengths**:
```
LinkedIn:
- get_linkedin_company -> Company size, growth
- get_linkedin_company_posts -> Messaging, brand strength
- search_linkedin_users -> Leadership quality

Y Combinator:
- get_yc_company -> Funding, pedigree

Social:
- Follower counts, engagement rates
- Content quality and frequency
```

**Weaknesses**:
```
Reddit:
- search_reddit_posts(competitor) -> Customer complaints
- Product gaps, feature requests

LinkedIn:
- Employee turnover (departures)
- Job re-postings (hiring challenges)

Web:
- Website quality, user experience
- Missing features vs. competitors
```

**Opportunities**:
```
Market gaps identified through:
- Competitor job postings (expansion areas)
- Customer requests in forums
- Underserved geographies
- Unaddressed use cases
```

**Threats**:
```
Competitive threats:
- YC batch analysis (new entrants)
- Hiring velocity (aggressive growth)
- New product launches
- Pricing changes
```

## Competitive Positioning Matrix

**Dimensions to Track**:
1. Market Focus (Enterprise vs. SMB)
2. Product Complexity (Simple vs. Feature-Rich)
3. Pricing Strategy (Premium vs. Value)
4. Customer Type (Technical vs. Business Users)

**Data Sources**:
- Website messaging
- LinkedIn company description
- Pricing pages
- Job postings (customer success vs. enterprise support)

## Porter's Five Forces Analysis

**Threat of New Entrants**:
- Monitor YC batches for new competitors
- Track LinkedIn company formations in space
- Watch for well-funded startups

**Competitive Rivalry**:
- Employee count growth rates
- Content output and engagement
- Product launch frequency
- Market share signals

**Supplier Power**:
- Identify common technology partners
- Track integrations and partnerships
- Monitor platform dependencies

**Buyer Power**:
- Analyze customer segments (from job postings)
- Track pricing transparency
- Monitor customer communities

**Threat of Substitutes**:
- Identify adjacent solutions
- Track feature overlap
- Monitor market positioning shifts
