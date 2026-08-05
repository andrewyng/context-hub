# ActiveRecord Queries Reference

## Where Conditions

```ruby
# Hash conditions (safe, auto-parameterized)
User.where(name: "Alice")
User.where(role: ["admin", "moderator"])   # IN clause
User.where(age: 18..65)                    # BETWEEN
User.where(age: 18..)                      # >= 18
User.where(age: ..65)                      # <= 65

# String conditions (use ? placeholders)
User.where("email LIKE ?", "%@example.com")
User.where("age > ? AND role = ?", 21, "user")

# Named placeholders
User.where("name = :name AND role = :role", name: "Alice", role: "admin")

# NOT
User.where.not(role: "admin")
User.where.not(age: nil)

# OR
User.where(role: "admin").or(User.where(role: "moderator"))

# Missing (NULL foreign key / no associated record)
Post.where.missing(:comments)
```

## Ordering and Limiting

```ruby
User.order(:name)                          # ASC
User.order(name: :desc)
User.order(role: :asc, name: :desc)
User.order(Arel.sql("LOWER(name)"))        # raw SQL ordering

User.limit(10)
User.offset(20)
User.limit(10).offset(20)                  # pagination
```

## Select and Pluck

```ruby
# select: returns AR objects with only specified columns
User.select(:id, :name)

# pluck: returns raw arrays, no AR objects (faster)
User.pluck(:id)                            # [1, 2, 3]
User.pluck(:id, :name)                     # [[1, "Alice"], [2, "Bob"]]

# pick: pluck for single row
User.where(email: "a@b.com").pick(:id)     # 42
```

## Aggregations

```ruby
User.count
User.where(active: true).count
User.maximum(:age)
User.minimum(:age)
User.average(:age)
User.sum(:balance)

# Group
User.group(:role).count                    # { "admin" => 5, "user" => 42 }
User.group(:role).average(:age)
User.group(:role).having("COUNT(*) > ?", 10).count
```

## Joins

```ruby
# INNER JOIN
User.joins(:posts)
User.joins(:posts).where(posts: { published: true })

# Multiple joins
User.joins(:posts, :profile)
User.joins(posts: :comments)               # nested join

# LEFT OUTER JOIN
User.left_joins(:posts)
User.left_outer_joins(:posts)

# Custom SQL join
User.joins("INNER JOIN posts ON posts.user_id = users.id AND posts.featured = true")
```

## Find Methods

```ruby
User.find(1)                               # raises RecordNotFound
User.find([1, 2, 3])                       # returns array
User.find_by(email: "a@b.com")             # nil if not found
User.find_by!(email: "a@b.com")            # raises RecordNotFound

User.first                                 # ORDER BY id ASC LIMIT 1
User.last                                  # ORDER BY id DESC LIMIT 1
User.take                                  # no ordering, LIMIT 1

User.find_or_create_by(email: "a@b.com")   # find or create
User.find_or_initialize_by(email: "a@b.com") # find or new (unsaved)
```

## Batch Processing

```ruby
# find_each: loads in batches of 1000 (configurable)
User.where(active: true).find_each(batch_size: 500) do |user|
  user.send_newsletter
end

# find_in_batches: yields arrays of records
User.find_in_batches(batch_size: 1000) do |batch|
  batch.each { |user| process(user) }
end

# in_batches: yields Relations (for update_all, delete_all)
User.in_batches(of: 1000).update_all(notified: true)
```

## Exists and Presence

```ruby
User.exists?(1)                            # by ID
User.exists?(email: "a@b.com")             # by condition
User.where(role: "admin").exists?           # any admin?
User.where(role: "admin").any?              # same but loads records
User.where(role: "admin").none?             # inverse
User.where(role: "admin").empty?            # no records?
```

## Raw SQL

```ruby
# When AR query interface isn't enough
results = ActiveRecord::Base.connection.execute("SELECT ...")
users = User.find_by_sql("SELECT * FROM users WHERE complex_condition")

# Sanitize user input in raw SQL
User.where(
  ActiveRecord::Base.sanitize_sql(["name = ?", user_input])
)
```

## Query Performance

```ruby
# Explain query plan
User.where(role: "admin").explain

# to_sql: inspect generated SQL
puts User.where(role: "admin").order(:name).to_sql

# Avoid N+1: use includes/preload/eager_load
User.includes(:posts).where(active: true).each do |user|
  user.posts  # no extra query
end

# strict_loading: raise on lazy load (catch N+1 in dev)
user = User.strict_loading.find(1)
user.posts  # raises ActiveRecord::StrictLoadingViolationError
```
