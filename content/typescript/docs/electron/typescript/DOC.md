---
name: electron
description: "TypeScript setup for Electron apps. `@types/electron@1.6.12` is the legacy DefinitelyTyped package; current projects should install `electron` and use its bundled declarations."
metadata:
  languages: "typescript"
  versions: "1.6.12"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,electron,desktop,nodejs,types,definitelytyped"
---

# Electron TypeScript Guide

## Golden Rule

`@types/electron@1.6.12` is a legacy package entry, not the package most current Electron apps should add.

The npm package page for `@types/electron` says Electron provides its own type definitions. In practice, install `electron`, import both runtime APIs and TypeScript types from `"electron"`, and remove `@types/electron` from modern projects.

Keep `@types/electron` only when you are maintaining an older codebase that is intentionally pinned to a historical Electron toolchain.

## Install

For a current Electron TypeScript project, install the Electron runtime plus your normal TypeScript and Node.js toolchain:

```bash
npm install -D electron typescript @types/node
```

If your project still lists the old DefinitelyTyped package directly, remove it:

```bash
npm uninstall @types/electron
```

If you are maintaining a legacy branch that still depends on the historical package entry, pin that package explicitly:

```bash
npm install -D @types/electron@1.6.12
```

There are no package-specific environment variables, credentials, or client objects to initialize.

## Initialization

The important setup points are your compiler configuration, your import style, and the boundary between Electron's main process, preload script, and renderer code.

### Recommended `tsconfig.json`

For a Node-based Electron main process or preload script, a practical baseline is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If your project explicitly restricts ambient type packages with `compilerOptions.types` and you still rely on the legacy `@types/electron` package, include `electron` there as well:

```json
{
  "compilerOptions": {
    "types": ["node", "electron"]
  }
}
```

Import from `"electron"`, not from `"@types/electron"`.

## Common Workflows

### Create a typed main-process window

Import both runtime values and types from `electron` and keep your browser-window options typed instead of redefining them locally.

```ts
import { app, BrowserWindow, type BrowserWindowConstructorOptions } from "electron";
import { join } from "node:path";

let mainWindow: BrowserWindow | null = null;

async function createMainWindow(): Promise<void> {
  const windowOptions: BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  mainWindow = new BrowserWindow(windowOptions);
  await mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  void createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
```

This keeps the runtime API and the option types in sync with the Electron package you actually ship.

### Share typed IPC contracts between main and preload

Keep channel names and payload types in a shared module, then use Electron's typed IPC APIs from both sides of the boundary.

```ts
export type Settings = {
  theme: "light" | "dark";
};

export const settingsChannel = "settings:read";
```

```ts
import { ipcMain, type IpcMainInvokeEvent } from "electron";

import { settingsChannel, type Settings } from "./shared/settings";

ipcMain.handle(
  settingsChannel,
  async (_event: IpcMainInvokeEvent): Promise<Settings> => {
    return { theme: "dark" };
  },
);
```

```ts
import { contextBridge, ipcRenderer } from "electron";

import { settingsChannel, type Settings } from "./shared/settings";

export type SettingsApi = {
  read(): Promise<Settings>;
};

const settingsApi: SettingsApi = {
  read: () => ipcRenderer.invoke(settingsChannel) as Promise<Settings>,
};

contextBridge.exposeInMainWorld("settings", settingsApi);

declare global {
  interface Window {
    settings: SettingsApi;
  }
}
```

This is the most practical TypeScript pattern for Electron apps that use `contextIsolation` and do not expose Node APIs directly to the renderer.

### Use the preload API from the renderer with a typed `window` surface

Once the preload script exposes a typed object, renderer code can consume it without `any` casts.

```ts
type Settings = {
  theme: "light" | "dark";
};

async function applyTheme(): Promise<void> {
  const settings: Settings = await window.settings.read();
  document.documentElement.dataset.theme = settings.theme;
}

void applyTheme();
```

The `Window` augmentation belongs in the preload-facing type layer for your app, not in ad hoc renderer assertions.

## Important Pitfalls

- `@types/electron` only affects TypeScript. It does not install or run Electron itself.
- For current Electron versions, do not keep `@types/electron` installed next to `electron` unless you intentionally need that legacy setup; duplicate or conflicting declarations are the common failure mode.
- Import values and types from `electron`, not from `@types/electron`.
- If you use `compilerOptions.types`, remember that the legacy package is filtered out unless `electron` is listed there.
- Main-process and preload code usually need Node.js types in addition to Electron types. Renderer code usually also needs DOM libs.
- Keep shared IPC payload types in one module so the main process, preload script, and renderer stay aligned.

## Version-Sensitive Notes

- This guide targets the `@types/electron` package entry at version `1.6.12`.
- The npm package entry is a legacy path. For new work, the important package is `electron`, because that package provides the runtime and its own declarations.
- If you are maintaining a truly old Electron codebase, check the matching Electron API documentation before copying newer patterns. APIs such as `contextBridge` and `ipcMain.handle` are modern Electron patterns, not universal across the oldest releases.

## Official Sources

- npm package page for `@types/electron`: https://www.npmjs.com/package/@types/electron
- DefinitelyTyped source for `@types/electron`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/electron
- Electron TypeScript documentation: https://www.electronjs.org/docs/latest/tutorial/typescript
- Electron `app` API: https://www.electronjs.org/docs/latest/api/app
- Electron `BrowserWindow` API: https://www.electronjs.org/docs/latest/api/browser-window
- Electron `contextBridge` API: https://www.electronjs.org/docs/latest/api/context-bridge
- Electron `ipcMain` API: https://www.electronjs.org/docs/latest/api/ipc-main
