---
name: key-value
description: "Redis JavaScript client (node-redis) for key-value storage, caching, and pub/sub messaging"
metadata:
  languages: "javascript"
  versions: "6.0.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "redis,database,cache,key-value,pubsub"
---

# Redis JavaScript Client (node-redis) - Complete Integration Guide

## Golden Rule

Use the official `redis` npm package (node-redis). The current `latest` dist-tag on npm is `6.0.0`. The package ships its own TypeScript definitions; do not depend on `@types/redis`.

```bash
npm install redis@6
```

Do not use `ioredis`, `redis-node`, or other unofficial clients unless your team has explicitly chosen one.

## Install And Environment

```bash
npm install redis@6
```

`.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0
REDIS_URL=redis://default:your_password_here@localhost:6379
```

```bash
npm install dotenv
```

## Initialization

### Basic connect

```javascript
import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

await client.connect();

// ...use the client

await client.quit();
```

`createClient()` returns an instance; commands work only after `await client.connect()`. `client.on('error', ...)` is required — without an error handler, an error event from a disconnected socket can crash the process.

### From a URL

```javascript
import { createClient } from 'redis';
import 'dotenv/config';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));
await client.connect();
```

### From explicit socket options

```javascript
import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  database: Number(process.env.REDIS_DB) || 0,
});

client.on('error', (err) => console.error('Redis Client Error', err));
await client.connect();
```

### Authentication

```javascript
const client = createClient({
  url: 'redis://alice:foobared@redis.example.com:6380',
});

// equivalent socket form
const clientAlt = createClient({
  socket: { host: 'redis.example.com', port: 6380 },
  username: 'alice',
  password: 'foobared',
});
```

### TLS

```javascript
import { createClient } from 'redis';
import fs from 'node:fs';

const client = createClient({
  socket: {
    host: 'redis.example.com',
    port: 6380,
    tls: true,
    key: fs.readFileSync('/path/to/client-key.pem'),
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    ca: [fs.readFileSync('/path/to/ca-cert.pem')],
  },
});

await client.connect();
```

### Connection state

```javascript
if (client.isReady) { /* commands can run */ }
if (client.isOpen)  { /* socket is open */ }
```

### Duplicate (required for pub/sub)

```javascript
const subscriber = client.duplicate();
await subscriber.connect();
```

### Shutdown

```javascript
await client.quit();        // graceful: drain pending commands, then close
await client.disconnect();  // immediate close
```

## Strings

```javascript
await client.set('key', 'value');
const value = await client.get('key');

await client.set('session:123', 'user_data', { EX: 3600 });   // seconds
await client.set('temp:key', 'value', { PX: 5000 });          // milliseconds
await client.set('key', 'value', { NX: true });
await client.set('key', 'new_value', { XX: true });
const oldValue = await client.set('key', 'new_value', { GET: true });

await client.mSet({ key1: 'value1', key2: 'value2' });
const values = await client.mGet(['key1', 'key2']);

await client.set('counter', 0);
await client.incr('counter');
await client.incrBy('counter', 10);
await client.incrByFloat('price', 2.5);
await client.decr('counter');
await client.decrBy('counter', 5);

await client.append('message', ' World');
await client.getRange('message', 0, 4);
await client.strLen('message');
await client.setRange('message', 6, 'Redis');
```

## Hashes

```javascript
await client.hSet('user:1000', 'name', 'John Doe');
const name = await client.hGet('user:1000', 'name');

await client.hSet('user:1000', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});

const user = await client.hGetAll('user:1000');

await client.hExists('user:1000', 'email');
await client.hKeys('user:1000');
await client.hVals('user:1000');
await client.hLen('user:1000');
await client.hmGet('user:1000', ['name', 'email']);
await client.hDel('user:1000', 'age');
await client.hIncrBy('user:1000', 'loginCount', 1);
await client.hIncrByFloat('user:1000', 'balance', 10.50);
await client.hSetNX('user:1000', 'created', String(Date.now()));

for await (const { field, value } of client.hScanIterator('user:1000')) {
  console.log(field, value);
}
```

