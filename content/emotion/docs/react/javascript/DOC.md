---
name: react
description: "Emotion React APIs for the css prop, theming, global styles, and cache configuration in JavaScript React apps."
metadata:
  languages: "javascript"
  versions: "11.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "emotion,react,css-in-js,styling,theme,css-prop"
---

# Emotion React Guide (JavaScript)

## Golden Rule

Use `@emotion/react` when you need Emotion's React-specific APIs: the `css` prop, `css` helper, `Global`, `ThemeProvider`, `ClassNames`, and `CacheProvider`.

`@emotion/react` does not need API keys, environment variables, or client initialization. The important setup step is JSX compilation: if you want to use the `css` prop directly in JSX, configure your build so the JSX import source is `@emotion/react`.

## Install

Install `@emotion/react` in the same app that renders your React components.

```bash
npm install @emotion/react
```

Add companion packages only when you need them:

```bash
# Optional: custom cache configuration
npm install @emotion/cache

# Optional: Babel plugin for Emotion-specific transforms
npm install -D @emotion/babel-plugin
```

For browser apps, you also need React and React DOM:

```bash
npm install react react-dom @emotion/react
```

## Enable the `css` prop

In modern React builds, the cleanest setup is the automatic JSX runtime with `importSource: "@emotion/react"`.

```javascript
// babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-react", { runtime: "automatic", importSource: "@emotion/react" }],
  ],
  plugins: ["@emotion/babel-plugin"],
};
```

If you only want to opt in for a single file, add the file-level pragma instead:

```jsx
/** @jsxImportSource @emotion/react */
```

Once that is in place, you can use the `css` prop on JSX elements and on custom components that forward `className`.

## Common Workflows

### Style JSX with the `css` prop

Use the `css` prop for component-local styles. Object styles work well for JavaScript apps because they keep selectors and values in normal JS objects.

```jsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const buttonStyles = css({
  border: 0,
  borderRadius: 9999,
  padding: "0.75rem 1rem",
  font: "inherit",
  color: "white",
  backgroundColor: "#2563eb",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#1d4ed8",
  },
});

export function SaveButton() {
  return <button css={buttonStyles}>Save changes</button>;
}
```

You can also pass an object directly to `css={...}` when you do not need to reuse the styles elsewhere.

### Share a theme with `ThemeProvider` and `useTheme`

Wrap the app with `ThemeProvider` when multiple components need the same colors, spacing, or typography tokens.

```jsx
/** @jsxImportSource @emotion/react */
import { ThemeProvider, useTheme } from "@emotion/react";

const theme = {
  colors: {
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    accent: "#22c55e",
  },
};

function StatusCard({ children }) {
  const currentTheme = useTheme();

  return (
    <section
      css={{
        padding: "1rem",
        borderRadius: "0.75rem",
        color: currentTheme.colors.text,
        backgroundColor: currentTheme.colors.surface,
      }}
    >
      {children}
    </section>
  );
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <main
        css={{
          minHeight: "100vh",
          padding: "2rem",
          backgroundColor: theme.colors.background,
        }}
      >
        <StatusCard>Ready</StatusCard>
      </main>
    </ThemeProvider>
  );
}
```

### Add app-wide styles with `Global`

Use `Global` for resets, base typography, and CSS variables that should apply to the whole document.

```jsx
/** @jsxImportSource @emotion/react */
import { Global, css } from "@emotion/react";

export function AppShell({ children }) {
  return (
    <>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            min-height: 100%;
          }

          body {
            margin: 0;
            font-family: Inter, system-ui, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
          }
        `}
      />

      <main>{children}</main>
    </>
  );
}
```

### Style components that work through `className`

Emotion can style custom components, but those components must pass the received `className` through to a DOM element or another Emotion-aware component.

```jsx
/** @jsxImportSource @emotion/react */
import { ClassNames } from "@emotion/react";

function Panel({ className, children }) {
  return <section className={className}>{children}</section>;
}

export function Sidebar() {
  return (
    <ClassNames>
      {({ css, cx }) => (
        <Panel
          className={cx(
            "analytics-sidebar",
            css({
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "#e0f2fe",
              border: "1px solid #7dd3fc",
            }),
          )}
        >
          Reports
        </Panel>
      )}
    </ClassNames>
  );
}
```

Use `ClassNames` when a component or third-party library expects `className` rather than a `css` prop.

### Control style insertion with `CacheProvider`

Use a custom cache when you need to control how Emotion inserts style tags, such as embedding a React app into an existing page or isolating styles for a specific subtree.

```jsx
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

const cache = createCache({
  key: "admin",
  prepend: true,
});

export function AppProviders({ children }) {
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
```

Create the cache once at module scope. Do not create a new cache inside a component render.

## Important pitfalls

- The `css` prop only works when your JSX transform is configured for `@emotion/react` with `@jsxImportSource` or an equivalent compiler setting.
- Custom components must forward `className`; if they drop it, Emotion cannot attach the generated styles.
- `@emotion/react` does not provide the `styled` API. Install `@emotion/styled` when you want `styled.div`, `styled.button`, or similar component factories.
- Use `CacheProvider` only when you need custom insertion behavior. A new cache per render causes unnecessary style churn.
- Prefer one setup path for the `css` prop across the app. Mixing incompatible JSX configurations is a common source of missing styles.

## Version notes

- This guide targets `@emotion/react@11.14.0`.
- `@emotion/react` is the package for the React runtime APIs. Cache creation lives in `@emotion/cache`, and the styled-component API lives in `@emotion/styled`.
