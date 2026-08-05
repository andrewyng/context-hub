---
name: atlas
description: "MongoDB Node.js driver for interacting with MongoDB Atlas databases using the official JavaScript/TypeScript SDK."
metadata:
  languages: "javascript"
  versions: "7.2.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "mongodb,atlas,database,nosql,driver"
---

# MongoDB Atlas Coding Guidelines (JavaScript/TypeScript)

You are a MongoDB Atlas coding expert. Help me with writing code using the MongoDB Node.js driver, calling the official libraries and SDKs.

## Golden Rule: Use The Official Driver

Always use the official MongoDB Node.js driver for all MongoDB Atlas interactions.

- **Library name:** MongoDB Node.js Driver
- **NPM package:** `mongodb`
- **GitHub:** https://github.com/mongodb/node-mongodb-native
- **Current `latest` dist-tag (May 29, 2026):** `7.2.0`

```bash
npm install mongodb@7
```

When upgrading from `mongodb@6`, watch for changes around server selection, BSON imports, and removed legacy callback APIs.

### Import patterns

```javascript
// ES module (recommended)
import { MongoClient } from 'mongodb';

// CommonJS
const { MongoClient } = require('mongodb');

// Common utilities
import { MongoClient, ObjectId, Timestamp, ServerApiVersion } from 'mongodb';
```

### Do not use

- Deprecated MongoDB packages (`mongodb-core`, `mongodb-legacy` callback-style helpers unless you need them explicitly)
- Third-party MongoDB wrappers unless they are required by your team
- Connection patterns from driver v2/v3 (callbacks, `MongoClient.connect(url, cb)` factory style)

## Installation And Environment Setup

```bash
npm install mongodb@7
```

`.env` for an Atlas cluster:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Atlas connection strings use the `mongodb+srv://` scheme, which performs DNS SRV lookups against your cluster's seed host to discover replica set members and TLS settings.

```bash
npm install dotenv
```

```javascript
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
```

## Initialization And Connection

`MongoClient` is the entry point. Call `connect()` once per process and reuse the client; it manages an internal connection pool.

### Basic connect

```javascript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();

    const database = client.db('myDatabase');
    const collection = database.collection('myCollection');

    // ...operations
  } finally {
    await client.close();
  }
}

main().catch(console.error);
```

### Connect with Stable API options

```javascript
import { MongoClient, ServerApiVersion } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

await client.connect();
await client.db('admin').command({ ping: 1 });
```

### Reusable client (long-lived process)

```javascript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

## CRUD Operations

### Insert

```javascript
const database = client.db('sample_db');
const users = database.collection('users');

await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  createdAt: new Date(),
});

const result = await users.insertMany([
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob',   email: 'bob@example.com',   age: 32 },
]);

console.log(result.insertedCount, result.insertedIds);

await users.insertOne(
  { name: 'David', email: 'david@example.com' },
  { writeConcern: { w: 'majority', wtimeout: 5000 } },
);
```

### Find

```javascript
const users = client.db('sample_db').collection('users');

const allDocs = await users.find({}).toArray();
const adults = await users.find({ age: { $gt: 25 } }).toArray();
const one = await users.findOne({ email: 'john@example.com' });

const projected = await users
  .find({ age: { $gte: 25 } }, { projection: { _id: 0, name: 1, email: 1 } })
  .toArray();

const paged = await users
  .find({})
  .sort({ age: -1 })
  .skip(5)
  .limit(10)
  .toArray();
```

#### Offset pagination

```javascript
async function page(coll, pageNum = 1, pageSize = 10) {
  const documents = await coll
    .find({})
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  const total = await coll.countDocuments({});

  return {
    documents,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    totalDocuments: total,
  };
}
```

#### Cursor-based pagination (recommended at scale)

```javascript
async function pageByCursor(coll, lastId = null, pageSize = 10) {
  const query = lastId ? { _id: { $gt: lastId } } : {};

  const documents = await coll
    .find(query)
    .sort({ _id: 1 })
    .limit(pageSize)
    .toArray();

  return {
    documents,
    nextCursor: documents.length ? documents[documents.length - 1]._id : null,
  };
}
```

### Update

```javascript
const users = client.db('sample_db').collection('users');

await users.updateOne(
  { email: 'john@example.com' },
  { $set: { age: 31, updatedAt: new Date() } },
);

await users.updateMany(
  { age: { $lt: 30 } },
  { $set: { category: 'young', updatedAt: new Date() } },
);

