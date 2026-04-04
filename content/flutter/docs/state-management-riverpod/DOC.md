---
name: state-management-riverpod
description: "Flutter state management with Riverpod. Covers providers, consumers, refs, overrides, scoping, async state, code generation, and testing."
metadata:
  languages: "dart"
  versions: "3.2.1"
  revision: 1
  updated-on: "2026-04-04"
  source: official
  tags: "flutter,dart,riverpod,flutter_riverpod,providers,async,testing,codegen"
---

# Flutter State Management: Riverpod

## Version Scope

This doc is written for:

- Flutter `3.41.6` (stable)
- Dart `3.11.4` (bundled with Flutter 3.41.6)
- `flutter_riverpod` package `3.3.1`
- `riverpod` package `3.2.1`

This draft assumes Riverpod 3.x APIs. If your project uses a newer 3.x release, keep the same structure and update package versions in `pubspec.yaml`.

## Package Distinction: `riverpod` vs `flutter_riverpod`

The `riverpod` package provides the core provider system. The `flutter_riverpod` package adds Flutter widgets and integration helpers.

Use them like this:
- Dart-only project: add `riverpod`
- Flutter app: add `flutter_riverpod`
- If you use `flutter_riverpod`, you usually do not add `riverpod` separately because it comes through the Flutter package

## Choose the Right Primitive

Use these defaults:
- `Provider` for read-only dependencies and derived values
- `StateProvider` for simple mutable state
- `FutureProvider` for one-shot async loading
- `StreamProvider` for reactive streams
- `Notifier` or `AsyncNotifier` for feature state and mutations
- `StateNotifier` only if you are maintaining legacy Riverpod 1.x style or a codebase that already uses it

## Install Dependencies

For a Flutter app using Riverpod:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^3.3.1
```

If you use code generation, add these too:

```yaml
dependencies:
  riverpod_annotation: ^4.0.2

dev_dependencies:
  build_runner: ^2.4.0
  riverpod_generator: ^4.0.3
```

Run:

```bash
flutter pub get
```

## ProviderScope and Consumer Widgets

Wrap the app in `ProviderScope` once at the root. Use `ConsumerWidget`, `Consumer`, or `ConsumerStatefulWidget` to read providers.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final greetingProvider = Provider<String>((ref) => 'Hello Riverpod');

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: HomePage());
  }
}

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final greeting = ref.watch(greetingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Riverpod')),
      body: Center(
        child: Text(greeting),
      ),
    );
  }
}
```

## Simple Mutable State with StateProvider

Use `StateProvider` for small local state.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final countProvider = StateProvider<int>((ref) => 0);

class CounterPage extends ConsumerWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(countProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Text('Count: $count', style: const TextStyle(fontSize: 28)),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ref.read(countProvider.notifier).state++;
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

## Async Data with FutureProvider

Use `FutureProvider` when the state is loading/data/error.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final todosProvider = FutureProvider<List<String>>((ref) async {
  await Future.delayed(const Duration(seconds: 1));
  return ['Buy milk', 'Write docs', 'Review PR'];
});

class TodosPage extends ConsumerWidget {
  const TodosPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todosAsync = ref.watch(todosProvider);

    return todosAsync.when(
      data: (todos) => ListView.builder(
        itemCount: todos.length,
        itemBuilder: (context, index) => ListTile(title: Text(todos[index])),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => Center(child: Text('Error: $error')),
    );
  }
}
```

## StreamProvider for Live Updates

Use `StreamProvider` for realtime data.

```dart
final clockProvider = StreamProvider<DateTime>((ref) async* {
  while (true) {
    yield DateTime.now();
    await Future.delayed(const Duration(seconds: 1));
  }
});
```

## family for Parameterized State

Use `.family` when the provider depends on an argument.

```dart
final userProvider = FutureProvider.family<Map<String, dynamic>, int>(
  (ref, userId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      'id': userId,
      'name': 'User $userId',
    };
  },
);

class UserPage extends ConsumerWidget {
  final int userId;

  const UserPage({super.key, required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProvider(userId));

    return userAsync.when(
      data: (user) => Text('Name: ${user['name']}'),
      loading: () => const CircularProgressIndicator(),
      error: (error, stackTrace) => Text('Error: $error'),
    );
  }
}
```

## autoDispose for Short-Lived State

Use `autoDispose` for search screens, transient requests, or state that should reset when unused.

```dart
final searchResultsProvider = FutureProvider.autoDispose<List<String>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 300));
  return ['Result A', 'Result B'];
});
```

Use `ref.keepAlive()` only when you explicitly want to keep the state cached.

## refs and Containers

Use `Ref` inside providers and `WidgetRef` in Flutter widgets. Use `ProviderContainer` in non-UI code or tests.

```dart
final apiBaseUrlProvider = Provider<String>((ref) => 'https://api.example.com');

