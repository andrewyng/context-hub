---
name: riverpod
description: "Use when working with Flutter Riverpod state management. Covers providers, consumers, refs, containers, overrides, async state, code generation, testing, and safe defaults."
metadata:
  revision: 1
  updated-on: "2026-04-04"
  source: official
  tags: "flutter,dart,riverpod,flutter_riverpod,providers,async,testing,codegen"
---

# Flutter Riverpod State Management

Use this skill when building Flutter state management with `riverpod` and `flutter_riverpod`.

## Core Rule

- Use `Provider` for read-only values and dependency wiring.
- Use `StateProvider` for small mutable state.
- Use `FutureProvider` for one-shot async loading.
- Use `StreamProvider` for reactive streams.
- Use `Notifier` or `AsyncNotifier` for feature state that needs mutation methods.
- Use `autoDispose` for short-lived state.
- Use `family` when provider output depends on an argument.
- Use `flutter_riverpod` in Flutter apps.
- If you use `flutter_riverpod`, you usually do not add `riverpod` separately because the Flutter package brings it in transitively.
- Current stable line is Riverpod 3.x (`riverpod` 3.2.1, `flutter_riverpod` 3.3.1).

## Decision Guide

Choose Riverpod when:
- you want provider-based dependency injection and reactive state in one model
- state should be derived from other providers
- async data is a major part of the feature
- test overrides and scoped state matter
- you want fewer classes than a Bloc-heavy approach

Choose a different pattern when:
- the feature is a tiny local state toggle and a simple widget would be enough
- the logic is better expressed as an explicit event machine

## Required Project Setup

For Dart-only code:
- add `riverpod`

For Flutter UI code:
- add `flutter_riverpod`
- wrap the app in `ProviderScope`
- use `ConsumerWidget`, `Consumer`, or `ConsumerStatefulWidget` where `ref` is needed

If code generation is used:
- add `riverpod_annotation`
- add `riverpod_generator`
- add `build_runner`

## Implementation Pattern

Prefer this structure:
- providers own state, dependencies, and derived values
- repositories and APIs stay outside widgets
- UI reads state with `ref.watch`
- UI performs imperative reads with `ref.read`
- container-level overrides are used for tests, demos, and environment-specific wiring

Keep providers small and composable.
Keep state immutable unless the provider type is specifically meant for mutation.
Keep feature logic in providers or notifiers, not in widgets.

## Lifecycle Rules

- Use `autoDispose` for short-lived screens and transient queries.
- Use `ref.keepAlive()` only when you want cached state to survive temporarily.
- Prefer provider disposal over manual cleanup.
- In tests and pure Dart code, dispose `ProviderContainer` when finished.

## UI Binding Rules

Use `ConsumerWidget` when the whole widget depends on providers.
Use `Consumer` when only a small subtree needs access to `ref`.
Use `ConsumerStatefulWidget` when you need widget lifecycle plus `ref`.
Use `select` to reduce rebuilds.
Use `ProviderListener` or `ref.listen` for side effects.

## Testing Rules

- Test providers through `ProviderContainer`.
- Override dependencies instead of mocking provider internals.
- Assert `AsyncValue` states directly for async providers.
- Dispose containers in tests.

## Common Pitfalls

- Do not call `ref.watch` inside callbacks; use `ref.read` there.
- Do not skip `ProviderScope` at the app root.
- Do not use `StateProvider` for large feature state.
- Do not put business logic in widgets.
- Do not rebuild the whole tree when a single field changes; use `select`.
- Do not model async loading manually when `FutureProvider` or `AsyncNotifier` fits.
- Do not forget provider overrides for tests and previews.

## What To Prefer In Answers

When writing code or advising on design:
- show the smallest working provider first
- mention whether `ProviderScope` is required
- mention whether the provider should be `autoDispose` or cached
- mention whether a `family` is needed for arguments
- include test override notes when dependencies are external
- keep examples aligned with the current Riverpod docs and Flutter integration patterns
- if code generation is involved, prefer matching `riverpod_annotation` / `riverpod_generator` versions from the same 3.x release line

## Minimal Reference Checklist

- `ProviderScope` = app root setup
- `ref.watch` = rebuild on change
- `ref.read` = imperative access
- `select` = narrower rebuilds
- `autoDispose` = short-lived state
- `family` = parameterized provider
- `ProviderContainer` = test/headless container
