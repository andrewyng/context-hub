---
name: react
description: "React runtime for building component UIs in JavaScript with hooks, context, Suspense, and lazy loading."
metadata:
  languages: "javascript"
  versions: "19.2.6"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "react,javascript,ui,components,hooks,context,suspense"
---

# React Guide (JavaScript)

## Golden Rule

Use `react` for components, hooks, context, and rendering logic. Use `react-dom` separately when you need to mount React in a browser.

For browser apps, keep `react` and `react-dom` on the same React major line so the runtime and renderer stay compatible.

## Install

Install `react` in every React app. Add `react-dom` for web apps that render into the DOM.

```bash
npm install react

# Browser apps
npm install react-dom
```

React does not need API keys, environment variables, or client initialization.

This guide assumes your app uses a JSX-capable build step. In modern React projects, JSX is usually compiled with the automatic JSX transform, so you do not need `import React from "react"` just to write JSX.

## Initialize a Browser App

`react` does not mount itself into the page. For that, import `createRoot` from `react-dom/client`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

```jsx
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```jsx
// src/App.jsx
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Hello, React</h1>
      <button onClick={() => setCount((current) => current + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}
```

## Common Workflows

### Manage local component state with `useState`

Use `useState` for local, render-driven state such as toggles, input values, and counters.

```jsx
import { useState } from "react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <p>Thanks. We will contact {email}.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <button type="submit">Sign up</button>
    </form>
  );
}
```

### Synchronize with external systems using `useEffect`

Use `useEffect` when code must run after React commits the UI, such as timers, subscriptions, or DOM integrations. Return a cleanup function when the effect starts work that must be undone.

```jsx
import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return <time dateTime={now.toISOString()}>{now.toLocaleTimeString()}</time>;
}
```

### Share app-level values with context

Create the context with `createContext`, provide it near the top of the tree, and read it with `useContext` in descendants.

In React 19, the context object itself can be used as the provider component.

```jsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const value = useMemo(
    () => ({
      theme,
      toggleTheme() {
        setTheme((current) => (current === "light" ? "dark" : "light"));
      },
    }),
    [theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }

  return context;
}
```

### Memoize expensive derived values with `useMemo`

Use `useMemo` when recalculating a value on every render is measurably expensive.

```jsx
import { useMemo, useState } from "react";

const products = [
  { id: "1", name: "Keyboard" },
  { id: "2", name: "Monitor" },
  { id: "3", name: "Microphone" },
];

export function ProductSearch() {
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
      />

      <ul>
        {visibleProducts.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </>
  );
}
```

`useMemo` is a performance optimization. Your code should still be correct if React recalculates the value.

### Group related state transitions with `useReducer`

Use `useReducer` when state updates are non-trivial or several actions update the same state in different ways.

```jsx
import { useReducer } from "react";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </>
  );
}
```

### Stabilize callback identity with `useCallback`

Wrap a function in `useCallback` when a referentially stable callback matters, such as when passing it to a memoized child component or as a dependency to another hook.

```jsx
import { useCallback, useState } from "react";

export function TodoList({ todos }) {
  const [filter, setFilter] = useState("");

  const handleChange = useCallback((event) => {
    setFilter(event.target.value);
  }, []);

  return (
    <>
      <input value={filter} onChange={handleChange} />
      <ul>
        {todos
          .filter((todo) => todo.text.includes(filter))
          .map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
      </ul>
    </>
  );
}
```

### Hold mutable values and DOM nodes with `useRef`

Use `useRef` to keep a mutable value across renders without triggering a re-render, or to hold a DOM node reference.

```jsx
import { useEffect, useRef } from "react";

export function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

### Keep the UI responsive with `useTransition`

Mark non-urgent state updates with `useTransition` so React can keep the previous UI visible while it computes the new one.

```jsx
import { useState, useTransition } from "react";

export function TabSwitcher({ tabs, renderTab }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isPending, startTransition] = useTransition();

  function selectTab(tab) {
    startTransition(() => {
      setActiveTab(tab);
    });
  }

  return (
    <>
      <nav>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => selectTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {isPending ? <p>Loading…</p> : renderTab(activeTab)}
    </>
  );
}
```

### Defer expensive re-renders with `useDeferredValue`

`useDeferredValue` lets a slow part of the tree render with a stale value while a more important update finishes.

```jsx
import { useDeferredValue, useState } from "react";
import { SearchResults } from "./SearchResults.jsx";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <SearchResults query={deferredQuery} />
    </>
  );
}
```

### Show optimistic UI with `useOptimistic`

`useOptimistic` lets you render a temporary "optimistic" state during an async action and roll back automatically if the action throws.

```jsx
import { useOptimistic, useState } from "react";

async function sendMessage(text) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { id: crypto.randomUUID(), text };
}

export function Thread() {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current, pending) => [...current, { id: "pending", text: pending, pending: true }],
  );

  async function submit(formData) {
    const text = formData.get("text");
    addOptimisticMessage(text);
    const saved = await sendMessage(text);
    setMessages((current) => [...current, saved]);
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((message) => (
          <li key={message.id} style={{ opacity: message.pending ? 0.5 : 1 }}>
            {message.text}
          </li>
        ))}
      </ul>

      <form action={submit}>
        <input name="text" required />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

### Track form action state with `useActionState`

`useActionState` wraps a server or client action and exposes the latest result plus pending state.

```jsx
import { useActionState } from "react";

async function subscribe(_previousState, formData) {
  const email = formData.get("email");

  if (!email.includes("@")) {
    return { ok: false, message: "Please enter a valid email" };
  }

  return { ok: true, message: `Subscribed ${email}` };
}

export function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribe, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Subscribe"}
      </button>
      {state ? <p>{state.message}</p> : null}
    </form>
  );
}
```

### Read promises and context with `use`

`use` reads a Promise or a Context inside a component. When given a Promise, it suspends until the promise resolves.

```jsx
import { Suspense, use } from "react";

