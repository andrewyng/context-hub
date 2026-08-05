---
name: activerecord
description: "Rails ActiveRecord ORM for database modeling, querying, associations, and migrations"
metadata:
  languages: "ruby"
  versions: "8.0.2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "rails,orm,database,activerecord,ruby"
---

# Rails ActiveRecord

ActiveRecord is the ORM layer in Ruby on Rails. It maps database tables to Ruby classes, rows to objects, and columns to attributes.

## Golden Rule

Use ActiveRecord through Rails. Prefer `where` chains over raw SQL. Use `includes` to prevent N+1 queries. Don't use `find_by_sql` unless absolutely necessary.

## Setup

ActiveRecord ships with Rails. In a Rails app, it's available automatically. For standalone use:

```ruby
gem "activerecord", "~> 8.0"
gem "sqlite3" # or pg, mysql2, trilogy
```

## Defining Models

```ruby
class User < ApplicationRecord
  # table: users
  # columns become attribute accessors automatically
end
```

Generate a model with migration:

```bash
bin/rails generate model User name:string email:string age:integer
bin/rails db:migrate
```

## CRUD Operations

### Create

```ruby
user = User.create(name: "Alice", email: "alice@example.com")

# Or two-step:
user = User.new(name: "Bob")
user.email = "bob@example.com"
user.save
```

### Read

```ruby
user = User.find(1)                          # by primary key, raises if not found
user = User.find_by(email: "alice@example.com") # first match or nil

users = User.where(age: 18..30)              # ActiveRecord::Relation
users = User.where("name LIKE ?", "%ali%")   # parameterized SQL
users = User.order(created_at: :desc).limit(10)
```

### Update

```ruby
user.update(name: "Alice Smith")

# Bulk update
User.where(active: false).update_all(archived: true)
```

### Delete

```ruby
user.destroy       # runs callbacks and dependent destroys
user.delete        # direct SQL delete, skips callbacks

User.where("last_login < ?", 2.years.ago).delete_all
```

## Querying

Chain scopes to build queries — SQL is generated lazily:

```ruby
User.where(active: true)
    .where.not(role: "admin")
    .order(:name)
    .limit(20)
    .offset(40)
    .pluck(:id, :name)
```

### Common Query Methods

```ruby
User.count                           # SELECT COUNT(*)
User.average(:age)                   # aggregate
User.distinct.pluck(:email)          # unique values
User.exists?(email: "x@example.com") # boolean check
User.select(:id, :name)             # specific columns
User.group(:role).count              # { "admin" => 5, "user" => 42 }
```

### Scopes

```ruby
class User < ApplicationRecord
  scope :active, -> { where(active: true) }
  scope :recent, -> { order(created_at: :desc).limit(10) }
  scope :by_role, ->(role) { where(role: role) }
end

User.active.recent
User.by_role("admin").count
```

## Associations

```ruby
class User < ApplicationRecord
  has_many :posts, dependent: :destroy
  has_many :comments, through: :posts
  has_one :profile
  belongs_to :team, optional: true
end

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_and_belongs_to_many :tags
end
```

Use associations:

```ruby
user.posts.create(title: "Hello")
user.posts.where(published: true)
user.build_profile(bio: "Developer")

# Eager loading to avoid N+1
users = User.includes(:posts).where(active: true)
users = User.preload(:posts, :profile)
users = User.eager_load(:posts) # LEFT OUTER JOIN
```

See `references/associations.md` for all association options.

## Validations

```ruby
class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true
  validates :name, length: { minimum: 2, maximum: 100 }
  validates :age, numericality: { greater_than: 0 }, allow_nil: true
  validates :role, inclusion: { in: %w[admin user moderator] }
  validate :email_domain_allowed

  private

  def email_domain_allowed
    return if email.blank?
    errors.add(:email, "domain not allowed") unless email.end_with?("@company.com")
  end
end
```

Check validity:

```ruby
user.valid?    # true/false
user.errors.full_messages  # ["Email can't be blank", ...]
user.save      # returns false if invalid
user.save!     # raises ActiveRecord::RecordInvalid if invalid
```

## Callbacks

```ruby
class User < ApplicationRecord
  before_validation :normalize_email
  before_create :set_defaults
  after_create :send_welcome_email
  after_destroy :cleanup_external_resources

  private

  def normalize_email
    self.email = email&.downcase&.strip
  end
end
```

Callback order: `before_validation → after_validation → before_save → before_create/update → after_create/update → after_save → after_commit`

## Transactions

```ruby
ActiveRecord::Base.transaction do
  account_from.update!(balance: account_from.balance - amount)
  account_to.update!(balance: account_to.balance + amount)
end
# Both succeed or both roll back on exception

# Nested (uses savepoints):
User.transaction do
  user.save!
  user.posts.each { |post| post.archive! }
end
```

## Migrations

```ruby
class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.integer :age
      t.references :team, foreign_key: true
      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
```

Common migration commands:

```bash
bin/rails db:migrate            # run pending migrations
bin/rails db:rollback           # undo last migration
bin/rails db:migrate:status     # show migration status
bin/rails generate migration AddRoleToUsers role:string
```

See `references/migrations.md` for detailed migration patterns.

## Enum

```ruby
class Post < ApplicationRecord
  enum :status, { draft: 0, published: 1, archived: 2 }
end

post = Post.new(status: :draft)
post.draft?      # true
post.published!  # updates and saves
Post.published   # scope: all published posts
```

## Common Pitfalls

- **N+1 queries**: Use `includes`, `preload`, or `eager_load` when accessing associations in loops.
- **update_all skips callbacks/validations**: Use it only for bulk operations where that's acceptable.
- **delete vs destroy**: `delete` skips callbacks and dependent associations; prefer `destroy` unless you need raw speed.
- **Lazy loading**: Queries aren't executed until you iterate or call a terminal method like `to_a`, `count`, or `pluck`.

## Official Sources

- Rails ActiveRecord guide: `https://guides.rubyonrails.org/active_record_basics.html`
- ActiveRecord query interface: `https://guides.rubyonrails.org/active_record_querying.html`
- RubyGems: `https://rubygems.org/gems/activerecord`
