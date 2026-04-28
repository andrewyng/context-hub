---
name: bloc-cubit
description: "Use when working with Flutter Bloc/Cubit state management. Covers when to choose Bloc vs Cubit, how to use bloc and flutter_bloc together, lifecycle, testing, and safe defaults."
metadata:
  revision: 1
  updated-on: "2026-04-04"
  source: official
  tags: "flutter,dart,bloc,cubit,flutter_bloc,state-management,testing,architecture"
---

# Flutter Bloc/Cubit State Management

Use this skill when building Flutter state management with `bloc` and `flutter_bloc`.

## Core Rule

- Use `Cubit` for simple, direct state updates.
- Use `Bloc` for event-driven flows, transitions, and replayable business logic.
- Use `bloc` in Dart-only projects.
- Use `flutter_bloc` in Flutter apps when you need widgets like `BlocProvider`, `BlocBuilder`, or `BlocListener`.
- If you install `flutter_bloc`, you do not need to add `bloc` separately in a Flutter app because `flutter_bloc` depends on it.

## Decision Guide

Choose `Cubit` when:
- state changes are simple method calls
- you do not need events
- the feature is local and low complexity
- examples include counters, toggles, filters, form flags, and theme mode

Choose `Bloc` when:
- user actions should be modeled as explicit events
- the flow has loading, success, and failure transitions
- the logic benefits from clear state machines
- examples include auth, pagination, checkout, sync, and multi-step workflows

## Required Project Setup

For Dart-only code:
- add `bloc`
- do not add `flutter_bloc` unless Flutter widgets are needed

For Flutter UI code:
- add `flutter_bloc`
- let it bring `bloc` transitively
- use `BlocProvider` at the feature boundary
- use `BlocBuilder` for rebuilds and `BlocListener` for side effects

## Implementation Pattern

Prefer this structure:
- repository or service owns I/O
- bloc/cubit owns state and orchestration
- UI only dispatches actions and renders state

Keep state immutable.
Keep events explicit when using `Bloc`.
Keep one bloc or cubit per feature responsibility.

## Lifecycle Rules

- Close manually created blocs and cubits with `close()`.
- Do not manually close instances owned by `BlocProvider`.
- Use `BlocProvider` or `MultiBlocProvider` to let Flutter manage disposal.
- If you create a bloc/cubit with `new` or a constructor outside the widget tree, you own its lifecycle.

## UI Binding Rules

Use `BlocBuilder` when the widget should rebuild from state.
Use `BlocListener` when the widget should react without rebuilding.
Use `BlocConsumer` only when both are needed in one place.
Use `buildWhen` and `listenWhen` when rebuilds or listeners need narrowing.
Use `BlocSelector` when only one field should drive rebuilds.

## Testing Rules

- Test `Cubit` by calling methods and asserting emitted states.
- Test `Bloc` by adding events and asserting the transition sequence.
- Mock repositories at the boundary, not inside the bloc logic.
- Test side effects separately from rendering logic.

## Common Pitfalls

- Do not put network calls directly in widgets.
- Do not use `Bloc` for trivial local state.
- Do not add both `bloc` and `flutter_bloc` in a Flutter app when only `flutter_bloc` is needed.
- Do not forget `close()` for manually managed instances.
- Do not emit duplicate states unless the transition is meaningful.
- Do not let a single bloc grow into an app-wide dumping ground.

## What To Prefer In Answers

When writing code or advising on design:
- show the smallest working Bloc or Cubit first
- mention why Bloc or Cubit was chosen
- mention whether the dependency should be `bloc` or `flutter_bloc`
- include cleanup and testing notes if lifecycle is manual
- keep examples aligned with the current Flutter state management docs and the bloc package docs

## Minimal Reference Checklist

- `bloc` = core logic package
- `flutter_bloc` = Flutter UI integration package
- `Cubit` = method-based updates
- `Bloc` = event-based transitions
- manual creation = manual `close()`
- provider-owned instance = no manual `close()`
