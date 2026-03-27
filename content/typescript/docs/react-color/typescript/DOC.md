---
name: react-color
description: "TypeScript declarations for react-color picker components, color change results, and typed wrapper props"
metadata:
  languages: "typescript"
  versions: "3.0.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-color,color-picker,ui,types,definitelytyped"
---

# react-color TypeScript Guide

`@types/react-color` adds TypeScript declarations for the `react-color` runtime package. Use it when your React app renders picker components such as `SketchPicker` or `ChromePicker` and you want typed color values, typed change handlers, and typed component props.

This package only ships `.d.ts` files. Your application imports and renders `react-color`; the declaration package gives TypeScript the module and component types.

## Install

Install the runtime package in your React app, then add the TypeScript declarations.

```bash
npm install react react-dom react-color
npm install -D typescript @types/react @types/react-dom @types/react-color
```

If your app already has React set up, add only the missing packages:

```bash
npm install react-color
npm install -D @types/react-color
```

There are no environment variables, authentication settings, or client objects to configure.

## TypeScript Setup

Import from `react-color`, not from `@types/react-color`.

For a browser React app, keep JSX and DOM libraries enabled:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

TypeScript usually discovers the declarations automatically once `@types/react-color` is installed.

If you restrict `compilerOptions.types`, keep your React packages listed there so JSX and React component types remain available:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

## Common Workflows

### Render a controlled picker and store the selected hex value

`ColorResult` is the practical type to use in change handlers. It gives you the selected color in multiple formats.

```tsx
import { useState } from "react";
import { SketchPicker, type ColorResult } from "react-color";

export function BrandColorField() {
  const [color, setColor] = useState("#2563eb");

  function handleChangeComplete(result: ColorResult) {
    setColor(result.hex);
  }

  return (
    <div>
      <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
      <output>{color}</output>
    </div>
  );
}
```

Use `onChangeComplete` when you want to commit the final value after a drag or interaction finishes.

### Keep alpha information instead of flattening to hex

If your UI allows transparency, store `ColorResult["rgb"]` or `ColorResult["hsl"]` instead of only `result.hex`.

```tsx
import { useMemo, useState } from "react";
import { ChromePicker, type ColorResult } from "react-color";

export function OverlayColorField() {
  const [color, setColor] = useState<ColorResult["rgb"]>({
    r: 37,
    g: 99,
    b: 235,
    a: 0.7,
  });

  const preview = useMemo(() => {
    const alpha = color.a ?? 1;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }, [color]);

  return (
    <div>
      <ChromePicker color={color} onChange={(result: ColorResult) => setColor(result.rgb)} />
      <div
        style={{
          width: 64,
          height: 32,
          marginTop: 12,
          borderRadius: 6,
          background: preview,
        }}
      />
    </div>
  );
}
```

This pattern avoids losing the alpha channel when a user chooses semi-transparent colors.

### Reuse picker props when you build a wrapper component

When you wrap a picker in your own component, derive the prop type from the runtime component so your wrapper stays aligned with the installed declarations.

```tsx
import { SketchPicker, type ColorResult } from "react-color";

type BrandColorPickerProps = Omit<
  React.ComponentProps<typeof SketchPicker>,
  "color" | "onChangeComplete"
> & {
  value: string;
  onChange: (nextColor: string) => void;
};

export function BrandColorPicker({ value, onChange, ...rest }: BrandColorPickerProps) {
  function handleChangeComplete(result: ColorResult) {
    onChange(result.hex);
  }

  return <SketchPicker {...rest} color={value} onChangeComplete={handleChangeComplete} />;
}
```

This is the safest way to expose a narrower app-specific API without manually re-declaring the picker's prop surface.

### Use the full change result in form helpers

The change result already contains hex, RGB, and HSL representations, so you can normalize once and pass a single typed object through your form code.

```tsx
import { TwitterPicker, type ColorResult } from "react-color";

type ThemeColor = {
  hex: string;
  rgb: ColorResult["rgb"];
  hsl: ColorResult["hsl"];
};

export function ThemeSwatchPicker(props: {
  value: string;
  onChange: (next: ThemeColor) => void;
}) {
  return (
    <TwitterPicker
      color={props.value}
      onChangeComplete={(result: ColorResult) => {
        props.onChange({
          hex: result.hex,
          rgb: result.rgb,
          hsl: result.hsl,
        });
      }}
    />
  );
}
```

## Important Pitfalls

- Install `react-color` separately; `@types/react-color` only provides TypeScript declarations.
- Import components and types from `react-color`, never from `@types/react-color`.
- If your browser app uses JSX, keep the DOM library and React JSX compiler settings enabled in `tsconfig.json`.
- `result.hex` is convenient, but it can be the wrong storage format when transparency matters; keep `result.rgb` or `result.hsl` if alpha must round-trip.
- Picker callbacks can fire repeatedly while a user drags a control. Use `onChange` for live preview and `onChangeComplete` for state you do not want to update on every intermediate event.
- Keep `react`, `react-dom`, `@types/react`, and `@types/react-color` aligned with the React app you actually compile.

## Version-Sensitive Notes

- This guide targets `@types/react-color==3.0.13`.
- The declaration package describes the `react-color` runtime API; if your app is pinned to an older or patched runtime release, verify that the installed declaration package still matches the picker components and callback props you use.

## Official Sources

- npm package page for `@types/react-color`: https://www.npmjs.com/package/@types/react-color
- DefinitelyTyped source for `@types/react-color`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-color
- `@types/react-color` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-color/index.d.ts
- npm package page for `react-color`: https://www.npmjs.com/package/react-color
- `react-color` source repository: https://github.com/casesandberg/react-color
