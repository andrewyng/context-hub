---
name: vue
description: "Vue 3 runtime for building reactive component UIs in JavaScript with the Composition API, single-file components, and app-level configuration."
metadata:
  languages: "javascript"
  versions: "3.5.30"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "vue,javascript,ui,components,reactivity,composition-api"
---

# Vue Guide (JavaScript)

## Golden Rule

Use `vue` for application creation, components, reactivity, lifecycle hooks, and app-level configuration.

Vue does not require API keys, auth configuration, or package-level environment variables. If your app uses environment variables, they come from your bundler or framework rather than from `vue` itself.

This guide assumes a modern ESM app. If you import `.vue` single-file components, your toolchain must compile them.

## Install

Install the runtime package:

```bash
npm install vue
```

For a typical browser app, mount Vue onto an existing DOM element and let your bundler load `src/main.js`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## Initialize an App

Create the app with `createApp(...)`, configure it, then call `mount(...)`.

```javascript
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.mount("#app");
```

```vue
<!-- src/App.vue -->
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <main>
    <h1>Hello, Vue</h1>
    <button type="button" @click="count += 1">
      Clicked {{ count }} times
    </button>
  </main>
</template>
```

If you need SSR hydration instead of a fresh client mount, create the app with `createSSRApp(...)` instead of `createApp(...)`.

## Common Workflows

### Manage local state with `ref()` and `reactive()`

Use `ref()` for primitive values and `reactive()` for object-shaped state.

```vue
<script setup>
import { reactive, ref } from "vue";

const isSaving = ref(false);

const form = reactive({
  email: "",
  marketing: false,
});

async function submit() {
  isSaving.value = true;

  try {
    console.log("Submitting", {
      email: form.email,
      marketing: form.marketing,
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <label>
      Email
      <input v-model="form.email" type="email" required />
    </label>

    <label>
      <input v-model="form.marketing" type="checkbox" />
      Receive product updates
    </label>

    <button type="submit" :disabled="isSaving">
      {{ isSaving ? "Saving..." : "Save preferences" }}
    </button>
  </form>
</template>
```

### Derive values with `computed()` and react to changes with `watch()`

Use `computed()` for derived state and `watch()` for side effects triggered by a specific source.

```vue
<script setup>
import { computed, reactive, watch } from "vue";

const filters = reactive({
  query: "",
  inStockOnly: false,
});

const normalizedQuery = computed(() => filters.query.trim().toLowerCase());

watch(
  () => filters.query,
  (query, previousQuery) => {
    console.log("Search changed", {
      previousQuery,
      query,
    });
  },
);
</script>

<template>
  <section>
    <input
      v-model="filters.query"
      type="search"
      placeholder="Search products"
    />

    <label>
      <input v-model="filters.inStockOnly" type="checkbox" />
      In stock only
    </label>

    <p>Normalized query: {{ normalizedQuery || "all products" }}</p>
  </section>
</template>
```

### Accept props and emit events in `<script setup>`

Use `defineProps()` to declare the public input contract and `defineEmits()` to publish events upward.

```vue
<!-- components/SubmitButton.vue -->
<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["submit"]);

function handleClick() {
  emit("submit");
}
</script>

<template>
  <button type="button" :disabled="props.disabled" @click="handleClick">
    {{ props.label }}
  </button>
</template>
```

```vue
<!-- Parent component -->
<script setup>
import SubmitButton from "./components/SubmitButton.vue";

function save() {
  console.log("Save requested");
}
</script>

<template>
  <SubmitButton label="Save" @submit="save" />
</template>
```

### Share app-level values with `provide()` and `inject()`

Provide a value near the top of the tree and read it in descendants without prop drilling.

```javascript
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.provide("apiBaseUrl", "/api");
app.mount("#app");
```

```vue
<!-- components/ApiBanner.vue -->
<script setup>
import { inject } from "vue";

const apiBaseUrl = inject("apiBaseUrl");

if (!apiBaseUrl) {
  throw new Error("Missing apiBaseUrl provider");
}
</script>

<template>
  <p>Sending requests to {{ apiBaseUrl }}</p>
</template>
```

### Access DOM elements with template refs

In Vue 3.5, `useTemplateRef()` provides a concise way to read a template ref from `<script setup>`.

```vue
<script setup>
import { onMounted, useTemplateRef } from "vue";

const searchInput = useTemplateRef("searchInput");

onMounted(() => {
  searchInput.value?.focus();
});
</script>

<template>
  <input ref="searchInput" type="search" placeholder="Search" />
</template>
```

## Important Pitfalls

- `ref` values use `.value` in JavaScript. Inside templates, Vue automatically unwraps them.
- When you watch part of a reactive object, pass a getter such as `() => filters.query` instead of the raw property value.
- Call `app.use()`, `app.component()`, `app.directive()`, and `app.provide()` before `app.mount()`.
- `defineProps()` and `defineEmits()` are compiler macros for `<script setup>`. Do not import them from `vue`.
- Lifecycle hooks such as `onMounted()` must run synchronously during `setup()` or `<script setup>`.
- The `vue` package exposes the runtime APIs, but `.vue` single-file components still need compiler support from your toolchain.

## Version-Sensitive Notes

- This guide targets `vue==3.5.30`.
- `useTemplateRef()` is part of the Vue 3.5 API. Older Vue 3 code often uses `const el = ref(null)` for the same job.
- Use `createSSRApp()` rather than `createApp()` when hydrating HTML that was rendered on the server.

## Official Sources

- Vue package page: https://www.npmjs.com/package/vue
- Vue API index: https://vuejs.org/api/
- Quick Start: https://vuejs.org/guide/quick-start.html
- Application API: https://vuejs.org/api/application.html
- Reactivity Core API: https://vuejs.org/api/reactivity-core.html
- Lifecycle Hooks API: https://vuejs.org/api/composition-api-lifecycle.html
- Dependency Injection API: https://vuejs.org/api/composition-api-dependency-injection.html
- `<script setup>` macros: https://vuejs.org/api/sfc-script-setup.html
- Template refs guide: https://vuejs.org/guide/essentials/template-refs.html
