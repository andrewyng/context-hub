---
name: mysql
description: "TypeScript declarations for the callback-based mysql client, including connections, pools, transactions, query configuration, and result packet types."
metadata:
  languages: "typescript"
  versions: "2.15.27"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,mysql,nodejs,sql,types,definitelytyped"
---

# MySQL TypeScript Guide

## Golden Rule

Install `@types/mysql` for compile-time declarations only.

Your application still runs the real `mysql` package at runtime. `@types/mysql` adds TypeScript definitions for `createConnection()`, `createPool()`, `query()`, transaction methods such as `beginTransaction()` and `commit()`, connection and pool config, `MysqlError`, `OkPacket`, and `FieldInfo`.

Import code from `mysql`, not from `@types/mysql`.

## Install

Install the runtime package first, then add TypeScript and the declaration packages:

```bash
npm install mysql
npm install -D typescript @types/mysql @types/node
```

If your project already uses `mysql`, add only the missing declarations:

```bash
npm install -D @types/mysql
```

`@types/mysql@2.15.27` depends on `@types/node` and declares `typeScriptVersion: "5.0"`, so use TypeScript 5.0 or newer with this version.

## Initialization

There are no package-defined environment variables or credentials.

In practice, most apps load connection settings from their own environment variables and pass them into `mysql.createConnection()` or `mysql.createPool()`.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

If your project restricts ambient types with `compilerOptions.types`, keep `node` available:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Define connection settings in the environment

These variable names are application-defined, but they map directly to `ConnectionConfig` fields such as `host`, `port`, `user`, `password`, and `database`.

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_USER=app_user
export MYSQL_PASSWORD=secret
export MYSQL_DATABASE=app_db
```

### Import `mysql` and create a pool

Use a namespace import so the runtime module and exported types stay aligned.

```typescript
import * as mysql from "mysql";

const database = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER;

if (!database || !user) {
  throw new Error("MYSQL_DATABASE and MYSQL_USER are required");
}

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user,
  password: process.env.MYSQL_PASSWORD,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: ["DATE", "DATETIME", "TIMESTAMP"],
});
```

`createConnection()` accepts the same config shape and also accepts a connection URI string.

## Common Workflows

### Run a parameterized `SELECT`

`query()` is callback-based in these declarations. The `results` value is typed as `any`, so define your row shape at the application boundary and cast or validate there.

```typescript
import * as mysql from "mysql";

type UserRow = {
  id: number;
  email: string;
  created_at: string;
};

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) {
    throw err;
  }

  connection.query(
    "SELECT id, email, created_at FROM users WHERE id = ?",
    [42],
    (queryError, results, fields) => {
      if (queryError) {
        throw queryError;
      }

      const rows = results as UserRow[];

      console.log(rows[0]?.email);
      console.log(fields?.map((field) => field.name));

      connection.end();
    },
  );
});
```

The callback's `fields` argument is typed as `mysql.FieldInfo[]` when it is present.

### Handle `INSERT`, `UPDATE`, and `DELETE` results with `OkPacket`

For write queries, cast the result to `mysql.OkPacket` so you can read `affectedRows`, `insertId`, and `changedRows` explicitly.

```typescript
import * as mysql from "mysql";

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.query(
  "INSERT INTO users (email) VALUES (?)",
  ["ada@example.com"],
  (err, results) => {
    if (err) {
      throw err;
    }

    const packet = results as mysql.OkPacket;

    console.log(packet.insertId);
    console.log(packet.affectedRows);

    connection.end();
  },
);
```

### Use transactions with `beginTransaction()`, `commit()`, and `rollback()`

The transaction API is also callback-based. Roll back before releasing or ending the connection when a step fails.

```typescript
import * as mysql from "mysql";

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.beginTransaction((transactionError) => {
  if (transactionError) {
    throw transactionError;
  }

  connection.query(
    "UPDATE accounts SET balance = balance - ? WHERE id = ?",
    [50, 1],
    (debitError) => {
      if (debitError) {
        connection.rollback(() => connection.end());
        return;
      }

      connection.query(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [50, 2],
        (creditError) => {
          if (creditError) {
            connection.rollback(() => connection.end());
            return;
          }

          connection.commit((commitError) => {
            if (commitError) {
              connection.rollback(() => connection.end());
              return;
            }

            connection.end();
          });
        },
      );
    },
  );
});
```

### Get a pooled connection for multi-step work

Use `pool.getConnection()` when several statements must run on the same underlying connection.

```typescript
import * as mysql from "mysql";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    throw err;
  }

  connection.query("SELECT NOW() AS now", (queryError, results) => {
    connection.release();

    if (queryError) {
      throw queryError;
    }

    console.log(results);
  });
});
```

Call `connection.release()` for pooled connections, and `pool.end()` during application shutdown.

### Format values and identifiers safely

The declarations expose `format()`, `escape()`, and `escapeId()` for the same SQL templating API as the runtime package.

```typescript
import * as mysql from "mysql";

const sql = mysql.format(
  "SELECT ?? FROM ?? WHERE id = ?",
  ["email", "users", 42],
);

console.log(sql);
```

Prefer placeholders and `format()` over manual string concatenation.

## Common Pitfalls

- `@types/mysql` is a declaration package only. Install `mysql` separately for the runtime.
- Do not import from `@types/mysql` in application code.
- These declarations model the callback-based API. They do not add promise-returning query methods.
- `query()` results are not generic in this package; the callback result is `any`, so cast or validate rows at your application boundary.
- If your project restricts ambient types with `compilerOptions.types`, include `node` or the Node dependency types used by this package will disappear.
- `multipleStatements` is available in `ConnectionConfig`, but its declaration comment warns that enabling it increases SQL injection risk.
- If you provide a custom `typeCast` function, the declaration comment requires calling exactly one of `field.string()`, `field.buffer()`, or `field.geometry()` when parsing a value.
- Use `supportBigNumbers`, `bigNumberStrings`, and `dateStrings` deliberately when you need predictable handling for `BIGINT`, `DECIMAL`, `DATE`, `DATETIME`, or `TIMESTAMP` values.

## Official Sources

- https://www.npmjs.com/package/@types/mysql
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mysql
