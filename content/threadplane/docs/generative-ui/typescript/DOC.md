---
name: generative-ui
description: "Agent-generated UI in Angular — render structured json-render specs with <render-spec> from @threadplane/render, or stream agent-built A2UI surfaces through <chat [views]>. Use when an AI agent should produce real Angular UI (cards, forms, dashboards) instead of plain text."
metadata:
  languages: "typescript"
  versions: "0.0.53"
  revision: 1
  updated-on: "2026-06-24"
  source: official
  tags: "angular,typescript,generative-ui,json-render,a2ui,render,agent,threadplane"
---

# Generative UI in Angular (@threadplane/render + A2UI)

Threadplane renders agent-produced UI two ways. Pick by contract shape:

- **json-render** (`@threadplane/render`) — a fixed JSON spec becomes an Angular component tree. Best when the app owns the schema and you can validate the whole UI before showing it (cards, forms, dashboards, structured results).
- **A2UI** (`@threadplane/a2ui`, rendered through `@threadplane/chat`) — an agent-owned protocol for surfaces that update over time and send structured actions back. Best for live conversational UI with partial or streaming data.

Both resolve element/component **type names through a registry that acts as an allowlist** — an unregistered name falls back instead of executing. Requires Angular 20+.

## json-render: render a spec

```bash
npm install @threadplane/render
```

A registered component receives its resolved props plus a standard input contract — `spec`, `childKeys`, and (optionally) an `emit` function to dispatch actions to `[handlers]`:

```typescript
// text.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { Spec } from '@json-render/core';

@Component({
  selector: 'app-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ label() }}</p>`,
})
export class TextComponent {
  readonly label = input<string>('');       // a resolved prop from the spec
  readonly childKeys = input<string[]>([]);  // standard: keys of child elements
  readonly spec = input.required<Spec>();    // standard: this element's spec node
}
```

Map type names to components with `defineAngularRegistry()`, then render a spec with `<render-spec>`:

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RenderSpecComponent, defineAngularRegistry, signalStateStore } from '@threadplane/render';
import type { Spec } from '@json-render/core';
import { TextComponent } from './text.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RenderSpecComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<render-spec [spec]="spec" [registry]="registry" [store]="store" />`,
})
export class AppComponent {
  registry = defineAngularRegistry({ Text: TextComponent });
  store = signalStateStore({ name: 'World' });

  spec: Spec = {
    root: 'greeting',
    elements: {
      greeting: { type: 'Text', props: { label: { $state: '/name' } } },
    },
  };
}
```

A spec is a flat `elements` map plus a `root` key. A prop with a `{ $state: '/path' }` expression reads reactively from the store; `store.set('/name', 'Angular')` updates the rendered tree. You can also embed initial state in `spec.state` and omit `[store]` — `<render-spec>` creates an internal store for you.

## A2UI: agent-built surfaces in chat

A2UI surfaces arrive in the chat stream. Provide a catalog via `<chat [views]>`. `a2uiBasicCatalog()` ships 18 built-in components — `Text`, `Button`, `Card`, `Column`, `Row`, `Divider`, `Icon`, `Image`, `List`, `Modal`, `Tabs`, `TextField`, `CheckBox`, `MultipleChoice`, `Slider`, `DateTimeInput`, `AudioPlayer`, and `Video`:

```typescript
import { a2uiBasicCatalog } from '@threadplane/chat';
// ...
catalog = a2uiBasicCatalog();
```

```html
<chat [agent]="agent" [views]="catalog" [handlers]="handlers" />
```

`<chat>` classifies each assistant message as it streams: plain text → markdown; content whose first non-whitespace char is `{` → json-render; content starting with `---a2ui_JSON---` → A2UI. Both paths use the same `views` catalog.

## Registry builders: `views()` vs `defineAngularRegistry()`

There are two builders, and they are not interchangeable:

- **`defineAngularRegistry({...})`** → an `AngularRegistry` consumed directly by `<render-spec>`.
- **`views({...})`** (from `@threadplane/render`) → a `ViewRegistry`, the shape `<chat [views]>` consumes. `toRenderRegistry()` converts a `ViewRegistry` into an `AngularRegistry` so one component map serves both. Compose registries with `withViews()`.

Use `defineAngularRegistry()` when you drive `<render-spec>` yourself; use `views()` when wiring components into chat.

A registry value can be a bare component class or an object — `{ component, fallback?, schema? }`. `fallback` renders while bound data is still streaming in, and `schema` gates when a component is considered ready. These make streaming, agent-built UI safe to mount incrementally.

## Common pitfalls

- **The registry is the allowlist.** If the agent emits a type the registry doesn't contain, the renderer falls back — it never executes unknown UI. Don't register components you don't want the model able to mount.
- **Two registry builders.** `<render-spec>` needs `defineAngularRegistry()` (`AngularRegistry`); `<chat [views]>` needs `views()` (`ViewRegistry`). Convert with `toRenderRegistry()`; don't pass one where the other is expected.
- **`Spec` is imported from `@json-render/core`**, not `@threadplane/render`.
- **Path selection is by content prefix** (`{` vs `---a2ui_JSON---`); your agent must emit the shape that matches the path you want.
- **A2UI is for streaming, updating surfaces; json-render is one-spec-one-tree.** Don't reach for A2UI when a fixed, validated spec is enough.
