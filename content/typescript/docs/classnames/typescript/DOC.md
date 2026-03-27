---
name: classnames
description: "TypeScript setup for `classnames`. `@types/classnames@2.3.4` is a stub package, so install `classnames` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "2.3.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,classnames,css,react,types,definitelytyped,npm"
---

# classnames TypeScript Guide

## Golden Rule

`@types/classnames@2.3.4` is a stub package.

The npm package page for `@types/classnames` says that `classnames` provides its own type definitions. For current projects, install `classnames`, import from `"classnames"` or `"classnames/bind"`, and remove `@types/classnames` if you added it directly.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install classnames
npm install -D typescript
```

If your project already depends on the old stub package directly, remove it:

```bash
npm uninstall @types/classnames
```

If this is a React project, keep React and React's type packages installed separately. `classnames` only builds class name strings.

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

## Initialization

There are no package-specific environment variables, auth steps, or client objects.

The important setup point is importing the runtime package directly so TypeScript reads the declarations bundled with `classnames`.

### Import from `classnames`

If your project uses `esModuleInterop` or a bundler setup that supports default imports from CommonJS packages, use:

```typescript
import classNames from "classnames";
```

If you want the configuration-independent TypeScript import for a CommonJS export, use:

```typescript
import classNames = require("classnames");
```

Do not import from `@types/classnames`.

### Default-import TypeScript config

If you prefer `import classNames from "classnames"`, enable `esModuleInterop` or `allowSyntheticDefaultImports`:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If your project restricts ambient packages with `compilerOptions.types`, you do not need to list `classnames` there. Its declarations come from the imported runtime package.

## Common Workflows

### Build conditional class strings

Pass strings, object maps, arrays, and optional values to a single `classNames()` call.

```typescript
import classNames from "classnames";

type ButtonClassNameOptions = {
  intent: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function getButtonClassName({
  intent,
  disabled = false,
  loading = false,
  className,
}: ButtonClassNameOptions): string {
  return classNames(
    "button",
    `button-${intent}`,
    {
      "is-disabled": disabled,
      "is-loading": loading,
    },
    className,
  );
}
```

Object keys are included only when their values are truthy. Standalone falsy arguments are ignored.

### Combine arrays and nested values

`classnames` accepts arrays, including nested arrays, so you can compose reusable class fragments.

```typescript
import classNames from "classnames";

const sharedAlertClasses = ["is-interactive", "has-outline"];

export function getAlertClassName(compact: boolean, tone: "info" | "error"): string {
  return classNames(
    "alert",
    sharedAlertClasses,
    [compact && "alert-compact"],
    {
      "alert-info": tone === "info",
      "alert-error": tone === "error",
    },
  );
}
```

This is the practical boundary with application code: `classnames` always returns a plain `string`, ready to pass into a `className` prop or template.

### Merge a component's own classes with an incoming `className`

This is the most common integration pattern in React components.

```tsx
import classNames from "classnames";
import type { ReactNode } from "react";

type BadgeProps = {
  tone: "neutral" | "success" | "warning";
  className?: string;
  children: ReactNode;
};

export function Badge({ tone, className, children }: BadgeProps) {
  return (
    <span
      className={classNames("badge", `badge-${tone}`, className)}
    >
      {children}
    </span>
  );
}
```

Keeping `className?: string` at the component boundary works well because `classnames` already handles missing or falsy values cleanly.

### Use `classnames/bind` with CSS Modules

The package documents a separate `bind` build for CSS Modules-style lookups.

```typescript
import classNames from "classnames/bind";
import styles from "./Button.module.css";

const cx = classNames.bind(styles);

type ButtonStyleOptions = {
  pressed?: boolean;
  disabled?: boolean;
};

export function getModuleButtonClassName({
  pressed = false,
  disabled = false,
}: ButtonStyleOptions): string {
  return cx("root", {
    pressed,
    disabled,
  });
}
```

With `bind`, the object keys are the local CSS Module keys, and the returned string contains the mapped class names from `styles`.

## Important Pitfalls

- `@types/classnames` does not replace the `classnames` runtime package.
- Do not import from `@types/classnames`; import from `classnames` or `classnames/bind`.
- Standalone falsy values such as `false`, `null`, `undefined`, `0`, and `""` are ignored. If `"0"` needs to be a class token, pass it as a string.
- If a default import fails under your TypeScript config, switch to `import classNames = require("classnames")` or enable `esModuleInterop`.
- `classnames` returns a plain `string`. It does not validate whether a class actually exists in your CSS.

## Version-Sensitive Notes

- This guide targets the `@types/classnames` package entry at version `2.3.4`.
- For this version, the npm package entry is a stub package that points TypeScript users to `classnames`.
- For new work, the relevant package is `classnames`, because it provides both the runtime behavior and the bundled TypeScript declarations.

## Official Sources

- npm package page for `@types/classnames`: https://www.npmjs.com/package/@types/classnames
- DefinitelyTyped source for `@types/classnames`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/classnames
- npm package page for `classnames`: https://www.npmjs.com/package/classnames
- `classnames` README and API reference: https://github.com/JedWatson/classnames/blob/master/README.md
