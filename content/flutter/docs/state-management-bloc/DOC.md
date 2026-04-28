---
name: state-management-bloc
description: "Flutter state management using bloc and cubit patterns with flutter_bloc. Covers bloc vs cubit selection, event-driven architecture, listeners, and bloc testing."
metadata:
  languages: "dart"
  versions: "3.41.6"
  revision: 1
  updated-on: "2026-04-04"
  source: official
  tags: "flutter,dart,bloc,cubit,state-management,flutter_bloc,events,architecture"
---

# Flutter State Management: Bloc and Cubit

## Version Scope

This doc is written for:

- Flutter `3.41.6` (stable)
- Dart `3.11.4` (bundled with Flutter 3.41.6)
- `bloc` package `9.2.0`
- `flutter_bloc` package `9.1.1`

All examples follow this architecture. Adjust versions if using newer bloc releases, which maintain API compatibility within the 9.x series.

## Package Distinction: `bloc` vs `flutter_bloc`

The `bloc` package provides **core, framework-agnostic** state management logic (Bloc, Cubit, Event classes, state streams). The `flutter_bloc` package provides **Flutter-specific widgets and helpers** (BlocProvider, BlocBuilder, BlocListener, MultiBlocProvider).

**Use them based on your project type:**
- Dart-only project: add `bloc`
- Flutter app: add `flutter_bloc` and let it bring `bloc` transitively

In non-Flutter Dart projects, use `bloc` alone.

## Cubit vs Bloc: When to Use Each

**Cubit** — Simple state mutations with method calls (no external events):
- State changes via direct method calls (e.g., `cubit.increment()`)
- Fewer moving parts, suitable for simple features (theme toggle, counter, form state)
- Single responsibility: one cubit = one state source
- Preferred for 60% of UI state needs

**Bloc** — Event-driven state machine with explicit transitions:
- State changes via events (e.g., `bloc.add(LoginEvent(email, password))`)
- Clear event → processing → state flow (great for debugging)
- Recoverable: events can be replayed for state restoration
- Preferred for complex flows (authentication, data sync, undo/redo)

**Decision rule:**
- No events needed? → Use Cubit
- Events, state transitions, or replay? → Use Bloc

## Install Dependencies

Add the package that matches your project:

Option A: Dart-only project

```yaml
dependencies:
  bloc: ^9.2.0
```

Option B: Flutter app using Bloc widgets

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_bloc: ^9.1.1
```

Run:

```bash
flutter pub get
```

## Cubit: Direct State Mutations

Cubit emits state via method calls (no events). Use for simple state changes.

```dart
import 'package:bloc/bloc.dart';

// Define state
class CounterState {
  final int count;
  CounterState({required this.count});
  
  CounterState copyWith({int? count}) {
    return CounterState(count: count ?? this.count);
  }
}

// Cubit: state emission via methods
class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(CounterState(count: 0));

  void increment() {
    emit(state.copyWith(count: state.count + 1));
  }

  void decrement() {
    emit(state.copyWith(count: state.count - 1));
  }
}

// Use in Flutter
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => CounterCubit(),
      child: MaterialApp(
        home: const CounterPage(),
      ),
    );
  }
}

class CounterPage extends StatelessWidget {
  const CounterPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter (Cubit)')),
      body: Center(
        child: BlocBuilder<CounterCubit, CounterState>(
          builder: (context, state) {
            return Text(
              'Count: ${state.count}',
              style: const TextStyle(fontSize: 28),
            );
          },
        ),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () => context.read<CounterCubit>().increment(),
            child: const Icon(Icons.add),
          ),
          const SizedBox(width: 8),
          FloatingActionButton(
            onPressed: () => context.read<CounterCubit>().decrement(),
            child: const Icon(Icons.remove),
          ),
        ],
      ),
    );
  }
}
```

## Bloc: Event-Driven State Machine

Bloc emits state through events and explicit event handlers. Use for complex flows with state transitions.

```dart
import 'package:bloc/bloc.dart';

// Define event
abstract class AuthEvent {}

class LoginEvent extends AuthEvent {
  final String email;
  final String password;
  LoginEvent(this.email, this.password);
}

class LogoutEvent extends AuthEvent {}

// Define state
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthSuccess extends AuthState {
  final String userId;
  AuthSuccess(this.userId);
}

class AuthFailure extends AuthState {
  final String error;
  AuthFailure(this.error);
}

// Bloc: event-driven state transitions
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    // Register event handlers
    on<LoginEvent>((event, emit) async {
      emit(AuthLoading());
      
      try {
        // Simulate API call
        await Future.delayed(const Duration(seconds: 2));
        
        if (event.email.isEmpty || event.password.isEmpty) {
          emit(AuthFailure('Email and password required'));
        } else if (!event.email.contains('@')) {
          emit(AuthFailure('Invalid email format'));
        } else {
          emit(AuthSuccess('user_${event.email}'));
        }
      } catch (e) {
        emit(AuthFailure(e.toString()));
      }
    });

    on<LogoutEvent>((event, emit) {
      emit(AuthInitial());
    });
  }
}

