---
name: luxon
description: "TypeScript declarations for Luxon date, time, duration, and interval APIs, including zone-aware parsing, formatting, and invalid-value handling."
metadata:
  languages: "typescript"
  versions: "3.7.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,luxon,date,time,timezone,intl,types,definitelytyped"
---

# Luxon TypeScript Guide

## Golden Rule

Install `@types/luxon` alongside the real `luxon` runtime package, then import runtime values from `"luxon"`.

`@types/luxon` only provides TypeScript declarations. Your application still runs the `luxon` package at runtime. The Luxon 3.x package metadata does not advertise bundled declaration files, so `@types/luxon` is the package that provides editor and compiler support for TypeScript projects using this runtime line.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install luxon
npm install -D typescript @types/luxon
```

If the same files also read Node.js globals such as `process.env`, add Node.js types too:

```bash
npm install -D @types/node
```

No environment variables, API keys, or client initialization are required.

## Initialization

Import the runtime exports you use:

```typescript
import { DateTime, Duration, Interval, Settings } from "luxon";
```

Luxon relies on the platform `Intl` APIs for locale and time zone support, so there is no separate locale or tzdata package to configure for normal usage.

## Common Workflows

### Parse ISO timestamps and format output

```typescript
import { DateTime } from "luxon";

const createdAt = DateTime.fromISO("2026-03-13T15:30:00Z");

if (!createdAt.isValid) {
  throw new Error(
    createdAt.invalidExplanation ?? createdAt.invalidReason ?? "Invalid timestamp"
  );
}

console.log(createdAt.toISO());
console.log(createdAt.toLocaleString(DateTime.DATETIME_MED));
console.log(createdAt.toFormat("yyyy-LL-dd HH:mm"));
```

`fromISO()`, `toISO()`, `toLocaleString()`, and `toFormat()` are the core parse-and-format methods you will use most often when a TypeScript app receives or emits timestamps.

### Preserve or change zones explicitly

```typescript
import { DateTime } from "luxon";

const meeting = DateTime.fromISO("2026-03-13T09:00:00-04:00", {
  setZone: true,
});

const utcMeeting = meeting.toUTC();
const parisMeeting = meeting.setZone("Europe/Paris");

console.log(meeting.zoneName);
console.log(utcMeeting.toISO());
console.log(parisMeeting.toISO());
```

Use `setZone: true` when the incoming ISO string already contains an offset and you want Luxon to keep that zone on the resulting `DateTime`. Use `setZone()` or `toUTC()` when your app needs a normalized output zone.

### Build typed helpers with `DateTime`

```typescript
import { DateTime } from "luxon";

export function formatDeadline(deadline: DateTime): string {
  if (!deadline.isValid) {
    throw new Error("Deadline must be a valid Luxon DateTime");
  }

  return deadline.toUTC().toFormat("yyyy-LL-dd HH:mm 'UTC'");
}

const deadline = DateTime.fromObject(
  { year: 2026, month: 4, day: 1, hour: 17, minute: 0 },
  { zone: "America/New_York" }
);

console.log(formatDeadline(deadline));
```

For most application code, the practical type boundary is the runtime class itself: accept `DateTime` in function signatures and return strings, native `Date` objects, or application-specific types at the edge.

### Convert between Luxon and native `Date`

```typescript
import { DateTime } from "luxon";

const jsDate = new Date("2026-03-13T15:30:00Z");

const dt = DateTime.fromJSDate(jsDate, { zone: "utc" });

if (!dt.isValid) {
  throw new Error("Could not convert Date into DateTime");
}

const backToDate = dt.plus({ hours: 2 }).toJSDate();

console.log(dt.toISO(), backToDate.toISOString());
```

Use `fromJSDate()` when browser, database, or platform APIs give you a native `Date`, and `toJSDate()` when another library expects one.

### Work with `Duration` and `Interval`

```typescript
import { DateTime, Duration, Interval } from "luxon";

