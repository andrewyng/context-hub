---
name: anysite-influencer-discovery
description: "Find and evaluate influencers by niche, engagement rate, and audience quality"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "creators,ambassador,micro-influencer,partnership,kol"
---

# anysite Influencer Discovery

Find and analyze influencers across social platforms using anysite MCP. Discover content creators, evaluate their reach and engagement, and identify partnership opportunities.

## Overview

- **Discover influencers** across Instagram, Twitter, LinkedIn, YouTube
- **Analyze engagement** and audience quality
- **Track activity** and content patterns
- **Evaluate partnership fit** based on niche and metrics
- **Build influencer lists** with contact information

**Coverage**: 85% - Excellent for Instagram, Twitter, LinkedIn, YouTube influencers.

## Supported Platforms

- Instagram: Profile stats, posts, followers, engagement, Reels
- Twitter/X: User search, followers, tweets, engagement
- LinkedIn: B2B influencers, thought leaders, professional content
- YouTube: Channel search, subscribers, views, video performance
- Reddit: Community influencers, karma, post quality

## Quick Start

**Step 1: Search for Influencers**

By platform:
- Instagram: `search_instagram_posts` with niche keywords + hashtags
- Twitter: `search_twitter_users` with niche keywords
- LinkedIn: `search_linkedin_users` with industry + "thought leader"
- YouTube: `search_youtube_videos` with niche, then analyze channels

**Step 2: Analyze Profiles**

Get detailed metrics:
- Instagram: `get_instagram_user` -> followers, posts, engagement rate
- Twitter: `get_twitter_user` -> followers, tweet frequency
- YouTube: `get_youtube_channel_videos` -> subscribers, views, growth
- LinkedIn: `get_linkedin_profile` -> connections, post engagement

**Step 3: Evaluate Engagement**

Check engagement quality:
- Post likes, comments, shares
- Engagement rate (engagement / followers)
- Audience authenticity (comment quality)
- Content consistency (posts per week)

**Step 4: Build Influencer List**

Export with:
- Name, handle, platform
- Follower count, engagement rate
- Niche/topics, content type
- Contact info (if available)
- Partnership fit score

## Common Workflows

### Workflow 1: Instagram Influencer Discovery

**Scenario**: Find Instagram influencers in sustainable fashion (10k-100k followers)

1. Search by hashtag/keywords: `search_instagram_posts(query="sustainable fashion", count=100)`
2. Analyze each creator: `get_instagram_user(username)` -> filter by follower range
3. Evaluate content: `get_instagram_user_posts(username, count=30)` -> engagement rate, quality
4. Check audience quality: `get_instagram_post_likes` + `get_instagram_post_comments` -> real engagement
5. Get contact information from bios and LinkedIn

### Workflow 2: LinkedIn Thought Leader Identification

**Scenario**: Find B2B thought leaders in SaaS/sales

1. Search for active posters: `search_linkedin_users(keywords="SaaS sales thought leader", count=100)`
2. Analyze post activity: `get_linkedin_user_posts(urn, count=50)` -> filter by frequency and engagement
3. Evaluate influence: average reactions, comment quality, share count
4. Assess content quality: expertise demonstration, original insights

### Workflow 3: YouTube Creator Research

**Scenario**: Find YouTube creators in tech reviews

1. Search for niche content: `search_youtube_videos(query="tech review 2026", count=100)`
2. Analyze channels: `get_youtube_channel_videos(channel, count=30)` -> metrics
3. Evaluate video performance: views, likes, comments per video
4. Analyze audience engagement from comments

## MCP Tools Reference

### Instagram
- `search_instagram_posts` - Find posts by keywords/hashtags
- `get_instagram_user` - Get profile with followers, bio
- `get_instagram_user_posts` - Get recent posts with engagement
- `get_instagram_post_likes` - Check audience authenticity
- `get_instagram_post_comments` - Analyze engagement quality
- `get_instagram_user_friendships` - Get followers list

### Twitter/X
- `search_twitter_users` - Find users by keywords/bio
- `get_twitter_user` - Get profile with followers, tweets
- `get_twitter_user_posts` - Get recent tweets with engagement
- `search_twitter_posts` - Find influential tweets in niche

### LinkedIn
- `search_linkedin_users` - Find professionals by keywords/title
- `get_linkedin_profile` - Get complete profile
- `get_linkedin_user_posts` - Get post history and engagement
- `get_linkedin_user_skills` - Verify expertise

### YouTube
- `search_youtube_videos` - Find videos by keywords
- `get_youtube_channel_videos` - Get all videos from channel
- `get_youtube_video` - Get video metrics (views, likes)
- `get_youtube_video_comments` - Analyze audience engagement

### Reddit
- `search_reddit_posts` - Find influential posts in subreddits
- `reddit_user_posts` - Get user's post history
- `reddit_user_comments` - Analyze community engagement

## Influencer Evaluation Framework

### Reach Metrics
- **Followers**: Total audience size
- **Views**: Average content views
- **Growth**: Follower growth rate

### Engagement Metrics
- **Rate**: Engagement / Followers
- **Quality**: Comment depth and relevance
- **Consistency**: Regular engagement patterns

### Authenticity Indicators
- **Audience Quality**: Real vs. fake followers
- **Comment Quality**: Meaningful discussions
- **Growth Pattern**: Organic vs. purchased
- **Engagement Distribution**: Consistent vs. spiky

### Content Quality
- **Production Value**: Visual/audio quality
- **Originality**: Unique vs. repurposed
- **Consistency**: Regular posting schedule
- **Niche Alignment**: On-brand content

### Partnership Fit
- **Audience Overlap**: Match with target market
- **Brand Alignment**: Values and messaging
- **Professionalism**: Past partnerships, disclosure
- **Availability**: Contact information, responsiveness

## Advanced Features

### Micro-Influencer Strategy

Focus on 10k-50k followers for higher engagement:
- Higher engagement rates (5-10% vs. 1-3%)
- More authentic audience connections
- Lower partnership costs
- Niche expertise

### Multi-Platform Presence Analysis

Identify influencers active across platforms:
1. Find on Instagram/Twitter
2. Search LinkedIn for professional presence
3. Check for YouTube channel
4. Look for website/blog (parse_webpage)

## Output Formats

**Chat Summary**: Top 10 influencers with key metrics, engagement comparison, partnership recommendations
**CSV Export**: Name, handle, platform, followers, engagement rate, niche, email, fit score
**JSON Export**: Complete profile data, all posts with engagement, audience demographics

## Reference Documentation

- **[DISCOVERY_CRITERIA.md](references/DISCOVERY_CRITERIA.md)** - Influencer evaluation criteria, scoring frameworks, and niche identification strategies