await users.updateOne(
  { email: 'newuser@example.com' },
  {
    $set: {
      name: 'New User',
      email: 'newuser@example.com',
      createdAt: new Date(),
    },
  },
  { upsert: true },
);

await users.updateOne(
  { email: 'john@example.com' },
  {
    $set: { status: 'active' },
    $inc: { loginCount: 1 },
    $push: { tags: 'premium' },
    $currentDate: { lastModified: true },
  },
);

await users.replaceOne(
  { email: 'john@example.com' },
  {
    name: 'John Doe Updated',
    email: 'john@example.com',
    age: 31,
    status: 'active',
    updatedAt: new Date(),
  },
);

const after = await users.findOneAndUpdate(
  { email: 'john@example.com' },
  { $inc: { age: 1 } },
  { returnDocument: 'after' },
);
```

### Delete

```javascript
const users = client.db('sample_db').collection('users');

await users.deleteOne({ email: 'john@example.com' });
await users.deleteMany({ age: { $lt: 18 } });

const deleted = await users.findOneAndDelete(
  { email: 'john@example.com' },
  { sort: { createdAt: -1 } },
);
```

## Aggregation Pipeline

```javascript
const users = client.db('sample_db').collection('users');

const summary = await users.aggregate([
  { $match: { age: { $gte: 25 } } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgAge: { $avg: '$age' },
    },
  },
  { $sort: { count: -1 } },
]).toArray();
```

### Multi-stage report

```javascript
const orders = client.db('sample_db').collection('orders');

const monthly = await orders.aggregate([
  {
    $match: {
      status: 'completed',
      createdAt: { $gte: new Date('2026-01-01') },
    },
  },
  {
    $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      totalSales: { $sum: '$amount' },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: '$amount' },
    },
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
  {
    $project: {
      _id: 0,
      year: '$_id.year',
      month: '$_id.month',
      totalSales: 1,
      orderCount: 1,
      avgOrderValue: { $round: ['$avgOrderValue', 2] },
    },
  },
]).toArray();
```

### `$lookup` join

```javascript
const orders = client.db('sample_db').collection('orders');

const withUser = await orders.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails',
    },
  },
  { $unwind: '$userDetails' },
  {
    $project: {
      orderNumber: 1,
      amount: 1,
      userName: '$userDetails.name',
      userEmail: '$userDetails.email',
    },
  },
]).toArray();
```

### `$facet` for multiple pipelines

```javascript
const products = client.db('sample_db').collection('products');

const analytics = await products.aggregate([
  {
    $facet: {
      categoryCounts: [
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ],
      priceStats: [
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        },
      ],
      topProducts: [
        { $sort: { sales: -1 } },
        { $limit: 5 },
        { $project: { name: 1, sales: 1, price: 1 } },
      ],
    },
  },
]).toArray();
```

### Atlas Vector Search

Atlas exposes vector search as the `$vectorSearch` aggregation stage. Define a `vectorSearch` index in the Atlas UI or via the management API, then query it from the driver:

```javascript
const docs = client.db('sample_db').collection('docs');

const matches = await docs.aggregate([
  {
    $vectorSearch: {
      index: 'docs_embedding_index',
      path: 'embedding',
      queryVector: queryEmbedding,         // number[]
      numCandidates: 200,
      limit: 10,
      // optional pre-filter on indexed fields
      filter: { category: 'guide' },
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      score: { $meta: 'vectorSearchScore' },
    },
  },
]).toArray();
```

`$vectorSearch` requires an Atlas cluster with a vector search index defined for the queried path; it is not available on self-hosted MongoDB without Atlas Search.

## Indexes

```javascript
const users = client.db('sample_db').collection('users');

await users.createIndex({ email: 1 });
await users.createIndex({ lastName: 1, firstName: 1 });
await users.createIndex({ email: 1 }, { unique: true });

const articles = client.db('sample_db').collection('articles');
await articles.createIndex({ title: 'text', content: 'text' });

const search = await articles
  .find(
    { $text: { $search: 'mongodb tutorial' } },
    { projection: { score: { $meta: 'textScore' } } },
  )
  .sort({ score: { $meta: 'textScore' } })
  .toArray();

const locations = client.db('sample_db').collection('locations');
await locations.createIndex({ location: '2dsphere' });

const nearby = await locations.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [-73.9667, 40.78] },
      $maxDistance: 5000,
    },
  },
}).limit(10).toArray();

