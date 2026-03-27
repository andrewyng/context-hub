---
name: react-datepicker
description: "TypeScript setup for `react-datepicker`. `@types/react-datepicker@7.0.0` is a stub package, so install `react-datepicker` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "7.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-datepicker,date-picker,ui,types,definitelytyped"
---

# react-datepicker TypeScript Guide

## Golden Rule

`@types/react-datepicker@7.0.0` is a stub package.

The npm package page for `@types/react-datepicker` says that `react-datepicker` provides its own type definitions. For application code, install `react-datepicker`, import from `"react-datepicker"`, and remove `@types/react-datepicker` if you added it directly.

## Install

Install the runtime package with React and your normal TypeScript toolchain:

```bash
npm install react react-dom react-datepicker
npm install -D typescript @types/react @types/react-dom
```

If your project already uses React, add only the missing runtime package:

```bash
npm install react-datepicker
```

If you installed the old stub package directly, remove it:

```bash
npm uninstall @types/react-datepicker
```

There are no package-specific environment variables, credentials, or client objects to configure.

## TypeScript Setup

Import both the component and any inferred types from `react-datepicker`, not from `@types/react-datepicker`.

For a browser React app, keep JSX and DOM libraries enabled:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

TypeScript picks up the declarations automatically from the `react-datepicker` package once it is installed.

If your project restricts ambient packages with `compilerOptions.types`, keep your React entries listed there so JSX and DOM renderer types remain available:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

You do not need to list `react-datepicker` in `compilerOptions.types`; its declarations come from the runtime module import.

## Initialization

There is no SDK client or authentication step. Runtime setup usually means importing the component and its stylesheet where your app renders it.

```tsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PublishDateField() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <DatePicker
      selected={value}
      onChange={(nextDate) => setValue(nextDate)}
      dateFormat="yyyy-MM-dd"
    />
  );
}
```

In the common single-date workflow, the selected value is `Date | null`, so model component state the same way.

## Common Workflows

### Render a controlled date picker

Use React state for the selected `Date | null` value, and convert it to an application-specific string only at the boundary where you submit or persist data.

```tsx
import { useState } from "react";
import DatePicker from "react-datepicker";

type FormValues = {
  publishAt: string | null;
};

export function PublishForm() {
  const [publishAt, setPublishAt] = useState<Date | null>(null);

  function buildPayload(): FormValues {
    return {
      publishAt: publishAt ? publishAt.toISOString() : null,
    };
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(buildPayload());
      }}
    >
      <DatePicker
        selected={publishAt}
        onChange={(nextDate) => setPublishAt(nextDate)}
        placeholderText="Choose a publish date"
        isClearable
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

Keep the picker state as a `Date` in UI code. Serialize to ISO strings only when sending data to an API or storing it.

### Reuse the runtime component's prop types in a wrapper

When you build a design-system wrapper, derive the prop surface from the real component instead of duplicating prop names manually.

```tsx
import { type ComponentProps } from "react";
import DatePicker from "react-datepicker";

type BaseDatePickerProps = ComponentProps<typeof DatePicker>;

type BookingDateFieldProps = Omit<
  BaseDatePickerProps,
  "selected" | "onChange"
> & {
  value: Date | null;
  onValueChange(value: Date | null): void;
  label: string;
};

export function BookingDateField({
  value,
  onValueChange,
  label,
  ...props
}: BookingDateFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <DatePicker
        {...props}
        selected={value}
        onChange={(nextDate) => onValueChange(nextDate)}
      />
    </label>
  );
}
```

This keeps wrapper props aligned with the installed `react-datepicker` version and avoids importing a separate prop type package.

## Important Pitfalls

- `@types/react-datepicker` does not provide the runtime component. Install `react-datepicker` itself.
- Import from `react-datepicker`, not from `@types/react-datepicker`.
- If your app does not load `react-datepicker/dist/react-datepicker.css`, the picker still type-checks but will render without the package's default styles.
- If you restrict `compilerOptions.types`, keep `react` and `react-dom` listed there or JSX-related types can appear to disappear.
- The common single-date flow uses `Date | null`; keep your form state compatible with that shape instead of forcing everything to strings too early.

## Version-Sensitive Notes

- This guide targets the `@types/react-datepicker` package entry at version `7.0.0`.
- The important package for real application code is `react-datepicker`, because that package provides both the runtime component and its type declarations.
- When your installed `react-datepicker` version changes, rely on that package's bundled declarations as the source of truth for prop and callback types.

## Official Sources

- npm package page for `@types/react-datepicker`: https://www.npmjs.com/package/@types/react-datepicker
- DefinitelyTyped source for `@types/react-datepicker`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-datepicker
- npm package page for `react-datepicker`: https://www.npmjs.com/package/react-datepicker
- `react-datepicker` repository: https://github.com/Hacker0x01/react-datepicker
- `react-datepicker` documentation site: https://reactdatepicker.com/
