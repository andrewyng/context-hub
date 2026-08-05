# ActiveRecord Migrations Reference

## Generating Migrations

```bash
# Generate standalone migration
bin/rails generate migration CreateUsers name:string email:string
bin/rails generate migration AddRoleToUsers role:string
bin/rails generate migration RemoveAgeFromUsers age:integer
bin/rails generate migration AddIndexToUsersEmail

# Generate with model
bin/rails generate model Post title:string body:text user:references
```

Rails infers migration content from the name:
- `CreateXxx` → `create_table`
- `AddXxxToYyy` → `add_column`
- `RemoveXxxFromYyy` → `remove_column`

## Column Types

```ruby
create_table :examples do |t|
  t.string :name           # VARCHAR(255)
  t.text :description      # TEXT
  t.integer :count         # INTEGER
  t.bigint :large_count    # BIGINT
  t.float :score           # FLOAT
  t.decimal :price, precision: 10, scale: 2  # DECIMAL(10,2)
  t.boolean :active        # BOOLEAN
  t.date :birthday         # DATE
  t.datetime :published_at # DATETIME/TIMESTAMP
  t.time :start_time       # TIME
  t.json :metadata         # JSON (native)
  t.jsonb :settings        # JSONB (PostgreSQL)
  t.binary :data           # BLOB
  t.uuid :external_id      # UUID (PostgreSQL)

  t.references :user, foreign_key: true  # user_id + index + FK
  t.timestamps             # created_at, updated_at
end
```

## Column Options

```ruby
t.string :email, null: false                  # NOT NULL
t.string :role, default: "user"               # DEFAULT value
t.integer :position, limit: 2                 # SMALLINT
t.string :code, index: true                   # add index
t.string :email, index: { unique: true }      # unique index
t.text :comment, comment: "User comment"      # column comment
```

## Table Operations

```ruby
# Create
create_table :users do |t|
  t.string :name
  t.timestamps
end

# Create with UUID primary key (PostgreSQL)
create_table :users, id: :uuid do |t|
  t.string :name
end

# Rename
rename_table :old_name, :new_name

# Drop
drop_table :users

# Change table
change_table :users do |t|
  t.remove :age
  t.string :role
  t.rename :name, :full_name
end
```

## Column Operations

```ruby
# Add
add_column :users, :role, :string, default: "user"

# Remove
remove_column :users, :age, :integer  # specify type for reversibility

# Rename
rename_column :users, :name, :full_name

# Change type
change_column :users, :age, :string
change_column_null :users, :email, false       # set NOT NULL
change_column_default :users, :role, "member"  # change default
```

## Index Operations

```ruby
# Single column
add_index :users, :email
add_index :users, :email, unique: true

# Multi-column
add_index :users, [:last_name, :first_name]

# Partial index (PostgreSQL)
add_index :users, :email, where: "active = true"

# Remove
remove_index :users, :email
remove_index :users, column: [:last_name, :first_name]
```

## Foreign Keys

```ruby
add_foreign_key :posts, :users
add_foreign_key :posts, :users, column: :author_id
add_foreign_key :posts, :users, on_delete: :cascade

remove_foreign_key :posts, :users
```

## Reversible Migrations

```ruby
class MigrateData < ActiveRecord::Migration[8.0]
  def change
    # Reversible block for custom up/down
    reversible do |dir|
      dir.up do
        execute "UPDATE users SET role = 'member' WHERE role IS NULL"
      end
      dir.down do
        execute "UPDATE users SET role = NULL WHERE role = 'member'"
      end
    end
  end
end
```

Or use explicit `up`/`down`:

```ruby
class MigrateData < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :role, :string, default: "member"
    User.reset_column_information
    User.update_all(role: "member")
  end

  def down
    remove_column :users, :role
  end
end
```

## Running Migrations

```bash
bin/rails db:migrate                # run all pending
bin/rails db:migrate VERSION=20260317120000  # up to specific version
bin/rails db:rollback               # undo last migration
bin/rails db:rollback STEP=3        # undo last 3
bin/rails db:migrate:status         # show status of all migrations
bin/rails db:migrate:redo           # rollback then migrate
bin/rails db:schema:load            # load schema.rb (fresh DB)
bin/rails db:seed                   # run db/seeds.rb
bin/rails db:reset                  # drop + create + schema:load + seed
```

## Common Patterns

### Safe zero-downtime migration (add column with default)

```ruby
# Rails 8 handles this in a single step safely:
add_column :users, :role, :string, default: "user", null: false
```

### Add index concurrently (PostgreSQL, no table lock)

```ruby
class AddIndexToUsersEmail < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_index :users, :email, unique: true, algorithm: :concurrently
  end
end
```

### Data migration with safety

```ruby
class BackfillUserRoles < ActiveRecord::Migration[8.0]
  def up
    User.in_batches(of: 1000).update_all(role: "member")
  end

  def down
    # no-op or reverse
  end
end
```