const start = DateTime.fromISO("2026-03-13T09:00:00", {
  zone: "America/New_York",
});
const end = start.plus({ minutes: 90 });

const interval = Interval.fromDateTimes(start, end);
const duration = Duration.fromObject({ hours: 1, minutes: 30 });

console.log(
  interval.contains(
    DateTime.fromISO("2026-03-13T09:30:00", {
      zone: "America/New_York",
    })
  )
);
console.log(interval.toDuration(["hours", "minutes"]).toObject());
console.log(duration.toISO());
console.log(duration.shiftTo("minutes").toObject());
```

Use `Interval` for start/end windows and `Duration` for reusable amounts of time. Keep them distinct in your own types and helper names.

### Fail fast on invalid values

```typescript
import { DateTime, Settings } from "luxon";

Settings.throwOnInvalid = true;

try {
  const impossible = DateTime.fromObject({
    year: 2026,
    month: 2,
    day: 30,
  });

  console.log(impossible.toISO());
} finally {
  Settings.throwOnInvalid = false;
}
```

If you prefer not to set a global flag, keep the default behavior and check `isValid`, `invalidReason`, and `invalidExplanation` on each `DateTime`, `Duration`, or `Interval` value.

### Set application-wide defaults carefully

```typescript
import { DateTime, Settings } from "luxon";

Settings.defaultZone = "UTC";
Settings.defaultLocale = "en-US";

const createdAt = DateTime.now();
const publishedAt = DateTime.fromISO("2026-03-13T15:30:00");

console.log(createdAt.toISO());
console.log(publishedAt.toLocaleString(DateTime.DATE_FULL));
```

`Settings.defaultZone` and `Settings.defaultLocale` only affect instances created after you set them.

## Minimal End-to-End Example

```typescript
import { DateTime, Interval, Settings } from "luxon";

Settings.defaultZone = "UTC";

const input = "2026-03-13T09:00:00-04:00";

const start = DateTime.fromISO(input, { setZone: true });

if (!start.isValid) {
  throw new Error(
    start.invalidExplanation ?? start.invalidReason ?? "Invalid start time"
  );
}

const end = start.plus({ hours: 2 });
const window = Interval.fromDateTimes(start, end);

console.log({
  input,
  startIso: start.toISO(),
  startUtc: start.toUTC().toISO(),
  endIso: end.toISO(),
  minutes: window.toDuration("minutes").as("minutes"),
});
```

This is the typical `@types/luxon` boundary: import classes from `luxon`, let TypeScript track `DateTime` and `Interval` values through your code, and convert to strings or native `Date` objects only when another API requires them.

## Common Pitfalls

- Install `luxon` as well as `@types/luxon`; the `@types` package does not include runtime code.
- Import from `"luxon"`, not from `"@types/luxon"`.
- Check `isValid` before assuming a parsed or constructed value is usable, unless you intentionally enable `Settings.throwOnInvalid`.
- Do not treat `plus({ days: 1 })` and `plus({ hours: 24 })` as interchangeable across DST boundaries; Luxon distinguishes calendar shifts from exact elapsed time.
- Treat `Settings` as global process-wide state. Reset or isolate it in tests so one suite does not leak defaults into another.
- Keep runtime and declaration versions aligned to the same Luxon major when you upgrade.

## Version Notes

- This guide targets `@types/luxon@3.7.1`.
- The documented runtime API is Luxon 3.x, including named exports such as `DateTime`, `Duration`, `Interval`, and `Settings`.
- Luxon's maintainer README links the install guide, quick tour, and API reference at `moment.github.io/luxon`.
- The current Luxon 3.x package metadata does not advertise bundled TypeScript declaration files, so `@types/luxon` remains the declaration package to install for TypeScript support.

## Official Sources

- https://www.npmjs.com/package/@types/luxon
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/luxon
- https://www.npmjs.com/package/luxon
- https://github.com/moment/luxon
- https://moment.github.io/luxon/#/install
- https://moment.github.io/luxon/#/tour
- https://moment.github.io/luxon/api-docs/index.html
