---
name: tailwindcss
description: "Tailwind CSS v4 utility framework for styling JavaScript applications with official Vite or PostCSS integrations"
metadata:
  languages: "javascript"
  versions: "4.3.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "tailwindcss,css,postcss,vite,javascript,npm"
---

# tailwindcss JavaScript Guide

## Golden Rule

Install `tailwindcss` together with the integration package for your build tool.

- Use `@tailwindcss/vite` with Vite.
- Use `@tailwindcss/postcss` with PostCSS.
- Do not configure `tailwindcss` itself as a PostCSS plugin in v4.

Tailwind CSS v4 is **CSS-first**: configuration lives inside your CSS via `@theme`, and there is no `tailwind.config.js` file by default. The old JavaScript config is supported only for legacy migrations through the `@config` directive.

Tailwind CSS is a build-time dependency. There are no API keys, accounts, authentication steps, or application runtime environment variables to configure. The only environment-sensitive behavior in the official integrations is CSS optimization: the Vite and PostCSS plugins check `NODE_ENV` to decide whether Lightning CSS optimization should run by default.

## Install with Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

Your main stylesheet only needs the Tailwind import:

`src/style.css`:

```css
@import "tailwindcss";
```

Import that stylesheet from your app entrypoint:

`src/main.ts`:

```ts
import './style.css';
```

## Install with PostCSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

`postcss.config.mjs`:

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [tailwindcss()],
};
```

`src/app.css`:

```css
@import "tailwindcss";
```

`@tailwindcss/postcss` handles Tailwind's `@import` processing itself, so you do not need a separate `postcss-import` plugin just to load Tailwind.

## CSS-First Configuration with @theme

Configure design tokens directly in CSS with the `@theme` at-rule. Each value becomes both a CSS variable and a matching utility class.

```css
@import "tailwindcss";

@theme {
  --color-brand-50:  oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.62 0.18 250);
  --color-brand-900: oklch(0.28 0.10 250);

  --font-display: "Inter", sans-serif;

  --spacing: 0.25rem;

  --breakpoint-3xl: 1920px;

  --radius-card: 0.75rem;
}
```

These tokens generate utilities automatically:

- `--color-brand-500` makes `bg-brand-500`, `text-brand-500`, `border-brand-500`, etc.
- `--font-display` makes `font-display`.
- `--breakpoint-3xl` adds a `3xl:` responsive variant.
- `--radius-card` makes `rounded-card`.

Reset or remove an entire namespace before redefining it:

```css
@theme {
  --color-*: initial;
  --color-primary: #2563eb;
  --color-secondary: #f59e0b;
}
```

Reference the same variables anywhere in CSS:

```css
.card {
  background: var(--color-brand-50);
  border-radius: var(--radius-card);
}
```

## Utility Classes

Build interfaces by composing utilities directly in markup. v4 follows the same naming conventions as earlier versions.

```html
<button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-2 focus:outline-indigo-700">
  Save changes
</button>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
  <article class="rounded-lg border border-gray-200 p-4">...</article>
</div>
```

State variants (`hover:`, `focus:`, `disabled:`, `group-hover:`, `peer-checked:`), responsive variants (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`), and structural variants (`first:`, `last:`, `odd:`, `even:`, `has-[...]:`) chain naturally.

## Arbitrary Values

When a token doesn't exist, drop the literal value into square brackets:

```html
<div class="top-[117px] grid-cols-[1fr_2fr_1fr] bg-[#1da1f2] text-[clamp(1rem,2vw,2rem)]">
  ...
</div>
```

Arbitrary variants follow the same pattern:

```html
<p class="[&>span]:font-semibold lg:[&:nth-child(3n)]:bg-gray-100">...</p>
```

## Dark Mode

By default v4 uses the `prefers-color-scheme` media query. Switch to class-based dark mode with the `@variant` directive:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle by adding `class="dark"` on a parent element. Use `dark:` utilities anywhere:

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  ...
</div>
```

You can override design tokens specifically for dark mode:

```css
@theme {
  --color-surface: white;
  --color-ink: black;
}

@layer base {
  .dark {
    --color-surface: #0a0a0a;
    --color-ink: #f5f5f5;
  }
}
```

## @apply and @utility

Use `@apply` to inline existing utilities inside your own CSS rules:

```css
@import "tailwindcss";

.btn-primary {
  @apply rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white;
  @apply hover:bg-indigo-500 focus:outline-2 focus:outline-indigo-700;
}
```

Define brand-new utilities (which then become first-class, variant-able classes) with `@utility`:

```css
@utility tab-4 {
  tab-size: 4;
}

@utility scrollbar-hide {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
```

`@utility` definitions automatically receive variant support, so `md:scrollbar-hide` and `hover:tab-4` both work.

## Content Detection

v4 detects source files automatically: any file imported by your stylesheet or referenced from your project's entry point is scanned. You usually do not need to list `content` paths.

If you need to add or override sources, use the `@source` directive:

```css
@import "tailwindcss";

@source "../node_modules/@my-org/ui/dist/**/*.js";
@source "./templates/**/*.html";
```

Explicitly exclude paths with `@source not`:

```css
@source not "./legacy/**/*.html";
```

## Common Workflows

### Change where PostCSS scans for source files

The PostCSS plugin searches from the current working directory by default. Set `base` when your frontend code lives in a subdirectory or workspace package.

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    tailwindcss({
      base: path.resolve(__dirname, './src'),
    }),
  ],
};
```

### Control CSS optimization explicitly

Both official integrations use Lightning CSS and infer production mode from `NODE_ENV`. Set `optimize` when you want deterministic behavior instead of environment-based defaults.

Vite example:

```ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss({
      optimize: { minify: false },
    }),
  ],
});
```

PostCSS example:

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcss({
      optimize: false,
    }),
  ],
};
```

### Disable automatic `url(...)` rewriting in PostCSS

Leave `transformAssetUrls` enabled unless your framework or bundler already rewrites asset URLs for imported CSS.

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcss({
      transformAssetUrls: false,
    }),
  ],
};
```

### Import Tailwind helper modules from JavaScript

The `tailwindcss` package exports JavaScript helpers and CSS entrypoints in addition to the main stylesheet.

```js
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

console.log(colors.sky[500]);
console.log(defaultTheme.fontFamily.sans);
console.log(typeof plugin);
```

If you need the distributed CSS entrypoints separately, the package also exports `tailwindcss/theme`, `tailwindcss/preflight`, and `tailwindcss/utilities`.

## Important Pitfalls

- `tailwindcss` is not the PostCSS plugin in v4. If you add it directly to `postcss.config.*`, Tailwind throws an error telling you to install `@tailwindcss/postcss` instead.
- Vite and PostCSS integration packages decide whether to optimize CSS by checking `NODE_ENV`. Set `optimize` yourself if you need stable behavior across local builds, CI, and preview environments.
- `@tailwindcss/postcss` rewrites `url(...)` references by default because it also handles `@import`. Disable `transformAssetUrls` only when your framework already owns that step.
- When your app source is not rooted at the current working directory, set the PostCSS plugin's `base` option or Tailwind can scan the wrong place.
- Prefer current v4 setup docs over older Tailwind examples that show `tailwindcss` directly in PostCSS configuration.
