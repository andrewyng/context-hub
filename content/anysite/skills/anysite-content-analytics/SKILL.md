---
name: anysite-content-analytics
description: "Measure content performance, engagement metrics, and posting strategy effectiveness"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "engagement,roi,viral,posting-strategy,benchmarking"
---

# anysite Content Analytics

Measure and optimize content performance across social platforms using anysite MCP. Track engagement, identify top performers, and refine your content strategy.

## Overview

- **Track post performance** across Instagram, YouTube, LinkedIn, Twitter/X
- **Analyze engagement metrics** (likes, comments, shares, views)
- **Identify top content** and viral patterns
- **Benchmark against competitors** for strategy insights
- **Optimize posting strategy** based on data

**Coverage**: 80% - Strong for Instagram, YouTube, LinkedIn, Twitter, Reddit

## Supported Platforms

- Instagram: Posts, Reels, likes, comments, engagement rates
- YouTube: Videos, views, likes, comments, watch time indicators
- LinkedIn: Posts, articles, reactions, comments, shares
- Twitter/X: Tweets, retweets, likes, replies
- Reddit: Posts, upvotes, comments, awards

## Quick Start

**Step 1: Collect Content Data**

Platform-specific:
- Instagram: `get_instagram_user_posts(username, count=50)`
- LinkedIn: `get_linkedin_user_posts(urn, count=50)`
- Twitter: `get_twitter_user_posts(user, count=100)`
- YouTube: `get_youtube_channel_videos(channel, count=30)`

**Step 2: Analyze Engagement**

Calculate metrics:
- Engagement rate: (likes + comments + shares) / followers
- Best performing content: Top 10% by engagement
- Content types: Video vs. image vs. text
- Posting frequency: Posts per week

**Step 3: Identify Patterns**

Look for:
- Best posting times (day of week, time)
- Top-performing topics/themes
- Optimal content length
- High-engagement formats

**Step 4: Optimize Strategy**

Based on findings:
- Double down on top content types
- Post more during peak engagement times
- Replicate successful topics
- Adjust content mix

## Common Workflows

### Workflow 1: Instagram Content Audit

1. Get all posts: `get_instagram_user_posts(username, count=100)`
2. Calculate metrics: engagement rate, content type breakdown
3. Identify top performers: sort by engagement, analyze common patterns
4. Analyze content mix: Reels vs. carousels vs. single images
5. Benchmark against competitors

### Workflow 2: LinkedIn Content Strategy Analysis

1. Collect post history: `get_linkedin_user_posts(urn, count=100)`
2. Categorize content: text-only, image, video, article, poll
3. Analyze engagement by type: reactions, comments, shares per category
4. Topic analysis: extract themes from top posts
5. Posting timing analysis: group by day/time, calculate average engagement

### Workflow 3: YouTube Channel Performance Analysis

1. Get channel videos: `get_youtube_channel_videos(channel, count=50)`
2. Analyze each video: views, likes, comments, view velocity
3. Identify patterns in top 20%: length, titles, topics, timing
4. Engagement analysis from comments
5. Content mix optimization: long-form vs short, tutorial vs entertainment

## MCP Tools Reference

### Instagram
- `get_instagram_user_posts(user, count)` - Get posts with engagement
- `get_instagram_post(post_id)` - Get detailed post metrics
- `get_instagram_post_likes(post, count)` - Analyze likers
- `get_instagram_post_comments(post, count)` - Get comments

### LinkedIn
- `get_linkedin_user_posts(urn, count)` - Get post history
- `get_linkedin_company_posts(urn, count)` - Company page posts

### Twitter/X
- `get_twitter_user_posts(user, count)` - Get tweets
- `search_twitter_posts(query, count)` - Find trending tweets

### YouTube
- `get_youtube_channel_videos(channel, count)` - All videos
- `get_youtube_video(video)` - Video details and metrics
- `get_youtube_video_comments(video, count)` - Comments

### Reddit
- `reddit_user_posts(username, count)` - User's posts
- `search_reddit_posts(query, count)` - Find popular posts

## Key Metrics

**Engagement Rate**:
- Formula: (Likes + Comments + Shares) / Followers x 100
- Instagram benchmark: 3-6%
- LinkedIn benchmark: 2-5% of connections
- Twitter benchmark: 0.5-1%

**Content Performance Score**:
```
Score = (Engagement Rate x 40) +
        (Comments/Likes Ratio x 30) +
        (Share Rate x 30)
```

**Viral Potential Indicators**:
- Engagement rate >2x average
- High share rate (>5% of engagement)
- Rapid engagement velocity (50% within 24h)
- Quality comments (questions, discussions)

## Output Formats

**Chat Summary**: Top 5 performing posts, key insights, optimization recommendations
**CSV Export**: Post URL, date, type, likes, comments, shares, engagement rate, rank
**JSON Export**: Full post data with metadata, time-series engagement, historical trends

## Reference Documentation

- **[METRICS_GUIDE.md](references/METRICS_GUIDE.md)** - Detailed metrics definitions, calculation formulas, and benchmarks
