---
name: react-beautiful-dnd
description: "TypeScript declarations for react-beautiful-dnd components, render-prop helpers, and drag responder types used to build typed drag-and-drop lists in React."
metadata:
  languages: "typescript"
  versions: "13.1.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,drag-and-drop,types,definitelytyped"
---

# react-beautiful-dnd TypeScript Guide

## Golden Rule

Install `@types/react-beautiful-dnd` for type checking, but import both components and types from `react-beautiful-dnd` in application code.

`@types/react-beautiful-dnd` does not provide drag-and-drop behavior by itself. It supplies declarations for the runtime package's public API, including `DragDropContext`, `Droppable`, `Draggable`, `DropResult`, and the render-prop helper types.

## Install

Install the runtime package plus React, then add the declaration package to your TypeScript dev dependencies:

```bash
npm install react react-dom react-beautiful-dnd
npm install -D typescript @types/react @types/react-dom @types/react-beautiful-dnd
```

If your project already has TypeScript and the React type packages, add only the drag-and-drop pieces:

```bash
npm install react-beautiful-dnd
npm install -D @types/react-beautiful-dnd
```

Import from the runtime module:

```ts
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { DropResult, DraggableProvided, DroppableProvided } from "react-beautiful-dnd";
```

Do not import from `@types/react-beautiful-dnd` in application code.

## Initialization

There is no client object, authentication step, or package-specific environment variable.

The setup work is a normal React + TypeScript project plus the correct module imports.

### Practical `tsconfig.json`

If you already have a working React TypeScript config, no package-specific compiler flag is required. A practical baseline looks like this:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If your app uses a different module setup such as `NodeNext`, keep that existing project configuration. The important boundary is that your code imports from `"react-beautiful-dnd"` and that TypeScript can see the installed declaration package.

## Common Workflows

### Type `onDragEnd` and reorder a list

The most common TypeScript workflow is typing the `onDragEnd` callback with `DropResult` and guarding against a missing destination.

```tsx
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";

type Task = {
  id: string;
  content: string;
};

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const next = [...list];
  const [moved] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, moved);
  return next;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task-1", content: "Write guide" },
    { id: "task-2", content: "Review reorder logic" },
    { id: "task-3", content: "Ship changes" },
  ]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setTasks((current) => reorder(current, source.index, destination.index));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps}>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {task.content}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

### Type drag lifecycle responders

When you need more than `onDragEnd`, use the responder types exported by the same runtime module.

```tsx
import { DragDropContext } from "react-beautiful-dnd";
import type {
  DragStart,
  DragUpdate,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";

const onDragStart = (start: DragStart, provided: ResponderProvided) => {
  console.log("starting", start.draggableId, provided);
};

const onDragUpdate = (update: DragUpdate) => {
  console.log("updating", update.destination);
};

const onDragEnd = (result: DropResult) => {
  console.log("finished", result.reason);
};

export function Board() {
  return (
    <DragDropContext
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >
      <div />
    </DragDropContext>
  );
}
```

These types are useful when you want callback signatures in shared helpers, test utilities, or custom hooks.

### Type extracted draggable and droppable render helpers

When you move JSX out of inline render-prop functions, import the provided and snapshot helper types explicitly.

```tsx
import type { ReactNode } from "react";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";

type Task = {
  id: string;
  content: string;
};

type TaskItemProps = {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

function TaskItem({ task, provided, snapshot }: TaskItemProps) {
  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-dragging={snapshot.isDragging}
    >
      {task.content}
    </li>
  );
}

type ColumnProps = {
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
  children: ReactNode;
};

function Column({ provided, snapshot, children }: ColumnProps) {
  return (
    <section
      ref={provided.innerRef}
      {...provided.droppableProps}
      data-dragging-over={snapshot.isDraggingOver}
    >
      {children}
      {provided.placeholder}
    </section>
  );
}
```

This keeps render-prop extraction strongly typed without reaching into internal declaration files.

## Important Pitfalls

- Install the runtime package `react-beautiful-dnd` as well as `@types/react-beautiful-dnd`; the type package alone does not add runtime behavior.
- Import from `react-beautiful-dnd`, not from `@types/react-beautiful-dnd`.
- Treat `result.destination` as optional in `onDragEnd`; a drop outside a valid destination should not try to reorder state.
- Keep `draggableId` and `droppableId` as strings, and pass a numeric `index` to each `Draggable`.
- Always attach `provided.innerRef` and spread the matching props on the DOM element that participates in dragging or dropping.
- Render `provided.placeholder` inside each droppable area so layout can update correctly while dragging.
- If TypeScript reports missing exports or mismatched prop types, verify that the installed `react-beautiful-dnd` runtime package matches the declaration package you added.

## Version Note For `@types/react-beautiful-dnd` 13.1.8

This guide tracks the declaration package version `13.1.8`.

For application code, the practical import surface is still the runtime package `react-beautiful-dnd`. Install that package, import from that module path, and use `@types/react-beautiful-dnd` only to supply TypeScript declarations.
