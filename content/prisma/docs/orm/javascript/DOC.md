---
name: orm
description: "Prisma ORM client for JavaScript/TypeScript with type-safe database access and migrations"
metadata:
  languages: "javascript"
  versions: "8.0.14"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "prisma,orm,database,typescript,migrations"
---

# Prisma ORM - JavaScript/TypeScript

## Golden Rule

**ALWAYS use `@prisma/client` version 8.0.14+ with the `prisma` CLI for development.**

```bash
npm install @prisma/client@8.0.14
npm install -D prisma@8.0.14
```

**DO NOT** use deprecated packages like:
- `@prisma/cli` (deprecated - use `prisma` instead)
- Old Prisma 1.x packages
- Unofficial Prisma wrappers

Prisma ORM is the official next-generation ORM for Node.js and TypeScript. It provides type-safe database access, auto-completion, and an intuitive data modeling experience.

---

## Installation

### Step 1: Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma typescript tsx @types/node
```

### Step 2: Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables file

### Step 3: Configure Database Connection

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

For other databases:

```env
# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# SQLite
DATABASE_URL="file:./dev.db"

# MongoDB
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/mydb"

# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=sa;password=password;encrypt=true"
```

### Step 4: Initialize TypeScript (if needed)

```bash
npx tsc --init
```

---

## Initialization

### Basic Client Setup

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Your database queries here
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Client with Logging

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### Client with Error Formatting

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  errorFormat: 'pretty', // 'pretty' | 'colorless' | 'minimal'
})
```

### Environment-Based Configuration

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

---

## Schema Definition

### Basic Schema Structure

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Field Types

```prisma
model Example {
  id        Int      @id @default(autoincrement())
  string    String
  int       Int
  bigInt    BigInt
  float     Float
  decimal   Decimal
  boolean   Boolean
  dateTime  DateTime
  json      Json
  bytes     Bytes
  optional  String?
  array     String[]
}
```

### Field Attributes

```prisma
model User {
  id        Int      @id @default(autoincrement())
  uuid      String   @default(uuid())
  email     String   @unique
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([email, name])
  @@index([email])
  @@map("users")
}
```

### Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}
```

---

## Relations

### One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}
```

### One-to-Many

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Many-to-Many (Implicit)

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
```

### Many-to-Many (Explicit)

```prisma
model Post {
  id               Int                @id @default(autoincrement())
  title            String
  postCategories   PostCategory[]
}

model Category {
  id               Int                @id @default(autoincrement())
  name             String
  postCategories   PostCategory[]
}

model PostCategory {
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
  assignedAt DateTime @default(now())

  @@id([postId, categoryId])
}
```

### Self-Relations

```prisma
model User {
  id         Int    @id @default(autoincrement())
  name       String
  invitedBy  User?  @relation("UserInvites", fields: [inviterId], references: [id])
  inviterId  Int?
  invites    User[] @relation("UserInvites")
}
```

---

## Migrations

### Create Migration

```bash
npx prisma migrate dev --name init
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

### Generate Client After Schema Changes

```bash
npx prisma generate
```

### Push Schema Without Migrations (Prototyping)

`db push` syncs the database to your schema without creating migration files. Use it for prototyping or for databases without migration history (e.g. MongoDB).

```bash
npx prisma db push
```

### Pull Schema From an Existing Database

```bash
npx prisma db pull
```

### Open Prisma Studio

```bash
npx prisma studio
```

---

## CRUD Operations

### Create

#### Single Record

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
  },
})
```

#### Multiple Records

```typescript
const users = await prisma.user.createMany({
  data: [
    { email: 'bob@prisma.io', name: 'Bob' },
    { email: 'charlie@prisma.io', name: 'Charlie' },
  ],
  skipDuplicates: true,
})
```

#### Create and Return Multiple (v5.14.0+)

```typescript
const users = await prisma.user.createManyAndReturn({
  data: [
    { email: 'alice@prisma.io', name: 'Alice' },
    { email: 'bob@prisma.io', name: 'Bob' },
  ],
})
```

#### Create with Relations

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
    posts: {
      create: [
        { title: 'First Post' },
        { title: 'Second Post' },
      ],
    },
  },
})
```

