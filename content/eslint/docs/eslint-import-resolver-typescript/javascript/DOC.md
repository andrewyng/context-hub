---
name: eslint-import-resolver-typescript
description: "JavaScript guide for eslint-import-resolver-typescript 4.4.4, covering flat config, legacy config, tsconfig selection, Bun support, and resolver behavior for TypeScript imports."
metadata:
  languages: "javascript"
  versions: "4.4.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "javascript,typescript,eslint,linting,imports,resolver"
---

# eslint-import-resolver-typescript JavaScript Guide

## Golden Rule

Use `eslint-import-resolver-typescript` with either `eslint-plugin-import` or `eslint-plugin-import-x`. This package is a resolver, not an ESLint plugin by itself.

Use it when you want import resolution rules to understand TypeScript files, `tsconfig.json` or `jsconfig.json` path mapping, package `imports` and `exports` fields, and `@types/*` packages.

## Install

`eslint-import-resolver-typescript@4.4.4` declares Node.js support for `^16.17.0 || >=18.6.0`.

Install it with the import plugin you actually use:

```bash
# eslint-plugin-import
npm install -D eslint eslint-plugin-import eslint-import-resolver-typescript

# or eslint-plugin-import-x
npm install -D eslint eslint-plugin-import-x eslint-import-resolver-typescript
```

If you still use legacy `.eslintrc*` config for TypeScript files, also install the parser used in the upstream example:

```bash
npm install -D @typescript-eslint/parser
```

This package does not use API keys, service accounts, runtime environment variables, or client initialization.

## Flat Config With `eslint-plugin-import-x`

If you are on `eslint-plugin-import-x@>=4.5.0`, you can import the resolver directly in `eslint.config.js`.

```js
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default [
  {
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: "packages/*/{ts,js}config.json",
        }),
      ],
    },
  },
];
```

Use `bun: true` in the resolver options when your code imports Bun built-ins such as `bun:test`.

If your repo has a single root `tsconfig.json` or `jsconfig.json`, omit `project` and the resolver uses the root config by default.

## Flat Config With `eslint-plugin-import`

If you use `eslint-plugin-import`, or an older `eslint-plugin-import-x`, configure the resolver through `settings["import/resolver"]` instead of importing it directly.

```js
export default [
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "packages/*/{ts,js}config.json",
        },
      },
    },
  },
];
```

The same option names apply here, including `bun` and `project`.

## Legacy `.eslintrc`

For legacy config, add the parser mapping and the resolver settings under `settings`.

```jsonc
{
  "plugins": ["import"],
  "rules": {
    "import/no-unresolved": "error"
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "packages/*/{ts,js}config.json"
      }
    }
  }
}
```

If your project only has one root `tsconfig.json` or `jsconfig.json`, remove `project` and let the resolver pick the root config automatically.

## Choosing `project`

The `project` option controls which TypeScript or JS config files the resolver reads.

- Omit it to use `<root>/tsconfig.json` or `<root>/jsconfig.json`.
- Set it to a folder such as `"apps/web"` to use that folder's `tsconfig.json` or `jsconfig.json`.
- Set it to a glob such as `"packages/*/{ts,js}config.json"` for monorepos.
- Set it to an array when different workspaces need different config files.

Examples:

```js
createTypeScriptImportResolver({ project: "apps/web" });

createTypeScriptImportResolver({
  project: [
    "packages/module-a/tsconfig.json",
    "packages/module-b/jsconfig.json",
  ],
});
```

The upstream README notes that multiple configs are useful for monorepos, but TypeScript `references` are preferred when available.

## Bun Support

Bun built-ins are not resolved by default.

Choose one of these upstream-documented approaches:

- Set `bun: true` in the resolver options.
- Run ESLint with `bun --bun eslint`.
- Enable `run.bun` in `bunfig.toml`.

Example:

```js
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default [
  {
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          bun: true,
        }),
      ],
    },
  },
];
```

## Resolver Options And Defaults

Resolver options are passed through to `unrs-resolver`. The README calls out these commonly adjusted keys:

- `conditionNames`
- `extensions`
- `extensionAlias`
- `mainFields`

Documented defaults that matter most in practice:

- `conditionNames` starts with `"types"` and `"import"`, then includes Node and browser conditions.
- `extensions` defaults to `.ts`, `.tsx`, `.d.ts`, `.js`, `.jsx`, `.json`, and `.node`.
- `mainFields` starts with `"types"` and `"typings"` before JavaScript entry fields such as `"module"` and `"main"`.

## Important Behavior And Pitfalls

After version `2.0.0`, the resolver prefers `.d.ts` over plain `.js` or `.jsx` files when resolving packages from `node_modules`. Upstream documents this as intentional so ESLint can prefer package typings or `@types/*` definitions.

If you see `import/default` or `import/named` behavior that looks wrong, the maintainer README points those issues to `eslint-plugin-import`, not to this resolver.

If you want the direct `createTypeScriptImportResolver(...)` import in flat config, use `eslint-plugin-import-x@>=4.5.0`. Otherwise, configure the resolver through `settings["import/resolver"]`.
