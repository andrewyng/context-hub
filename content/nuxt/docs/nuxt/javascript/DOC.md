---
name: nuxt
description: "Nuxt framework for building Vue applications with file-based routing, server routes, runtime config, plugins, and production build commands"
metadata:
  languages: "javascript"
  versions: "4.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "nuxt,vue,ssr,ssg,nitro,meta-framework"
---

# Nuxt for JavaScript

Use `nuxt` when you need the framework package itself: project scaffolding, app configuration, file-based pages, server routes, plugins, runtime config, and build/dev commands.

## Install and start a project

Create a new Nuxt app with the official initializer:

```bash
npx nuxi@latest init my-app
cd my-app
npm install
npm run dev
```

For an existing Vue project, install the framework package and the Vue runtime packages it depends on:

```bash
npm install nuxt vue vue-router
```

Minimal `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "generate": "nuxt generate"
  }
}
```

## Minimal project setup

`nuxt.config.js` is the main entry point for framework configuration.

```js
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api"
    }
  }
})
```

Example `.env`:

```env
NUXT_API_SECRET=replace-me
NUXT_PUBLIC_API_BASE=/api
```

Important runtime config rule:

- Top-level keys such as `apiSecret` are server-only.
- Keys under `runtimeConfig.public` are exposed to both server and browser code.

## Create pages and fetch data

Nuxt turns files in `pages/` into routes automatically.

`pages/index.vue`

```vue
<script setup>
const { data, pending, error, refresh } = await useFetch("/hello", {
  baseURL: useRuntimeConfig().public.apiBase
})
</script>

<template>
  <main>
    <h1>Nuxt app</h1>

    <p v-if="pending">Loading…</p>
    <p v-else-if="error">{{ error.message }}</p>
    <pre v-else>{{ data }}</pre>

    <button type="button" @click="refresh()">Refresh</button>
  </main>
</template>
```

Use `useFetch()` in pages, components, and composables when you want Nuxt-aware data fetching that works with server rendering.

## Add a server API route

Files in `server/api/` become server endpoints under `/api`.

`server/api/hello.get.js`

```js
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return {
    message: "Hello from the server",
    apiBase: config.public.apiBase,
    hasSecret: Boolean(config.apiSecret)
  }
})
```

The page example above calls this route through the public `apiBase` value.

## Initialize a reusable API client in a plugin

Use a Nuxt plugin when you want one configured client instance available across the app.

`plugins/api.js`

```js
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      accept: "application/json"
    }
  })

  return {
    provide: {
      api
    }
  }
})
```

Use the injected client from components, pages, or composables:

```vue
<script setup>
const { $api } = useNuxtApp()
const profile = await $api("/hello")
</script>

<template>
  <pre>{{ profile }}</pre>
</template>
```

## Route middleware

Use named middleware in `middleware/` to guard pages.

`middleware/auth.js`

```js
export default defineNuxtRouteMiddleware(() => {
  const loggedIn = useState("logged-in", () => false)

  if (!loggedIn.value) {
    return navigateTo("/login")
  }
})
```

Apply it in a page:

`pages/account.vue`

```vue
<script setup>
definePageMeta({
  middleware: "auth"
})
</script>

<template>
  <div>Private account page</div>
</template>
```

## Common commands

```bash
# Start the development server
npm run dev

# Build the production server bundle
npm run build

# Preview the production build locally
npm run preview

# Generate a static site when your app is configured for prerender/static output
npm run generate
```

## Common pitfalls

- Do not put secrets in `runtimeConfig.public`; everything there is available to client-side code.
- Use `useFetch()` inside Nuxt app code where composables are allowed; use `$fetch()` for imperative requests in plugins, route handlers, or utilities.
- Keep server endpoints in `server/api/`; client code should call them with relative `/api/...` paths or a public runtime-config base URL.
- Call Nuxt composables such as `useRuntimeConfig()`, `useFetch()`, and `useState()` inside Nuxt setup/context, not at module top level.
- Register shared clients and cross-cutting setup in `plugins/` instead of recreating them in each page.

## Useful links

- `https://nuxt.com/docs/getting-started/installation`
- `https://nuxt.com/docs/api/commands/init`
- `https://nuxt.com/docs/api/commands/dev`
- `https://nuxt.com/docs/api/commands/build`
- `https://nuxt.com/docs/api/commands/preview`
- `https://nuxt.com/docs/api/commands/generate`
- `https://nuxt.com/docs/api/utils/define-nuxt-config`
- `https://nuxt.com/docs/guide/going-further/runtime-config`
- `https://nuxt.com/docs/api/composables/use-fetch`
- `https://nuxt.com/docs/guide/directory-structure/server`
- `https://nuxt.com/docs/guide/directory-structure/plugins`
- `https://nuxt.com/docs/guide/directory-structure/middleware`