#### Create with Nested Relations

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    posts: {
      create: {
        title: 'Hello World',
        categories: {
          create: [
            { name: 'Tech' },
            { name: 'News' },
          ],
        },
      },
    },
  },
})
```

### Read

#### Find Unique

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'alice@prisma.io' },
})
```

#### Find Unique or Throw

```typescript
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
})
```

#### Find First

```typescript
const user = await prisma.user.findFirst({
  where: {
    posts: {
      some: {
        likes: { gt: 100 },
      },
    },
  },
  orderBy: { id: 'desc' },
})
```

#### Find First or Throw

```typescript
const user = await prisma.user.findFirstOrThrow({
  where: { email: { contains: 'prisma.io' } },
})
```

#### Find Many

```typescript
const users = await prisma.user.findMany()
```

#### Find Many with Filter

```typescript
const users = await prisma.user.findMany({
  where: {
    email: { endsWith: 'prisma.io' },
    posts: {
      some: {
        published: true,
      },
    },
  },
})
```

#### Select Specific Fields

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'alice@prisma.io' },
  select: {
    id: true,
    email: true,
    name: true,
  },
})
```

#### Include Relations

```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
})
```

#### Include with Nested Relations

```typescript
const users = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        categories: true,
      },
    },
  },
})
```

#### Include with Filtering

```typescript
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    },
  },
})
```

### Update

#### Update Single Record

```typescript
const user = await prisma.user.update({
  where: { email: 'alice@prisma.io' },
  data: { name: 'Alice Smith' },
})
```

#### Update Multiple Records

```typescript
const users = await prisma.user.updateMany({
  where: {
    email: { contains: 'prisma.io' },
  },
  data: {
    role: 'ADMIN',
  },
})
```

#### Update and Return Multiple (v6.2.0+)

```typescript
const users = await prisma.user.updateManyAndReturn({
  where: { email: { contains: 'prisma.io' } },
  data: { role: 'ADMIN' },
})
```

#### Upsert (Update or Create)

```typescript
const user = await prisma.user.upsert({
  where: { email: 'alice@prisma.io' },
  update: { name: 'Alice Updated' },
  create: {
    email: 'alice@prisma.io',
    name: 'Alice',
  },
})
```

#### Atomic Number Operations

```typescript
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    views: { increment: 1 },
    likes: { increment: 5 },
  },
})
```

```typescript
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    views: { decrement: 1 },
    score: { multiply: 2 },
    total: { divide: 10 },
  },
})
```

#### Update with Relations

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: 'New Post' },
    },
  },
})
```

#### Connect Existing Relations

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      connect: { id: 5 },
    },
  },
})
```

#### Disconnect Relations

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      disconnect: { id: 5 },
    },
  },
})
```

### Delete

#### Delete Single Record

```typescript
const user = await prisma.user.delete({
  where: { email: 'alice@prisma.io' },
})
```

#### Delete Multiple Records

```typescript
const users = await prisma.user.deleteMany({
  where: {
    email: { contains: 'prisma.io' },
  },
})
```

#### Delete All Records

```typescript
const users = await prisma.user.deleteMany({})
```

---

## Filtering and Sorting

### Basic Filters

```typescript
const users = await prisma.user.findMany({
  where: {
    email: { equals: 'alice@prisma.io' },
    name: { not: 'Bob' },
    age: { gt: 18 },
  },
})
```

### String Filters

```typescript
const users = await prisma.user.findMany({
  where: {
    email: { startsWith: 'alice' },
    name: { endsWith: 'Smith' },
    bio: { contains: 'developer' },
  },
})
```

### Number Filters

```typescript
const posts = await prisma.post.findMany({
  where: {
    views: { gt: 100 },
    likes: { gte: 50 },
    comments: { lt: 10 },
    shares: { lte: 5 },
    rating: { in: [4, 5] },
    score: { notIn: [0, 1] },
  },
})
```

### Logical Operators

```typescript
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: 'prisma.io' } },
      { name: { contains: 'Alice' } },
    ],
  },
})
```

```typescript
const users = await prisma.user.findMany({
  where: {
    AND: [
      { email: { contains: 'prisma.io' } },
      { role: 'ADMIN' },
    ],
  },
})
```

```typescript
const users = await prisma.user.findMany({
  where: {
    NOT: {
      email: { contains: 'spam.com' },
    },
  },
})
```

