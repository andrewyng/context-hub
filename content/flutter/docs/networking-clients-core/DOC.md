---
name: networking-clients-core
description: "Flutter networking guide for HTTP requests, authenticated calls, CRUD patterns, WebSocket usage, and network debugging."
metadata:
  languages: "dart"
  versions: "3.41.6"
  revision: 1
  updated-on: "2026-04-04"
  source: official
  tags: "flutter,dart,networking,http,dio,websocket,devtools"
---

# Flutter Networking And HTTP Core Guide

## Version Scope

This doc is written for:

- Flutter `3.41.6` (stable)
- Dart `3.11.4` (bundled with Flutter 3.41.6)
- `http` package `1.6.0`
- `dio` package `5.9.2`
- `web_socket_channel` package `3.0.3`

If your project pins older versions, adjust API usage and dependency constraints accordingly.

## Choose One HTTP Client (Independent Usage)

`http` and `dio` are alternatives for HTTP calls. You can use either one independently.

- Use `http` for simpler REST flows.
- Use `dio` for interceptors, richer request config, and centralized error handling.
- Do not install both unless your project has a specific migration or mixed-client reason.

## Install Dependencies

Pick one HTTP client setup below.

Option A: `http` only

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: 1.6.0
  web_socket_channel: 3.0.3
```

Option B: `dio` only

```yaml
dependencies:
  flutter:
    sdk: flutter
  dio: 5.9.2
  web_socket_channel: 3.0.3
```

Then run:

```bash
flutter pub get
```

## Basic GET With http

Use `http` for straightforward REST calls.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class Todo {
  final int id;
  final String title;
  final bool completed;

  const Todo({
    required this.id,
    required this.title,
    required this.completed,
  });

  factory Todo.fromJson(Map<String, dynamic> json) {
    return Todo(
      id: json['id'] as int,
      title: json['title'] as String,
      completed: json['completed'] as bool,
    );
  }
}

Future<Todo> fetchTodo(http.Client client) async {
  final uri = Uri.parse('https://jsonplaceholder.typicode.com/todos/1');
  final response = await client.get(uri).timeout(const Duration(seconds: 10));

  if (response.statusCode != 200) {
    throw Exception('GET failed: ${response.statusCode}');
  }

  final map = jsonDecode(response.body) as Map<String, dynamic>;
  return Todo.fromJson(map);
}
```

## Authenticated Request

Set auth and content headers explicitly.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> fetchProfile({
  required http.Client client,
  required String token,
}) async {
  final uri = Uri.parse('https://api.example.com/profile');

  final response = await client.get(
    uri,
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );

  if (response.statusCode != 200) {
    throw Exception('Profile request failed: ${response.statusCode}');
  }

  return jsonDecode(response.body) as Map<String, dynamic>;
}
```

## Send, Update, Delete Data

Common CRUD flows with JSON payloads.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> createPost(http.Client client) async {
  final uri = Uri.parse('https://api.example.com/posts');

  final response = await client.post(
    uri,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'title': 'Hello', 'body': 'World'}),
  );

  if (response.statusCode != 201) {
    throw Exception('Create failed: ${response.statusCode}');
  }
}

Future<void> updatePost(http.Client client, int id) async {
  final uri = Uri.parse('https://api.example.com/posts/$id');

  final response = await client.put(
    uri,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'title': 'Updated title'}),
  );

  if (response.statusCode != 200) {
    throw Exception('Update failed: ${response.statusCode}');
  }
}

Future<void> deletePost(http.Client client, int id) async {
  final uri = Uri.parse('https://api.example.com/posts/$id');
  final response = await client.delete(uri);

  if (response.statusCode != 200 && response.statusCode != 204) {
    throw Exception('Delete failed: ${response.statusCode}');
  }
}
```

## When To Use Dio

Use `dio` when you choose `dio` as your single HTTP client and need interceptors, richer request options, or centralized error mapping.

```dart
import 'package:dio/dio.dart';

Dio buildApiClient(String token) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Authorization': 'Bearer $token'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onError: (error, handler) {
        handler.next(error);
      },
    ),
  );

  return dio;
}

Future<Map<String, dynamic>> fetchMe(Dio dio) async {
  final response = await dio.get('/me');
  return response.data as Map<String, dynamic>;
}
```

## WebSocket For Realtime

Use WebSocket for push updates such as chat, notifications, and live status.

```dart
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeClient {
  final WebSocketChannel channel;

  RealtimeClient(String url) : channel = WebSocketChannel.connect(Uri.parse(url));

  Stream<Map<String, dynamic>> messages() {
    return channel.stream.map((event) {
      return jsonDecode(event as String) as Map<String, dynamic>;
    });
  }

  void send(Map<String, dynamic> payload) {
    channel.sink.add(jsonEncode(payload));
  }

  void dispose() {
    channel.sink.close();
  }
}
```

## Debugging Network Calls In DevTools

Use Flutter DevTools Network view to inspect:

- request URL, method, and headers
- response status and timing
- payload size and sequence

Practical workflow:

1. Reproduce the failing screen or action.
2. Open the request in Network view.
3. Verify status code, headers, and body shape.
4. Match failures to app-side error handling.

## Pitfalls And Safe Defaults

- Reuse one client where practical; close it when no longer needed.
- Always set request timeouts.
- Check non-2xx responses before decoding.
- In widgets, guard post-await UI updates with `mounted` checks.
- Keep parsing typed and explicit.
- Avoid logging tokens or sensitive request payloads.

## References

- https://docs.flutter.dev/data-and-backend/networking
- https://docs.flutter.dev/cookbook/networking/fetch-data
- https://docs.flutter.dev/cookbook/networking/authenticated-requests
- https://docs.flutter.dev/cookbook/networking/send-data
- https://docs.flutter.dev/cookbook/networking/update-data
- https://docs.flutter.dev/cookbook/networking/delete-data
- https://docs.flutter.dev/cookbook/networking/web-sockets
- https://docs.flutter.dev/tools/devtools/network
- https://pub.dev/packages/http
- https://pub.dev/packages/dio
