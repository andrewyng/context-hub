---
name: anysite-audience-analysis
description: "Analyze follower demographics, engagement patterns, and audience quality across platforms"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "demographics,followers,growth,segments,instagram,youtube"
---

# anysite Audience Analysis

Understand your audience through demographic analysis, engagement patterns, and follower behavior across Instagram, YouTube, and LinkedIn.

## Overview

- **Analyze follower demographics** and characteristics
- **Track engagement patterns** and behavior
- **Evaluate audience quality** and authenticity
- **Identify content preferences** by audience segment
- **Optimize targeting** based on audience insights

**Coverage**: 60% - Focused on Instagram, YouTube, LinkedIn

## Supported Platforms

- Instagram: Follower analysis, engagement patterns, audience location
- YouTube: Subscriber insights, comment demographics, viewer behavior
- LinkedIn: Connection analysis, professional demographics, engagement

## Quick Start

**Step 1: Identify Audience Source**

Choose platform:
- Instagram: `get_instagram_user` + `get_instagram_user_friendships`
- YouTube: `get_youtube_channel_videos` + comment analysis
- LinkedIn: `get_linkedin_user_posts` + engagement analysis

**Step 2: Collect Audience Data**

Gather:
- Follower/subscriber counts
- Engagement metrics
- Demographics (from profiles)
- Behavior patterns

**Step 3: Analyze Patterns**

Look for:
- Audience segments
- Engagement drivers
- Content preferences
- Peak activity times

**Step 4: Generate Insights**

Deliver:
- Audience profile summary
- Engagement patterns
- Content recommendations
- Targeting suggestions

## Common Workflows

### Workflow 1: Instagram Audience Analysis

**Steps**:

1. **Get Profile Overview**
```
get_instagram_user(username)
```

2. **Analyze Followers** (sample)
```
get_instagram_user_friendships(
  user=username,
  type="followers",
  count=100
)

For each follower (sample):
- Profile type (personal, business, creator)
- Bio indicators (interests, location)
- Follower count (influence level)
```

3. **Engagement Pattern Analysis**
```
get_instagram_user_posts(username, count=50)

For each post:
  get_instagram_post_likes(post_id, count=100)
  get_instagram_post_comments(post_id, count=50)

Analyze:
- Who engages most (power users)
- When engagement happens (timing)
- What content drives engagement
- Comment quality and topics
```

4. **Audience Segmentation**
```
Group followers by:
- Engagement level (active, passive, ghost)
- Interests (from bios)
- Location (from profiles)
- Influence (follower counts)
```

### Workflow 2: YouTube Audience Insights

1. Channel overview via `get_youtube_channel_videos`
2. Viewer engagement analysis via video metrics and comments
3. Audience demographics from comment analysis
4. Content performance correlation

### Workflow 3: LinkedIn Audience Profiling

1. Get post history via `get_linkedin_user_posts`
2. Analyze engagement patterns (reactions, comments, shares)
3. Profile engagers (job titles, industries, companies)
4. Content-audience mapping

## MCP Tools Reference

### Instagram
- `get_instagram_user` - Profile stats
- `get_instagram_user_friendships` - Follower/following lists
- `get_instagram_user_posts` - Post history
- `get_instagram_post_likes` - Who liked posts
- `get_instagram_post_comments` - Comment analysis

### YouTube
- `get_youtube_channel_videos` - Channel content
- `get_youtube_video` - Video metrics
- `get_youtube_video_comments` - Audience engagement

### LinkedIn
- `get_linkedin_user_posts` - Post history
- `get_linkedin_profile` - Profile insights

## Audience Analysis Framework

**Demographic Analysis**:
- Age range (inferred from profiles)
- Location (from bio/profiles)
- Interests (from bio keywords)
- Professional level (LinkedIn titles)

**Behavioral Analysis**:
- Engagement frequency
- Content preferences
- Peak activity times
- Interaction patterns

**Quality Metrics**:
- Real vs. fake followers
- Engagement authenticity
- Audience overlap
- Influence distribution

## Output Formats

**Chat Summary**: Audience profile highlights, key engagement patterns, content recommendations
**CSV Export**: Follower sample data, engagement metrics, segment distribution
**JSON Export**: Complete audience data, engagement time series, segmentation details

## Reference Documentation

- **[PLATFORM_COVERAGE.md](references/PLATFORM_COVERAGE.md)** - Platform-specific audience analysis capabilities
- **[TOOL_MAPPING.md](references/TOOL_MAPPING.md)** - Mapping analysis needs to MCP tools
