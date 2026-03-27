---
name: react-transition-group
description: "TypeScript setup for react-transition-group, including installation, JSX compiler settings, typed transition components, and StrictMode-safe refs."
metadata:
  languages: "typescript"
  versions: "4.4.12"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,transitions,animation,react-transition-group,types,definitelytyped"
---

# react-transition-group TypeScript Guide

`@types/react-transition-group` provides the TypeScript declarations for the `react-transition-group` runtime package. Install it when your React app uses components such as `Transition`, `CSSTransition`, `TransitionGroup`, or `SwitchTransition` and you want typed props, callbacks, refs, and transition-state inference.

This package only ships declaration files. Install the real `react-transition-group` runtime separately.

## Install

Install the runtime package, React, and the matching type packages together:

```bash
npm install react react-dom react-transition-group
npm install --save-dev typescript @types/react @types/react-dom @types/react-transition-group
```

If the project already has `react`, `react-dom`, and `react-transition-group`, add only the missing declarations:

```bash
npm install --save-dev @types/react-transition-group
```

## Initialization

There are no environment variables, credentials, or client objects to configure.

TypeScript uses these declarations automatically when you import from `"react-transition-group"`.

For browser React apps, keep JSX and DOM libraries enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

If your project restricts `compilerOptions.types`, include the React packages there. You do not import from `@types/react-transition-group` directly.

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

## Import The Runtime Package

Import the components from `react-transition-group` itself:

```tsx
import {
  CSSTransition,
  SwitchTransition,
  Transition,
  TransitionGroup,
} from "react-transition-group";
```

Do not write application imports against `@types/react-transition-group`.

## Common Workflows

### Animate a single element with `CSSTransition`

`CSSTransition` is the most common entry point for class-based enter and exit animations.

```tsx
import { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

export function SaveNotice() {
  const [open, setOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button onClick={() => setOpen((value) => !value)}>Toggle</button>

      <CSSTransition
        in={open}
        nodeRef={nodeRef}
        timeout={200}
        classNames="fade"
        unmountOnExit
      >
        <div ref={nodeRef}>Saved</div>
      </CSSTransition>
    </>
  );
}
```

Match the `classNames` prefix with CSS that covers the same timeout:

```css
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity 200ms ease-in;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-out;
}
```

### Render from transition state with `Transition`

Use `Transition` when you want inline styles or custom rendering logic instead of CSS class management.

```tsx
import { type CSSProperties, useRef, useState } from "react";
import { Transition } from "react-transition-group";

const duration = 180;

const defaultStyle: CSSProperties = {
  opacity: 0,
  transition: `opacity ${duration}ms ease-in-out`,
};

const transitionStyles: Record<string, CSSProperties> = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

export function InlineFade() {
  const [open, setOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button onClick={() => setOpen((value) => !value)}>Toggle</button>

      <Transition in={open} timeout={duration} nodeRef={nodeRef} mountOnEnter unmountOnExit>
        {(state) => (
          <div ref={nodeRef} style={{ ...defaultStyle, ...(transitionStyles[state] ?? {}) }}>
            Animated content
          </div>
        )}
      </Transition>
    </>
  );
}
```

The `state` render-prop value is inferred from the transition lifecycle, so TypeScript can help keep your style map aligned with the runtime states.

### Animate list items with `TransitionGroup`

Use `TransitionGroup` when items enter and leave a collection. Keep a stable `key` and a separate `nodeRef` for each keyed child.

```tsx
import { createRef, type RefObject, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

type Todo = {
  id: string;
  label: string;
};

export function TodoList({ items }: { items: Todo[] }) {
  const nodeRefs = useRef<Record<string, RefObject<HTMLLIElement | null>>>({});

  const getNodeRef = (id: string) => {
    nodeRefs.current[id] ??= createRef<HTMLLIElement>();
    return nodeRefs.current[id];
  };

  return (
    <TransitionGroup component="ul">
      {items.map((item) => {
        const nodeRef = getNodeRef(item.id);

        return (
          <CSSTransition key={item.id} nodeRef={nodeRef} timeout={150} classNames="todo">
            <li ref={nodeRef}>{item.label}</li>
          </CSSTransition>
        );
      })}
    </TransitionGroup>
  );
}
```

### Replace one child with another using `SwitchTransition`

`SwitchTransition` is useful when exactly one child is shown at a time and the child changes by key.

```tsx
import { useRef, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export function StatusBadge() {
  const [state, setState] = useState<"saved" | "saving">("saved");
  const nodeRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <button onClick={() => setState((value) => (value === "saved" ? "saving" : "saved"))}>
        Toggle status
      </button>

      <SwitchTransition mode="out-in">
        <CSSTransition key={state} nodeRef={nodeRef} timeout={180} classNames="fade">
          <span ref={nodeRef}>{state}</span>
        </CSSTransition>
      </SwitchTransition>
    </>
  );
}
```

## Important Pitfalls

- `@types/react-transition-group` does not include runtime JavaScript. Install `react-transition-group` itself.
- Import from `"react-transition-group"`, not from `"@types/react-transition-group"`.
- Use `nodeRef` in modern React apps, especially under `StrictMode`, so the library does not fall back to `findDOMNode`.
- When you pass `nodeRef`, transition callbacks no longer receive the DOM node argument; read from the ref you supplied instead.
- Keep the `timeout` prop aligned with your real CSS durations or the transition state and class cleanup will not match the visual animation.
- In `TransitionGroup`, each keyed child should keep its own stable ref object. Reusing one ref across different keys causes incorrect typing and incorrect runtime behavior.

## Version-Sensitive Notes

- This guide targets `@types/react-transition-group==4.4.12`.
- The declaration package is for the `react-transition-group` runtime API, so keep the types aligned with the runtime major version used in the same project.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/react-transition-group
- DefinitelyTyped source for `@types/react-transition-group`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-transition-group
- `@types/react-transition-group` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-transition-group/index.d.ts
- `Transition` docs: https://reactcommunity.org/react-transition-group/transition/
- `CSSTransition` docs: https://reactcommunity.org/react-transition-group/css-transition/
- `TransitionGroup` docs: https://reactcommunity.org/react-transition-group/transition-group/
- `SwitchTransition` docs: https://reactcommunity.org/react-transition-group/switch-transition/
