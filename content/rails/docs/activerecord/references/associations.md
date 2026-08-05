# ActiveRecord Associations Reference

## Association Types

### belongs_to

Creates a foreign key column on this model's table.

```ruby
class Post < ApplicationRecord
  belongs_to :user                          # required by default
  belongs_to :category, optional: true      # allows nil
  belongs_to :author, class_name: "User", foreign_key: "author_id"
  belongs_to :parent_post, class_name: "Post", optional: true
end
```

Options:
- `optional: true` — allows nil foreign key
- `class_name:` — specify model when name differs
- `foreign_key:` — override foreign key column name
- `counter_cache: true` — maintain `posts_count` on parent
- `touch: true` — update parent's `updated_at` on save
- `inverse_of:` — specify inverse association for bidirectional loading

### has_many

```ruby
class User < ApplicationRecord
  has_many :posts, dependent: :destroy
  has_many :draft_posts, -> { where(status: :draft) }, class_name: "Post"
  has_many :comments, through: :posts
end
```

Options:
- `dependent:` — `:destroy`, `:delete_all`, `:nullify`, `:restrict_with_error`
- `-> { scope }` — default scope on the association
- `through:` — join through another association
- `source:` — specify source association name on the through model
- `inverse_of:` — bidirectional association hint

### has_one

```ruby
class User < ApplicationRecord
  has_one :profile, dependent: :destroy
  has_one :latest_post, -> { order(created_at: :desc) }, class_name: "Post"
end
```

### has_and_belongs_to_many (HABTM)

Requires a join table with no model:

```ruby
# Join table migration
create_table :posts_tags, id: false do |t|
  t.belongs_to :post
  t.belongs_to :tag
end

class Post < ApplicationRecord
  has_and_belongs_to_many :tags
end

class Tag < ApplicationRecord
  has_and_belongs_to_many :posts
end
```

### has_many :through (preferred over HABTM)

When you need attributes on the join or callbacks:

```ruby
class User < ApplicationRecord
  has_many :memberships
  has_many :teams, through: :memberships
end

class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :team
  # Can have additional attributes: role, joined_at, etc.
end

class Team < ApplicationRecord
  has_many :memberships
  has_many :users, through: :memberships
end
```

## Polymorphic Associations

```ruby
class Comment < ApplicationRecord
  belongs_to :commentable, polymorphic: true
end

class Post < ApplicationRecord
  has_many :comments, as: :commentable
end

class Photo < ApplicationRecord
  has_many :comments, as: :commentable
end
```

Migration:

```ruby
create_table :comments do |t|
  t.text :body
  t.references :commentable, polymorphic: true, index: true
  t.timestamps
end
```

## Eager Loading Strategies

```ruby
# includes: lets Rails choose preload or eager_load
User.includes(:posts)

# preload: always separate queries (one per association)
User.preload(:posts, :profile)

# eager_load: LEFT OUTER JOIN (single query)
User.eager_load(:posts).where(posts: { published: true })

# Nested eager loading
User.includes(posts: [:comments, :tags])
```

## Self-Referential Associations

```ruby
class Employee < ApplicationRecord
  belongs_to :manager, class_name: "Employee", optional: true
  has_many :reports, class_name: "Employee", foreign_key: "manager_id"
end
```

## Common Patterns

### Dependent options guide

| Option | Behavior |
|--------|----------|
| `:destroy` | Call destroy on each associated record (runs callbacks) |
| `:delete_all` | Direct SQL delete (no callbacks) |
| `:nullify` | Set foreign key to NULL |
| `:restrict_with_error` | Add error if records exist, prevent delete |
| `:restrict_with_exception` | Raise exception if records exist |
