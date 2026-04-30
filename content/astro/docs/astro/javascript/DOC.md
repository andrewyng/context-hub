---
name: astro
description: "Astro 6 guide for building fast, content-focused websites with islands architecture, file-based routing, content collections, and zero client JS by default"
metadata:
  languages: "javascript"
  versions: "6.0.7"
  revision: 1
  updated-on: "2026-03-20"
  source: community
  tags: "astro,javascript,ssg,ssr,islands,content,vite"
---

# Astro Guide (JavaScript)

## Golden Rule

Astro is server-first. Components render to HTML at build time (or on the server) with zero client JavaScript by default. Only add interactivity where needed using `client:*` directives on framework components (React, Vue, Svelte, etc.). This is the islands architecture.

Astro has no API key or client SDK initialization. Setup is package installation, file conventions, and `astro.config.mjs`.

## Install

Create a new project with the official CLI:

```bash
npm create astro@latest my-site
cd my-site
npm run dev
```

To add Astro to an existing project:

```bash
npm install astro@6.0.7
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

## Project Structure

```text
src/
  pages/          # File-based routing (*.astro, *.md, *.mdx)
  layouts/        # Reusable page layouts
  components/     # UI components (.astro, .jsx, .vue, .svelte)
  content/        # Content collections (Markdown, MDX, JSON, YAML)
  styles/         # Global stylesheets
public/           # Static assets (served as-is)
astro.config.mjs  # Astro configuration
```

## Astro Components

Astro components (`.astro` files) have two parts separated by `---` fences: a frontmatter script (runs at build/server time) and an HTML template.

`src/components/Greeting.astro`:

```astro
---
const { name } = Astro.props;
---

<h1>Hello, {name}!</h1>

<style>
  h1 {
    color: navy;
  }
</style>
```

Use it in another component or page:

```astro
---
import Greeting from '../components/Greeting.astro';
---

<Greeting name="World" />
```

Styles in `<style>` tags are scoped to the component by default.

## Layouts

Layouts are Astro components that wrap page content via a `<slot />`.

`src/layouts/Base.astro`:

```astro
---
const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body>
    <nav>My Site</nav>
    <main>
      <slot />
    </main>
  </body>
</html>
```

Use it in a page:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="Home">
  <h1>Welcome</h1>
  <p>This is the home page.</p>
</Base>
```

## File-Based Routing

Files in `src/pages/` become routes. The file extension is stripped.

```text
src/pages/index.astro       -> /
src/pages/about.astro       -> /about
src/pages/blog/index.astro  -> /blog
src/pages/blog/[slug].astro -> /blog/:slug (dynamic)
src/pages/[...slug].astro   -> catch-all route
```

### Dynamic Routes

For static builds, dynamic routes must export `getStaticPaths()`.

`src/pages/blog/[slug].astro`:

```astro
---
export function getStaticPaths() {
  return [
    { params: { slug: 'first-post' }, props: { title: 'First Post' } },
    { params: { slug: 'second-post' }, props: { title: 'Second Post' } },
  ];
}

const { title } = Astro.props;
---

<h1>{title}</h1>
```

In SSR mode (`output: 'server'`), `getStaticPaths()` is not needed. Read params directly:

```astro
---
const { slug } = Astro.params;
---

<h1>Post: {slug}</h1>
```

## Content Collections

Content collections organize Markdown, MDX, JSON, or YAML files in `src/content/` with type-safe schemas.

### Define a Collection

`src/content.config.js`:

```js
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

Place Markdown files in `src/content/blog/`:

```text
src/content/blog/
  first-post.md
  second-post.md
```

Each file needs frontmatter matching the schema:

```markdown
---
title: First Post
date: 2026-03-20
---

Post content here.
```

### Query Collections

```astro
---
import { getCollection, getEntry, render } from 'astro:content';

// Get all non-draft posts
const posts = await getCollection('blog', ({ data }) => !data.draft);

// Get a single entry
const post = await getEntry('blog', 'first-post');

// Render content to HTML
const { Content } = await render(post);
---

<ul>
  {posts.map((p) => <li><a href={`/blog/${p.id}`}>{p.data.title}</a></li>)}
</ul>

<!-- Render a single post -->
<Content />
```

## Islands Architecture

Astro components render to static HTML. To add interactivity, use framework components (React, Vue, Svelte) with `client:*` directives.

### Client Directives

| Directive | Behavior |
|-----------|----------|
| `client:load` | Hydrate immediately on page load |
| `client:idle` | Hydrate once the browser is idle |
| `client:visible` | Hydrate when the component scrolls into view |
| `client:media="(query)"` | Hydrate when a CSS media query matches |
| `client:only="react"` | Render only on the client (skip server HTML) |

Without a `client:*` directive, a framework component renders to static HTML with no JavaScript.

### Example

```astro
---
import Counter from '../components/Counter.jsx';
import HeavyChart from '../components/HeavyChart.jsx';
---

