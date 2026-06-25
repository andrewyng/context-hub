---
name: chat
description: "Drop-in streaming chat UI for Angular AI agents — render <chat [agent]> from @threadplane/chat against an AG-UI or LangGraph backend, or any Agent contract. Use when adding an agent chat interface to an Angular app."
metadata:
  languages: "typescript"
  versions: "0.0.53"
  revision: 1
  updated-on: "2026-06-24"
  source: official
  tags: "angular,typescript,chat,streaming,agent,ui,generative-ui,langgraph,ag-ui,threadplane"
---

# @threadplane/chat for Angular

`@threadplane/chat` is a production chat UI for Angular AI agents: streaming messages, tool calls, errors, interrupts, threads, and generative UI. You bind one component, `<chat [agent]>`, to an `Agent` — a runtime-neutral contract implemented by the AG-UI and LangGraph adapters (or `mockAgent()` for offline work). The UI never learns which backend it talks to.

Requires Angular 20+.

## Install

```bash
npm install @threadplane/chat marked
```

`marked` renders markdown in assistant messages. To talk to a real backend, also install an adapter — `@threadplane/ag-ui` (recommended default) or `@threadplane/langgraph`. Fetch their docs with `chub get threadplane/ag-ui` or `chub get threadplane/langgraph`.

## Render a chat (no backend)

`mockAgent()` implements the same `Agent` contract with canned messages, so the UI renders exactly as it will against a real agent. Use it to build UI before a backend exists.

```typescript
// chat-page.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatComponent, mockAgent } from '@threadplane/chat';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div style="height: 100vh"><chat [agent]="agent" /></div>`,
})
export class ChatPageComponent {
  protected readonly agent = mockAgent({
    messages: [
      { id: 'm1', role: 'user', content: 'Hello' },
      { id: 'm2', role: 'assistant', content: 'Hi — I am a mock agent.' },
    ],
  });
}
```

The chat ships its own design tokens and component-scoped styles — no Tailwind, PostCSS, or global stylesheet import needed.

## Configure providers (real backend)

`provideChat()` sets chat-wide options such as the assistant's display name. The adapter provides the agent. This example uses AG-UI (the default adapter):

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideChat } from '@threadplane/chat';
import { provideAgent } from '@threadplane/ag-ui'; // or @threadplane/langgraph

export const appConfig: ApplicationConfig = {
  providers: [
    provideChat({ assistantName: 'Assistant' }),
    provideAgent({ url: 'http://localhost:3000/agent' }), // AG-UI
  ],
};
```

Then inject the agent in the component with the **adapter's** `injectAgent()` and bind it:

```typescript
import { injectAgent } from '@threadplane/ag-ui'; // import from the package you provided
// ...
protected readonly agent = injectAgent();
// template: <chat [agent]="agent" />
```

Wire a real backend with one of the adapters:
- AG-UI (recommended default): `chub get threadplane/ag-ui`
- LangGraph: `chub get threadplane/langgraph`

## Generative UI

`<chat>` can render agent-produced UI, not just text. Pass a `views` catalog (and optional `handlers`); chat detects json-render specs and A2UI surfaces in the stream and renders them through your registered components.

```html
<chat [agent]="agent" [views]="catalog" [handlers]="handlers" />
```

See `chub get threadplane/generative-ui` for the json-render and A2UI paths.

## Do I need a license?

Evaluating costs nothing — the chat runs without a license token, emitting a single advisory `console.warn` (it never blocks rendering). For commercial use, pass your license token to `provideChat()`:

```typescript
provideChat({ assistantName: 'Assistant', license: 'YOUR_LICENSE_TOKEN' });
```

The token is verified at runtime against a public key compiled into the build. `@threadplane/chat` is the one commercially-licensed package; the rest of the framework is MIT.

## Common pitfalls

- **`injectAgent()` and `provideAgent()` come from the ADAPTER, not from `@threadplane/chat`.** Import them from `@threadplane/ag-ui` or `@threadplane/langgraph` — whichever you provided. `@threadplane/chat` itself exports `provideChat()` and `mockAgent()`.
- **Forgetting `marked`.** Assistant markdown won't render without it.
- **Wrong adapter config key.** AG-UI uses `provideAgent({ url })`; LangGraph uses `provideAgent({ apiUrl, assistantId })`. They are different functions from different packages — see the adapter docs.
- **The component selector is `<chat>`; the class is `ChatComponent`.** Add `ChatComponent` to `imports`.
