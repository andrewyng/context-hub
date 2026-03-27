---
name: client
description: "Supabase Flutter/Dart SDK for mobile and desktop apps — authentication, database queries, realtime streams, and storage"
metadata:
  languages: "dart"
  versions: "2.9.0"
  revision: 1
  updated-on: "2026-03-12"
  source: community
  tags: "supabase,flutter,dart,sdk,database,auth,storage,realtime,mobile"
---
# Supabase Flutter/Dart SDK Coding Guidelines

You are a Supabase + Flutter coding expert. Help me write code using the `supabase_flutter` package, which provides Supabase integration for Flutter and Dart apps.

Official Dart SDK reference: https://supabase.com/docs/reference/dart/introduction

## Critical Differences from JavaScript SDK

**Do NOT translate JS patterns directly.** The Dart SDK has key differences:

- **Error handling**: Throws exceptions (`PostgrestException`, `AuthException`, `StorageException`) — does NOT return `{data, error}` objects
- **Initialization**: `await Supabase.initialize()` in `main()`, accessed via `Supabase.instance.client`
- **Realtime**: Use `.stream()` for Flutter `StreamBuilder` widgets; `.channel()` for pub/sub
- **Types**: Returns `List<Map<String, dynamic>>` for queries, not typed arrays
- **Async**: All operations are `Future<T>` — use `await` with `try/catch`

## Installation

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.9.0
```

## Initialization

**Initialize once in `main()` before `runApp()`:**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  runApp(const MyApp());
}

// Access the client anywhere in the app
final supabase = Supabase.instance.client;
```

**With additional options:**

```dart
await Supabase.initialize(
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  authOptions: const FlutterAuthClientOptions(
    authFlowType: AuthFlowType.pkce,
    autoRefreshToken: true,
  ),
  realtimeClientOptions: const RealtimeClientOptions(
    eventsPerSecond: 10,
  ),
  storageOptions: const StorageClientOptions(
    retryAttempts: 3,
  ),
);
```

## Authentication

### Sign Up

```dart
try {
  final AuthResponse response = await supabase.auth.signUp(
    email: 'user@example.com',
    password: 'secure-password',
    data: {'display_name': 'John'},  // optional user metadata
  );
  final User? user = response.user;
} on AuthException catch (e) {
  // Handle auth errors
  print('Auth error: ${e.message}');
}
```

### Sign In with Email/Password

```dart
try {
  final AuthResponse response = await supabase.auth.signInWithPassword(
    email: 'user@example.com',
    password: 'password',
  );
  final Session? session = response.session;
  final User? user = response.user;
} on AuthException catch (e) {
  print('Sign in failed: ${e.message}');
}
```

### Sign In with OAuth (Google, Apple, etc.)

```dart
// Opens browser/in-app browser for OAuth flow
await supabase.auth.signInWithOAuth(
  OAuthProvider.google,
  redirectTo: 'io.supabase.myapp://login-callback/',
  authScreenLaunchMode: LaunchMode.externalApplication,
);

// For Apple Sign In on iOS
await supabase.auth.signInWithApple();
```

### Sign In with OTP (Magic Link)

```dart
await supabase.auth.signInWithOtp(
  email: 'user@example.com',
  emailRedirectTo: 'io.supabase.myapp://login-callback/',
);

// Verify OTP token
await supabase.auth.verifyOTP(
  email: 'user@example.com',
  token: '123456',
  type: OtpType.email,
);
```

### Get Current User and Session

```dart
// Get current user (cached, synchronous)
final User? user = supabase.auth.currentUser;

// Get current session (cached, synchronous)
final Session? session = supabase.auth.currentSession;

// Refresh and get current session (async, checks server)
final AuthResponse response = await supabase.auth.refreshSession();
```

### Listen to Auth State Changes

```dart
// Use in initState or a service — always cancel subscription
late final StreamSubscription<AuthState> _authSubscription;

@override
void initState() {
  super.initState();
  _authSubscription = supabase.auth.onAuthStateChange.listen((data) {
    final AuthChangeEvent event = data.event;
    final Session? session = data.session;

    switch (event) {
      case AuthChangeEvent.signedIn:
        // Navigate to home
        break;
      case AuthChangeEvent.signedOut:
        // Navigate to login
        break;
      case AuthChangeEvent.tokenRefreshed:
        // Session refreshed
        break;
      default:
        break;
    }
  });
}

@override
void dispose() {
  _authSubscription.cancel();
  super.dispose();
}
```

### Sign Out

```dart
await supabase.auth.signOut();
```