## Lists

```javascript
await client.rPush('tasks', 'task1');
await client.rPush('tasks', ['task2', 'task3']);
await client.lPush('tasks', 'urgent_task');

await client.lLen('tasks');
await client.lRange('tasks', 0, -1);
await client.lIndex('tasks', 0);
await client.rPop('tasks');
await client.lPop('tasks');

await client.blPop('tasks', 10);     // wait up to 10s
await client.brPop('tasks', 10);

await client.lSet('tasks', 0, 'updated_task');
await client.lInsert('tasks', 'BEFORE', 'task2', 'new_task');
await client.lRem('tasks', 0, 'task3');
await client.lTrim('tasks', 0, 9);
await client.lMove('source', 'destination', 'LEFT', 'RIGHT');
await client.blMove('source', 'destination', 'RIGHT', 'LEFT', 5);
```

## Sets

```javascript
await client.sAdd('tags', 'javascript');
await client.sAdd('tags', ['nodejs', 'redis', 'database']);

await client.sIsMember('tags', 'nodejs');
await client.sMembers('tags');
await client.sCard('tags');
await client.sRem('tags', ['nodejs', 'redis']);
await client.sPop('tags');
await client.sRandMember('tags');
await client.sRandMemberCount('tags', 3);

await client.sUnion(['set1', 'set2']);
await client.sUnionStore('result', ['set1', 'set2']);
await client.sInter(['set1', 'set2']);
await client.sInterStore('result', ['set1', 'set2']);
await client.sDiff(['set1', 'set2']);
await client.sDiffStore('result', ['set1', 'set2']);
await client.sMove('set1', 'set2', 'a');

for await (const member of client.sScanIterator('tags')) {
  console.log(member);
}
```

## Sorted Sets

```javascript
await client.zAdd('leaderboard', { score: 100, value: 'player1' });
await client.zAdd('leaderboard', [
  { score: 200, value: 'player2' },
  { score: 150, value: 'player3' },
]);

await client.zRank('leaderboard', 'player1');
await client.zRevRank('leaderboard', 'player2');
await client.zScore('leaderboard', 'player2');
await client.zCard('leaderboard');
await client.zIncrBy('leaderboard', 50, 'player1');

await client.zRange('leaderboard', 0, 2);
await client.zRangeWithScores('leaderboard', 0, 2);
await client.zRangeByScore('leaderboard', 100, 200, {
  LIMIT: { offset: 0, count: 10 },
});

await client.zCount('leaderboard', 100, 200);
await client.zRem('leaderboard', ['player2', 'player3']);
await client.zRemRangeByRank('leaderboard', 0, 1);
await client.zRemRangeByScore('leaderboard', 0, 100);

await client.zPopMax('leaderboard');
await client.zPopMin('leaderboard');
await client.bzPopMax('leaderboard', 5);

await client.zUnionStore('result', ['set1', 'set2'], { WEIGHTS: [2, 3] });
await client.zInterStore('result', ['set1', 'set2'], { AGGREGATE: 'SUM' });

for await (const member of client.zScanIterator('leaderboard')) {
  console.log(member);
}
```

## Key Management

```javascript
await client.exists('mykey');
await client.exists(['key1', 'key2']);
await client.del('mykey');
await client.del(['key1', 'key2', 'key3']);

await client.expire('mykey', 60);
await client.expireAt('mykey', Math.floor(Date.now() / 1000) + 3600);
await client.pExpire('mykey', 60_000);
await client.ttl('mykey');     // -1 no TTL, -2 missing
await client.pTtl('mykey');
await client.persist('mykey');

await client.rename('oldkey', 'newkey');
await client.renameNX('oldkey', 'newkey');
await client.type('mykey');
await client.randomKey();
```