### Relation Filters

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        published: true,
      },
    },
  },
})
```

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: {
      every: {
        published: true,
      },
    },
  },
})
```

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: {
      none: {
        published: false,
      },
    },
  },
})
```

### Sorting

```typescript
const users = await prisma.user.findMany({
  orderBy: {
    name: 'asc',
  },
})
```

```typescript
const users = await prisma.user.findMany({
  orderBy: [
    { role: 'desc' },
    { name: 'asc' },
  ],
})
```

```typescript
const users = await prisma.user.findMany({
  orderBy: {
    posts: {
      _count: 'desc',
    },
  },
})
```

---

## Pagination

### Offset Pagination

```typescript
const users = await prisma.user.findMany({
  skip: 10,
  take: 10,
})
```

### Cursor-Based Pagination

```typescript
const users = await prisma.user.findMany({
  take: 10,
  cursor: {
    id: lastUserId,
  },
  skip: 1, // Skip cursor itself
})
```

---

## Aggregation

### Count

```typescript
const count = await prisma.user.count()
```

```typescript
const count = await prisma.user.count({
  where: {
    email: { contains: 'prisma.io' },
  },
})
```

### Aggregate Operations

```typescript
const result = await prisma.post.aggregate({
  _count: {
    _all: true,
  },
  _avg: {
    views: true,
    likes: true,
  },
  _sum: {
    views: true,
  },
  _min: {
    createdAt: true,
  },
  _max: {
    createdAt: true,
  },
})
```

### Group By

```typescript
const result = await prisma.user.groupBy({
  by: ['role'],
  _count: {
    _all: true,
  },
})
```

```typescript
const result = await prisma.user.groupBy({
  by: ['country'],
  _sum: {
    profileViews: true,
  },
  _avg: {
    age: true,
  },
  having: {
    age: {
      _avg: {
        gt: 18,
      },
    },
  },
})
```

```typescript
const result = await prisma.post.groupBy({
  by: ['authorId'],
  _count: {
    _all: true,
  },
  orderBy: {
    _count: {
      _all: 'desc',
    },
  },
})
```

---

## Transactions

### Sequential Operations Transaction

```typescript
const [deletedPosts, deletedUser] = await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 1 } }),
  prisma.user.delete({ where: { id: 1 } }),
])
```

### Interactive Transaction

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'alice@prisma.io', name: 'Alice' },
  })

  const post = await tx.post.create({
    data: {
      title: 'Hello World',
      authorId: user.id,
    },
  })

  return { user, post }
})
```

### Transaction with Timeout

```typescript
const result = await prisma.$transaction(
  async (tx) => {
    // Operations here
  },
  {
    maxWait: 5000, // Wait max 5s to start transaction
    timeout: 10000, // Max 10s for transaction
  }
)
```

### Transaction with Isolation Level

```typescript
const result = await prisma.$transaction(
  async (tx) => {
    // Operations here
  },
  {
    isolationLevel: 'Serializable',
  }
)
```

---

## Raw Queries

### Raw Query (Read)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE "email" = ${'alice@prisma.io'}
`
```

### Raw Execute (Write)

```typescript
const result = await prisma.$executeRaw`
  UPDATE "User" SET "name" = ${'Alice'} WHERE "id" = ${1}
`
```

### Raw Query Unsafe (Use with Caution)

```typescript
const users = await prisma.$queryRawUnsafe(
  'SELECT * FROM User WHERE id = ?',
  1
)
```

### Raw Queries in Transactions

```typescript
const [users, count] = await prisma.$transaction([
  prisma.$queryRaw`SELECT * FROM "User"`,
  prisma.$executeRaw`UPDATE "User" SET "role" = 'ADMIN' WHERE "id" = ${1}`,
])
```

---

## Advanced Features

### Distinct

```typescript
const distinctEmails = await prisma.user.findMany({
  distinct: ['email'],
})
```

### Null Filtering

```typescript
const users = await prisma.user.findMany({
  where: {
    name: { not: null },
  },
})
```

```typescript
const users = await prisma.user.findMany({
  where: {
    name: null,
  },
})
```

### Case-Insensitive Filtering (PostgreSQL, MongoDB)

