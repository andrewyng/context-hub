---
name: ag-ui
description: "AG-UI backend adapter for Angular AI chat — provideAgent({url}) + injectAgent() bind @threadplane/chat to any AG-UI-compatible agent (CrewAI, Mastra, Pydantic AI, LangGraph, custom). Use when wiring an Angular chat UI to an AG-UI backend."
metadata:
  languages: "typescript"
  versions: "0.0.53"
  revision: 1
  updated-on: "2026-06-24"
  source: official
  tags: "angular,typescript,ag-ui,agent,streaming,chat,adapter,threadplane"
---

# @threadplane/ag-ui for Angular

`@threadplane/ag-ui` connects an Angular app to any AG-UI-compatible backend and exposes it as the runtime-neutral `Agent` contract that `<chat [agent]>` consumes. AG-UI is the recommended default adapter — it works with anything that speaks the AG-UI protocol (CrewAI, Mastra, Pydantic AI, LangGraph, or a custom service).

Requires Angular 20+ and Node 22+.

## Install

```bash
npm install @threadplane/chat @threadplane/ag-ui @ag-ui/client @ag-ui/core
```

`@ag-ui/client` and `@ag-ui/core` are both required peers of the adapter.

## Configure the provider

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAgent } from '@threadplane/ag-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgent({
      url: 'http://localhost:3000/agent',
      // headers: { Authorization: `Bearer ${token}` }, // optional — sent with every request
    }),
  ],
};
```

`provideAgent` also accepts `agentId`, `threadId`, and `headers` — `headers` is the documented way to send auth tokens to your backend.

No backend yet? Use `provideFakeAgent({ tokens: ['Hello', ' from', ' a fake agent.'] })` — it streams the canned tokens so you can build and test UI offline. (`provideFakeAgent({})` wires the transport but emits no reply.)

## Render the chat

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChatComponent } from '@threadplane/chat';
import { injectAgent } from '@threadplane/ag-ui';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [ChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<chat [agent]="agent" />`,
})
export class StreamingComponent {
  protected readonly agent = injectAgent();
}
```

`<chat>` handles streaming messages, tool calls, errors, and submit — all bound to the AG-UI backend through the `Agent` contract.

## Switching backends without changing UI

The `Agent` contract is the payoff: your component never learns the protocol. Swapping AG-UI ↔ LangGraph is a one-line change in `app.config.ts`; component code is identical.

```diff
- import { provideAgent } from '@threadplane/langgraph';
- providers: [provideAgent({ apiUrl: '...', assistantId: 'chat' })],
+ import { provideAgent } from '@threadplane/ag-ui';
+ providers: [provideAgent({ url: '...' })],
```

## Common pitfalls

- **Config key is `url`, not `apiUrl`.** `@threadplane/ag-ui`'s `provideAgent` takes `{ url }`. `apiUrl` is the LangGraph adapter's key — a different function in a different package.
- **Install `@ag-ui/client` and `@ag-ui/core`.** Both are required peers for the AG-UI transport.
- **Import `injectAgent`/`provideAgent` from `@threadplane/ag-ui`**, not from `@threadplane/chat`. Mixing adapter symbols across packages won't resolve.
- **Use `provideFakeAgent({ tokens: [...] })` for offline** — `provideFakeAgent({})` wires the transport but streams no reply. Don't point `url` at a server that isn't running while building UI.