### Scanning

```javascript
for await (const key of client.scanIterator({ MATCH: 'user:*', COUNT: 100 })) {
  console.log(key);
}

for await (const key of client.scanIterator({ TYPE: 'string', COUNT: 100 })) {
  console.log(key);
}
```

Use `scanIterator` instead of `keys` in production.

## Transactions And Pipelining

### `MULTI / EXEC`

```javascript
const results = await client
  .multi()
  .set('key', 'value')
  .get('another-key')
  .incr('counter')
  .exec();

console.log(results); // ['OK', 'another-value', 1]
```

### Per-command error handling

```javascript
const results = await client.multi()
  .set('key1', 'value1')
  .incr('not-a-number')
  .get('key1')
  .exec();

results.forEach((result, i) => {
  if (result instanceof Error) {
    console.error(`Command ${i} failed:`, result.message);
  } else {
    console.log(`Command ${i} result:`, result);
  }
});
```

### `WATCH` optimistic locking

```javascript
await client.watch('balance');
const balance = parseInt(await client.get('balance') ?? '0', 10);

if (balance >= 100) {
  const results = await client
    .multi()
    .decrBy('balance', 100)
    .incrBy('purchases', 1)
    .exec();

  if (results === null) {
    console.log('Transaction aborted - balance was modified');
  }
} else {
  await client.unwatch();
}
```

### Automatic batching

Commands queued in the same tick are pipelined automatically:

```javascript
const [a, b, c] = await Promise.all([
  client.set('key1', 'value1'),
  client.set('key2', 'value2'),
  client.get('key1'),
]);
```

### Manual pipeline without transaction semantics

```javascript
const results = await client
  .multi()
  .set('key1', 'value1')
  .set('key2', 'value2')
  .mGet(['key1', 'key2'])
  .exec();
```

## Pub/Sub

Pub/sub commands run on a dedicated connection. Use `client.duplicate()` for the subscriber and keep the original client for `publish`.

```javascript
import { createClient } from 'redis';

const client = createClient();
client.on('error', (err) => console.error('Redis Client Error', err));
await client.connect();

const subscriber = client.duplicate();
subscriber.on('error', (err) => console.error('Subscriber Error', err));
await subscriber.connect();

await subscriber.subscribe('notifications', (message) => {
  console.log('Received message:', message);
});

await client.publish('notifications', 'Hello, World!');
```

### Multiple channels

```javascript
await subscriber.subscribe('channel1', (m) => console.log('1:', m));
await subscriber.subscribe('channel2', (m) => console.log('2:', m));
```

### Pattern subscription

```javascript
await subscriber.pSubscribe('user:*', (message, channel) => {
  console.log(`Message from ${channel}:`, message);
});

await client.publish('user:1000', 'User 1000 logged in');
```

### Unsubscribe

```javascript
await subscriber.unsubscribe('channel1');
await subscriber.unsubscribe();
await subscriber.pUnsubscribe('user:*');
```

## Streams

```javascript
const id = await client.xAdd('events', '*', {
  user: 'alice',
  action: 'login',
  timestamp: String(Date.now()),
});

await client.xAdd('events', '*', { user: 'charlie' }, {
  TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: 1000 },
});

const messages = await client.xRead(
  { key: 'events', id: '0' },
  { COUNT: 10 },
);

await client.xRead(
  { key: 'events', id: '$' },
  { BLOCK: 5000 },
);

await client.xRange('events', '-', '+', { COUNT: 100 });
await client.xRevRange('events', '+', '-', { COUNT: 10 });
await client.xLen('events');
await client.xInfo('events');

try {
  await client.xGroupCreate('events', 'processors', '0', { MKSTREAM: true });
} catch (_err) {
  // group already exists
}

const consumed = await client.xReadGroup(
  'processors', 'consumer1',
  { key: 'events', id: '>' },
  { COUNT: 10, BLOCK: 5000 },
);

for (const stream of consumed ?? []) {
  for (const message of stream.messages) {
    // process...
    await client.xAck('events', 'processors', message.id);
  }
}

await client.xDel('events', [id]);
await client.xTrim('events', 'MAXLEN', 1000);
```