```typescript
const users = await prisma.user.findMany({
  where: {
    email: {
      equals: 'ALICE@PRISMA.IO',
      mode: 'insensitive',
    },
  },
})
```

### Full-Text Search (PostgreSQL)

```typescript
const posts = await prisma.post.findMany({
  where: {
    title: {
      search: 'database | prisma',
    },
  },
})
```

### JSON Filtering

```typescript
const users = await prisma.user.findMany({
  where: {
    metadata: {
      path: ['tags'],
      array_contains: 'developer',
    },
  },
})
```

---

## Client Extensions

### Custom Result Fields

```typescript
const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`
        },
      },
    },
  },
})

const user = await prisma.user.findUnique({
  where: { id: 1 },
})

console.log(user.fullName)
```

### Custom Model Methods

```typescript
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return await prisma.user.findUnique({
          where: { email },
        })
      },
    },
  },
})

const user = await prisma.user.findByEmail('alice@prisma.io')
```

### Query Extensions

```typescript
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        console.log('Finding users...')
        return query(args)
      },
    },
  },
})
```

---

## Middleware

```typescript
const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()

  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)

  return result
})
```

```typescript
prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'delete') {
    params.action = 'update'
    params.args['data'] = { deleted: true }
  }
  return next(params)
})
```

---

## Error Handling

### Handle Specific Errors

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

try {
  const user = await prisma.user.create({
    data: { email: 'alice@prisma.io' },
  })
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      console.log('Unique constraint violation')
    }
  }
  throw error
}
```

### Common Error Codes

- `P2002`: Unique constraint violation
- `P2003`: Foreign key constraint violation
- `P2025`: Record not found
- `P2014`: Relation violation

---

## Database Utilities

### Connection Test

```typescript
await prisma.$connect()
await prisma.$disconnect()
```

### Execute Raw SQL

```typescript
await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE')
```

### Run Commands

```typescript
await prisma.$runCommandRaw({
  drop: 'User',
})
```

---

## Best Patterns for Code Generation

### Type-Safe Queries

```typescript
import { Prisma } from '@prisma/client'

const whereClause: Prisma.UserWhereInput = {
  email: { contains: 'prisma.io' },
}

const users = await prisma.user.findMany({
  where: whereClause,
})
```

### Reusable Query Fragments

```typescript
const userWithPosts = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { posts: true },
})

type UserWithPosts = Prisma.UserGetPayload<typeof userWithPosts>

const user: UserWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  ...userWithPosts,
})
```

### Type Utilities

```typescript
import { Prisma } from '@prisma/client'

// Get the type for creating a user
type UserCreateInput = Prisma.UserCreateInput

// Get the type for a user from the database
type User = Prisma.UserGetPayload<{}>

// Get the type for a user with relations
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>
```

---

## Database-Specific Features

### PostgreSQL

```prisma
model User {
  id   Int    @id @default(autoincrement())
  data Json   @db.JsonB
  tags String[] @db.VarChar(255)
}
```

### MySQL

```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String @db.VarChar(255)
  bio  String @db.Text
}
```

### SQLite

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### MongoDB

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
}
```

---

## Complete Example Application

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create user with posts
  const user = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: [
          {
            title: 'Getting Started with Prisma',
            content: 'Learn how to use Prisma ORM...',
            published: true,
          },
          {
            title: 'Advanced Prisma Patterns',
            content: 'Dive deeper into Prisma...',
            published: false,
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  })
  console.log('Created user:', user)

  // Find all published posts with author
  const publishedPosts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  console.log('Published posts:', publishedPosts)

  // Update post
  const updatedPost = await prisma.post.update({
    where: { id: 1 },
    data: {
      views: { increment: 1 },
    },
  })
  console.log('Updated post:', updatedPost)

  // Aggregate data
  const stats = await prisma.post.aggregate({
    _count: { _all: true },
    _avg: { views: true },
    where: { published: true },
  })
  console.log('Post statistics:', stats)

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: 'bob@prisma.io',
        name: 'Bob',
      },
    })

    const newPost = await tx.post.create({
      data: {
        title: 'Bob\'s First Post',
        authorId: newUser.id,
      },
    })

    return { user: newUser, post: newPost }
  })
  console.log('Transaction result:', result)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```
