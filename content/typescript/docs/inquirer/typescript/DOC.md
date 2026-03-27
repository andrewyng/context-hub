---
name: inquirer
description: "TypeScript setup for Inquirer. `@types/inquirer@9.0.9` is a stub package; install `inquirer` itself because it ships its own type definitions."
metadata:
  languages: "typescript"
  versions: "9.0.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,inquirer,cli,prompts,types,definitelytyped"
---

# Inquirer TypeScript Guide

## Golden Rule

`@types/inquirer@9.0.9` is not the package you should install for a modern Inquirer application.

The npm package page for `@types/inquirer` marks it as a stub package and says that `inquirer` provides its own type definitions. Install the real `inquirer` runtime package and import both runtime APIs and TypeScript types from `inquirer`.

If an older project still has `@types/inquirer` in its lockfile, remove it unless that project is intentionally pinned to an older Inquirer setup that still depended on DefinitelyTyped declarations.

## Install

Install the runtime package plus the normal TypeScript toolchain for a Node.js CLI or terminal app:

```bash
npm install inquirer
npm install -D typescript @types/node
```

If your project already added the old stub package, remove it:

```bash
npm uninstall @types/inquirer
```

There are no package-specific credentials, auth steps, or environment variables. The practical setup points are your TypeScript compiler and how you type the answers returned by `inquirer.prompt()`.

## Initialization

Use a Node-aware TypeScript config so the compiler understands the runtime environment around your prompts.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

`@types/node` matters in CLI code because prompt scripts commonly use `process`, `stdin`, `stdout`, and other Node globals around Inquirer.

## Common Workflows

### Prompt for a typed answer object

Pass a TypeScript interface to `inquirer.prompt<Answers>()` so the returned answers object has the shape your application expects.

```ts
import inquirer from "inquirer";

interface InitAnswers {
  projectName: string;
  useTypeScript: boolean;
}

const answers = await inquirer.prompt<InitAnswers>([
  {
    type: "input",
    name: "projectName",
    message: "Project name?",
  },
  {
    type: "confirm",
    name: "useTypeScript",
    message: "Use TypeScript?",
    default: true,
  },
]);

console.log(answers.projectName);
console.log(answers.useTypeScript);
```

This is the main TypeScript boundary for Inquirer: define the answer shape once, then let `prompt()` return that typed object.

### Use literal unions for constrained answers

When a prompt should only return a small set of known values, model that field with a union type in your answers interface.

```ts
import inquirer from "inquirer";

type PackageManager = "npm" | "pnpm" | "yarn";

interface SetupAnswers {
  packageManager: PackageManager;
  initializeGit: boolean;
}

const answers = await inquirer.prompt<SetupAnswers>([
  {
    type: "list",
    name: "packageManager",
    message: "Package manager?",
    choices: ["npm", "pnpm", "yarn"],
    default: "npm",
  },
  {
    type: "confirm",
    name: "initializeGit",
    message: "Initialize a Git repository?",
    default: true,
  },
]);

if (answers.packageManager === "pnpm") {
  console.log("Run pnpm install after scaffolding");
}
```

This keeps downstream branching logic typed instead of falling back to unstructured string handling.

### Wrap prompts in a reusable helper

Return a typed promise from your prompt helper so the rest of your CLI code can work with a stable answer shape.

```ts
import inquirer from "inquirer";

interface CreateAppAnswers {
  appName: string;
  installDependencies: boolean;
}

export async function askCreateAppQuestions(): Promise<CreateAppAnswers> {
  return inquirer.prompt<CreateAppAnswers>([
    {
      type: "input",
      name: "appName",
      message: "App name?",
    },
    {
      type: "confirm",
      name: "installDependencies",
      message: "Install dependencies now?",
      default: true,
    },
  ]);
}
```

This is usually cleaner than threading loosely typed answer objects through multiple setup steps.

## Important Pitfalls

- Do not import from `@types/inquirer`; import from `inquirer`.
- Do not keep both `inquirer` and `@types/inquirer` installed in a modern project unless you are intentionally maintaining an older setup.
- `@types/inquirer` does not include the runtime prompt implementation. You still need the real `inquirer` package.
- The active type surface now comes from the `inquirer` version in your application, not from DefinitelyTyped.
- Add `@types/node` for CLI projects so surrounding Node.js globals are typed cleanly.

## Version-Sensitive Notes

- This guide targets `@types/inquirer==9.0.9`.
- `@types/inquirer@9.0.9` is a stub package; the runtime package you actually use is `inquirer`.

## Official Sources

- https://www.npmjs.com/package/@types/inquirer
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/inquirer
- https://www.npmjs.com/package/inquirer
- https://github.com/SBoudrias/Inquirer.js