// Use in Flutter
class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late TextEditingController emailController;
  late TextEditingController passwordController;

  @override
  void initState() {
    super.initState();
    emailController = TextEditingController();
    passwordController = TextEditingController();
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login (Bloc)')),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Logged in: ${state.userId}')),
            );
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.error}')),
            );
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: emailController,
                decoration: const InputDecoration(hintText: 'Email'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: passwordController,
                decoration: const InputDecoration(hintText: 'Password'),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthLoading) {
                    return const CircularProgressIndicator();
                  }
                  
                  return ElevatedButton(
                    onPressed: () {
                      context.read<AuthBloc>().add(
                        LoginEvent(
                          emailController.text,
                          passwordController.text,
                        ),
                      );
                    },
                    child: const Text('Login'),
                  );
                },
              ),
              if (context.read<AuthBloc>().state is AuthSuccess)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: ElevatedButton.icon(
                    onPressed: () {
                      context.read<AuthBloc>().add(LogoutEvent());
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Logout'),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## Bloc Lifecycle and Closing

Always close blocs and cubits when they are no longer needed to free resources:

```dart
// Bloc closes itself when disposed via BlocProvider
// Manual close when managing blocs directly:
final authBloc = AuthBloc();
// ... use bloc ...
await authBloc.close(); // Free event listener and close stream

// Using try-finally to ensure close:
final counterCubit = CounterCubit();
try {
  // Use cubit
} finally {
  await counterCubit.close();
}
```

## BlocListener for Side Effects

Use `BlocListener` for side effects (navigation, snackbars, analytics) that should not rebuild:

```dart
BlocListener<AuthBloc, AuthState>(
  listenWhen: (previous, current) {
    // Only listen to failure state changes
    return current is AuthFailure;
  },
  listener: (context, state) {
    if (state is AuthFailure) {
      // Show error snackbar
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.error)),
      );
    }
  },
  child: BlocBuilder<AuthBloc, AuthState>(
    builder: (context, state) {
      // Build UI based on state
      return const Text('UI');
    },
  ),
);
```

## MultiBlocProvider for Multiple State Sources

Provide multiple blocs at the same level to avoid deep nesting:

```dart
MultiBlocProvider(
  providers: [
    BlocProvider(create: (context) => AuthBloc()),
    BlocProvider(create: (context) => UserBloc()),
    BlocProvider(create: (context) => ThemeCubit()),
  ],
  child: MaterialApp(
    home: const HomePage(),
  ),
);
```

## Testing Blocs

Test blocs by adding events and asserting emitted states:

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CounterCubit', () {
    test('increments count', () async {
      final cubit = CounterCubit();
      
      await expectLater(
        cubit.stream,
        emits(isA<CounterState>().having(
          (state) => state.count,
          'count',
          1,
        )),
      );
      
      cubit.increment();
      await cubit.close();
    });
  });

  group('AuthBloc', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthSuccess] on LoginEvent',
      build: () => AuthBloc(),
      act: (bloc) => bloc.add(LoginEvent('test@example.com', 'password123')),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthSuccess>(),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthFailure] on invalid email',
      build: () => AuthBloc(),
      act: (bloc) => bloc.add(LoginEvent('invalid', 'password123')),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthFailure>(),
      ],
    );
  });
}
```

Add `bloc_test` to `pubspec.yaml` for testing utilities:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  bloc_test: ^9.1.0
```

## Pitfalls and Safe Defaults

- **Do not** emit state synchronously in event handlers — always use `emit()` which respects equality checks and prevents unnecessary rebuilds
- **Do not** forget to call `await bloc.close()` when manually managing blocs — use `BlocProvider` for automatic closure
- **Do not** use `context.read()` outside of `build` methods — use `context.watch()` in build, `context.read()` in event handlers
- **Do** use sealed classes (Dart 3.0+) for events and states to ensure exhaustive pattern matching
- **Do** add `equatable` mixin or override `==` and `hashCode` for state comparison (bloc uses `==` to skip duplicate emissions)
- **Do** test bloc/cubit side effects separately using `BlocListener` tests or mock dependencies

## References

- [Bloc Package](https://pub.dev/packages/bloc)
- [Flutter Bloc Package](https://pub.dev/packages/flutter_bloc)
- [Official Flutter State Management Guide](https://docs.flutter.dev/data-and-backend/state-mgmt/intro)
- [Bloc Package GitHub](https://github.com/felangel/bloc)
- [Flutter Bloc YouTube Intro](https://www.youtube.com/watch?v=hTExltbRoYs)
