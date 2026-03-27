---
name: next
description: "Next.js 16 JavaScript guide for App Router apps, including installation, project structure, client components, route handlers, environment variables, images, and production builds"
metadata:
  languages: "javascript"
  versions: "16.1.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "next,nextjs,javascript,react,app-router,ssr"
---

# Next.js JavaScript Guide

## Golden Rule

For new work in `next@16.1.6`, use the App Router:

- put routes under `app/`
- treat components as Server Components by default
- add `'use client'` only in files that need browser APIs, state, effects, or event handlers
- put backend HTTP endpoints in `app/api/**/route.js`

Next.js itself has no API key or client SDK initialization step. Setup is mainly package installation, file conventions, environment variables, and `next.config.*`.

## Install

For a new JavaScript app, the official starter flow is `create-next-app`:

```bash
npx create-next-app@latest my-app --js --app
cd my-app
npm run dev
```

To add Next.js to an existing project, install the framework with React:

```bash
npm install next@16.1.6 react react-dom
```

Add the standard scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

## Minimal App Router Setup

The smallest useful App Router app needs a root layout and a page.

```text
app/
  layout.js
  page.js
```

`app/layout.js`:

```js
export const metadata = {
  title: "My App",
  description: "Next.js app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.js`:

```js
export default function HomePage() {
  return <main>Hello from Next.js</main>;
}
```

Run the app locally:

```bash
npm run dev
```

## Server Components And Client Components

Files in `app/` are Server Components by default. Use this for data fetching, server-only code, and secrets.

When a component needs interactivity, mark that file with `'use client'`.

`app/components/counter.js`:

```js
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Count: {count}
    </button>
  );
}
```

`app/page.js`:

```js
import Counter from './components/counter';

export default function HomePage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Counter />
    </main>
  );
}
```

Use `'use client'` only where needed. Adding it too high in the tree turns more of your component graph into client-side code than necessary.

## Environment Variables

Put local secrets in `.env.local`.

```dotenv
DATABASE_URL=postgres://user:pass@localhost:5432/appdb
INTERNAL_API_KEY=super-secret
NEXT_PUBLIC_APP_NAME=My App
```

Access server-only variables in Server Components, Route Handlers, and other server code:

```js
export default function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return (
    <main>
      <h1>{appName}</h1>
      <p>Database configured: {String(hasDatabase)}</p>
    </main>
  );
}
```

Important rule:

- only variables prefixed with `NEXT_PUBLIC_` are exposed to browser-side code
- keep secrets such as database credentials, private tokens, and signing keys unprefixed so they stay server-only

## Route Handlers

Use Route Handlers under `app/api/**/route.js` for JSON endpoints and webhooks.

`app/api/posts/route.js`:

```js
const posts = [
  { id: 1, title: 'Hello' },
  { id: 2, title: 'World' },
];

export async function GET() {
  return Response.json(posts);
}

export async function POST(request) {
  const body = await request.json();

  const post = {
    id: posts.length + 1,
    title: body.title,
  };

  posts.push(post);

  return Response.json(post, { status: 201 });
}
```

Example requests while the dev server is running:

```bash
curl http://localhost:3000/api/posts

curl -X POST http://localhost:3000/api/posts \
  -H "content-type: application/json" \
  -d '{"title":"New post"}'
```

For external APIs that can be cached and revalidated, use Next's fetch options:

```js
export default async function BlogPage() {
  const response = await fetch('https://example.com/api/posts', {
    next: { revalidate: 60 },
  });

  const posts = await response.json();

  return <pre>{JSON.stringify(posts, null, 2)}</pre>;
}
```

## Metadata

Use the Metadata API instead of manually editing `<head>` inside page components.

Static metadata in a page or layout:

```js
export const metadata = {
  title: 'Settings',
  description: 'Account settings page',
};

export default function SettingsPage() {
  return <main>Settings</main>;
}
```

## Images

Use `next/image` for optimized images. If you load remote images, allow their hosts in `next.config.mjs`.

`next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },
};

export default nextConfig;
```

Component usage:

```js
import Image from 'next/image';

export default function Avatar() {
  return (
    <Image
      src="https://images.example.com/avatar.png"
      alt="User avatar"
      width={128}
      height={128}
    />
  );
}
```

If you forget to configure the remote host, remote image rendering fails at runtime.

## Production Build And Standalone Output

Create a production build:

```bash
npm run build
npm run start
```

For container-style deployments, Next supports standalone output:

`next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

Build after enabling it:

```bash
npm run build
```

## Common Pitfalls

- Do not add `'use client'` to a page or layout unless the file really needs client-side React features.
- Do not expose secrets with the `NEXT_PUBLIC_` prefix. That prefix is specifically for values that are safe in browser bundles.
- Put HTTP handlers in `app/api/**/route.js`, not in arbitrary server files, if you want them to be routable endpoints.
- Use `next/image` with `images.remotePatterns` for remote hosts instead of raw `<img>` tags when you want Next image optimization.
- Keep `app/layout.js` present. The App Router requires a root layout.

## Version-Sensitive Notes

- This guide targets `next@16.1.6`.
- The examples here use the App Router and file conventions from the current official Next.js docs.
- If you maintain an older Pages Router app under `pages/`, follow that router's conventions consistently instead of mixing patterns across routers.

## Official Sources

- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/api-reference/directives/use-client
- https://nextjs.org/docs/app/guides/environment-variables
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/components/image
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://nextjs.org/docs/app/building-your-application/data-fetching
- https://www.npmjs.com/package/next