### Update User

```dart
await supabase.auth.updateUser(
  UserAttributes(
    email: 'newemail@example.com',
    password: 'newpassword',
    data: {'display_name': 'New Name'},
  ),
);
```

### Password Reset

```dart
await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  redirectTo: 'io.supabase.myapp://reset-callback/',
);
```

## Database Queries

**Important**: Queries throw `PostgrestException` on error — always wrap in try/catch.

### Select

```dart
// Returns List<Map<String, dynamic>>
final List<Map<String, dynamic>> data = await supabase
    .from('posts')
    .select();

// Select specific columns
final data = await supabase
    .from('posts')
    .select('id, title, created_at');

// Select with foreign table (join)
final data = await supabase
    .from('posts')
    .select('id, title, author:profiles(id, username, avatar_url)');
```

### Filtering

```dart
// Equals
final data = await supabase
    .from('posts')
    .select()
    .eq('user_id', userId);

// Multiple filters (AND)
final data = await supabase
    .from('posts')
    .select()
    .eq('status', 'published')
    .gt('likes', 10);

// OR filter
final data = await supabase
    .from('posts')
    .select()
    .or('status.eq.published,status.eq.draft');

// In array
final data = await supabase
    .from('posts')
    .select()
    .inFilter('status', ['published', 'featured']);

// Null check
final data = await supabase
    .from('posts')
    .select()
    .isFilter('deleted_at', null);

// Text search (ILIKE)
final data = await supabase
    .from('posts')
    .select()
    .ilike('title', '%flutter%');

// Full-text search
final data = await supabase
    .from('posts')
    .select()
    .textSearch('content', 'supabase flutter');
```

### Ordering, Limiting, Pagination

```dart
// Order
final data = await supabase
    .from('posts')
    .select()
    .order('created_at', ascending: false);

// Limit
final data = await supabase
    .from('posts')
    .select()
    .limit(10);

// Pagination with range
final data = await supabase
    .from('posts')
    .select()
    .range(0, 9);   // page 1 (10 items)
```

### Single Row

```dart
// Throws if 0 or >1 rows — use when you expect exactly one result
final Map<String, dynamic> post = await supabase
    .from('posts')
    .select()
    .eq('id', postId)
    .single();

// Returns null if not found, throws if >1 row
final Map<String, dynamic>? post = await supabase
    .from('posts')
    .select()
    .eq('id', postId)
    .maybeSingle();
```

### Count

```dart
final PostgrestCountResponse response = await supabase
    .from('posts')
    .select()
    .count(CountOption.exact);

final int count = response.count;
```

### Insert

```dart
// Insert single row
await supabase.from('posts').insert({
  'title': 'Hello World',
  'body': 'My first post',
  'user_id': supabase.auth.currentUser!.id,
});

// Insert and return inserted row
final data = await supabase
    .from('posts')
    .insert({'title': 'Hello', 'user_id': userId})
    .select()
    .single();

// Insert multiple rows
await supabase.from('posts').insert([
  {'title': 'Post 1', 'user_id': userId},
  {'title': 'Post 2', 'user_id': userId},
]);
```

### Update

```dart
await supabase
    .from('posts')
    .update({'title': 'Updated Title', 'updated_at': DateTime.now().toIso8601String()})
    .eq('id', postId);

// Update and return
final data = await supabase
    .from('posts')
    .update({'title': 'Updated'})
    .eq('id', postId)
    .select()
    .single();
```

### Upsert

```dart
await supabase.from('profiles').upsert({
  'id': userId,
  'username': 'johndoe',
  'updated_at': DateTime.now().toIso8601String(),
});
```

### Delete

```dart
await supabase.from('posts').delete().eq('id', postId);

// Delete and return deleted row
final data = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .select()
    .single();
```

### RPC (Call Postgres Functions)

```dart
final data = await supabase.rpc('get_posts_near_location', params: {
  'lat': 37.7749,
  'lng': -122.4194,
  'radius_km': 10,
});
```

### Error Handling Pattern

```dart
try {
  final data = await supabase
      .from('posts')
      .select()
      .eq('user_id', userId);
  // use data
} on PostgrestException catch (e) {
  // Database/query errors
  print('DB error: ${e.message}, code: ${e.code}');
} on AuthException catch (e) {
  // Auth errors (e.g., accessing protected table while signed out)
  print('Auth error: ${e.message}');
} catch (e) {
  // Network or other errors
  print('Unexpected error: $e');
}
```

## Realtime

### Stream for Flutter Widgets (Recommended)

