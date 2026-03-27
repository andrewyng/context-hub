---
name: react-select
description: "TypeScript setup for `react-select`. `@types/react-select@5.0.1` is a stub package, so install `react-select` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "5.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-select,select,forms,ui,types,definitelytyped"
---

# react-select TypeScript Guide

## Golden Rule

`@types/react-select@5.0.1` is a stub package.

The npm package page for `@types/react-select` says that `react-select` provides its own type definitions. For application code, install `react-select`, import from `"react-select"`, and remove `@types/react-select` if you added it directly.

## Install

Install the runtime package with React and your normal TypeScript toolchain:

```bash
npm install react react-dom react-select
npm install -D typescript @types/react @types/react-dom
```

If your project already uses React, add only the missing runtime package:

```bash
npm install react-select
```

If you installed the old stub package directly, remove it:

```bash
npm uninstall @types/react-select
```

There are no package-specific environment variables, credentials, or client objects to configure.

## TypeScript Setup

Import both the component and its public types from `react-select`, not from `@types/react-select`.

For a browser React app, keep JSX and DOM libraries enabled:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

TypeScript picks up the declarations automatically from the `react-select` package once it is installed.

If your project restricts ambient packages with `compilerOptions.types`, keep your React entries listed there so JSX and DOM renderer types remain available:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

You do not need to list `react-select` in `compilerOptions.types`; its declarations come from the runtime module import.

## Initialization

There is no SDK client or authentication step. Runtime setup usually means importing `Select` and rendering it with typed options.

```tsx
import { useState } from "react";
import Select, { type SingleValue } from "react-select";

type ColorOption = {
  value: string;
  label: string;
};

const colorOptions: ColorOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
];

export function FavoriteColorField() {
  const [value, setValue] = useState<ColorOption | null>(null);

  function handleChange(nextValue: SingleValue<ColorOption>) {
    setValue(nextValue ?? null);
  }

  return (
    <Select<ColorOption>
      inputId="favorite-color"
      options={colorOptions}
      value={value}
      onChange={handleChange}
      isClearable
    />
  );
}
```

In the common single-select flow, `SingleValue<Option>` maps to `Option | null`, so keep component state compatible with that shape.

## Common Workflows

### Model `isMulti` values correctly

When `isMulti` is enabled, the change value becomes `MultiValue<Option>` instead of `SingleValue<Option>`.

```tsx
import { useState } from "react";
import Select, { type MultiValue } from "react-select";

type UserOption = {
  value: string;
  label: string;
};

const userOptions: UserOption[] = [
  { value: "ada", label: "Ada" },
  { value: "grace", label: "Grace" },
  { value: "linus", label: "Linus" },
];

export function AssigneeField() {
  const [value, setValue] = useState<UserOption[]>([]);

  function handleChange(nextValue: MultiValue<UserOption>) {
    setValue([...nextValue]);
  }

  return (
    <Select<UserOption, true>
      inputId="assignees"
      isMulti
      options={userOptions}
      value={value}
      onChange={handleChange}
      closeMenuOnSelect={false}
    />
  );
}
```

`MultiValue<Option>` is a readonly array type, so spread it into a new array when your local state expects a mutable `Option[]`.

### Reuse the runtime component's prop types in a wrapper

When you build a design-system wrapper, derive the prop surface from `react-select` instead of copying prop names by hand.

```tsx
import Select, {
  type GroupBase,
  type Props as SelectProps,
} from "react-select";

type StatusOption = {
  value: string;
  label: string;
};

type StatusSelectProps = SelectProps<
  StatusOption,
  false,
  GroupBase<StatusOption>
> & {
  label: string;
};

export function StatusSelect({
  label,
  inputId = "status",
  ...props
}: StatusSelectProps) {
  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <Select<StatusOption>
        {...props}
        inputId={inputId}
      />
    </label>
  );
}
```

This keeps wrapper props aligned with the installed `react-select` version and avoids inventing a second prop contract.

### Type style overrides with `StylesConfig`

Style callbacks can stay fully typed by parameterizing `StylesConfig` with your option shape and `isMulti` mode.

```tsx
import Select, {
  type GroupBase,
  type StylesConfig,
} from "react-select";

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

const options: StatusOption[] = [
  { value: "todo", label: "Todo", color: "#6b7280" },
  { value: "doing", label: "Doing", color: "#2563eb" },
  { value: "done", label: "Done", color: "#16a34a" },
];

const styles: StylesConfig<
  StatusOption,
  false,
  GroupBase<StatusOption>
> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#2563eb" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : base.boxShadow,
  }),
  option: (base, state) => ({
    ...base,
    color: state.data.color,
    fontWeight: state.isSelected ? 600 : 400,
  }),
};

export function StatusField() {
  return (
    <Select<StatusOption>
      inputId="status"
      options={options}
      styles={styles}
    />
  );
}
```

The callback state stays connected to your option type, so `state.data` is strongly typed inside style functions.

## Important Pitfalls

- `@types/react-select` does not provide the runtime component. Install `react-select` itself.
- Import from `react-select`, not from `@types/react-select`.
- If an older lockfile still includes `@types/react-select`, remove the stub package before troubleshooting duplicate or stale type behavior.
- `Select<Option, true>` and `Select<Option, false>` produce different callback value shapes; keep the `isMulti` generic aligned with the real component usage.
- `MultiValue<Option>` is readonly, so copy it before storing it in mutable application state.
- If you restrict `compilerOptions.types`, keep `react` and `react-dom` listed there or JSX-related types can appear to disappear.

## Version-Sensitive Notes

- This guide targets the `@types/react-select` package entry at version `5.0.1`.
- The important package for real application code is `react-select`, because that package provides both the runtime component and its type declarations.
- When your installed `react-select` version changes, rely on that package's bundled declarations as the source of truth for props, callback values, and style helper types.

## Official Sources

- npm package page for `@types/react-select`: https://www.npmjs.com/package/@types/react-select
- DefinitelyTyped source for `@types/react-select`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-select
- npm package page for `react-select`: https://www.npmjs.com/package/react-select
- `react-select` repository: https://github.com/JedWatson/react-select
- `react-select` documentation site: https://react-select.com/
