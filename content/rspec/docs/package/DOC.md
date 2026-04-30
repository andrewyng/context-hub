---
name: package
description: "RSpec testing framework for Ruby — BDD-style tests with matchers, mocks, and shared examples"
metadata:
  languages: "ruby"
  versions: "3.13.2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "rspec,testing,bdd,ruby,tdd"
---

# RSpec

RSpec is a BDD testing framework for Ruby. It provides a readable DSL for writing tests (specs), built-in matchers, mocking/stubbing, and shared examples.

## Golden Rule

Use RSpec with `rspec-rails` for Rails projects. Prefer request specs over controller specs. Use `let` for lazy setup, `let!` when side effects are needed. Use verified doubles (`instance_double`) over plain `double`.

## Setup

```ruby
# Gemfile
group :test do
  gem "rspec", "~> 3.13"
  # For Rails:
  gem "rspec-rails", "~> 7.1"
end
```

```bash
bundle install

# For Rails projects:
bin/rails generate rspec:install
# Creates: .rspec, spec/spec_helper.rb, spec/rails_helper.rb

# For non-Rails:
rspec --init
```

## Basic Structure

```ruby
# spec/models/user_spec.rb
RSpec.describe User do
  describe "#full_name" do
    it "returns first and last name" do
      user = User.new(first_name: "Alice", last_name: "Smith")
      expect(user.full_name).to eq("Alice Smith")
    end

    it "handles missing last name" do
      user = User.new(first_name: "Alice", last_name: nil)
      expect(user.full_name).to eq("Alice")
    end
  end

  describe ".active" do
    it "returns only active users" do
      active = User.create!(name: "A", active: true)
      User.create!(name: "B", active: false)
      expect(User.active).to eq([active])
    end
  end
end
```

## Running Specs

```bash
bundle exec rspec                      # all specs
bundle exec rspec spec/models/         # directory
bundle exec rspec spec/models/user_spec.rb  # single file
bundle exec rspec spec/models/user_spec.rb:15  # specific line
bundle exec rspec --tag focus          # tagged specs
bundle exec rspec --format documentation  # verbose output
bundle exec rspec --fail-fast          # stop on first failure
```

## Matchers

```ruby
# Equality
expect(value).to eq(expected)          # ==
expect(value).to eql(expected)         # eql?
expect(value).to equal(expected)       # same object
expect(value).to be(expected)          # same object

# Truthiness
expect(value).to be true
expect(value).to be_truthy
expect(value).to be_falsey
expect(value).to be_nil

# Comparisons
expect(value).to be > 5
expect(value).to be_between(1, 10)
expect(value).to be_within(0.01).of(3.14)

# Strings
expect(string).to include("substring")
expect(string).to start_with("hello")
expect(string).to match(/pattern/)

# Collections
expect(array).to include(1, 2)
expect(array).to contain_exactly(3, 1, 2)  # any order
expect(array).to match_array([3, 1, 2])
expect(hash).to include(key: "value")
expect(array).to have_attributes(name: "Alice")
expect(array).to be_empty
expect(array).to have_exactly(3).items  # with rspec-collection_matchers

# Types
expect(value).to be_a(String)
expect(value).to be_an(Integer)
expect(value).to respond_to(:name)

# Changes
expect { user.activate! }.to change(user, :active).from(false).to(true)
expect { array.push(1) }.to change(array, :size).by(1)

# Errors
expect { raise "boom" }.to raise_error(RuntimeError, "boom")
expect { raise "boom" }.to raise_error(/boom/)
expect { code }.not_to raise_error

# Output
expect { puts "hello" }.to output("hello\n").to_stdout
```

See `references/matchers.md` for the full matcher reference.

## Let and Subject

```ruby
RSpec.describe User do
  let(:user) { User.new(name: "Alice", age: 30) }
  let!(:admin) { User.create!(name: "Admin", role: "admin") } # eager

  subject { described_class.new(name: "Bob") }

  it { is_expected.to be_valid }

  it "has correct name" do
    expect(user.name).to eq("Alice")
  end
end
```

`let` is lazy (computed on first access). `let!` is eager (computed before each test).

## Hooks

```ruby
RSpec.describe User do
  before(:each) { @counter = 0 }        # before each test
  after(:each) { cleanup }              # after each test
  before(:all) { seed_database }        # once before all tests in group
  after(:all) { truncate_database }     # once after all tests in group
  around(:each) do |example|
    Timeout.timeout(5) { example.run }
  end
end
```

## Context and Describe

```ruby
RSpec.describe Order do
  describe "#total" do
    context "with no items" do
      it "returns zero" do
        expect(Order.new.total).to eq(0)
      end
    end

    context "with items" do
      let(:order) { Order.new(items: [Item.new(price: 10), Item.new(price: 20)]) }

      it "sums item prices" do
        expect(order.total).to eq(30)
      end
    end

    context "with discount" do
      it "applies discount to total" do
        order = Order.new(items: [Item.new(price: 100)], discount: 0.1)
        expect(order.total).to eq(90)
      end
    end
  end
end
```

## Shared Examples

```ruby
RSpec.shared_examples "a timestamped model" do
  it { is_expected.to respond_to(:created_at) }
  it { is_expected.to respond_to(:updated_at) }
end

RSpec.shared_examples "soft deletable" do |factory_name|
  describe "#soft_delete" do
    it "sets deleted_at" do
      record = create(factory_name)
      record.soft_delete
      expect(record.deleted_at).not_to be_nil
    end
  end
end

RSpec.describe User do
  it_behaves_like "a timestamped model"
  it_behaves_like "soft deletable", :user
end
```

## Rails Integration

```ruby
# spec/rails_helper.rb loads Rails + RSpec config
require "rails_helper"

# Model specs
RSpec.describe User, type: :model do
  it "validates email presence" do
    user = User.new(email: nil)
    expect(user).not_to be_valid
    expect(user.errors[:email]).to include("can't be blank")
  end
end

# Request specs (preferred over controller specs)
RSpec.describe "Users API", type: :request do
  describe "GET /users" do
    it "returns users" do
      create(:user, name: "Alice")
      get "/users", headers: { "Accept" => "application/json" }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(1)
    end
  end

  describe "POST /users" do
    it "creates a user" do
      expect {
        post "/users", params: { user: { name: "Alice", email: "a@b.com" } }
      }.to change(User, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end
end
```

## Common Pitfalls

- **let vs let!**: `let` is lazy. If you need the side effect (like DB insertion) before the test runs, use `let!`.
- **before(:all) and DB state**: Records created in `before(:all)` aren't wrapped in a transaction. Use `before(:each)` or FactoryBot.
- **subject**: Prefer explicit `let` variables for clarity. Use `subject` mainly for one-liner `is_expected` tests.
- **Random order**: RSpec runs in random order by default. Tests should not depend on execution order.

## Official Sources

- RSpec documentation: `https://rspec.info/documentation/`
- RSpec Rails: `https://github.com/rspec/rspec-rails`
- RubyGems: `https://rubygems.org/gems/rspec`