function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <h2>{user.name}</h2>;
}

export function UserPage({ userPromise }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

Unlike other hooks, `use` may be called inside loops and conditionals.

### Catch render errors with an error boundary

React does not provide a hook for catching errors. Use a class component with `componentDidCatch` or `getDerivedStateFromError`, or use a library such as `react-error-boundary`.

```jsx
import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return <p>Something went wrong.</p>;
    }

    return this.props.children;
  }
}
```

### Split code with `lazy` and `Suspense`

Use `lazy` for component-level code splitting and wrap the lazy component in `Suspense` with a fallback UI.

```jsx
import { Suspense, lazy, useState } from "react";

const SettingsPanel = lazy(() => import("./SettingsPanel.jsx"));

export function SettingsPage() {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setOpen(true)}>Open settings</button>

      {open ? (
        <Suspense fallback={<p>Loading settings…</p>}>
          <SettingsPanel />
        </Suspense>
      ) : null}
    </section>
  );
}
```

## React Server Components

React 19 ships first-class support for React Server Components (RSC). A framework such as Next.js (App Router) is responsible for bundling, the RSC payload, and serving server modules.

Quick rules:

- Server Components are the default in RSC frameworks. They run on the server, can `await` data, and never ship to the browser.
- Hooks that depend on the browser (`useState`, `useEffect`, refs, event handlers) are not allowed in Server Components.
- Mark a file with `'use client'` at the top to opt into a Client Component module.
- Mark a module function with `'use server'` to expose it as a Server Action callable from a Client Component or `<form action={...}>`.

`react` itself only provides the building blocks. Use a framework integration to actually render Server Components.

## Important Pitfalls

- `react` does not create or hydrate browser roots. Import `createRoot` or `hydrateRoot` from `react-dom/client`.
- In modern React projects, JSX does not require `import React from "react"`, but hooks and other APIs still must be imported explicitly.
- `useEffect` is for synchronization with external systems, not for deriving values from props or state. Compute derived values during render instead.
- When `StrictMode` is enabled, React may run an extra development-only setup and cleanup cycle for effects. Write cleanup logic so repeated setup is safe.
- Use stable keys from your data when rendering lists. Avoid array indexes for reorderable or editable collections.
- `createContext(defaultValue)` uses that default only when no matching provider exists above the component.
- `useMemo`, `useCallback`, and `memo` help with performance, but they should not be required for correctness.

## Version-Sensitive Notes

- This guide targets `react@19.2.6`.
- Pair `react` with a matching React 19 `react-dom` release in browser apps.
- The React 19 reference documents context providers using the context object directly, for example `<ThemeContext value={theme}>`.
- The React 19 reference also includes newer hooks such as `useActionState`, `useOptimistic`, and `use` in addition to the long-standing core hooks.

## Official Sources

- React package page: https://www.npmjs.com/package/react
- React API reference: https://react.dev/reference/react
- `useState`: https://react.dev/reference/react/useState
- `useEffect`: https://react.dev/reference/react/useEffect
- `createContext`: https://react.dev/reference/react/createContext
- `useContext`: https://react.dev/reference/react/useContext
- `useMemo`: https://react.dev/reference/react/useMemo
- `lazy`: https://react.dev/reference/react/lazy
- `Suspense`: https://react.dev/reference/react/Suspense
- Browser root creation with `react-dom/client`: https://react.dev/reference/react-dom/client/createRoot