Use `.stream()` for reactive UI — returns a `Stream` suitable for `StreamBuilder`:

```dart
// Stream all rows, ordered by created_at
StreamBuilder<List<Map<String, dynamic>>>(
  stream: supabase
      .from('messages')
      .stream(primaryKey: ['id'])
      .order('created_at'),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const CircularProgressIndicator();
    final messages = snapshot.data!;
    return ListView.builder(
      itemCount: messages.length,
      itemBuilder: (context, index) => Text(messages[index]['content']),
    );
  },
);

// Stream filtered by column value
supabase
    .from('messages')
    .stream(primaryKey: ['id'])
    .eq('thread_id', threadId)
    .order('created_at', ascending: false)
    .limit(50);
```

### Channel-based Realtime (Pub/Sub)

Use for fine-grained control — subscribe to specific events:

```dart
// Subscribe to database changes
final channel = supabase
    .channel('public:posts')
    .onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'posts',
      callback: (PostgresChangePayload payload) {
        print('Change: ${payload.eventType}');
        print('New: ${payload.newRecord}');
        print('Old: ${payload.oldRecord}');
      },
    )
    .subscribe();

// Listen to only INSERT
supabase
    .channel('inserts')
    .onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'posts',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'user_id',
        value: userId,
      ),
      callback: (payload) => handleNewPost(payload.newRecord),
    )
    .subscribe();

// Always unsubscribe when done
await supabase.removeChannel(channel);
// Or remove all channels
await supabase.removeAllChannels();
```

### Broadcast (Real-time Messaging Between Clients)

```dart
final channel = supabase.channel('room-1');

// Send
channel.subscribe((status, error) async {
  if (status == RealtimeSubscribeStatus.subscribed) {
    await channel.sendBroadcastMessage(
      event: 'cursor-move',
      payload: {'x': 100, 'y': 200, 'user_id': userId},
    );
  }
});

// Receive
channel.onBroadcast(
  event: 'cursor-move',
  callback: (payload) => updateCursor(payload),
);
```

### Presence (Online Users)

```dart
final channel = supabase.channel('online-users');

channel
  .onPresenceSync((payload) {
    final state = channel.presenceState();
    print('Online: ${state.length} users');
  })
  .onPresenceJoin((payload) => print('${payload.newPresences} joined'))
  .onPresenceLeave((payload) => print('${payload.leftPresences} left'))
  .subscribe((_status, _error) async {
    await channel.track({'user_id': userId, 'online_at': DateTime.now().toIso8601String()});
  });
```

## Storage

```dart
// Upload from File
final File file = File('/path/to/image.jpg');
await supabase.storage.from('avatars').upload(
  'public/${userId}_avatar.jpg',
  file,
  fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
);

// Upload from bytes (Uint8List) — common in Flutter
final Uint8List bytes = await file.readAsBytes();
await supabase.storage.from('avatars').uploadBinary(
  'public/${userId}_avatar.jpg',
  bytes,
  fileOptions: const FileOptions(contentType: 'image/jpeg', upsert: true),
);

// Get public URL (for public buckets)
final String url = supabase.storage
    .from('avatars')
    .getPublicUrl('public/${userId}_avatar.jpg');

// Get public URL with image transform
final String thumbnailUrl = supabase.storage
    .from('avatars')
    .getPublicUrl(
      'public/${userId}_avatar.jpg',
      transform: const TransformOptions(width: 200, height: 200),
    );

// Create signed URL (for private buckets, expires in seconds)
final String signedUrl = await supabase.storage
    .from('private-files')
    .createSignedUrl('document.pdf', 3600);

// Download file
final Uint8List bytes = await supabase.storage
    .from('avatars')
    .download('public/${userId}_avatar.jpg');

// Delete files
await supabase.storage.from('avatars').remove(['path/file1.jpg', 'path/file2.jpg']);

// List files
final List<FileObject> files = await supabase.storage.from('avatars').list(
  path: 'public',
  searchOptions: const SearchOptions(limit: 100, sortBy: SortBy(column: 'name')),
);
```

## Edge Functions

```dart
final response = await supabase.functions.invoke(
  'send-push-notification',
  body: {'user_id': userId, 'message': 'Hello!'},
);
print(response.data);
```

## Useful Links

- Flutter SDK Reference: https://supabase.com/docs/reference/dart/introduction
- Flutter Quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/flutter
- Auth with Flutter: https://supabase.com/docs/guides/auth/flutter
- Realtime with Flutter: https://supabase.com/docs/guides/realtime/flutter
