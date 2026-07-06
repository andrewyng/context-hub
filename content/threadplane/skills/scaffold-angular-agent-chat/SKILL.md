---
name: scaffold-angular-agent-chat
description: "Scaffolds a streaming AI chat UI in an Angular app using @threadplane/chat, rendering <chat [agent]> bound to a backend adapter — @threadplane/ag-ui (default) or @threadplane/langgraph. Use when a user wants to add an agent chat interface, streaming chat, or generative UI to an Angular project, or mentions Threadplane, @threadplane/*, AG-UI with Angular, or LangGraph with Angular. Confirm which adapter the user is on before scaffolding; default to AG-UI if unspecified."
metadata:
  revision: 2
  updated-on: "2026-07-06"
  source: official
  tags: "angular,typescript,chat,agent,streaming,generative-ui,ag-ui,langgraph,threadplane"
---

# Scaffold an Angular agent chat UI with Threadplane

Threadplane provides a production chat UI for Angular AI agents (`@threadplane/chat`) bound to a runtime-neutral `Agent` contract. The same `<chat [agent]>` UI works against any backend through an adapter. Requires Angular 20+.

## Step 0 — Confirm the backend adapter (do this first)

Threadplane has two backend adapters. Pick the right one before writing any code:

- **`@threadplane/ag-ui`** — for any AG-UI-compatible backend (CrewAI, Mastra, Pydantic AI, LangGraph, custom). **This is the default** — use it unless the user says otherwise.
- **`@threadplane/langgraph`** — for a LangGraph server specifically (config keys `apiUrl` + `assistantId`).

Determine the adapter, in order:
1. Ask the user which backend they are using, or
2. Check `package.json` for an existing `@threadplane/ag-ui` or `@threadplane/langgraph` dependency, then
3. If still unknown, default to **AG-UI** and tell the user that is what you chose.

Do not assume the LangGraph adapter just because the backend happens to use LangGraph — an AG-UI-wrapped LangGraph backend uses the AG-UI adapter.

## Step 1 — Fetch the current docs

Before writing code, fetch the exact, version-pinned API with chub (it changes between releases):

```bash
chub get threadplane/chat --lang typescript
chub get threadplane/ag-ui --lang typescript          # or threadplane/langgraph
chub get threadplane/generative-ui --lang typescript  # only if generating UI
```

## Step 2 — Install

```bash
npm install @threadplane/chat marked
# then the chosen adapter:
npm install @threadplane/ag-ui @ag-ui/client @ag-ui/core   # AG-UI (default)
# or
npm install @threadplane/langgraph                    # LangGraph
```

## Step 3 — Provide the chat + agent (app.config.ts)

AG-UI (default):

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideChat } from '@threadplane/chat';
import { provideAgent } from '@threadplane/ag-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideChat({ assistantName: 'Assistant' }),
    provideAgent({ url: 'http://localhost:3000/agent' }),
  ],
};
```

LangGraph (if chosen): use `provideAgent({ apiUrl: 'http://localhost:2024', assistantId: 'chat' })` from `@threadplane/langgraph` instead.

## Step 4 — Render the chat

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChatComponent } from '@threadplane/chat';
import { injectAgent } from '@threadplane/ag-ui'; // import from the SAME package you provided

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div style="height: 100vh"><chat [agent]="agent" /></div>`,
})
export class ChatPageComponent {
  protected readonly agent = injectAgent();
}
```

## Escape hatch — no backend yet

Build UI offline without a server:
- AG-UI: use `provideFakeAgent({})` instead of `provideAgent({...})`.
- Or skip providers entirely: `mockAgent({ messages: [...] })` from `@threadplane/chat`, constructed directly in the component.

## Critical rules (where agents go wrong)

- `injectAgent()` and `provideAgent()` come from the ADAPTER package (`@threadplane/ag-ui` or `@threadplane/langgraph`), NOT from `@threadplane/chat`. `@threadplane/chat` exports `provideChat()` and `mockAgent()`.
- AG-UI's config key is `url`; LangGraph's are `apiUrl` + `assistantId`. They are different `provideAgent` functions from different packages — never mix them.
- Install `marked` for chat markdown; install `@ag-ui/client` + `@ag-ui/core` for the AG-UI adapter.
- The component selector is `<chat>`; the imported class is `ChatComponent`.
- For generative UI (agent-produced cards/forms), pass `<chat [views]="catalog">` and fetch `chub get threadplane/generative-ui`.