<!-- Interactive immediately -->
<Counter client:load />

<!-- Interactive only when scrolled into view -->
<HeavyChart client:visible />

<!-- Static HTML, no JS shipped -->
<Counter />
```

## Framework Integrations

Add framework support with `astro add`:

```bash
npx astro add react
npx astro add vue
npx astro add svelte
npx astro add tailwind
```

This installs the package and updates `astro.config.mjs` automatically.

Manual configuration in `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

Then use `.jsx`/`.tsx` components in Astro pages with `client:*` directives for interactivity.

## Styling

### Scoped Styles

`<style>` in `.astro` files is scoped to that component:

```astro
<p>Styled text</p>

<style>
  p { color: blue; }
</style>
```

### Global Styles

Import a global stylesheet in a layout:

```astro
---
import '../styles/global.css';
---
```

Or use `is:global` to opt out of scoping:

```astro
<style is:global>
  body { margin: 0; }
</style>
```

## Data Fetching

Use standard `fetch` or any Node API in component frontmatter. It runs at build time (static) or request time (SSR).

```astro
---
const response = await fetch('https://api.example.com/posts');
const posts = await response.json();
---

<ul>
  {posts.map((post) => <li>{post.title}</li>)}
</ul>
```

## Output Modes

Configure in `astro.config.mjs`:

| Mode | Behavior |
|------|----------|
| `'static'` (default) | Pre-renders all pages at build time |
| `'server'` | Server-renders all pages on demand |

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
```

To pre-render specific pages in server mode, add to the page frontmatter:

```astro
---
export const prerender = true;
---
```

SSR requires an adapter. Install one for your deployment target:

```bash
npx astro add node
npx astro add vercel
npx astro add cloudflare
npx astro add netlify
```

## Environment Variables

Use `import.meta.env` in frontmatter and client code.

`.env`:

```dotenv
DATABASE_URL=postgres://user:pass@localhost:5432/db
PUBLIC_SITE_URL=https://example.com
```

- `PUBLIC_` prefixed variables are available in client-side code
- All other variables are server-only (frontmatter, endpoints, middleware)

```astro
---
const dbUrl = import.meta.env.DATABASE_URL;
---

<p>Site: {import.meta.env.PUBLIC_SITE_URL}</p>
```

## API Endpoints

Create JSON endpoints with `.js` or `.ts` files in `src/pages/`.

`src/pages/api/posts.js`:

```js
export async function GET() {
  const posts = [{ id: 1, title: 'Hello' }];
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }) {
  const body = await request.json();
  return new Response(JSON.stringify({ received: body }), { status: 201 });
}
```

In static mode, endpoints run at build time and produce static files. In server mode, they run on each request.

## Configuration

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Key options:

| Option | Purpose |
|--------|---------|
| `site` | Full URL for sitemap and canonical URLs |
| `output` | `'static'` (default) or `'server'` |
| `adapter` | Server adapter for SSR deployments |
| `integrations` | Framework and tool integrations |
| `vite` | Pass-through Vite configuration |

## Build And Deploy

```bash
# Production build
npm run build

# Preview the build locally
npm run preview
```

Static builds output to `dist/`. Deploy to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

For SSR builds, use the appropriate adapter and follow its deployment guide.

## Common Pitfalls

- Do not add `client:*` directives to `.astro` components. They only work on framework components (React, Vue, Svelte, etc.).
- Do not forget `getStaticPaths()` for dynamic routes in static mode. The build will fail without it.
- Do not expose secrets with the `PUBLIC_` prefix. Only values safe for browsers should use it.
- Do not import server-only modules in client-hydrated components. The bundler will try to include them in the client bundle.
- Content collection files must have frontmatter matching the schema, or the build will throw validation errors.

## Version-Sensitive Notes

- This guide targets `astro@6.0.7`.
- Astro 5+ moved content collection config from `src/content/config.ts` to `src/content.config.js` (project root level for content layer).
- Astro 5+ uses `render()` from `astro:content` instead of calling `.render()` on entries.
- `hybrid` output mode was removed in Astro 5. Use `output: 'server'` with `export const prerender = true` on individual pages instead.

## Official Sources

- https://docs.astro.build/en/getting-started/
- https://docs.astro.build/en/basics/project-structure/
- https://docs.astro.build/en/basics/astro-components/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/styling/
- https://docs.astro.build/en/guides/environment-variables/
- https://docs.astro.build/en/guides/endpoints/
- https://docs.astro.build/en/guides/on-demand-rendering/
- https://docs.astro.build/en/reference/configuration-reference/
- https://www.npmjs.com/package/astro
