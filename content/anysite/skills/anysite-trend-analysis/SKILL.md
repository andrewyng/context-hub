---
name: anysite-trend-analysis
description: "Detect emerging trends, viral content, and topic momentum across social platforms"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "viral,hashtag,momentum,emerging,signals,zeitgeist"
---

# anysite Trend Analysis

Discover emerging trends and track viral content across social platforms using anysite MCP. Identify what's gaining momentum before it peaks.

## Overview

- **Detect emerging trends** across multiple platforms
- **Track viral content** and identify breakout topics
- **Monitor hashtag performance** and trending keywords
- **Analyze topic momentum** and growth patterns
- **Identify market shifts** through social listening

**Coverage**: 75% - Good for Twitter, Reddit, YouTube, LinkedIn, Instagram

## Supported Platforms

- Twitter/X: Trending topics, viral tweets, hashtag tracking
- Reddit: Trending posts, subreddit activity, upvote velocity
- YouTube: Trending videos, search trends, rising channels
- LinkedIn: Professional trends, industry discussions
- Instagram: Trending hashtags, viral content

## Quick Start

**Step 1: Search for Trending Content**

By platform:
- Twitter: `search_twitter_posts(query, count)` sorted by engagement
- Reddit: `search_reddit_posts(query, count)` sorted by upvotes
- YouTube: `search_youtube_videos(query, count)` by recent
- LinkedIn: `search_linkedin_posts(keywords, count)`
- Instagram: `search_instagram_posts(query, count)`

**Step 2: Analyze Momentum**

Check indicators:
- Engagement velocity (growth rate)
- Cross-platform presence
- Comment volume and sentiment
- Share/retweet patterns

**Step 3: Track Over Time**

Monitor changes:
- Daily engagement growth
- New platform adoption
- Mainstream vs. niche spread
- Peak timing prediction

**Step 4: Report Insights**

Deliver:
- Trending topics list
- Momentum indicators
- Strategic recommendations
- Early warnings or opportunities

## Common Workflows

### Workflow 1: Multi-Platform Trend Detection

**Scenario**: Identify what's trending in tech/AI space

1. **Search Across Platforms**
```
# Twitter
search_twitter_posts(query="AI OR artificial intelligence", count=100)

# Reddit
search_reddit_posts(query="artificial intelligence", count=100)

# YouTube
search_youtube_videos(query="AI news", count=50)

# LinkedIn
search_linkedin_posts(keywords="artificial intelligence", count=50)
```

2. **Extract Common Themes**: Analyze content for recurring keywords, company mentions, events, questions

3. **Calculate Trend Score**: Platform count, total engagement, growth velocity, sentiment distribution

4. **Identify Breakout Trends**: Presence on 3+ platforms, engagement growing >50% daily, influencer coverage

### Workflow 2: Hashtag Performance Tracking

1. Search by hashtag across Instagram, Twitter, LinkedIn
2. Calculate velocity (posts in last 24h vs. previous 24h)
3. Analyze content evolution (early vs. recent posts)
4. Predict peak based on growth curve

### Workflow 3: Reddit Trend Mining

1. Search target subreddits for top posts
2. Analyze post momentum (upvotes per hour, comment velocity)
3. Extract discussion themes from high-momentum posts
4. Track cross-pollination to Twitter, LinkedIn, YouTube

## MCP Tools Reference

### Twitter/X
- `search_twitter_posts(query, count)` - Find tweets, filter by engagement
- `get_twitter_user(user)` - Check influencer adoption

### Reddit
- `search_reddit_posts(query, subreddit, count)` - Find discussions
- `get_reddit_post(url)` - Get post details and momentum
- `get_reddit_post_comments(url)` - Analyze discussion depth

### YouTube
- `search_youtube_videos(query, count)` - Find trending videos
- `get_youtube_video(video)` - Track view velocity
- `get_youtube_video_comments(video, count)` - Gauge interest

### LinkedIn
- `search_linkedin_posts(keywords, count)` - Professional trends
- `get_linkedin_company_posts(urn, count)` - Corporate adoption

### Instagram
- `search_instagram_posts(query, count)` - Hashtag trends
- `get_instagram_post(post_id)` - Engagement metrics

## Trend Identification Framework

**Trend Stages**:

1. **Emergence** (0-20% awareness)
   - Niche communities discussing
   - Low but accelerating engagement
   - Action: Monitor closely, prepare strategy

2. **Growth** (20-50% awareness)
   - Crossing into mainstream platforms
   - Rapid engagement growth
   - Action: Create content, engage actively

3. **Peak** (50-80% awareness)
   - Maximum visibility
   - Slowing growth rate
   - Action: Maximize presence before decline

4. **Decline** (80-100% awareness)
   - Engagement decreasing
   - Moving to "background noise"
   - Action: Shift focus to next trend

**Momentum Indicators**:
- **Volume**: Mentions per day
- **Velocity**: Growth rate (% change)
- **Reach**: Unique accounts discussing
- **Spread**: Number of platforms
- **Sentiment**: Positive/negative ratio
- **Influence**: Key accounts involved

## Output Formats

**Chat Summary**: Top 5 trends with momentum scores, platform breakdown, strategic recommendations
**CSV Export**: Trend name, platforms, volume, growth rate, sentiment, key influencers
**JSON Export**: Complete trend data, time-series metrics, cross-platform correlations

## Reference Documentation

- **[SOCIAL_MONITORING.md](references/SOCIAL_MONITORING.md)** - Social listening techniques, monitoring strategies, and trend prediction methods
