---
name: hidden-api
description: "ESPN's unofficial public JSON API — scoreboards, schedules, teams, and game summaries for pro and college sports; keyless, undocumented, read-only"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-07-19"
  source: community
  tags: "espn,sports,scores,schedules,unofficial,keyless"
---
# ESPN Hidden API (unofficial)

ESPN exposes the JSON endpoints that power espn.com. They are **undocumented, unofficial, and carry no SLA or stability guarantee** — ESPN can change or remove them at any time, and there is no support channel. That said, the `site.api.espn.com` surface has been stable for years and is widely used for read-only hobby projects (score tickers, schedule dashboards). No API key, no auth.

Treat it accordingly: cache aggressively, degrade gracefully when a request fails or a field disappears, and keep traffic modest. Verified working 2026-07-19.

Base URL: `https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}`

## Sport/league slugs

The path is always `{sport}/{league}`:

| League | Path |
|---|---|
| NFL | `football/nfl` |
| College football | `football/college-football` |
| NBA / WNBA | `basketball/nba`, `basketball/wnba` |
| Men's / women's college basketball | `basketball/mens-college-basketball`, `basketball/womens-college-basketball` |
| MLB | `baseball/mlb` |
| NHL | `hockey/nhl` |
| Major soccer leagues | `soccer/{league}` e.g. `soccer/eng.1`, `soccer/usa.1` |

## Core endpoints

All are GET, all return JSON:

| Endpoint | Returns |
|---|---|
| `/scoreboard` | Today's (or `?dates=YYYYMMDD`) games with live scores |
| `/teams` | All teams in the league, with IDs, names, logos |
| `/teams/{teamId}` | One team |
| `/teams/{teamId}/schedule` | Team season schedule (`?season=YYYY&seasontype=2` — 1 pre, 2 regular, 3 post) |
| `/teams/{teamId}/roster` | Team roster |
| `/summary?event={eventId}` | Full game detail: box score, plays, leaders |
| `/news` | League headlines |
| `/standings` | League standings |

```javascript
const res = await fetch(
  "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/42/schedule",
  { headers: { "User-Agent": "my-dashboard/1.0" } }
);
const json = await res.json();
const events = json?.events ?? [];
```

## Event/competition shape (the part everyone parses)

Scoreboards and schedules both return an `events` array. Each event nests a `competitions` array (almost always length 1), which holds the useful detail:

```javascript
for (const e of events) {
  const c = e.competitions?.[0];
  const home = c?.competitors?.find((x) => x.homeAway === "home");
  const away = c?.competitors?.find((x) => x.homeAway === "away");
  const game = {
    id: e.id,
    date: e.date,                                  // ISO 8601 with Z (UTC)
    name: e.name,                                  // "Team A at Team B"
    homeTeam: home?.team?.displayName,
    awayTeam: away?.team?.displayName,
    homeScore: home?.score,                        // string, and shape differs by endpoint (see gotchas)
    venue: c?.venue?.fullName,
    tv: c?.broadcasts?.[0]?.media?.shortName,      // e.g. "ESPN2" — often absent
    completed: c?.status?.type?.completed ?? false,
    state: c?.status?.type?.state,                 // "pre" | "in" | "post"
  };
}
```

Key substructures:

- `competitors[]`: two entries with `homeAway: "home" | "away"`, each carrying `team` (`id`, `displayName`, `abbreviation`, `logos[].href`, `color`), `score`, and often `records[]`.
- `status.type`: `state` (`pre`/`in`/`post`), `completed` (boolean), `detail` (human string like "Final" or "7:30 PM ET").
- `broadcasts[]`: TV info; frequently empty or absent, especially for future or minor games.
- `venue`: `fullName`, `address.city`/`state`; absent for unannounced venues.

## Other API hosts (same family, rougher shapes)

- `https://sports.core.api.espn.com/v2/...` — the low-level linked-data API. Responses are shells of `$ref` URLs you must follow with further requests (athletes, odds, statistics, historical seasons live here). More complete, much chattier.
- `https://cdn.espn.com/core/{league}/scoreboard?xhr=1` — CDN-cached variants of site pages.
- `https://site.web.api.espn.com/apis/common/v3/...` — search, athlete profiles.

Start with `site.api.espn.com`; drop to `sports.core.api.espn.com` only when the site API lacks the data.

## Gotchas summary

1. **Everything is optional.** Any nested object — `competitions`, `competitors`, `venue`, `broadcasts`, `logos` — can be missing on any given event. Use optional chaining on every hop; a parser that assumes presence will crash on preseason, postponed, or TBD games.
2. **Scores are strings**, not numbers, and the score shape differs by endpoint: scoreboard competitors carry `score` as a plain string, while team-schedule competitors may carry `score` as an object (`{ value, displayValue }`). Normalize before comparing.
3. **Schedule endpoints need `seasontype`** for sports with distinct phases (`2` = regular season). Omitting `season`/`seasontype` returns the current default, which flips to next season in the offseason.
4. **Dates are UTC** (`Z` suffix) — a 7 PM local game shows as next-day UTC; convert before grouping by day. `?dates=YYYYMMDD` on scoreboard filters by ESPN's (US Eastern) game day, not UTC.
5. **No rate-limit headers, no documented quota.** Be polite: send an identifying User-Agent, cache responses (schedules change rarely — hours-long TTLs are fine; live scores every 30–60s at most), and fail soft (empty list) rather than retrying hot.
6. **Team IDs are per-league**, not global — team 12 in one league is unrelated to team 12 in another. Get IDs from the `/teams` endpoint.
7. Fields appear and disappear as ESPN A/B-tests its site. Pin your parser to the minimal set you need and tolerate extras.
