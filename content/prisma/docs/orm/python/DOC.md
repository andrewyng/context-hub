---
name: orm
description: "Prisma Client Python for type-safe database access and schema-driven development"
metadata:
  languages: "python"
  versions: "0.15.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "prisma,orm,database,python,migrations"
---

# Prisma Client Python

## Golden Rule

**ALWAYS use `prisma` (prisma-client-py) version 0.15.0+ for Python projects.**

```bash
pip install prisma==0.15.0
```

**IMPORTANT NOTE:** Prisma Client Python is no longer actively maintained as of April 2025. However, version 0.15.0 remains functional and is documented here for existing projects.

**DO NOT** use:
- Old `prisma2` packages
- Unofficial Prisma Python wrappers
- `prisma-client` (different package on PyPI)

Prisma Client Python is an auto-generated, fully type-safe database client designed for ease of use with Python applications. It provides intuitive data modeling, automated migrations, and comprehensive type safety.

---

## Installation

### Step 1: Install Prisma

```bash
pip install prisma
```

### Step 2: Create Schema File

Create `schema.prisma` in your project root:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider             = "prisma-client-py"
  recursive_type_depth = 5
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### Step 3: Set Environment Variable

Create `.env` file:

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

# CockroachDB
DATABASE_URL="postgresql://user:password@localhost:26257/mydb"
```

### Step 4: Generate Client and Push Schema

```bash
prisma db push
```

Or separately:

```bash
prisma generate
prisma db push
```

For auto-regeneration during development:

```bash
prisma generate --watch
```

---

## Initialization

### Async Client (Recommended)

```python
import asyncio
from prisma import Prisma

async def main() -> None:
    db = Prisma()
    await db.connect()

    # Your database queries here

    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
```

### Sync Client

```python
from prisma import Prisma

db = Prisma()
db.connect()

# Your database queries here

db.disconnect()
```

### Context Manager (Auto Connect/Disconnect)

```python
import asyncio
from prisma import Prisma

async def main() -> None:
    async with Prisma() as db:
        # Database operations here
        user = await db.user.create(
            data={'name': 'Alice', 'email': 'alice@prisma.io'}
        )

if __name__ == '__main__':
    asyncio.run(main())
```

### Client with Auto-Register (Model-Based Access)

```python
from prisma import Prisma
from prisma.models import User

async def main() -> None:
    db = Prisma(auto_register=True)
    await db.connect()

    # Access via model
    user = await User.prisma().create(
        data={'name': 'Alice', 'email': 'alice@prisma.io'}
    )

    await db.disconnect()
