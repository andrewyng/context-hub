---
name: styled-components
description: "CSS-in-JS for React with styled elements, theming, global styles, and server-side rendering support."
metadata:
  languages: "javascript"
  versions: "6.3.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "styled-components,react,css-in-js,styling,theme,ssr"
---

# styled-components Guide (JavaScript)

## Golden Rule

Use `styled-components` to create styled React components with tagged template literals. Define styled components at module scope, not inside render functions, so React does not recreate component classes on every render.

`styled-components` does not need API keys, environment variables, or client initialization. Install it, import the APIs you need, and render your components normally.

## Install

Install `styled-components` in the same app that renders your React components.

```bash
npm install styled-components
```

For web apps, you also need React and React DOM:

```bash
npm install react react-dom styled-components
```

## Basic usage

Import the default `styled` factory and create styled elements or wrappers around your own React components.

```jsx
import styled from "styled-components";

const Page = styled.main`
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem;
`;

const Button = styled.button`
  border: 0;
  border-radius: 9999px;
  padding: 0.75rem 1rem;
  font: inherit;
  color: white;
  background: #7c3aed;
  cursor: pointer;

  &:hover {
    background: #6d28d9;
  }
`;

export function App() {
  return (
    <Page>
      <h1>styled-components</h1>
      <Button>Save changes</Button>
    </Page>
  );
}
```

## Pass styling props safely

For props that only exist to control styling, use transient props with a `$` prefix. They are available in your styles but are not forwarded to the underlying DOM element.

```jsx
import styled from "styled-components";

const Alert = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
  background: ${({ $tone }) => ($tone === "danger" ? "#dc2626" : "#2563eb")};
`;

export function Banner() {
  return <Alert $tone="danger">Something went wrong.</Alert>;
}
```

This is the simplest way to avoid React warnings about unknown DOM props in `styled-components` v6.

## Theme an app with `ThemeProvider`

Wrap your app with `ThemeProvider` to expose a shared theme object to styled components.

```jsx
import styled, { ThemeProvider } from "styled-components";

const theme = {
  colors: {
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    accent: "#22c55e",
  },
  space: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
};

const Card = styled.section`
  padding: ${({ theme }) => theme.space.lg};
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

const AccentText = styled.span`
  color: ${({ theme }) => theme.colors.accent};
`;

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Card>
        Status: <AccentText>healthy</AccentText>
      </Card>
    </ThemeProvider>
  );
}
```

## Add global CSS with `createGlobalStyle`

Use `createGlobalStyle` for resets, font rules, and app-wide CSS variables.

```jsx
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";

const theme = {
  colors: {
    background: "#0f172a",
    text: "#e2e8f0",
  },
};

const GlobalStyle = createGlobalStyle`
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
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Layout = styled.main`
  padding: 2rem;
`;

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>Dashboard</Layout>
    </ThemeProvider>
  );
}
```

## Reuse style fragments with `css`, `keyframes`, and `attrs`

Use helpers when you want shared fragments, animations, or default props.

```jsx
import styled, { css, keyframes } from "styled-components";

const interactive = css`
  border: 0;
  border-radius: 0.5rem;
  font: inherit;
  cursor: pointer;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Input = styled.input.attrs({
  type: "email",
  autoComplete: "email",
})`
  ${interactive}
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  background: white;
`;

const Toast = styled.div`
  ${interactive}
  padding: 0.75rem 1rem;
  color: white;
  background: #0f766e;
  animation: ${fadeIn} 160ms ease-out;
`;
```

## Server-side rendering with `ServerStyleSheet`

For classic server rendering, collect styles during `renderToString(...)`, inject them into the HTML response, and always call `sheet.seal()` in a `finally` block.

```jsx
import React from "react";
import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { App } from "./App.jsx";

export function renderPage() {
  const sheet = new ServerStyleSheet();

  try {
    const html = renderToString(sheet.collectStyles(<App />));
    const styleTags = sheet.getStyleTags();

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${styleTags}
    <title>styled-components SSR</title>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>`;
  } finally {
    sheet.seal();
  }
}
```

If you need React elements instead of raw HTML strings, use `sheet.getStyleElement()`.

## Restore v5-style prop filtering or vendor prefixes with `StyleSheetManager`

In v6, `styled-components` no longer automatically filters unknown props for DOM elements, and vendor prefixes are omitted by default. Use `StyleSheetManager` when you need to customize either behavior.

```jsx
import isPropValid from "@emotion/is-prop-valid";
import { StyleSheetManager } from "styled-components";

function shouldForwardProp(propName, target) {
  if (typeof target === "string") {
    return isPropValid(propName);
  }

  return true;
}

export function AppProviders({ children }) {
  return (
    <StyleSheetManager
      enableVendorPrefixes
      shouldForwardProp={shouldForwardProp}
    >
      {children}
    </StyleSheetManager>
  );
}
```

Install `@emotion/is-prop-valid` only if you choose this prop-filtering approach:

```bash
npm install @emotion/is-prop-valid
```

Prefer transient props like `$tone` and `$size` when you only need to prevent style-only props from reaching the DOM.

## Important pitfalls

- Define styled components outside React render functions.
- Use transient props or `StyleSheetManager.shouldForwardProp` for style-only props on DOM elements.
- Call `sheet.seal()` after SSR collection, even when rendering throws.
- If you use Stylis plugins in v6, make sure they are compatible with Stylis v4.
- Use `styled-components/native` instead of `styled-components` when styling React Native primitives.

## Version notes

- This guide targets `styled-components@6.3.11`.
- In v6, automatic DOM prop filtering is no longer the default.
- In v6, vendor prefixes are disabled by default and can be re-enabled with `StyleSheetManager enableVendorPrefixes`.
