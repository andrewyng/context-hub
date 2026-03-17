# WeRedis C/C++ Client - Detailed Guide

WeRedis C/C++ Client is based on hiredis, providing native Redis protocol support.

## Build

```bash
mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX=. ..
make && make install
```

Output:
- Libraries: `${CMAKE_INSTALL_PREFIX}/build/lib/`
- Headers: `${CMAKE_INSTALL_PREFIX}/build/include/`

## Linking

### Dynamic Linking
```bash
$(CC) simple_example.c -o app-shared \
    -I../build/include \
    -I../build/include/weredis \
    -I../build/include/hiredis \
    -I../build/include/cjson \
    -L../build/lib \
    -lweredis -lhiredis -lcurl -lcjson -levent
```

### Static Linking
```bash
$(CC) simple_example.c -o app-static \
    -I../build/include \
    -I../build/include/weredis \
    -I../build/include/hiredis \
    -I../build/include/cjson \
    -L../build/lib \
    -Wl,-Bstatic -lweredis -lhiredis -lcjson -levent \
    -Wl,-Bdynamic -lpthread -lcurl -lcrypto -lssl
```

## Header Files

```c
#include "proxy_redis_client.h"  // WeRedis client API
#include "hiredis.h"             // hiredis native API
```

## Key Structures

### `redisClientConfig`
Configuration structure for client initialization:

```c
typedef struct {
    const char *cluster_name;      // Required: cluster name
    const char *username;          // Required: UM account
    const char *password;          // Required: password
    const char *ob_domain;         // Required: Observer URL

    const char *init_server;       // Optional: fallback proxy list
    int active_num;                // Optional: pool size (default 32, max 32)
    int connect_timeout;           // Optional: connect timeout ms (default 2000)
    int so_timeout;                // Optional: read timeout ms (default 2000)
    int borrow_wait_timeout;       // Optional: pool wait ms (default 2000)
    const char *log_file;          // Optional: log file (default stdout)
    int log_verb;                  // Optional: log level (default INFO)
} redisClientConfig;
```

### `proxyRedisClient`
Thread-safe client instance - maintains connection pool to the cluster.

### `redisContext`
Connection handle from hiredis - **NOT thread-safe**.

## Configuration Parameters

### Required

| Parameter | Description |
|-----------|-------------|
| `cluster_name` | Target cluster name |
| `username` | UM account (max 32 chars, no `:`) |
| `password` | Account password |
| `ob_domain` | Observer URL |

### Optional

| Parameter | Default | Description |
|-----------|---------|-------------|
| `init_server` | - | Fallback proxy list (e.g., "host1:port1,host2:port2") |
| `active_num` | 32 | Pool size (max 32) |
| `connect_timeout` | 2000 | Connection timeout (ms) |
| `so_timeout` | 2000 | Read timeout (ms) |
| `borrow_wait_timeout` | 2000 | Pool wait timeout (ms). -1=immediate, -2=infinite |
| `log_file` | stdout | Log output file |
| `log_verb` | INFO | Log level |

## Client Setup

### Basic Setup
```c
#include "proxy_redis_client.h"
#include "hiredis.h"

int main(int argc, char *argv[]) {
    redisClientConfig config = {
        .cluster_name = "your-cluster-name",
        .username = "your-username",
        .password = "your-password",
        .ob_domain = "http://10.107.117.44:19091",
    };

    proxyRedisClient *client = newRedisClient(&config);
    if (client == NULL) {
        fprintf(stderr, "Failed to create client\n");
        return -1;
    }

    // Use client...

    closeRedisClient(client);
    return 0;
}
```

### With Full Configuration
```c
redisClientConfig config = {
    .cluster_name = "your-cluster-name",
    .username = "your-username",
    .password = "your-password",
    .ob_domain = "http://10.107.117.44:19091",
    .init_server = "10.0.0.1:6379,10.0.0.2:6379",
    .active_num = 32,
    .connect_timeout = 3000,
    .so_timeout = 3000,
    .borrow_wait_timeout = 5000,
    .log_file = "/var/log/redis-client.log",
    .log_verb = 1,  // DEBUG
};
```

## Basic Usage

### Get Connection and Execute Commands
```c
// Get connection from pool
redisContext *ctx = getConnection(client);
if (ctx == NULL) {
    printf("Cannot get connection\n");
    return -1;
}

// Execute command
redisReply *reply = redisCommand(ctx, "SET key value");
if (reply == NULL) {
    printf("Command failed\n");
    returnConnection(client, ctx);
    return -1;
}

printf("Reply: %s\n", reply->str);
freeReplyObject(reply);

// Return connection to pool
returnConnection(client, ctx);
```