```

---

## Schema Definition

### Basic Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider             = "prisma-client-py"
  recursive_type_depth = 5
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
  id       Int      @id @default(autoincrement())
  string   String
  int      Int
  bigInt   BigInt
  float    Float
  decimal  Decimal
  boolean  Boolean
  dateTime DateTime
  json     Json
  bytes    Bytes
  optional String?
  array    String[]
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
  id             Int            @id @default(autoincrement())
  title          String
  postCategories PostCategory[]
}

model Category {
  id             Int            @id @default(autoincrement())
  name           String
  postCategories PostCategory[]
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

---

## CRUD Operations

### Create

#### Single Record

```python
user = await db.user.create(
    data={
        'email': 'alice@prisma.io',
        'name': 'Alice',
    }
)
```

#### Multiple Records

```python
count = await db.user.create_many(
    data=[
        {'email': 'bob@prisma.io', 'name': 'Bob'},
        {'email': 'charlie@prisma.io', 'name': 'Charlie'},
    ],
    skip_duplicates=True,
)
```

#### Create with Relations

```python
user = await db.user.create(
    data={
        'email': 'alice@prisma.io',
        'name': 'Alice',
        'posts': {
            'create': [
                {'title': 'First Post', 'published': True},
                {'title': 'Second Post', 'published': False},
            ]
        }
    }
)
```

#### Create with Nested Relations

```python
user = await db.user.create(
    data={
        'email': 'alice@prisma.io',
        'name': 'Alice',
        'posts': {
            'create': {
                'title': 'Hello World',
                'categories': {
                    'create': [
                        {'name': 'Tech'},
                        {'name': 'News'},
                    ]
                }
            }
        }
    }
)
```

### Read

#### Find Unique

```python
user = await db.user.find_unique(
    where={'email': 'alice@prisma.io'}
)
```

#### Find Unique or Raise

```python
user = await db.user.find_unique_or_raise(
    where={'id': 1}
)
```

#### Find First

```python
post = await db.post.find_first(
    where={
        'title': {'contains': 'Prisma'}
    },
    order={'createdAt': 'desc'}
)
```

#### Find First or Raise

```python
post = await db.post.find_first_or_raise(
    where={'published': True}
)
```

#### Find Many

```python
users = await db.user.find_many()
```

#### Find Many with Filter

```python
users = await db.user.find_many(
    where={
        'email': {'endswith': 'prisma.io'},
        'posts': {
            'some': {
                'published': True
            }
        }
    }
)
```

#### Include Relations

```python
users = await db.user.find_many(
    include={'posts': True}
)
```

#### Include with Nested Relations

```python
users = await db.user.find_many(
    include={
        'posts': {
            'include': {
                'categories': True
            }
        }
    }
)
```

#### Include with Filtering

```python
users = await db.user.find_many(
    include={
        'posts': {
            'where': {
                'published': True
            },
            'order': {
                'createdAt': 'desc'
            },
            'take': 5
        }
    }
)
```

### Update

#### Update Single Record

```python
user = await db.user.update(
    where={'email': 'alice@prisma.io'},
    data={'name': 'Alice Smith'}
)
```

#### Update Multiple Records

```python
count = await db.user.update_many(
    where={
        'email': {'contains': 'prisma.io'}
    },
    data={'role': 'ADMIN'}
)
```

#### Upsert (Update or Create)

```python
user = await db.user.upsert(
    where={'email': 'alice@prisma.io'},
    data={
        'create': {
            'email': 'alice@prisma.io',
            'name': 'Alice'
        },
        'update': {
            'name': 'Alice Updated'
        }
    }
)
```

#### Atomic Number Operations

```python
post = await db.post.update(
    where={'id': 1},
    data={
        'views': {'increment': 1},
        'likes': {'increment': 5}
    }
)
```

```python
post = await db.post.update(
    where={'id': 1},
    data={
        'views': {'decrement': 1},
        'score': {'multiply': 2},
        'total': {'divide': 10}
    }
)
```

#### Update with Relations

```python
user = await db.user.update(
    where={'id': 1},
    data={
        'posts': {
            'create': {'title': 'New Post'}
        }
    }
)
```

#### Connect Existing Relations

```python
user = await db.user.update(
    where={'id': 1},
    data={
        'posts': {
            'connect': [{'id': 5}]
        }
    }
)
```

#### Disconnect Relations

```python
user = await db.user.update(
    where={'id': 1},
    data={
        'posts': {
            'disconnect': [{'id': 5}]
        }
    }
)
```

### Delete

#### Delete Single Record

```python
user = await db.user.delete(
    where={'email': 'alice@prisma.io'}
)
```

#### Delete Multiple Records

```python
count = await db.user.delete_many(
    where={
        'email': {'contains': 'prisma.io'}
    }
)
```

#### Delete All Records

```python
count = await db.user.delete_many()
```

---

## Filtering and Sorting

### Basic Filters

```python
users = await db.user.find_many(
    where={
        'email': {'equals': 'alice@prisma.io'},
        'name': {'not': 'Bob'},
        'age': {'gt': 18}
    }
)
```

### String Filters

```python
users = await db.user.find_many(
    where={
        'email': {'startswith': 'alice'},
        'name': {'endswith': 'Smith'},
        'bio': {'contains': 'developer'}
    }
)
```

### Number Filters

```python
posts = await db.post.find_many(
    where={
        'views': {'gt': 100},
        'likes': {'gte': 50},
        'comments': {'lt': 10},
        'shares': {'lte': 5},
        'rating': {'in': [4, 5]},
        'score': {'not_in': [0, 1]}
    }
)
```

### Logical Operators

```python
users = await db.user.find_many(
    where={
        'OR': [
            {'email': {'contains': 'prisma.io'}},
            {'name': {'contains': 'Alice'}}
        ]
    }
)
```

```python
users = await db.user.find_many(
    where={
        'AND': [
            {'email': {'contains': 'prisma.io'}},
            {'role': 'ADMIN'}
        ]
    }
)
```

```python
users = await db.user.find_many(
    where={
        'NOT': {
            'email': {'contains': 'spam.com'}
        }
    }
)
```

### Relation Filters

```python
users = await db.user.find_many(
    where={
        'posts': {
            'some': {
                'published': True
            }
        }
    }
)
```

```python
users = await db.user.find_many(
    where={
        'posts': {
            'every': {
                'published': True
            }
        }
    }
)
```

```python
users = await db.user.find_many(
    where={
        'posts': {
            'none': {
                'published': False
            }
        }
    }
)
```

```python
posts = await db.post.find_many(
    where={
        'author': {
            'is': {
                'name': 'Alice'
            }
        }
    }
)
```

```python
posts = await db.post.find_many(
    where={
        'author': {
            'is_not': {
                'role': 'BANNED'
            }
        }
    }
)
```

### Sorting

```python
users = await db.user.find_many(
    order={'name': 'asc'}
)
```

```python
users = await db.user.find_many(
    order=[
        {'role': 'desc'},
        {'name': 'asc'}
    ]
)
```

---

## Pagination

### Offset Pagination

```python
users = await db.user.find_many(
    skip=10,
    take=10
)
```

### Cursor-Based Pagination

```python
users = await db.user.find_many(
    take=10,
    cursor={'id': last_user_id},
    skip=1  # Skip cursor itself
)
```

---

## Aggregation

### Count

```python
count = await db.user.count()
```

```python
count = await db.user.count(
    where={
        'email': {'contains': 'prisma.io'}
    }
)
```

### Group By

```python
results = await db.user.group_by(
    by=['role']
)
```

```python
results = await db.user.group_by(
    by=['country'],
    count={'_all': True}
)
```

```python
results = await db.user.group_by(
    by=['country'],
    count={'_all': True, 'city': True},
    sum={'views': True},
    avg={'age': True},
    order={'country': 'desc'},
    having={
        'age': {
            '_avg': {
                'gt': 18
            }
        }
    }
)
```

```python
results = await db.post.group_by(
    by=['authorId'],
    count={'_all': True},
    order={
        '_count': {
            '_all': 'desc'
        }
    }
)
```

---

## Transactions

### Transaction with Context Manager (Async)

```python
async with db.tx() as transaction:
    user = await transaction.user.update(
        where={'id': from_user_id},
        data={'balance': {'decrement': 50}}
    )

    if user.balance < 0:
        raise ValueError(f'{user.name} does not have enough balance')

    await transaction.user.update(
        where={'id': to_user_id},
        data={'balance': {'increment': 50}}
    )
