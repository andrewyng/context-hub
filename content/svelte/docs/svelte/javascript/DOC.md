---
name: svelte
description: "Svelte JavaScript package guide for building reactive UI with Svelte 5 components, runes, stores, and Vite"
metadata:
  languages: "javascript"
  versions: "5.53.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "svelte,javascript,ui,frontend,components,vite"
---

# Svelte JavaScript Package Guide

## Golden Rule

For new Svelte 5 code, use the rune-based APIs documented in the current Svelte docs: `$props()` for component inputs, `$state(...)` for mutable reactive state, `$derived(...)` for computed values, and `$effect(...)` for side effects. Mount client-rendered apps with `mount(...)`, and use `hydrate(...)` only when you are attaching to HTML that was already rendered on the server.

Svelte itself is the component compiler and runtime. It does not add routing, server rendering, or app conventions on its own. If you need those, use SvelteKit. If you only need a client-rendered app, pair `svelte` with Vite and `@sveltejs/vite-plugin-svelte`.

## Install

For a new browser app, the simplest starting point is the official Vite Svelte template:

```bash
npm create vite@latest my-app -- --template svelte
cd my-app
npm install
npm run dev
```

To add Svelte to an existing Vite project manually:

```bash
npm install -D svelte@5.53.10 vite @sveltejs/vite-plugin-svelte
```

Svelte has no package-specific authentication step and no required environment variables.

## Minimal Vite Setup

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
})
```

`svelte.config.js`:

```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
}
```

`src/main.js`:

```js
import { mount } from 'svelte'
import App from './App.svelte'
import './app.css'

mount(App, {
  target: document.getElementById('app'),
})
```

Typical app scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Core Component Pattern

`App.svelte`:

```svelte
<script>
  let count = $state(0)
  const doubled = $derived(count * 2)

  $effect(() => {
    console.log(`count changed to ${count}`)
  })

  function increment() {
    count += 1
  }
</script>

<main>
  <button onclick={increment}>Count: {count}</button>
  <p>Doubled: {doubled}</p>
</main>
```

This is the baseline Svelte 5 mental model:

- Put mutable component state in `$state(...)`
- Derive computed values with `$derived(...)`
- Put DOM or external side effects in `$effect(...)`
- Use normal JavaScript functions for event handlers and attach them with `onclick`, `oninput`, and similar attributes

## Props And Parent Callbacks

Use `$props()` in rune-based components instead of `export let`.

`src/lib/TodoItem.svelte`:

```svelte
<script>
  let { todo, onremove } = $props()
</script>

<li>
  <span>{todo.text}</span>
  <button onclick={() => onremove?.(todo.id)}>Remove</button>
</li>
```

`App.svelte`:

```svelte
<script>
  import TodoItem from './lib/TodoItem.svelte'

  let todos = $state([
    { id: 1, text: 'Ship docs' },
    { id: 2, text: 'Review UI' },
  ])

  function removeTodo(id) {
    todos = todos.filter(todo => todo.id !== id)
  }
</script>

<ul>
  {#each todos as todo (todo.id)}
    <TodoItem {todo} onremove={removeTodo} />
  {/each}
</ul>
```

In Svelte 5, parent-to-child communication is still props, and child-to-parent communication is usually a callback prop like `onremove` rather than `createEventDispatcher`.

## Form Binding And Conditional UI

Two-way bindings still use `bind:`.

```svelte
<script>
  let email = $state('')
  let subscribed = $state(false)
</script>

<label>
  Email
  <input type="email" bind:value={email} />
</label>

<label>
  <input type="checkbox" bind:checked={subscribed} />
  Subscribe to updates
</label>

{#if subscribed && email}
  <p>Saving newsletter preference for {email}</p>
{:else}
  <p>Enter an email and opt in to subscribe.</p>
{/if}
```

`bind:value`, `bind:checked`, `bind:files`, and the other `bind:` forms are the normal way to keep DOM state and component state in sync.

## Fetch Data In The Browser

Use `onMount(...)` for browser-only work such as `fetch`, `window`, or `localStorage` access.

```svelte
<script>
  import { onMount } from 'svelte'

  let users = $state([])
  let loading = $state(true)
  let error = $state('')

  onMount(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const response = await fetch('/api/users', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        users = await response.json()
      } catch (err) {
        if (err.name !== 'AbortError') {
          error = err.message
        }
      } finally {
        loading = false
      }
    }

    loadUsers()

    return () => controller.abort()
  })
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p>{error}</p>
{:else}
  <ul>
    {#each users as user (user.id)}
      <li>{user.name}</li>
    {/each}
  </ul>
{/if}
```

`onMount(...)` only runs in the browser. If the same component is rendered on the server, code inside `onMount(...)` is skipped there.

## Shared State With Stores

Rune state is the default inside components, but Svelte stores are still useful when state must live in a separate module or be shared across unrelated components.

`src/lib/theme.js`:

```js
import { writable } from 'svelte/store'

export const theme = writable('light')
```

`src/lib/ThemePicker.svelte`:

```svelte
<script>
  import { theme } from './theme.js'
</script>

<select bind:value={$theme}>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

<p>Current theme: {$theme}</p>
```

Inside a component, prefixing a store with `$` subscribes to it and gives you the current value. That auto-subscription syntax only works in Svelte component code, not in plain `.js` modules.

## Hydration For Server-Rendered HTML

Use `mount(...)` for a normal client-rendered app. Use `hydrate(...)` only if your page already contains HTML for the component tree and you want Svelte to attach event listeners and take over that markup.

```js
import { hydrate } from 'svelte'
import App from './App.svelte'

hydrate(App, {
  target: document.getElementById('app'),
})
```

If you call `hydrate(...)` on empty markup, or `mount(...)` on server-rendered markup you expected to preserve, the DOM work will not line up with your intent.

## Common Pitfalls

- In current Svelte 5 docs, event handlers are written as properties such as `onclick={...}` rather than the older `on:click={...}` directive style.
- In rune-based components, use `$props()` for inputs and callback props for parent notifications. Older patterns like `export let` and `createEventDispatcher` are compatibility patterns, not the preferred new style.
- Only values created with `$state(...)` are mutable reactive state. Plain local variables do not automatically become rune state.
- `onMount(...)` is browser-only. Do not read `window`, `document`, or `localStorage` at module evaluation time if the component can also render on the server.
- Store auto-subscriptions like `$theme` only work inside `.svelte` files.

## Version Notes For 5.53.10

This guide targets `svelte@5.53.10` and the Svelte 5 rune APIs. If you are maintaining older Svelte 4 code, you may still see legacy syntax in existing apps, but new Svelte 5 code should follow the rune-based patterns shown here.
