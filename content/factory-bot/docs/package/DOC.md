---
name: package
description: "FactoryBot test data factory library for Ruby — define, build, and create test fixtures"
metadata:
  languages: "ruby"
  versions: "6.5.1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "factory-bot,testing,fixtures,ruby,rails"
---

# FactoryBot

FactoryBot is a library for setting up test data in Ruby. It replaces fixtures with factories — flexible, composable definitions for creating test objects.

## Golden Rule

Use `factory_bot_rails` with Rails. Prefer `build` or `build_stubbed` over `create` for speed. Use traits for variations. Include `FactoryBot::Syntax::Methods` in test helpers.

## Setup

```ruby
# Gemfile
group :test do
  gem "factory_bot_rails", "~> 6.5"  # Rails integration
  # or for non-Rails:
  gem "factory_bot", "~> 6.5"
end
```

```ruby
# spec/support/factory_bot.rb (RSpec)
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
end

# test/test_helper.rb (Minitest)
class ActiveSupport::TestCase
  include FactoryBot::Syntax::Methods
end
```

## Defining Factories

```ruby
# spec/factories/users.rb (or test/factories/users.rb)
FactoryBot.define do
  factory :user do
    name { "Alice" }
    email { "alice@example.com" }
    age { 30 }
    role { "user" }
    active { true }
  end
end
```

### Sequences

```ruby
FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
  end
end
```

### Associations

```ruby
FactoryBot.define do
  factory :post do
    title { "My Post" }
    body { "Content here" }
    user  # belongs_to :user — auto-creates a user
    # or explicit: association :author, factory: :user
  end
end
```

### Traits

```ruby
FactoryBot.define do
  factory :user do
    name { "Alice" }
    email { "alice@example.com" }
    role { "user" }

    trait :admin do
      role { "admin" }
      email { "admin@example.com" }
    end

    trait :inactive do
      active { false }
    end

    trait :with_posts do
      transient do
        posts_count { 3 }
      end

      after(:create) do |user, evaluator|
        create_list(:post, evaluator.posts_count, user: user)
      end
    end
  end
end
```

### Nested Factories (Inheritance)

```ruby
FactoryBot.define do
  factory :user do
    name { "Alice" }
    role { "user" }

    factory :admin do
      role { "admin" }
    end

    factory :super_admin do
      role { "super_admin" }
    end
  end
end
```

## Using Factories

### Build Strategies

```ruby
# build: instantiates but doesn't save (no DB hit)
user = build(:user)
user = build(:user, name: "Bob")

# create: instantiates and saves to DB
user = create(:user)
user = create(:user, name: "Bob")

# attributes_for: returns a hash of attributes (no object)
attrs = attributes_for(:user)
# => { name: "Alice", email: "alice@example.com", ... }

# build_stubbed: builds a stubbed object with a fake ID (fastest)
user = build_stubbed(:user)
user.id       # => 1001 (fake)
user.persisted? # => true (stubbed)
```

### With Traits

```ruby
create(:user, :admin)
create(:user, :admin, :inactive)
create(:user, :with_posts, posts_count: 5)
build(:user, :admin, name: "Custom Name")
```

### Lists

```ruby
users = create_list(:user, 3)
users = create_list(:user, 3, role: "admin")
users = build_list(:user, 5)
```

### Overriding Attributes

```ruby
create(:user, name: "Bob", email: "bob@example.com")
create(:post, user: existing_user, title: "Custom Title")
```

## Transient Attributes

```ruby
FactoryBot.define do
  factory :user do
    transient do
      upcased { false }
    end

    name { "alice" }

    after(:build) do |user, evaluator|
      user.name = user.name.upcase if evaluator.upcased
    end
  end
end

create(:user, upcased: true)  # name: "ALICE"
```

## Callbacks

```ruby
FactoryBot.define do
  factory :user do
    after(:build)  { |user| user.name = user.name.strip }
    after(:create) { |user| user.create_profile! }
    before(:create) { |user| user.confirmed_at = Time.current }
  end
end
```

## Linting

Verify all factories are valid:

```ruby
# In a test or rake task
RSpec.describe "factories" do
  it "has valid factories" do
    FactoryBot.lint
  end

  # Or lint with traits:
  it "has valid factories with traits" do
    FactoryBot.lint(traits: true)
  end
end
```

## Common Pitfalls

- **Slow tests from `create`**: Use `build` or `build_stubbed` when you don't need DB persistence.
- **Dependent attributes**: Use blocks `{ }` for dynamic values. Static values are evaluated once at definition time.
- **Over-complex factories**: Keep factories minimal. Use traits for variations instead of complex conditional logic.
- **Association cascades**: `create(:post)` also creates a `:user`. This can slow tests. Use `build_stubbed` or pass an existing user.
- **Sequence collisions**: Sequences reset between test runs but not within a run. Ensure uniqueness constraints match.

## Official Sources

- FactoryBot guide: `https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md`
- FactoryBot Rails: `https://github.com/thoughtbot/factory_bot_rails`
- RubyGems: `https://rubygems.org/gems/factory_bot`