const within = await locations.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[
          [-74.0, 40.7], [-73.9, 40.7], [-73.9, 40.8], [-74.0, 40.8], [-74.0, 40.7],
        ]],
      },
    },
  },
}).toArray();

const indexes = await users.listIndexes().toArray();
await users.dropIndex('email_1');
```

## Bulk Write

```javascript
const users = client.db('sample_db').collection('users');

const result = await users.bulkWrite([
  { insertOne: { document: { name: 'User 1', email: 'user1@example.com' } } },
  {
    updateOne: {
      filter: { email: 'john@example.com' },
      update: { $set: { status: 'active' } },
    },
  },
  {
    updateMany: {
      filter: { age: { $lt: 25 } },
      update: { $set: { category: 'young' } },
    },
  },
  { deleteOne: { filter: { email: 'old@example.com' } } },
  {
    replaceOne: {
      filter: { email: 'replace@example.com' },
      replacement: { name: 'Replaced', email: 'replace@example.com', age: 40 },
    },
  },
]);

console.log(
  result.insertedCount,
  result.modifiedCount,
  result.deletedCount,
  result.upsertedCount,
);
```

Ordered (default) bulk writes stop at the first error. Unordered bulk writes continue and may run operations in parallel:

```javascript
await users.bulkWrite(operations, { ordered: false });
```

## Transactions

Transactions require a replica set or sharded cluster — Atlas provides both.

### `withTransaction` (recommended)

`withTransaction` handles commit retry on `TransientTransactionError` and `UnknownTransactionCommitResult` for you.

```javascript
async function transferFunds() {
  const session = client.startSession();
  try {
    const database = client.db('sample_db');

    const result = await session.withTransaction(async () => {
      const accounts = database.collection('accounts');
      const transactions = database.collection('transactions');

      await accounts.updateOne(
        { accountId: 'A' },
        { $inc: { balance: -100 } },
        { session },
      );

      await accounts.updateOne(
        { accountId: 'B' },
        { $inc: { balance: 100 } },
        { session },
      );

      await transactions.insertOne(
        { from: 'A', to: 'B', amount: 100, timestamp: new Date() },
        { session },
      );

      return 'ok';
    });

    return result;
  } finally {
    await session.endSession();
  }
}
```

### Manual start/commit/abort

```javascript
async function manualTransaction() {
  const session = client.startSession();
  try {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });

    const accounts = client.db('sample_db').collection('accounts');

    await accounts.updateOne(
      { accountId: 'A' },
      { $inc: { balance: -100 } },
      { session },
    );
    await accounts.updateOne(
      { accountId: 'B' },
      { $inc: { balance: 100 } },
      { session },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
```

## Change Streams

```javascript
const users = client.db('sample_db').collection('users');

const changeStream = users.watch();

changeStream.on('change', (change) => {
  console.log('Change:', change);
});

changeStream.on('error', (error) => {
  console.error('Change stream error:', error);
});
```

With a filter pipeline and `for await`:

```javascript
const stream = users.watch([
  {
    $match: {
      operationType: { $in: ['insert', 'update'] },
      'fullDocument.age': { $gte: 18 },
    },
  },
]);

for await (const change of stream) {
  if (change.operationType === 'insert') {
    console.log('Inserted:', change.fullDocument);
  } else if (change.operationType === 'update') {
    console.log('Updated:', change.documentKey);
  }
}
```

Database- and cluster-level streams:

```javascript
client.db('sample_db').watch();
client.watch();
```

## ObjectId Utilities

```javascript
import { ObjectId } from 'mongodb';

const users = client.db('sample_db').collection('users');

const newId = new ObjectId();

await users.insertOne({ _id: new ObjectId(), name: 'User with custom ID' });

const user = await users.findOne({ _id: new ObjectId('507f1f77bcf86cd799439011') });

if (user) {
  const timestamp = user._id.getTimestamp();
  console.log(timestamp);
}

ObjectId.isValid('507f1f77bcf86cd799439011');
```

## Error Handling

```javascript
import { MongoClient, MongoServerError } from 'mongodb';

try {
  await client.db('sample_db').collection('users').insertOne({
    email: 'duplicate@example.com',
  });
} catch (error) {
  if (error instanceof MongoServerError) {
    switch (error.code) {
      case 11000:
        console.error('Duplicate key:', error.message);
        break;
      case 121:
        console.error('Document validation failed:', error.message);
        break;
      default:
        console.error('MongoDB server error:', error.message);
    }
  } else if (error.name === 'MongoNetworkError') {
    console.error('Network error:', error.message);
  } else if (error.name === 'MongoParseError') {
    console.error('Invalid connection string:', error.message);
  } else {
    throw error;
  }
}
```

### Retry helper

```javascript
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable =
        error.name === 'MongoNetworkError' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET';

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
    }
  }
}
```

## Query Operators

### Comparison

```javascript
collection.find({ price: { $eq: 99 } });
collection.find({ status: { $ne: 'discontinued' } });
collection.find({ price: { $gt: 50 } });
collection.find({ stock: { $gte: 100 } });
collection.find({ price: { $lt: 100 } });
collection.find({ rating: { $lte: 3 } });
collection.find({ category: { $in: ['electronics', 'computers'] } });
collection.find({ status: { $nin: ['discontinued', 'out-of-stock'] } });
```

### Logical

```javascript
collection.find({
  $and: [{ price: { $lt: 100 } }, { stock: { $gt: 0 } }],
});