```

### Transaction with Context Manager (Sync)

```python
with db.tx() as transaction:
    user = transaction.user.update(
        where={'id': from_user_id},
        data={'balance': {'decrement': 50}}
    )

    if user.balance < 0:
        raise ValueError(f'{user.name} does not have enough balance')

    transaction.user.update(
        where={'id': to_user_id},
        data={'balance': {'increment': 50}}
    )
```

### Manual Transaction Management

```python
transaction = db.tx()
await transaction.start()

try:
    user = await transaction.user.create(
        data={'email': 'alice@prisma.io', 'name': 'Alice'}
    )

    post = await transaction.post.create(
        data={'title': 'Hello', 'authorId': user.id}
    )

    await transaction.commit()
except Exception as e:
    await transaction.rollback()
    raise e
```

---

## Raw Queries

### Raw Query (Select)

```python
results = await db.query_raw(
    'SELECT * FROM "User" WHERE email = $1',
    'alice@prisma.io'
)
```

### Raw Execute (Insert/Update/Delete)

```python
count = await db.execute_raw(
    'UPDATE "User" SET name = $1 WHERE id = $2',
    'Alice',
    1
)
```

### Unsafe Raw Queries (Use with Caution)

```python
users = await db.query_raw('SELECT * FROM "User"')
```

---

## Advanced Features

### Distinct

```python
users = await db.user.find_many(
    distinct=['email']
)
```

### Null Filtering

```python
users = await db.user.find_many(
    where={
        'name': {'not': None}
    }
)
```

```python
users = await db.user.find_many(
    where={
        'name': None
    }
)
```

### Case-Insensitive Filtering

```python
users = await db.user.find_many(
    where={
        'email': {
            'equals': 'ALICE@PRISMA.IO',
            'mode': 'insensitive'
        }
    }
)
```

### Full-Text Search (PostgreSQL)

```python
posts = await db.post.find_many(
    where={
        'title': {
            'search': 'database | prisma'
        }
    }
)
```

---

## Type Safety

### Using Generated Types

```python
from prisma.models import User
from prisma.types import UserCreateInput, UserWhereInput

