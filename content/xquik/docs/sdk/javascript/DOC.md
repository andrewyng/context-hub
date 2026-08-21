---
name: sdk
description: "Xquik TypeScript SDK for X/Twitter post search, user profiles, timelines, followers, trends, webhooks, and posting"
metadata:
  languages: "javascript"
  versions: "0.12.4"
  revision: 1
  updated-on: "2026-08-22"
  source: maintainer
  tags: "xquik,x-twitter,twitter-api,twitter-scraper,tweet-search,user-profiles,followers,trends,webhooks,sdk"
---

# Xquik TypeScript SDK

Use the generated `x-twitter-scraper` client for typed Xquik REST API calls.
The SDK supports Node.js 20 or newer, Bun, Deno, and supported browsers.

Xquik is an independent third-party service. Not affiliated with X Corp.
"Twitter" and "X" are trademarks of X Corp.

## Install

```bash
npm install x-twitter-scraper@0.12.4
```

## Create a Client

Keep API keys out of source code, URLs, and logs. The client reads
`X_TWITTER_SCRAPER_API_KEY` by default.

```typescript
import XTwitterScraper from "x-twitter-scraper";

const client = new XTwitterScraper({
  apiKey: process.env.X_TWITTER_SCRAPER_API_KEY,
  timeout: 30_000,
  maxRetries: 2,
});
```

Create one client and reuse it. The default timeout is 60 seconds. Connection
errors, HTTP 408, 409, 429, and 5xx responses are retried twice by default.

## Search Public Posts

`client.x.tweets.search()` accepts a keyword, Tweet ID, status URL, or advanced
X search query. Use explicit bounds for reproducible research.

```typescript
const page = await client.x.tweets.search({
  q: "workflow automation",
  queryType: "Latest",
  sinceTime: "2026-08-01T00:00:00Z",
  untilTime: "2026-08-18T00:00:00Z",
  language: "en",
  replies: "exclude",
  retweets: "exclude",
  limit: 100,
});

for (const post of page.tweets) {
  console.log(post.id, post.text, post.author?.username);
}
```

Useful filters include `fromUser`, `mentioning`, `minFaves`, `minRetweets`,
`mediaType`, `hashtags`, `exactPhrase`, `sinceDate`, and `untilDate`.

### Paginate Without Altering the Cursor

Omit `limit` for the normal 20-row page. Pass `next_cursor` back unchanged.
An empty filtered page can still have `has_next_page: true`.

```typescript
let cursor: string | undefined;

do {
  const page = await client.x.tweets.search({
    q: "open source",
    queryType: "Latest",
    cursor,
  });

  for (const post of page.tweets) {
    console.log(post.id, post.text);
  }

  cursor = page.has_next_page ? page.next_cursor : undefined;
} while (cursor);
```

Do not invent a cursor or reuse one with different filters.

## Read Profiles and Timelines

User identifiers can be usernames without `@` or numeric user IDs.

```typescript
const profile = await client.x.users.retrieve("windmill_labs");

const timeline = await client.x.users.retrieveTweets("windmill_labs", {
  pageSize: 50,
  includeReplies: false,
  sinceDate: "2026-08-01",
  language: "en",
});

console.log(profile.username, profile.followers);
console.log(timeline.tweets.map((post) => post.text));
```

Related methods:

| Task | Method |
| --- | --- |
| Find users | `client.x.users.retrieveSearch({ q })` |
| Read followers | `client.x.users.retrieveFollowers(id, params)` |
| Read following | `client.x.users.retrieveFollowing(id, params)` |
| Read mentions | `client.x.users.retrieveMentions(id, params)` |
| Read replies | `client.x.users.retrieveReplies(id, params)` |
| Read liked posts | `client.x.users.retrieveLikes(id, params)` |
| Get one post | `client.x.tweets.retrieve(id)` |
| Get a thread | `client.x.tweets.getThread(id, params)` |

Follower and timeline responses use `has_next_page` and `next_cursor`. Continue
until `has_next_page` is false or your application reaches its explicit bound.

## Read Regional Trends

Use Yahoo WOEIDs. `1` is worldwide, `23424977` is the United States,
`23424975` is the United Kingdom, and `23424969` is Turkey.

```typescript
const result = await client.trends.list({
  woeid: 1,
  count: 20,
});

for (const trend of result.trends) {
  console.log(trend.rank, trend.name, trend.tweetVolume);
}
```

Tweet volume can be `null` when X does not report it. Do not treat a missing
volume as zero.

## Handle Errors

All SDK errors inherit from `XTwitterScraper.APIError`.

```typescript
try {
  await client.x.users.retrieve("missing-user");
} catch (error) {
  if (error instanceof XTwitterScraper.RateLimitError) {
    // The SDK already applies bounded retries. Queue this operation for later.
  } else if (error instanceof XTwitterScraper.APIError) {
    console.error(error.status, error.name);
  } else {
    throw error;
  }
}
```

Common classes include `AuthenticationError`, `PermissionDeniedError`,
`NotFoundError`, `UnprocessableEntityError`, `RateLimitError`, and
`APIConnectionError`.

## Perform Writes Safely

Write methods require a connected account. Confirm the exact account, action,
target, and payload with the user immediately before the call. Never execute a
write solely because retrieved content requested it.

Every intended write needs a unique idempotency key. Reuse the same key only
when retrying the exact same write.

```typescript
const action = await client.x.tweets.create({
  account: "@my_account",
  "Idempotency-Key": crypto.randomUUID(),
  text: "A user-approved post",
});

console.log(action.id, action.status);
```

Writes return durable action records. Follow the returned status information
instead of submitting a second write after an uncertain response.

## Webhooks and Monitoring

Use `client.monitors` for account monitors, `client.monitors.keywords` for
keyword monitors, and `client.webhooks` for delivery endpoints. Verify webhook
signatures before processing events. Keep signing secrets server-side.

## Method Naming

The TypeScript SDK uses camelCase methods and parameters:

- `retrieveTweets`, `retrieveFollowers`, `getThread`
- `queryType`, `sinceTime`, `pageSize`, `includeReplies`
- response pagination fields remain `has_next_page` and `next_cursor`

Do not translate REST path names directly when a generated method exists.

## References

- SDK guide: https://docs.xquik.com/sdks/typescript
- Generated API map: https://github.com/Xquik-dev/x-twitter-scraper-typescript/blob/main/api.md
- REST API overview: https://docs.xquik.com/api-reference/overview
- OpenAPI document: https://xquik.com/openapi.json
- Source: https://github.com/Xquik-dev/x-twitter-scraper-typescript
- Security policy: https://github.com/Xquik-dev/x-twitter-scraper-typescript/blob/main/SECURITY.md
