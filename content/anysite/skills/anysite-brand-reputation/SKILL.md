---
name: anysite-brand-reputation
description: "Monitor brand mentions, customer sentiment, and social conversations across platforms"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "sentiment,mentions,crisis,social-listening,nps"
---

# anysite Brand Reputation Monitoring

Monitor and protect your brand reputation across social media platforms. Track mentions, analyze sentiment, and identify issues before they escalate.

## Overview

- **Track brand mentions** across social platforms
- **Analyze sentiment** (positive, negative, neutral)
- **Monitor conversations** about your brand
- **Identify reputation risks** and crisis signals
- **Measure brand health** over time

**Coverage**: 65% - Strong for Twitter, Reddit, Instagram, YouTube, LinkedIn

## Supported Platforms

- Twitter/X: Real-time mentions, sentiment, viral content
- Reddit: Community discussions, detailed feedback, sentiment
- Instagram: Visual brand mentions, hashtag tracking, influencer posts
- YouTube: Video mentions, comment sentiment, brand coverage
- LinkedIn: Professional mentions, company updates, B2B sentiment

## Quick Start

**Step 1: Set Up Monitoring**

Define:
- Brand keywords (company name, product names, misspellings)
- Platforms to monitor (Twitter, Reddit, Instagram, etc.)
- Monitoring frequency (real-time, daily, weekly)
- Alert thresholds (negative sentiment, volume spikes)

**Step 2: Search for Mentions**

Platform searches:
```
Twitter: search_twitter_posts(query="brand name", count=100)
Reddit: search_reddit_posts(query="brand name", count=100)
Instagram: search_instagram_posts(query="#brandname", count=100)
LinkedIn: search_linkedin_posts(keywords="brand name", count=50)
```

**Step 3: Analyze Sentiment**

For each mention:
- Classify: Positive, negative, neutral
- Categorize: Complaint, praise, question, general
- Prioritize: Urgency, reach, influence

**Step 4: Take Action**

Based on findings:
- Respond to negative mentions
- Amplify positive feedback
- Address product issues
- Engage with community

## Common Workflows

### Workflow 1: Daily Brand Monitoring

1. Search all platforms for recent mentions
2. Classify mentions by sentiment and category
3. Prioritize issues (High: viral negative, Medium: individual complaints, Low: positive)
4. Generate daily report with mention count, sentiment breakdown, top issues

### Workflow 2: Crisis Detection and Management

1. Monitor for anomalies (mentions >2x baseline, negative sentiment >50%)
2. Deep dive on spikes with expanded searches
3. Assess crisis severity (volume, velocity, reach, sentiment, validity)
4. Track crisis evolution with hourly monitoring
5. Measure resolution (volume returns to baseline, sentiment improves)

### Workflow 3: Competitive Reputation Benchmarking

1. Define 3-5 main competitors
2. Gather mentions for all brands across platforms
3. Calculate brand health scores (mention volume, sentiment score, engagement rate, share of voice)
4. Analyze strengths/weaknesses
5. Identify opportunities from competitor weaknesses

## MCP Tools Reference

### Twitter/X
- `search_twitter_posts(query, count)` - Find brand mentions
- `get_twitter_user(user)` - Check brand profile stats
- `get_twitter_user_posts(user, count)` - Monitor brand account

### Reddit
- `search_reddit_posts(query, subreddit, count)` - Find discussions
- `get_reddit_post(url)` - Get post details and sentiment
- `get_reddit_post_comments(url)` - Deep dive on discussions

### Instagram
- `search_instagram_posts(query, count)` - Find visual mentions
- `get_instagram_post(post_id)` - Analyze mention engagement
- `get_instagram_post_comments(post, count)` - Read feedback

### YouTube
- `search_youtube_videos(query, count)` - Find video mentions
- `get_youtube_video(video)` - Get video details
- `get_youtube_video_comments(video, count)` - Analyze sentiment

### LinkedIn
- `search_linkedin_posts(keywords, count)` - Professional mentions
- `get_linkedin_company_posts(urn, count)` - Monitor own posts

## Sentiment Analysis Framework

**Positive Indicators**: "Love", "great", "amazing", "best", recommendations, repeat purchase, favorable comparisons
**Negative Indicators**: "Disappointed", "worst", "terrible", problems, unfavorable comparisons, demands
**Neutral Indicators**: Questions without sentiment, factual statements, general mentions

**Sentiment Score**:
```
Score = (Positive mentions - Negative mentions) / Total mentions x 100

+50 to +100: Excellent
+20 to +49: Good
-19 to +19: Neutral/Mixed
-20 to -49: Poor
-50 to -100: Critical
```

## Monitoring Metrics

**Volume**: Total mentions per day/week/month, mentions by platform, trend over time
**Sentiment**: Distribution (% positive/negative/neutral), score, trend over time
**Engagement**: Average likes/shares per mention, viral mentions (>1000 engagements), influencer mentions
**Issue Tracking**: Top complaints by frequency, product/service issues, feature requests

## Output Formats

**Chat Summary**: Daily mention highlights, sentiment overview, top issues, recommended actions
**CSV Export**: Mention list with sentiment, platform, date, reach, issue categorization
**JSON Export**: Complete mention data, time-series sentiment, engagement metrics

## Reference Documentation

- **[MONITORING_GUIDE.md](references/MONITORING_GUIDE.md)** - Best practices for brand monitoring, crisis response protocols, and sentiment analysis techniques