### String Operations
```c
// SET
redisReply *reply = redisCommand(ctx, "SET my_key my_value");
freeReplyObject(reply);

// SET with expiration
reply = redisCommand(ctx, "SETEX my_key 3600 my_value");
freeReplyObject(reply);

// GET
reply = redisCommand(ctx, "GET my_key");
if (reply->type == REDIS_REPLY_STRING) {
    printf("Value: %s\n", reply->str);
} else if (reply->type == REDIS_REPLY_NIL) {
    printf("Key not found\n");
}
freeReplyObject(reply);

// DEL
reply = redisCommand(ctx, "DEL my_key");
printf("Deleted %lld keys\n", reply->integer);
freeReplyObject(reply);
```

### Hash Operations
```c
// HSET
redisReply *reply = redisCommand(ctx, "HSET user:1 name Alice");
freeReplyObject(reply);

// HGET
reply = redisCommand(ctx, "HGET user:1 name");
if (reply->type == REDIS_REPLY_STRING) {
    printf("Name: %s\n", reply->str);
}
freeReplyObject(reply);

// HGETALL
reply = redisCommand(ctx, "HGETALL user:1");
if (reply->type == REDIS_REPLY_ARRAY) {
    for (size_t i = 0; i < reply->elements; i += 2) {
        printf("%s: %s\n",
               reply->element[i]->str,
               reply->element[i+1]->str);
    }
}
freeReplyObject(reply);
```

### List Operations
```c
// LPUSH
redisReply *reply = redisCommand(ctx, "LPUSH mylist item1 item2");
freeReplyObject(reply);

// RPOP
reply = redisCommand(ctx, "RPOP mylist");
if (reply->type == REDIS_REPLY_STRING) {
    printf("Popped: %s\n", reply->str);
}
freeReplyObject(reply);

// LRANGE
reply = redisCommand(ctx, "LRANGE mylist 0 -1");
if (reply->type == REDIS_REPLY_ARRAY) {
    for (size_t i = 0; i < reply->elements; i++) {
        printf("%zu: %s\n", i, reply->element[i]->str);
    }
}
freeReplyObject(reply);
```

### Using Formatted Commands
```c
// Safe string formatting
char *key = "user:123";
char *value = "Alice";
redisReply *reply = redisCommand(ctx, "SET %s %s", key, value);

// With integer
int ttl = 3600;
reply = redisCommand(ctx, "SETEX %s %d %s", key, ttl, value);

// With binary data (use %b)
char *data = "binary\0data";
size_t len = 10;
reply = redisCommand(ctx, "SET %s %b", key, data, len);
```

## Pipeline

Pipeline allows sending multiple commands without waiting for responses:

```c
// Append commands to pipeline
redisAppendCommand(ctx, "SET key1 value1");
redisAppendCommand(ctx, "SET key2 value2");
redisAppendCommand(ctx, "GET key1");
redisAppendCommand(ctx, "GET key2");

// Read responses in order
redisReply *reply;

redisGetReply(ctx, (void**)&reply);  // SET key1 response
printf("SET key1: %s\n", reply->str);
freeReplyObject(reply);

redisGetReply(ctx, (void**)&reply);  // SET key2 response
printf("SET key2: %s\n", reply->str);
freeReplyObject(reply);

redisGetReply(ctx, (void**)&reply);  // GET key1 response
printf("GET key1: %s\n", reply->str);
freeReplyObject(reply);

redisGetReply(ctx, (void**)&reply);  // GET key2 response
printf("GET key2: %s\n", reply->str);
freeReplyObject(reply);
```

## Blocking Commands

For blocking commands like BLPOP/BRPOP, use `redisBlockCommand` helper:

```c
// BLPOP with 5 second timeout
redisReply *reply = redisBlockCommand(ctx, "BLPOP my_queue 5");
if (reply != NULL && reply->type == REDIS_REPLY_ARRAY) {
    for (size_t i = 0; i < reply->elements; i++) {
        printf("%zu: %s\n", i, reply->element[i]->str);
    }
    freeReplyObject(reply);
}
```

The `redisBlockCommand` helper properly sets the socket timeout for blocking operations.

## Transaction (MULTI/EXEC)

