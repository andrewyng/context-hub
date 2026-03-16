---
name: anysite-competitor-intelligence
description: "Track competitor activities, hiring patterns, content strategies, and market positioning"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "benchmarking,hiring,strategy,market-share,monitoring"
---

# anysite Competitor Intelligence

Comprehensive competitive intelligence gathering using anysite MCP server. Track competitors across LinkedIn, social media, and the web to understand their strategies, monitor their activities, and identify competitive opportunities.

## Overview

- **Track competitor companies** on LinkedIn and Y Combinator
- **Monitor hiring patterns** to identify growth areas and strategic priorities
- **Analyze content strategies** across social platforms
- **Benchmark positioning** and messaging
- **Identify key employees** and leadership changes
- **Track competitive movements** like funding, launches, partnerships

## Supported Platforms

- **LinkedIn** (Primary): Company pages, employee search, post monitoring, growth tracking
- **Y Combinator**: Startup competitor research, funding data, batch analysis
- **Twitter/X**: Social presence monitoring, content strategy, engagement analysis
- **Reddit**: Community sentiment, product discussions, competitor mentions
- **Instagram**: Brand presence, visual content strategy, influencer partnerships
- **YouTube**: Video content, channel growth, community engagement
- **Web Scraping**: Company websites, press releases, blog content
- **SEC**: Public company filings for competitors

## Quick Start

### Step 1: Identify Competitors

| Goal | Primary Tool | Output |
|------|-------------|--------|
| Find similar companies | `search_linkedin_companies` | Company list with metrics |
| Research startup competitors | `search_yc_companies` | YC startups by industry/batch |
| Discover by employee search | `search_linkedin_users` -> companies | Companies from profiles |
| Find by keywords/industry | `search_linkedin_companies` + keywords | Filtered company list |

### Step 2: Gather Competitive Intelligence

**Company Profile Analysis**
```
Tool: mcp__anysite__get_linkedin_company
Parameters:
- company: "competitor-name" or LinkedIn URL
Returns: Description, size, location, website, specialties
```

**Employee Intelligence**
```
Tool: mcp__anysite__search_linkedin_users
Parameters:
- company_keywords: "Competitor Inc"
- title: "VP OR Director OR Head" (for leadership)
- count: 50
```

**Hiring Velocity Analysis**
```
Tool: mcp__anysite__get_linkedin_company_employee_stats
Parameters:
- urn: <company URN from search>
Returns: Growth metrics, department distribution
```

**Content Strategy**
```
Tool: mcp__anysite__get_linkedin_company_posts
Parameters:
- urn: <company URN>
- count: 20
Returns: Recent posts, engagement, messaging themes
```

### Step 3: Analyze

- **Growth signals**: Hiring velocity, funding, expansion
- **Strategic priorities**: Department hiring, job postings, content themes
- **Market positioning**: Messaging, target audience, value props
- **Competitive threats**: New products, partnerships, key hires

## Common Workflows

### Workflow 1: Comprehensive Competitor Profile

1. **Company Overview**: `get_linkedin_company` -> Size, industry, description, website
2. **Leadership Team**: `search_linkedin_users` with company + C-level/VP titles
3. **Organizational Structure**: `get_linkedin_company_employee_stats` + department searches
4. **Content Strategy**: `get_linkedin_company_posts` + `get_twitter_user_posts`
5. **Product/Market Intel**: `parse_webpage` on competitor site + `search_reddit_posts`

### Workflow 2: Competitive Landscape Mapping

1. **Identify Competitors**: `search_linkedin_companies` with industry keywords
2. **Filter and Prioritize**: Review company descriptions, filter by relevance
3. **Categorize**: Direct, Indirect, Potential competitors
4. **Size and Growth**: `get_linkedin_company_employee_stats` for each
5. **Positioning**: Company posts + website analysis
6. **Funding** (startups): `search_yc_companies` + `get_yc_company`

### Workflow 3: Hiring Velocity Tracking

1. **Baseline**: `get_linkedin_company_employee_stats` for current count
2. **Open Positions**: `search_linkedin_jobs` for competitor
3. **Recent Hires**: `search_linkedin_users` + experience date analysis
4. **Key Departures**: Track "Former" employees, identify patterns
5. **Talent Pipeline**: Analyze where competitors hire from

### Workflow 4: Content Strategy Benchmarking

1. **LinkedIn**: `get_linkedin_company_posts(urn, count=50)` -> frequency, themes, engagement
2. **Twitter/X**: `get_twitter_user_posts` -> tweet frequency, content themes
3. **YouTube**: `get_youtube_channel_videos` -> upload frequency, views, topics
4. **Instagram**: `get_instagram_user_posts` -> visual style, engagement rates
5. **Blog**: `parse_webpage` + `get_sitemap` -> publishing frequency, topics
6. **Community**: `search_reddit_posts` -> customer feedback, sentiment

## MCP Tools Reference

### LinkedIn Company Intelligence
- `search_linkedin_companies` - Search by keywords, location, industry, size
- `get_linkedin_company` - Detailed company profile
- `get_linkedin_company_employee_stats` - Employee statistics and growth
- `get_linkedin_company_posts` - Recent posts with engagement

### LinkedIn People Intelligence
- `search_linkedin_users` - Find employees by title, department
- `get_linkedin_profile` - Detailed employee profile
- `get_linkedin_user_experience` - Detailed work history

### Y Combinator Intelligence
- `search_yc_companies` - Search by industry, batch
- `get_yc_company` - Detailed profile with founders, batch, status
- `search_yc_founders` - Founder research

### Social Media Monitoring
- Twitter/X: `search_twitter_posts`, `get_twitter_user`, `get_twitter_user_posts`
- Instagram: `search_instagram_posts`, `get_instagram_user`, `get_instagram_user_posts`
- Reddit: `search_reddit_posts`, `get_reddit_post`
- YouTube: `search_youtube_videos`, `get_youtube_channel_videos`, `get_youtube_video`

### Web Intelligence
- `parse_webpage` - Extract content from competitor websites
- `get_sitemap` - Get all pages on competitor site
- `duckduckgo_search` - Search for competitor mentions across the web

## Advanced Features

### SWOT Analysis Framework

**Strengths** (LinkedIn, website, reviews): Team expertise, product features, market position, brand recognition
**Weaknesses** (reviews, job postings, turnover): Customer complaints, hiring challenges, product gaps
**Opportunities** (market analysis): Underserved segments, geographic expansion, product expansion
**Threats** (competitive monitoring): New entrants (YC), competitive hiring, product launches

### Win/Loss Analysis

For each competitor in deals:
1. `get_linkedin_company` -> Current positioning
2. `parse_webpage(website + "/pricing")` -> Pricing strategy
3. `parse_webpage(website + "/features")` -> Feature set
4. `search_reddit_posts(competitor)` -> Customer feedback
5. `get_linkedin_company_posts` -> Recent messaging

## Output Formats

**Chat Summary**: Key findings, competitive threats, growth signals, recommended actions
**CSV Export**: Competitor comparison matrix with size, growth, engagement, threat score
**JSON Export**: Complete data for time-series tracking and dashboard visualization

## Reference Documentation

- **[ANALYSIS_PATTERNS.md](references/ANALYSIS_PATTERNS.md)** - Competitive analysis frameworks, SWOT templates, and intelligence gathering patterns