## Lua Scripts

```javascript
const result = await client.eval(
  `return redis.call('SET', KEYS[1], ARGV[1])`,
  { keys: ['mykey'], arguments: ['myvalue'] },
);

const sha = await client.scriptLoad(`return redis.call('GET', KEYS[1])`);
const value = await client.evalSha(sha, { keys: ['mykey'], arguments: [] });
```

Rate limiting:

```javascript
const rateLimitScript = `
  local current = redis.call('INCR', KEYS[1])
  if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
  if current > tonumber(ARGV[1]) then return 0 else return 1 end
`;

async function isAllowed(userId, limit = 10, window = 60) {
  const allowed = await client.eval(rateLimitScript, {
    keys: [`ratelimit:${userId}`],
    arguments: [String(limit), String(window)],
  });
  return allowed === 1;
}
```

## Optional Modules

The following sections require Redis Stack or the relevant server-side module to be installed and enabled.

### JSON (RedisJSON)

```javascript
await client.json.set('user:1', '$', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  tags: ['developer', 'redis'],
});

const user = await client.json.get('user:1');
const name = await client.json.get('user:1', { path: '$.name' });

await client.json.set('user:1', '$.email', '"new@example.com"');
await client.json.del('user:1', '$.age');

await client.json.arrAppend('user:1', '$.tags', '"javascript"');
await client.json.arrLen('user:1', '$.tags');
await client.json.arrPop('user:1', '$.tags', -1);

await client.json.numIncrBy('user:1', '$.loginCount', 1);
```

### Time Series

```javascript
await client.ts.create('temperature:sensor1', {
  RETENTION: 86_400_000,
  LABELS: { sensor: 'temp', location: 'room1' },
});

await client.ts.add('temperature:sensor1', '*', 22.5);
await client.ts.mAdd([
  { key: 'temperature:sensor1', timestamp: '*', value: 22.8 },
  { key: 'temperature:sensor2', timestamp: '*', value: 21.5 },
]);

await client.ts.range('temperature:sensor1', '-', '+', {
  AGGREGATION: { type: 'AVG', timeBucket: 3_600_000 },
});

await client.ts.get('temperature:sensor1');
```

### Search (RediSearch)

```javascript
await client.ft.create('idx:users', {
  '$.name':  { type: 'TEXT',    AS: 'name' },
  '$.age':   { type: 'NUMERIC', AS: 'age' },
  '$.email': { type: 'TAG',     AS: 'email' },
}, { ON: 'JSON', PREFIX: 'user:' });

await client.ft.search('idx:users', 'John');
await client.ft.search('idx:users', '@age:[25 35]');
```

## Geospatial

```javascript
await client.geoAdd('locations', {
  longitude: -122.4194, latitude: 37.7749, member: 'San Francisco',
});

await client.geoAdd('locations', [
  { longitude: -118.2437, latitude: 34.0522, member: 'Los Angeles' },
  { longitude: -73.9352,  latitude: 40.7306, member: 'New York' },
]);

await client.geoPos('locations', 'San Francisco');
await client.geoDist('locations', 'San Francisco', 'Los Angeles', 'mi');

await client.geoRadius('locations',
  { longitude: -122.4194, latitude: 37.7749 }, 500, 'mi');

await client.geoRadiusByMember(
  'locations', 'San Francisco', 600, 'mi',
  { WITHDIST: true, WITHCOORD: true },
);
```

## HyperLogLog And Bitmaps