```c
// Start transaction
redisReply *reply = redisCommand(ctx, "MULTI");
freeReplyObject(reply);

// Queue commands
redisCommand(ctx, "SET key1 value1");
redisCommand(ctx, "SET key2 value2");
redisCommand(ctx, "INCR counter");

// Execute transaction
reply = redisCommand(ctx, "EXEC");
if (reply->type == REDIS_REPLY_ARRAY) {
    // Process results
    for (size_t i = 0; i < reply->elements; i++) {
        printf("Result %zu: ", i);
        if (reply->element[i]->type == REDIS_REPLY_STRING) {
            printf("%s", reply->element[i]->str);
        } else if (reply->element[i]->type == REDIS_REPLY_INTEGER) {
            printf("%lld", reply->element[i]->integer);
        }
        printf("\n");
    }
}
freeReplyObject(reply);
```

## Reply Types

Check `reply->type` to handle different response types:

```c
switch (reply->type) {
    case REDIS_REPLY_STRING:
        printf("String: %s\n", reply->str);
        break;
    case REDIS_REPLY_INTEGER:
        printf("Integer: %lld\n", reply->integer);
        break;
    case REDIS_REPLY_NIL:
        printf("NULL\n");
        break;
    case REDIS_REPLY_ARRAY:
        for (size_t i = 0; i < reply->elements; i++) {
            // Process reply->element[i]
        }
        break;
    case REDIS_REPLY_STATUS:
        printf("Status: %s\n", reply->str);
        break;
    case REDIS_REPLY_ERROR:
        printf("Error: %s\n", reply->str);
        break;
}
```

## Thread Safety

### Important Rules

1. **`proxyRedisClient` is thread-safe**: Can be shared across threads
2. **`redisContext` is NOT thread-safe**: Each thread must get its own connection

### Multi-threaded Example
```c
void* worker_thread(void *arg) {
    proxyRedisClient *client = (proxyRedisClient *)arg;

    // Each thread gets its own connection
    redisContext *ctx = getConnection(client);
    if (ctx == NULL) {
        return NULL;
    }

    // Use connection
    redisReply *reply = redisCommand(ctx, "INCR counter");
    printf("Counter: %lld\n", reply->integer);
    freeReplyObject(reply);

    // Return connection
    returnConnection(client, ctx);
    return NULL;
}

int main() {
    proxyRedisClient *client = newRedisClient(&config);

    pthread_t threads[10];
    for (int i = 0; i < 10; i++) {
        pthread_create(&threads[i], NULL, worker_thread, client);
    }

    for (int i = 0; i < 10; i++) {
        pthread_join(threads[i], NULL);
    }

    closeRedisClient(client);
    return 0;
}
```

## Error Handling

```c
redisContext *ctx = getConnection(client);
if (ctx == NULL) {
    fprintf(stderr, "Failed to get connection from pool\n");
    return -1;
}

redisReply *reply = redisCommand(ctx, "GET key");
if (reply == NULL) {
    // Connection error
    fprintf(stderr, "Command failed: %s\n", ctx->errstr);
    returnConnection(client, ctx);
    return -1;
}

if (reply->type == REDIS_REPLY_ERROR) {
    fprintf(stderr, "Redis error: %s\n", reply->str);
    freeReplyObject(reply);
    returnConnection(client, ctx);
    return -1;
}

// Process successful reply...
freeReplyObject(reply);
returnConnection(client, ctx);
```

## Connection Pool Behavior

- `getConnection()` blocks if pool is empty (configurable via `borrow_wait_timeout`)
- `-1` timeout: return immediately with NULL if no connection
- `-2` timeout: wait indefinitely
- Default (2000ms): wait up to 2 seconds

```c
// Non-blocking get
redisClientConfig config = {
    // ...
    .borrow_wait_timeout = -1,  // Immediate return
};

redisContext *ctx = getConnection(client);
if (ctx == NULL) {
    // Pool exhausted, handle accordingly
}
```

## Best Practices

1. **Always free replies**: Call `freeReplyObject(reply)` after use
2. **Always return connections**: Call `returnConnection(client, ctx)` after use
3. **Check for NULL**: Both `getConnection` and `redisCommand` can return NULL
4. **Use pipeline**: For multiple commands, use pipeline to reduce round trips
5. **One connection per thread**: Don't share `redisContext` across threads
6. **Close on shutdown**: Call `closeRedisClient(client)` when done
