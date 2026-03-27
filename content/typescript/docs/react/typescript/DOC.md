---
name: react
description: "TypeScript declarations for React components, JSX, hooks, refs, and release-channel entry points."
metadata:
  languages: "typescript"
  versions: "19.2.14"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,jsx,hooks,refs,types,definitelytyped"
---

# React TypeScript Guide

## Golden Rule

Install `@types/react` alongside the real `react` runtime package. `@types/react` only provides TypeScript declarations; it does not include the React runtime.

For browser apps, keep `react`, `react-dom`, `@types/react`, and `@types/react-dom` on the same React major line so JSX, refs, DOM props, and renderer-specific types stay compatible.

## Install

Install the runtime first. Add `react-dom` only when this project renders to the DOM.

```bash
npm install react
npm install -D typescript @types/react

# Browser apps
npm install react-dom
npm install -D @types/react-dom
```

If your app already depends on `react`, add only the missing type package:

```bash
npm install -D @types/react
```

## Initialization

There are no environment variables, credentials, or client objects to configure.

TypeScript picks up `@types/react` automatically once it is installed.

### Browser JSX projects

For a normal browser app, make sure your compiler is set up for JSX and DOM types:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

`@types/react` exports `react/jsx-runtime` and `react/jsx-dev-runtime`, which are the type entry points used by the automatic JSX runtime.

### If you restrict `compilerOptions.types`

If your project uses `compilerOptions.types`, include `react` explicitly:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

Omit `react-dom` in React Native or other non-DOM projects.

### DOM-less projects

The package also includes empty DOM interface fallbacks so React projects can compile without the DOM library. That is useful for React Native or other DOM-less targets, but browser-only properties stay unavailable until you add `"DOM"` to `compilerOptions.lib`.

### Opt into `canary` or `experimental` declarations

Release-channel types are opt-in. Add the entry point to `compilerOptions.types`:

```json
{
  "compilerOptions": {
    "types": ["react", "react/canary"]
  }
}
```

Or load it once from a TypeScript file:

```ts
import {} from "react/canary";
```

Use `react/experimental` the same way when your runtime React channel matches the experimental declarations.

## Common Workflows

### Type component props and children

Use `PropsWithChildren` when `children` is optional, or use `ReactNode` directly when it must be present.

```tsx
import { type PropsWithChildren } from "react";

type PanelProps = PropsWithChildren<{
  title: string;
}>;

export function Panel({ title, children }: PanelProps) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

`PropsWithChildren<P>` is equivalent to `P & { children?: ReactNode }`.

### Reuse intrinsic element props and forward refs

`ComponentPropsWithoutRef` and `ComponentRef` are the most practical helpers for wrapper components.

```tsx
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ label, id, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label htmlFor={inputId}>
        <span>{label}</span>
        <input id={inputId} ref={ref} {...props} />
      </label>
    );
  },
);

export type TextInputRef = ComponentRef<typeof TextInput>;
```

This keeps the wrapper aligned with the real `<input>` prop and ref types instead of duplicating them by hand.

### Type context with a guarded hook

`createContext` requires a default value. When there is no sensible fallback, use `null` and guard access in a custom hook.

```tsx
import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

type Session = {
  userId: string;
  signOut(): void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  value,
  children,
}: PropsWithChildren<{ value: Session }>) {
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const session = useContext(SessionContext);

  if (session === null) {
    throw new Error("useSession must be used within <SessionProvider>");
  }

  return session;
}
```

In the current React 19 declaration line, the context object itself is callable as the provider component, so `<SessionContext value={...}>` is typed directly.

### Use React 19 action and optimistic state helpers

The declarations include typed tuples for `useActionState` and `useOptimistic`, so the dispatch function is inferred from your action signature.

```tsx
import { useActionState, useOptimistic } from "react";

type Comment = {
  id: string;
  body: string;
};

async function saveComment(
  currentComments: Comment[],
  formData: FormData,
): Promise<Comment[]> {
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return currentComments;
  }

  return [
    ...currentComments,
    { id: `saved-${currentComments.length + 1}`, body },
  ];
}

export function CommentComposer({
  initialComments,
}: {
  initialComments: Comment[];
}) {
  const [comments, submitComment, isPending] = useActionState(
    saveComment,
    initialComments,
  );
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current, body: string) => [
      ...current,
      { id: `optimistic-${current.length + 1}`, body },
    ],
  );

  return (
    <>
      <ul>
        {optimisticComments.map((comment) => (
          <li key={comment.id}>{comment.body}</li>
        ))}
      </ul>

      <form
        action={(formData) => {
          const body = String(formData.get("body") ?? "").trim();

          if (body) {
            addOptimisticComment(body);
          }

          submitComment(formData);
        }}
      >
        <input name="body" />
        <button disabled={isPending}>Post</button>
      </form>
    </>
  );
}
```

## Important Pitfalls

- `@types/react` is declarations only. Install `react` separately.
- Import runtime values and types from `react`, not from `@types/react`.
- If you set `compilerOptions.types`, include `react` there or the package can appear to disappear.
- `react/canary` and `react/experimental` declarations are not loaded unless you reference them explicitly.
- If your project omits the DOM library, the fallback DOM interfaces are intentionally empty. Add `"DOM"` to `compilerOptions.lib` before relying on browser-only properties such as `HTMLInputElement.value`.
- `createContext` requires a default value. Use `null` or `undefined` in the context type when there is no real fallback.
- Keep `@types/react`, `react`, and `@types/react-dom` on compatible React versions.

## Version-Sensitive Notes

- This guide targets `@types/react==19.2.14`.
- The current React 19 declaration line exports typed entry points for `react`, `react/canary`, `react/experimental`, `react/jsx-runtime`, `react/jsx-dev-runtime`, and `react/compiler-runtime`.
- The published package README lists `csstype` as a dependency.
- The React 19 declaration surface includes typed hooks and helpers such as `useActionState`, `useOptimistic`, `use`, `act`, `cache`, and `cacheSignal`.
- `react/compiler-runtime` is present for compiler integration; its declaration file does not expose a public API for normal application imports.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/react
- DefinitelyTyped source for `@types/react`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react
- `@types/react` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts
- `@types/react` canary declarations: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/canary.d.ts
- React runtime reference: https://react.dev/reference/react
- React `createContext` reference: https://react.dev/reference/react/createContext
