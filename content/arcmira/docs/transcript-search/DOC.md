---
name: transcript-search
description: "Arcmira JavaScript SDK for YouTube transcript search, timestamped quotes, speaker appearances, mentions, sponsors, and recommendations"
metadata:
  languages: "javascript"
  versions: "0.6.2"
  revision: 3
  updated-on: "2026-10-16"
  source: maintainer
  tags: "arcmira,youtube,transcripts,search,podcasts,speakers,sponsors"
---

# YouTube transcript search with Arcmira

Search indexed YouTube and podcast transcripts with the `arcmira` npm package. Results include source passages and timestamped watch links.

## Install and search

Requires Node.js 18 or later, or another runtime with global `fetch`.

```sh
npm install arcmira@0.6.2
```

Create an API key through the [authentication guide](https://arcmira.com/docs/authentication). Set `ARCMIRA_API_KEY` in your server environment. Keep the key out of browser bundles and source control.

```javascript
import { ArcmiraClient } from "arcmira";

const client = new ArcmiraClient({ apiKey: process.env.ARCMIRA_API_KEY });
const results = await client.transcripts.search({
	q: "vibe coding",
	limit: 5,
});

for (const hit of results.chunks) {
	console.log(hit.channel_name, hit.text, hit.watch_url);
}
console.log(results.window, results.search_index);
```

Report the returned publication window and index coverage with your findings. An empty result does not prove that a topic was never discussed. `window.before` is an exclusive upper bound. `search_index.missing_before` identifies older transcripts still being added.

## Resolve names before filtering

Entity filters take `ent_` IDs. Channel filters take YouTube channel IDs. Resolve an ambiguous name before requesting mentions or recommendations.

```javascript
const resolved = await client.entities.resolve({
	q: "Ramp",
	context: "the corporate card company",
});
const entity = resolved.best ?? resolved.suggested;
if (!entity) {
	throw new Error(resolved.ask?.question ?? "No matching entity");
}
if (resolved.suggested) {
	console.log(`Assuming ${entity.name}: ${resolved.suggested.evidence}`);
}

const passages = await client.transcripts.search({
	q: "corporate cards",
	about: entity.id,
	kind: "sponsored",
	limit: 5,
});
for (const hit of passages.chunks) console.log(hit.text, hit.watch_url);
```

Use `resolved.ask.options` to present alternatives when resolution needs clarification. Do not invent an ID or silently choose an unrelated entity.

Search supports `about`, `by`, `entity_ids`, and `channel_ids`. `kind` distinguishes `sponsored`, `organic`, and `mention`. Date filters use UTC with inclusive `after` and exclusive `before` boundaries.

## Retrieve mentions and recommendations

```javascript
const mentions = await client.mentions.list({ entity_id: entity.id, limit: 10 });
for (const mention of mentions.data) {
	console.log(mention.media.title, mention.start_seconds);
}

const recommendations = await client.recommendations.list({
	entity_id: entity.id,
	class: "organic",
	limit: 10,
});
for (const row of recommendations.data) {
	console.log(row.class, row.verbatim_quote);
}
```

Recommendations require Pro+. Classification reflects the API's analysis, not proof of a creator's commercial relationship.

A list response is a `Page`. Its `data` contains the current page. Async iteration follows subsequent pages automatically and can use additional credits. Use `hasNextPage()` and `getNextPage()` for explicit pagination, or stop iteration once you have enough rows.

## Read a Premium transcript

A paid read uses credits from your plan, then your on-demand budget. The account's configured budget is the approval. Get a free quote before a Premium read when you need to inspect its credit cost.

```javascript
const video_id = "dQw4w9WgXcQ";
console.log(await client.transcripts.quote({ video_id }));
const transcript = await client.transcripts.get({ video_id, quality: "premium" });

if (transcript.state === "ready") {
	for (const line of transcript.lines ?? []) console.log(line.speaker, line.text);
} else if (transcript.state === "pending") {
	console.log(`Poll again after ${transcript.job.next_poll_seconds ?? 30} seconds`);
} else {
	console.error(transcript.last_attempt.status, transcript.last_attempt.error);
}
```

A Premium read can start transcription. Poll the same read after the indicated delay. Repeated and concurrent reads join the same job without using credits twice. A failed result uses no credits by itself. Passing `retry: true` starts a new attempt and uses credits again. Do not replace a requested Premium transcript with another quality without making that change clear to the user.

## Handle API errors

```javascript
import { Arcmira } from "arcmira";

try {
	await client.transcripts.search({ q: "video editing", limit: 3 });
} catch (error) {
	if (error instanceof Arcmira.PaymentRequiredError || error instanceof Arcmira.ForbiddenError) {
		console.error(error.body.error.code, error.body.error.details?.quote);
	} else {
		throw error;
	}
}
```

Non-success responses throw typed SDK errors. Preserve `request_id` when reporting an error. A `401` requires valid authentication. Plan or budget refusals can return `403` or `402`; do not retry those indefinitely. Consult the [error reference](https://arcmira.com/docs/errors) and [usage documentation](https://arcmira.com/docs/usage-and-billing).

## Official references

- [Arcmira](https://arcmira.com)
- [API documentation](https://arcmira.com/docs)
- [JavaScript SDK](https://github.com/arcmira/arcmira)
- [OpenAPI schema](https://api.arcmira.com/v1/openapi.json)
- [MCP setup for agents](https://arcmira.com/docs/mcp-server)

This entry covers npm SDK `0.6.2`. The HTTP API and remote MCP server have separate version numbers.
