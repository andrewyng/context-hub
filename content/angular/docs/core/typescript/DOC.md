---
name: core
description: "Angular core runtime for standalone components, dependency injection, signals, and lifecycle APIs in TypeScript apps"
metadata:
  languages: "typescript"
  versions: "21.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "angular,typescript,ui,framework,signals,dependency-injection"
---

# Angular Core for TypeScript

`@angular/core` provides Angular's decorators, dependency injection, signals, lifecycle hooks, and application configuration types. For a browser app, pair it with `@angular/platform-browser`, and usually `@angular/common`.

## Install

For a new app, start with the Angular CLI:

```bash
npm create @angular@latest my-app
cd my-app
npm start
```

If you are wiring Angular manually, install the runtime packages plus the Angular compiler for builds:

```bash
npm install @angular/core @angular/common @angular/platform-browser rxjs zone.js
npm install -D @angular/compiler-cli typescript
```

`@angular/core` does not require package-specific environment variables.

## TypeScript and compiler setup

Angular templates are compiled by the Angular compiler. The Angular CLI already generates the required config. If you maintain your own build, keep TypeScript strict mode on and enable strict template checking:

```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```

Use `strictTemplates` to catch missing inputs, invalid event payloads, and nullable template bindings at build time.

## Bootstrap a standalone app

Angular applications are typically bootstrapped with a standalone root component.

`src/app/app.config.ts`:

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
};
```

`src/main.ts`:

```ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

If you use the Angular CLI defaults, `zone.js` is already configured for you. Keep the explicit import only in a manual setup that uses zone-based change detection.

## Create a standalone component with signals

Use `@Component` with `standalone: true`, and keep reactive state in signals.

`src/app/app.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { TodoItemComponent } from './todo-item.component';

type Todo = {
  id: number;
  label: string;
  done: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ title() }}</h1>
    <p>{{ remaining() }} remaining</p>

    <button type="button" (click)="addTodo()">Add item</button>

    @for (todo of todos(); track todo.id) {
      <app-todo-item
        [label]="todo.label"
        [done]="todo.done"
        (doneChange)="setDone(todo.id, $event)"
      />
    }
  `,
})
export class AppComponent {
  readonly title = signal('Angular Core example');

  readonly todos = signal<Todo[]>([
    { id: 1, label: 'Install Angular', done: true },
    { id: 2, label: 'Create a standalone component', done: false },
  ]);

  readonly remaining = computed(
    () => this.todos().filter((todo) => !todo.done).length,
  );

  addTodo(): void {
    this.todos.update((items) => [
      ...items,
      {
        id: items.length + 1,
        label: `Task ${items.length + 1}`,
        done: false,
      },
    ]);
  }

  setDone(id: number, done: boolean): void {
    this.todos.update((items) =>
      items.map((item) => (item.id === id ? { ...item, done } : item)),
    );
  }
}
```

`ChangeDetectionStrategy.OnPush` works well with signals and keeps updates predictable.

## Accept typed inputs and emit outputs

The `input()` and `output()` helpers keep component APIs strongly typed.

`src/app/todo-item.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="doneChange.emit(!done())">
      {{ done() ? '✓' : '○' }} {{ label() }}
    </button>
  `,
})
export class TodoItemComponent {
  readonly label = input.required<string>();
  readonly done = input(false);
  readonly doneChange = output<boolean>();
}
```

Use `input.required<T>()` when the parent must always bind a value. Read input signals in the template with `label()` and `done()`.

## Provide and inject services

Angular services are regular classes annotated with `@Injectable`. Use `inject()` in field initializers, constructors, or provider factories.

`src/app/timer.service.ts`:

```ts
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly destroyRef = inject(DestroyRef);

  readonly seconds = signal(0);

  constructor() {
    const timer = setInterval(() => {
      this.seconds.update((value) => value + 1);
    }, 1000);

    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
```

Inject the service from a component:

```ts
import { Component, inject } from '@angular/core';
import { TimerService } from './timer.service';

@Component({
  selector: 'app-clock',
  standalone: true,
  template: `<p>Seconds: {{ timer.seconds() }}</p>`,
})
export class ClockComponent {
  readonly timer = inject(TimerService);
}
```

## Common pitfalls

- `@angular/core` is not enough to render a browser app by itself; use it with `@angular/platform-browser`, and usually `@angular/common`.
- Standalone components must list every imported component, directive, and pipe in `imports`.
- Do not mutate objects or arrays stored in a signal in place. Call `.set()` or `.update()` with a new value.
- `inject()` only works inside an Angular injection context, such as a constructor, field initializer, or provider factory.
- Environment values exposed to browser code are public. Keep secrets on the server, not in Angular app config.
