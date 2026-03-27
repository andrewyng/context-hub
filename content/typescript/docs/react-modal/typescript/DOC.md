---
name: react-modal
description: "TypeScript declarations for react-modal, including typed modal props, accessibility setup, and style configuration"
metadata:
  languages: "typescript"
  versions: "3.16.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-modal,modal,accessibility,ui,types,definitelytyped"
---

# react-modal TypeScript Guide

`@types/react-modal` provides the TypeScript declarations for the `react-modal` runtime package. Use it in browser-based React apps when you want typed modal props, typed accessibility setup, and typed style objects for modal overlays and content.

This package only ships `.d.ts` files. Install the `react-modal` runtime separately, and import from `react-modal`, not from `@types/react-modal`.

## Install

Install the runtime package, React dependencies, and the declaration package together:

```bash
npm install react react-dom react-modal
npm install -D typescript @types/react @types/react-dom @types/react-modal
```

If your app already has React and TypeScript configured, add only the missing modal packages:

```bash
npm install react-modal
npm install -D @types/react-modal
```

No environment variables, credentials, or client initialization are required.

## TypeScript Setup

`react-modal` is a browser React library, so keep JSX and DOM libraries enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, use the default import form:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```tsx
import Modal from "react-modal";
```

If your compiler does not allow synthetic default imports, use the CommonJS-compatible import form instead:

```tsx
import Modal = require("react-modal");
```

TypeScript usually discovers the declarations automatically once `@types/react-modal` is installed.

## Initialize Accessibility Support

Call `Modal.setAppElement()` once so `react-modal` can hide the rest of the app from assistive technologies while the modal is open.

In a client-rendered app, calling it during startup is enough:

```tsx
import Modal from "react-modal";

Modal.setAppElement("#root");
```

If your framework renders on the server, do the setup in a browser-only path after mount:

```tsx
import { useEffect } from "react";
import Modal from "react-modal";

export function AppModalA11ySetup() {
  useEffect(() => {
    Modal.setAppElement("#__next");
  }, []);

  return null;
}
```

Use the selector that matches your real application root.

## Common Workflows

### Render a controlled modal

The main integration boundary is the `Modal` component from `react-modal`. Pass `isOpen`, `onRequestClose`, and an accessible label such as `contentLabel`.

```tsx
import { type FormEvent, useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export function RenameProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("Project Atlas");

  function openDialog() {
    setIsOpen(true);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    closeDialog();
  }

  return (
    <>
      <button onClick={openDialog}>Rename project</button>

      <Modal
        isOpen={isOpen}
        onRequestClose={closeDialog}
        contentLabel="Rename project"
        shouldCloseOnOverlayClick
      >
        <form onSubmit={handleSubmit}>
          <h2>Rename project</h2>

          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>

          <div>
            <button type="button" onClick={closeDialog}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

### Type a custom `style` object from the modal props

If you keep styles inline, derive the type from the component props instead of maintaining your own style shape.

```tsx
import { type ComponentProps } from "react";
import Modal from "react-modal";

type ModalStyle = NonNullable<ComponentProps<typeof Modal>["style"]>;

const modalStyle: ModalStyle = {
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    zIndex: 1000,
  },
  content: {
    inset: "4rem auto auto 50%",
    width: "min(32rem, calc(100vw - 2rem))",
    transform: "translateX(-50%)",
    borderRadius: "0.75rem",
    padding: "1.5rem",
  },
};

export function StyledDialog(props: { isOpen: boolean; onClose(): void }) {
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onClose}
      contentLabel="Styled dialog"
      style={modalStyle}
    >
      <p>Styled modal content</p>
    </Modal>
  );
}
```

This keeps the object aligned with the package's `style` prop instead of duplicating the shape by hand.

### Mount the modal into a specific portal container

Use `parentSelector` when your app needs the portal to render into a dedicated element instead of the default `document.body`.

```tsx
import Modal from "react-modal";

export function DrawerLikeModal(props: { isOpen: boolean; onClose(): void }) {
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onClose}
      contentLabel="Activity details"
      parentSelector={() => document.getElementById("modal-root") ?? document.body}
    >
      <p>Activity details</p>
    </Modal>
  );
}
```

Returning `document.body` as a fallback keeps the callback typed as an `HTMLElement`.

## Important Pitfalls

- Install both packages: `@types/react-modal` does not include the `react-modal` runtime.
- Import from `react-modal`: do not import declarations from `@types/react-modal` directly.
- Set the app element once: `Modal.setAppElement()` is part of the accessibility setup, not a per-dialog call.
- Use a browser-only setup path for SSR frameworks: `setAppElement()` needs access to the real DOM.
- Keep your React DOM types available: `react-modal` depends on normal React and browser DOM typing to type JSX and portal behavior correctly.

## Minimal Checklist

1. Install `react-modal` and `@types/react-modal`.
2. Enable JSX and DOM libraries in `tsconfig.json`.
3. Import `Modal` from `react-modal` with the import style your compiler supports.
4. Call `Modal.setAppElement()` for your app root.
5. Render `<Modal isOpen={...} onRequestClose={...} contentLabel="...">` in your React component.
