---
name: anysite-person-analyzer
description: "Multi-platform profile analysis: LinkedIn, Twitter, Reddit, and web presence intelligence"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "profiling,networking,recruitment,background,osint"
---

# Person Intelligence Analyzer

Comprehensive multi-platform intelligence analysis combining LinkedIn, Twitter/X, Reddit, GitHub, and web presence data to create actionable intelligence reports with cross-platform personality insights.

## Analysis Workflow

Execute phases sequentially, adapting depth based on available data and user requirements.

### Phase 1: Initial Data Collection

**Starting with LinkedIn Profile URL:**
1. Use `get_linkedin_profile` with full parameters (education, experience, skills)
2. Extract and save the **full URN** (format: `urn:li:fsd_profile:ACoAAABCDEF`) - critical for all subsequent API calls
3. Also extract: company URN, current role, location, connections count
4. Record profile completeness for confidence scoring

**IMPORTANT - URN Format:**
Always use the complete URN format `urn:li:fsd_profile:ACoAAABCDEF` from the profile response for all subsequent calls to `get_linkedin_user_posts`, `get_linkedin_user_comments`, and `get_linkedin_user_reactions`. Do not use shortened versions or profile URLs.

**Starting with Name + Context:**
1. Use `search_linkedin_users` with all available filters (name, title, company, location, school)
2. If multiple matches: present top 3-5 candidates with distinguishing details
3. After user confirmation, proceed with confirmed profile

**Critical Data Points to Capture:**
- Current company and role (with start date)
- Previous roles (last 2-3 positions)
- Education background
- Skills and endorsements
- Connection count, profile headline and summary

### Phase 2: Activity & Engagement Analysis

**Content Analysis (Posts):**
1. Use `get_linkedin_user_posts` with the full URN
   - Count: 20-50 depending on activity level
   - Posted after filter: last 90 days for active users, 180 days if low activity
2. Analyze for: topics/themes, engagement metrics, posting frequency, content style, language/tone

**Engagement Analysis (Comments & Reactions):**
1. Use `get_linkedin_user_comments` with full URN (count: 30)
2. Use `get_linkedin_user_reactions` with full URN (count: 50)
3. Analyze: who they engage with, topics that spark engagement, engagement style, response patterns

**Output: Engagement Profile**
- Primary content themes (ranked by frequency)
- Engagement level: High/Medium/Low
- Influence indicators: follower count, average engagement rate
- Communication style: formal/casual, technical/general

### Phase 3: Company Intelligence

**Current Company Deep Dive:**
1. Use `get_linkedin_company` with company URN
2. Use `get_linkedin_company_posts` (count: 20) - analyze communication themes, strategic priorities
3. Use `duckduckgo_search` for recent news: "[Company name] funding news", "[Company name] expansion"

**Company Social Media Presence:**
4. **Twitter/X**: Find company account via `search_twitter_users`, analyze posts for product announcements, culture signals
5. **Reddit**: `search_reddit_posts` for company mentions - customer sentiment, industry discussions

**Company Context Analysis:**
- Business model, technology stack, market position
- Social sentiment, community engagement
- Growth signals, customer pain points

### Phase 4: Multi-Platform Intelligence Enrichment

**A. Twitter/X Analysis:**
1. Find handle: check LinkedIn bio, or `search_twitter_users` with name + company
2. Profile: `get_twitter_user` - follower count, bio, creation date
3. Content: `get_twitter_user_posts` (count: 50-100) - topics, expertise, engagement rate
4. Topic discovery: `search_twitter_posts` for key interests

**B. Reddit Activity:**
1. `search_reddit_posts` with name/company mentions
2. Analyze: subreddit preferences, technical depth, helping behavior, community reputation

**C. Instagram Presence** (optional, B2C/personal brand focus):
- `get_instagram_user` if handle known
- `get_instagram_user_posts` for content style analysis

**D. Web Intelligence & Media Presence:**
1. `duckduckgo_search`: "[Name] speaker conference", "[Name] interview podcast", "[Name] article blog"
2. `duckduckgo_search`: "[Name] site:github.com" (for technical roles)
3. `parse_webpage` for high-value sources: personal blog, interviews, conference profiles, company team pages

**Platform Priority:**
1. **Always**: LinkedIn (mandatory) + Web Search
2. **High priority**: Twitter/X - usually most revealing for tech audience
3. **Medium priority**: Reddit - shows technical depth and community engagement
4. **Low priority**: Instagram - only if B2C or strong personal brand
5. **Context-dependent**: GitHub - critical for engineering roles

### Phase 5: Cross-Platform Strategic Analysis & Report Generation

**Connection Strategy:**
1. Conversation topics ranked by relevance across all platforms
2. Platform-specific engagement approach (timing, tone, ice-breakers)
3. Cross-platform personality synthesis

**Value Assessment:**
- **Direct Business Value**: ICP fit, decision maker level, budget authority
- **Partnership Potential**: Technology synergies, co-marketing
- **Network & Influence**: Network size/quality, industry influence
- **Talent & Advisory**: Expertise match, domain knowledge

**Prioritization Matrix:**
- **Tier 1 (Hot Lead)**: Decision maker + ICP match + high engagement
- **Tier 2 (Warm Lead)**: Mid-level + ICP match OR influencer + relevant network
- **Tier 3 (Long-term Nurture)**: Potential future value
- **Tier 4 (Low Priority)**: No clear fit

## Error Handling & Edge Cases

**Insufficient Data:** Focus more on company analysis and role-based inferences
**Multiple Profile Matches:** Always confirm with user before deep analysis
**Rate Limiting / API Errors:** Continue with available data, note limitations
**Privacy Considerations:** Only analyze publicly available information, no speculation on private matters

## Reference Documentation

- **[REPORT_TEMPLATE.md](references/REPORT_TEMPLATE.md)** - Full output format template, customization parameters (Quick/Standard/Deep), and platform-specific focus options
