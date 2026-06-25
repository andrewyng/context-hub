---
name: langgraph
description: "LangGraph backend adapter for Angular AI chat — provideAgent({apiUrl,assistantId}) + injectAgent() expose signal-based messages/isLoading/error/submit for @threadplane/chat. Use when wiring an Angular chat UI to a LangGraph server."
metadata:
  languages: "typescript"
  versions: "0.0.53"
  revision: 1
  updated-on: "2026-06-24"
  source: official
  tags: "angular,typescript,langgraph,agent,streaming,chat,adapter,signals,threadplane"
---

# @threadplane/langgraph for Angular

`@threadplane/langgraph` connects an Angular app to a LangGraph server (LangGraph Platform or a local `langgraph dev`) and exposes it as the runtime-neutral `Agent` contract. `injectAgent()` returns a ref whose every property is an Angular Signal, so you can render with `<chat [agent]>` or hand-roll your own template.

Requires Angular 20+ and Node 18+.

## Install

```bash
npm install @threadplane/langgraph
```

Add `@threadplane/chat` too if you want the drop-in `<chat>` UI.

## Configure the provider

```typescript
// app.config.ts
import { ApplicationConfig, signal } from '@angular/core';
import { provideAgent } from '@threadplane/langgraph';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgent({
      apiUrl: 'http://localhost:2024',
      assistantId: 'chat',        // maps to a key in your langgraph.json "graphs"
      threadId: signal(null),     // optional — set to persist a thread across reloads
    }),
  ],
};
```

`apiUrl` is optional (the SDK falls back to a default base URL) but you will usually set it. `assistantId` is required at runtime and must match a key in your `langgraph.json` `"graphs"`. `threadId` accepts a Signal, a plain string, or `null`.

## Use the agent

`injectAgent()` returns the singleton wired above. Every property is a Signal — call it.

```typescript
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { injectAgent } from '@threadplane/langgraph';

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  protected readonly chat = injectAgent();
  input = signal('');
  isStreaming = computed(() => this.chat.isLoading());

  send() {
    const msg = this.input();
    if (!msg.trim()) return;
    this.chat.submit({ message: msg });
    this.input.set('');
  }
}
```

```html
<!-- chat.component.html -->
@for (msg of chat.messages(); track $index) {
  <div [class]="msg.role">{{ msg.content }}</div>
}
@if (chat.error(); as err) { <div class="error">{{ err.message }}</div> }
<form (submit)="send(); $event.preventDefault()">
  <input [ngModel]="input()" (ngModelChange)="input.set($event)" />
  <button type="submit" [disabled]="isStreaming()">Send</button>
</form>
```

Prefer the drop-in UI? Skip the hand-rolled template and bind the same agent to `<chat [agent]="injectAgent()" />` from `@threadplane/chat`.

The agent ref exposes more than the basics above: `stop()`, `retry()`, `regenerate(index)`, an `interrupt` signal (resume with `submit({ resume })` or `submit(null)`), `switchThread(id)`, and a structured `error()` of type `AgentError` with `.kind` and `.retryable`. `submit()` accepts a message as `string | ContentBlock[]` plus optional `resume`/`state` and a second options argument. Because a message's `content` can be a `ContentBlock[]`, the plain-text template above is illustrative — `<chat [agent]>` renders every content shape for you.

## Start the backend

```bash
langgraph dev   # serves on http://localhost:2024
```

## Common pitfalls

- **Config keys are `apiUrl` + `assistantId`** — not `url`. (`url` is the AG-UI adapter's key, a different package.)
- **`assistantId` must match a key in `langgraph.json` "graphs".** A mismatch yields an empty or erroring stream.
- **Agent ref properties are Signals — call them.** Use `chat.messages()`, `chat.isLoading()`, `chat.error()`, not `chat.messages`.
- **`threadId` accepts a Signal, string, or `null`.** Omit it for the minimal path; pass `signal(...)` to persist a thread across reloads.
