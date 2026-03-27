---
name: react-redux
description: "TypeScript declarations for React Redux Provider, hooks, connect, and prop inference in react-redux 7.x applications."
metadata:
  languages: "typescript"
  versions: "7.1.34"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react-redux,react,redux,provider,hooks,connect,types,definitelytyped"
---

# React Redux TypeScript Guide

## Golden Rule

Install `@types/react-redux` alongside the real `react-redux` runtime package.

`@types/react-redux` only provides TypeScript declarations. Your application imports `Provider`, `connect`, `useDispatch`, `useSelector`, `shallowEqual`, and the related helper types from `react-redux`, not from `@types/react-redux`.

This declaration package is for the `react-redux` 7.x line. The `react-redux` 7.2.x packages depend on `@types/react-redux`, while `react-redux` 8.0.0 and later publish their own `.d.ts` files. If you upgrade the runtime to 8 or newer, remove `@types/react-redux` and use the bundled runtime types instead.

## Install

Install the runtime packages first, then add the declaration packages your TypeScript project needs.

```bash
npm install react react-redux redux
npm install -D typescript @types/react @types/react-redux

# Browser apps that render with react-dom
npm install react-dom
npm install -D @types/react-dom
```

If your project already has `react-redux` 7.x installed, add only the missing declaration package:

```bash
npm install -D @types/react-redux
```

Do not install `@types/react-redux` with `react-redux` 8+.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The setup that matters is your store type, your React `Provider`, and a TypeScript config that compiles JSX.

### Minimal `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

If your project uses the older React JSX transform, keep the JSX setting that matches that toolchain.

### Create a typed Redux store

```typescript
import { combineReducers, createStore } from "redux";

type CounterAction =
  | { type: "counter/increment" }
  | { type: "counter/add"; payload: number };

type CounterState = {
  value: number;
};

const initialCounterState: CounterState = {
  value: 0,
};

function counterReducer(
  state: CounterState = initialCounterState,
  action: CounterAction,
): CounterState {
  switch (action.type) {
    case "counter/increment":
      return { value: state.value + 1 };
    case "counter/add":
      return { value: state.value + action.payload };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  counter: counterReducer,
});

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Wrap the app with `Provider`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App";
import { store } from "./store";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

ReactDOM.createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

## Common Workflows

### Create typed selector and dispatch hooks

`TypedUseSelectorHook<TState>` lets you declare your root state once instead of repeating it in every selector.

```typescript
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Use those helpers from components:

```tsx
import { useAppDispatch, useAppSelector } from "./hooks";

export function CounterButton() {
  const value = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <button onClick={() => dispatch({ type: "counter/increment" })}>
      Count: {value}
    </button>
  );
}
```

### Pass `shallowEqual` when selecting an object

If a selector returns a fresh object, pass `shallowEqual` as the equality function so React Redux compares the selected fields instead of the object identity.

```tsx
import { shallowEqual } from "react-redux";
import { useAppSelector } from "./hooks";

export function CounterSummary() {
  const counter = useAppSelector(
    (state) => ({ value: state.counter.value }),
    shallowEqual,
  );

  return <p>Current value: {counter.value}</p>;
}
```

### Infer injected props from `connect`

When you still use `connect`, prefer `ConnectedProps<typeof connector>` instead of manually duplicating the injected prop types.

```tsx
import React from "react";
import { connect, type ConnectedProps } from "react-redux";
import type { RootState } from "./store";

type OwnProps = {
  label: string;
};

const mapState = (state: RootState) => ({
  value: state.counter.value,
});

const mapDispatch = {
  increment: () => ({ type: "counter/increment" as const }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;
type CounterCardProps = PropsFromRedux & OwnProps;

function CounterCard({ label, value, increment }: CounterCardProps) {
  return (
    <button onClick={increment}>
      {label}: {value}
    </button>
  );
}

export default connector(CounterCard);
```

This keeps `mapStateToProps` and `mapDispatchToProps` as the source of truth for injected props.

## Important Pitfalls

- `@types/react-redux` is a declaration package only. Install `react-redux`, `react`, and `redux` separately.
- Import everything from `react-redux`. Do not import runtime values or helper types from `@types/react-redux`.
- `@types/react-redux` `7.1.34` is for the runtime line before bundled types. Remove it when upgrading to `react-redux` `8+` to avoid duplicate or conflicting declarations.
- Keep `@types/react` aligned with your installed React major so context, JSX, and component types match the runtime.