collection.find({
  $or: [{ category: 'electronics' }, { featured: true }],
});

collection.find({ price: { $not: { $gt: 100 } } });

collection.find({
  $nor: [{ status: 'discontinued' }, { stock: 0 }],
});
```

### Element

```javascript
collection.find({ phone: { $exists: true } });
collection.find({ email: { $type: 'string' } });
```

### Array

```javascript
collection.find({ tags: { $all: ['premium', 'verified'] } });
collection.find({ scores: { $elemMatch: { $gte: 80, $lt: 90 } } });
collection.find({ tags: { $size: 3 } });
```

## Advanced Patterns

### Connection pool tuning

```javascript
const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30_000,
  waitQueueTimeoutMS: 5_000,
});
```

### Database and collection management

```javascript
const adminDb = client.db().admin();
const dbList = await adminDb.listDatabases();

const database = client.db('sample_db');
const collections = await database.listCollections().toArray();

await database.createCollection('newCollection', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name:  { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^.+@.+$' },
      },
    },
  },
});

// await database.collection('oldCollection').drop();
```

### Schema validation

```javascript
await client.db('sample_db').command({
  collMod: 'users',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'age'],
      properties: {
        name:  { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}$' },
        age:   { bsonType: 'int', minimum: 0, maximum: 150 },
        status: { enum: ['active', 'inactive', 'suspended'] },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
});
```

### Time series collections

```javascript
await client.db('sample_db').createCollection('sensor_data', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'sensorId',
    granularity: 'seconds',
  },
});

await client.db('sample_db').collection('sensor_data').insertMany([
  { sensorId: 'sensor1', timestamp: new Date('2026-05-29T00:00:00Z'), temperature: 22.5, humidity: 60 },
  { sensorId: 'sensor1', timestamp: new Date('2026-05-29T00:01:00Z'), temperature: 22.7, humidity: 59 },
]);
```

### Read and write concerns

```javascript
await collection.insertOne(
  { name: 'John', email: 'john@example.com' },
  { writeConcern: { w: 'majority', j: true, wtimeout: 5000 } },
);

await collection.findOne(
  { email: 'john@example.com' },
  { readConcern: { level: 'majority' } },
);
```

### Counts and distinct

```javascript
await collection.countDocuments({});
await collection.countDocuments({ status: 'active' });
await collection.estimatedDocumentCount();   // fast, may be stale

await collection.distinct('city');
await collection.distinct('city', { status: 'active' });
```

## Version Notes

- `mongodb` npm `7.2.0` is the current `latest` dist-tag as of May 29, 2026.
- v6 is still actively maintained at `6.21.0` for projects that haven't migrated.
- The driver uses `mongodb+srv://` connection strings for Atlas SRV discovery.
- The Stable API (`serverApi: { version: 'v1' }`) protects you from server-side behavior drift across MongoDB releases.
- Atlas Vector Search requires a `vectorSearch` index defined in Atlas; the driver only sends the aggregation stage.

## Official Sources

- Driver docs: https://www.mongodb.com/docs/drivers/node/current/
- API reference: https://mongodb.github.io/node-mongodb-native/
- GitHub: https://github.com/mongodb/node-mongodb-native
- npm: https://www.npmjs.com/package/mongodb
- Atlas Vector Search: https://www.mongodb.com/docs/atlas/atlas-vector-search/