final apiClientProvider = Provider<ApiClient>((ref) {
  final baseUrl = ref.watch(apiBaseUrlProvider);
  return ApiClient(baseUrl: baseUrl);
});

class ApiClient {
  final String baseUrl;
  ApiClient({required this.baseUrl});
}
```

`ProviderContainer` is the headless equivalent of a widget tree.

## Mutations and Imperative Updates

Use `Notifier` or `AsyncNotifier` when a feature needs mutation methods.

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final counterProvider = NotifierProvider<Counter, int>(Counter.new);

class Counter extends Notifier<int> {
  @override
  int build() => 0;

  void increment() {
    state++;
  }

  void decrement() {
    state--;
  }
}
```

For async mutation flows, use `AsyncNotifier` and expose loading/error states through `AsyncValue`.

## Overrides and Scoping

Use overrides for testing, previews, and environment-specific configuration.

```dart
final container = ProviderContainer(
  overrides: [
    apiBaseUrlProvider.overrideWithValue('https://mock.example.com'),
  ],
);

final value = container.read(apiBaseUrlProvider);
```

Use scoped providers when different parts of the tree need different values.

## select for Rebuild Control

Use `select` when only one field should trigger rebuilds.

```dart
final profileProvider = Provider<Profile>((ref) => Profile(name: 'Ada', age: 30));

class Profile {
  final String name;
  final int age;
  Profile({required this.name, required this.age});
}

class ProfileName extends ConsumerWidget {
  const ProfileName({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(profileProvider.select((profile) => profile.name));
    return Text(name);
  }
}
```

## Eager Initialization and Refresh

Use `ref.read(provider.future)` or `ref.refresh(provider)` when you need to prefetch or reload data.

```dart
class RefreshButton extends ConsumerWidget {
  const RefreshButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ElevatedButton(
      onPressed: () {
        ref.refresh(todosProvider);
      },
      child: const Text('Refresh'),
    );
  }
}
```

## Pull to Refresh and Cancel

For pull-to-refresh, call `ref.refresh(provider)` from the refresh handler.
For cancellation, use `autoDispose` so unused requests are disposed, or structure async work so it stops when the provider is disposed.

## Offline and Retry

Use provider overrides and cached state to model offline-first behavior. Use retry logic in the data layer, not inside the UI.

## Testing Riverpod Code

Test providers with `ProviderContainer` and overrides.

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  test('counterProvider increments', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    expect(container.read(counterProvider), 0);
    container.read(counterProvider.notifier).increment();
    expect(container.read(counterProvider), 1);
  });
}
```

Use provider overrides to isolate dependencies and assert side effects separately.

## Code Generation

Use `@riverpod` when you want generated providers and less boilerplate.

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'counter.g.dart';

@riverpod
int counter(CounterRef ref) {
  return 0;
}
```

Generated providers are useful when you want type-safe naming, auto-dispose defaults, and a consistent provider style.

## Pitfalls and Safe Defaults

- Do not call `ref.watch` inside callbacks; use `ref.read` there.
- Do not skip `ProviderScope` at the root.
- Do not use `StateProvider` for large feature state.
- Do not rebuild the whole widget tree when one field changes; use `select`.
- Do not put business logic in widgets.
- Do not model async loading manually if `FutureProvider` or `AsyncNotifier` fits.
- Do not reach for `Notifier` if a simple `Provider` or `StateProvider` is enough.

## References

- [Getting Started](https://riverpod.dev/docs/introduction/getting_started)
- [Providers](https://riverpod.dev/docs/concepts2/providers)
- [Consumers](https://riverpod.dev/docs/concepts2/consumers)
- [Containers](https://riverpod.dev/docs/concepts2/containers)
- [Refs](https://riverpod.dev/docs/concepts2/refs)
- [Auto Dispose](https://riverpod.dev/docs/concepts2/auto_dispose)
- [Family](https://riverpod.dev/docs/concepts2/family)
- [Mutations](https://riverpod.dev/docs/concepts2/mutations)
- [Testing](https://riverpod.dev/docs/how_to/testing)
- [Select](https://riverpod.dev/docs/how_to/select)
- [Code Generation](https://riverpod.dev/docs/concepts/about_code_generation)