# Type-safe create input
user_data: UserCreateInput = {
    'email': 'alice@prisma.io',
    'name': 'Alice'
}

user = await db.user.create(data=user_data)

# Type-safe where clause
where: UserWhereInput = {
    'email': {'contains': 'prisma.io'}
}

users = await db.user.find_many(where=where)
```

### Model Instance Methods

```python
from prisma.models import User

user = await User.prisma().create(
    data={'email': 'alice@prisma.io', 'name': 'Alice'}
)

# Access fields
print(user.id)
print(user.email)
print(user.name)

# Update instance
updated_user = await user.update(
    data={'name': 'Alice Smith'}
)

# Delete instance
await user.delete()
```

---

## Database-Specific Features

### PostgreSQL

```prisma
model User {
  id   Int      @id @default(autoincrement())
  data Json     @db.JsonB
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

```python
import asyncio
from prisma import Prisma
from prisma.models import User, Post

async def main() -> None:
    db = Prisma()
    await db.connect()

    # Create user with posts
    user = await db.user.create(
        data={
            'email': 'alice@prisma.io',
            'name': 'Alice',
            'posts': {
                'create': [
                    {
                        'title': 'Getting Started with Prisma',
                        'content': 'Learn how to use Prisma...',
                        'published': True
                    },
                    {
                        'title': 'Advanced Prisma Patterns',
                        'content': 'Dive deeper...',
                        'published': False
                    }
                ]
            }
        },
        include={'posts': True}
    )
    print(f'Created user: {user}')

    # Find all published posts with author
    published_posts = await db.post.find_many(
        where={'published': True},
        include={'author': True}
    )
    print(f'Published posts: {published_posts}')

    # Update post
    updated_post = await db.post.update(
        where={'id': 1},
        data={'views': {'increment': 1}}
    )
    print(f'Updated post: {updated_post}')

    # Aggregate data
    stats = await db.post.group_by(
        by=['published'],
        count={'_all': True},
        avg={'views': True}
    )
    print(f'Post statistics: {stats}')

    # Transaction
    async with db.tx() as transaction:
        new_user = await transaction.user.create(
            data={
                'email': 'bob@prisma.io',
                'name': 'Bob'
            }
        )

        new_post = await transaction.post.create(
            data={
                'title': "Bob's First Post",
                'authorId': new_user.id
            }
        )

        print(f'Transaction completed: {new_user}, {new_post}')

    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
```

---

## Batch Operations

### Batch Queries

```python
# Execute multiple queries in parallel
users, posts = await asyncio.gather(
    db.user.find_many(),
    db.post.find_many()
)
```

### Batch Creates

```python
users = await db.user.create_many(
    data=[
        {'email': f'user{i}@example.com', 'name': f'User {i}'}
        for i in range(100)
    ]
)
```

---

## Error Handling

```python
from prisma.errors import (
    UniqueViolationError,
    RecordNotFoundError,
    PrismaError
)

try:
    user = await db.user.create(
        data={'email': 'alice@prisma.io', 'name': 'Alice'}
    )
except UniqueViolationError:
    print('User with this email already exists')
except RecordNotFoundError:
    print('Record not found')
except PrismaError as e:
    print(f'Database error: {e}')
```

---

## Connection Management

### Connect and Disconnect

```python
db = Prisma()
await db.connect()

# Perform operations

await db.disconnect()
```

### Check Connection Status

```python
if db.is_connected():
    print('Connected to database')
else:
    print('Not connected')
```

### Connection Pooling

Prisma Client Python handles connection pooling automatically based on the underlying Prisma engine configuration.

---

## CLI Commands

### Generate Client

```bash
prisma generate
```

### Push Schema to Database

```bash
prisma db push
```

### Create Migration

```bash
prisma migrate dev --name init
```

### Apply Migrations

```bash
prisma migrate deploy
```

### Reset Database

```bash
prisma migrate reset
```

### Open Prisma Studio

```bash
prisma studio
```

### Format Schema

```bash
prisma format
```

### Validate Schema

```bash
prisma validate
```
