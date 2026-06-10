# Deep Competitor Analysis Workflows

## Phase 3: Deep Social & Community Research

### Twitter Deep Dive

**A. Company Account Analysis**
```python
Anysite:get_twitter_user({"user": "competitor_handle"})
Anysite:get_twitter_user_posts({"user": "competitor_handle", "count": 100})
```

Extract: Followers, tweet frequency, content mix, response time, tone, most engaging tweets.

**B. Founder/Executive Twitter Presence**
```python
Anysite:get_twitter_user({"user": "founder_handle"})
Anysite:get_twitter_user_posts({"user": "founder_handle", "count": 100})
```

Leadership signals: Personal brand strength, technical credibility, customer engagement, follower quality.

**C. Brand Mentions & Sentiment**
```python
# Comprehensive mention search
Anysite:search_twitter_posts({"query": "competitor_name OR @handle", "count": 200})

# Problem/complaint mentions
Anysite:search_twitter_posts({"query": "competitor_name (problem OR issue OR bug OR expensive)", "count": 100})

# Positive sentiment
Anysite:search_twitter_posts({"query": "competitor_name (love OR great OR amazing OR best)", "count": 100})

# Competitive mentions
Anysite:search_twitter_posts({"query": "competitor_name vs OR alternative OR switching from", "count": 100})
```

**Sentiment scoring:**
```
For each mention batch, calculate:
- Positive mentions: praise, recommendations, success stories
- Negative mentions: complaints, frustrations, churn signals
- Neutral mentions: questions, feature discussions
Sentiment Score = (Positive - Negative) / Total
Range: -1.0 (very negative) to +1.0 (very positive)
```

### Reddit Deep Community Intelligence

**A. Brand Presence Mapping**
```python
Anysite:search_reddit_posts({"query": "competitor_name", "count": 100})

# Search relevant subreddits
relevant_subs = ["SaaS", "startups", "webdev", "programming", "datascience"]
```

**B. Competitive Discussions**
```python
Anysite:search_reddit_posts({"query": "competitor_name vs", "count": 100})
Anysite:search_reddit_posts({"query": "alternative to competitor_name", "count": 100})
Anysite:search_reddit_posts({"query": "better than competitor_name", "count": 50})
```

**C. Deep Thread Analysis**
```python
Anysite:get_reddit_post({"post_url": "reddit.com/r/subreddit/comments/..."})
Anysite:get_reddit_post_comments({"post_url": "reddit.com/r/subreddit/comments/..."})
```

**D. Sentiment & Voice Analysis**

Positive signals: "I love [competitor]", "Works perfectly for...", "Best tool for...", "Highly recommend"
Negative signals: "Disappointed with...", "Overpriced", "Customer support is...", "Looking for alternative"

**E. Cross-Platform Insight Synthesis**

Twitter typically shows: Official narrative, marketing messaging, surface-level sentiment
Reddit typically reveals: Unfiltered opinions, detailed technical discussions, pricing sensitivity, real problems

Look for disconnects between platforms as signals of product-market fit quality.

## Phase 4: Leadership & Founders Intelligence

### Identify Key Leaders
```python
Anysite:search_linkedin_users({
    "company_keywords": "competitor-name",
    "title": "founder OR CEO OR CTO OR CPO",
    "count": 10
})

Anysite:get_linkedin_profile({
    "user": "founder-linkedin-username",
    "with_experience": true,
    "with_education": true,
    "with_skills": true
})
```

Extract: Full career history, previous companies, education, skills, languages, recommendations.

### Analyze Leadership Activity
```python
Anysite:get_linkedin_user_posts({"urn": "user-urn", "count": 50})
Anysite:get_linkedin_user_comments({"urn": "user-urn", "count": 30})
Anysite:get_linkedin_user_reactions({"urn": "user-urn", "count": 50})
```

Analyze: Posting frequency, themes, technical depth, customer engagement, thought leadership quality.

### Twitter Leadership Presence
```python
Anysite:get_twitter_user({"user": "founder_handle"})
Anysite:get_twitter_user_posts({"user": "founder_handle", "count": 100})
```

Indicators: Personal brand strength, technical credibility, customer relationships, industry influence.

## Phase 5: Technical & Data Discovery

### Documentation Quality
```python
Anysite:parse_webpage({"url": "https://competitor.com/docs", "only_main_content": true})
Anysite:parse_webpage({"url": "https://competitor.com/api", "only_main_content": true})
```

Assess: Documentation completeness, code examples, interactive explorer, SDK availability.

### GitHub Presence
```python
Anysite:parse_webpage({"url": "https://github.com/competitor-org", "only_main_content": true})
Anysite:parse_webpage({"url": "https://github.com/competitor-org/main-repo", "only_main_content": true})
```

Extract: Star count, fork count, commit frequency, contributors, issue response time, open source components.

### Alternative Data Sources
```python
Anysite:parse_webpage({"url": "https://www.glassdoor.com/Reviews/competitor-name", "only_main_content": true})
```

Extract: Overall rating, CEO approval, salary ranges, interview difficulty, work-life balance, recent reviews.

### Integration Ecosystem
```python
Anysite:get_sitemap({"url": "https://competitor.com/sitemap.xml", "count": 50})
Anysite:parse_webpage({"url": "https://competitor.com/integrations", "only_main_content": true})
```

Extract: Integration partners, platform focus, API-first vs GUI-first approach.

## Advanced Techniques

### Multi-Competitor Analysis

For analyzing 3-5 competitors simultaneously:
1. Run analysis workflow for each competitor
2. Create comparison matrix: pricing table, feature matrix, market position map, social presence
3. Focus on key differentiators

### Ongoing Monitoring (Quarterly)

Quick check (30 min):
```python
Anysite:parse_webpage({"url": "competitor.com/pricing"})
Anysite:get_linkedin_company_posts({"urn": "...", "count": 10})
Anysite:get_linkedin_company_employees({"companies": ["..."], "count": 20})
Anysite:search_twitter_posts({"query": "competitor", "count": 50})
```

### Battle Card Creation

Focus on:
1. Quick facts (1-2 sentences)
2. Head-to-head feature comparison (table format)
3. Pricing comparison (clear numbers)
4. 3 reasons we win
5. 3 reasons we might lose
6. Talk tracks ("When they say X, we say Y")

Keep to 1-2 pages maximum.

## Output Quality Standards

**Good competitive analysis includes:**
- Clear positioning statement
- Quantified metrics (prices, follower counts, team size)
- Specific examples (actual quotes, feature lists)
- Strategic implications explained
- Data sources noted
- Confidence levels indicated

**Avoid:**
- Vague assessments ("they seem good at X")
- Unsupported claims ("probably losing money")
- Missing pricing details
- Outdated data without date stamps
- Pure feature lists without analysis