```javascript
await client.pfAdd('unique:visitors', ['user1', 'user2', 'user3']);
await client.pfCount('unique:visitors');
await client.pfMerge('combined', ['unique:day1', 'unique:day2']);

await client.setBit('login:2026-05-29', 100, 1);
await client.getBit('login:2026-05-29', 100);
await client.bitCount('login:2026-05-29');
await client.bitOp('AND', 'result', ['bitmap1', 'bitmap2']);
await client.bitPos('login:2026-05-29', 1);
```

## Server, Database, And Client Management

```javascript
await client.info();
await client.info('memory');
await client.ping();
await client.time();

await client.select(1);
await client.dbSize();
await client.flushDb();
await client.flushAll();
await client.save();
await client.bgSave();
await client.lastSave();

await client.clientList();
await client.clientId();
await client.clientSetName('my-app');
await client.clientGetName();
await client.clientInfo();
```

## Error Handling And Reconnection

```javascript
import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Max retries reached');
      return Math.min(retries * 100, 3000);
    },
  },
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connected'));
client.on('reconnecting', () => console.log('Reconnecting...'));
client.on('ready', () => console.log('Ready'));

await client.connect();
```

`client.on('error', ...)` must be registered before `connect()` to avoid unhandled error events.

## Cluster

```javascript
import { createCluster } from 'redis';

const cluster = createCluster({
  rootNodes: [
    { url: 'redis://localhost:7000' },
    { url: 'redis://localhost:7001' },
    { url: 'redis://localhost:7002' },
  ],
});

cluster.on('error', (err) => console.error('Cluster error:', err));
await cluster.connect();

await cluster.set('key', 'value');
await cluster.get('key');

await cluster.quit();
```

## Complete Application Example

```javascript
import { createClient } from 'redis';
import 'dotenv/config';

class RedisManager {
  constructor() {
    this.client = null;
  }

  async connect() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
  }

  async cacheGet(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async cacheSet(key, value, ttl = 3600) {
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async invalidate(pattern) {
    const keys = [];
    for await (const key of this.client.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async trackActivity(userId, action) {
    const key = `activity:${userId}:${new Date().toISOString().split('T')[0]}`;
    await this.client.rPush(key, JSON.stringify({ action, ts: Date.now() }));
    await this.client.expire(key, 86400 * 7);
  }

  async addToLeaderboard(userId, score) {
    await this.client.zAdd('leaderboard', { score, value: userId });
  }

  async leaderboardTop(count = 10) {
    const results = await this.client.zRangeWithScores(
      'leaderboard', 0, count - 1, { REV: true },
    );
    return results.map(({ value, score }) => ({ userId: value, score }));
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
  }
}

const redis = new RedisManager();
await redis.connect();

await redis.cacheSet('user:1000', { name: 'John', email: 'john@example.com' });
console.log(await redis.cacheGet('user:1000'));

await redis.trackActivity('user:1000', 'login');

await redis.addToLeaderboard('user:1000', 500);
await redis.addToLeaderboard('user:2000', 750);
console.log(await redis.leaderboardTop(3));

await redis.disconnect();
```

## Common Pitfalls

- You must `await client.connect()` before issuing commands; `createClient()` alone doesn't open the socket.
- You must attach `client.on('error', ...)` before `connect()`; otherwise socket errors crash the process.
- Pub/sub needs a dedicated connection — use `client.duplicate()` for subscribers.
- Commands queued in the same tick are pipelined automatically; you don't need `multi()` just to batch.
- Use `scanIterator` (not `keys`) in production.
- JSON, Search, and TimeSeries commands depend on Redis Stack or those modules being installed server-side.
- When upgrading from node-redis v4, watch for renamed command options and the consolidated `socket` configuration.

## Version Notes

- `redis` npm `6.0.0` is the current `latest` dist-tag.
- v4 maintenance releases are still published under the `maintenance-v4` tag (`4.7.1`).
- TypeScript types ship with the package; do not install `@types/redis`.
- npm: https://www.npmjs.com/package/redis.
- Docs: https://github.com/redis/node-redis.
