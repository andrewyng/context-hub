# RSpec Matchers Reference

## Equality Matchers

```ruby
expect(a).to eq(b)       # a == b (most common)
expect(a).to eql(b)      # a.eql?(b) — value equality
expect(a).to equal(b)    # a.equal?(b) — identity (same object)
expect(a).to be(b)       # alias for equal
```

## Comparison Matchers

```ruby
expect(a).to be > 5
expect(a).to be >= 5
expect(a).to be < 5
expect(a).to be <= 5
expect(a).to be_between(1, 10).inclusive
expect(a).to be_between(1, 10).exclusive
expect(a).to be_within(0.5).of(3.14)
```

## Truthiness Matchers

```ruby
expect(value).to be true          # === true
expect(value).to be false         # === false
expect(value).to be_truthy        # not nil and not false
expect(value).to be_falsey        # nil or false
expect(value).to be_nil           # === nil
```

## Type Matchers

```ruby
expect(obj).to be_a(String)
expect(obj).to be_an(Array)
expect(obj).to be_a_kind_of(Numeric)    # alias
expect(obj).to be_an_instance_of(Float) # exact class, not subclass
expect(obj).to respond_to(:length)
expect(obj).to respond_to(:resize).with(2).arguments
```

## String Matchers

```ruby
expect(str).to include("sub")
expect(str).to start_with("hello")
expect(str).to end_with("world")
expect(str).to match(/regex/)
expect(str).to match("substring")       # also works
```

## Collection Matchers

```ruby
# include: contains elements (order doesn't matter, partial match OK)
expect([1, 2, 3]).to include(1, 3)
expect({ a: 1, b: 2 }).to include(a: 1)

# contain_exactly: exact elements, any order
expect([3, 1, 2]).to contain_exactly(1, 2, 3)

# match_array: alias for contain_exactly
expect([3, 1, 2]).to match_array([1, 2, 3])

# all: every element matches
expect([2, 4, 6]).to all(be_even)
expect(["a", "b"]).to all(be_a(String))

# Size
expect(arr).to be_empty
expect(arr).to have_attributes(size: 3)

# Nested
expect(arr).to include(a_hash_including(name: "Alice"))
expect(arr).to contain_exactly(
  a_hash_including(name: "Alice"),
  a_hash_including(name: "Bob")
)
```

## Change Matchers

```ruby
expect { x += 1 }.to change { x }.by(1)
expect { x += 1 }.to change { x }.from(0).to(1)
expect { arr.push(1) }.to change(arr, :size).by(1)
expect { action }.not_to change { x }

# Compound change
expect { action }.to change(User, :count).by(1)
  .and change(AuditLog, :count).by(1)
```

## Error Matchers

```ruby
expect { code }.to raise_error
expect { code }.to raise_error(SomeError)
expect { code }.to raise_error(SomeError, "message")
expect { code }.to raise_error(SomeError, /partial/)
expect { code }.to raise_error { |e| expect(e.code).to eq(404) }
expect { code }.not_to raise_error
```

## Output Matchers

```ruby
expect { print "hi" }.to output("hi").to_stdout
expect { warn "oops" }.to output(/oops/).to_stderr
expect { code }.to output.to_stdout
```

## Predicate Matchers

RSpec auto-generates matchers from predicate methods:

```ruby
# object.empty? → be_empty
expect([]).to be_empty

# object.valid? → be_valid
expect(user).to be_valid

# object.has_key?(:name) → have_key(:name)
expect(hash).to have_key(:name)

# object.active? → be_active
expect(user).to be_active
```

## Composed Matchers

```ruby
expect(value).to be_a(String).and include("hello")
expect(value).to start_with("a").or start_with("b")

# Argument matchers in expectations
expect(arr).to include(a_value_between(1, 10))
expect(hash).to include(name: a_string_starting_with("A"))
expect(arr).to all(be_a(Integer).and be > 0)
```

## Custom Matchers

```ruby
RSpec::Matchers.define :be_a_multiple_of do |expected|
  match do |actual|
    actual % expected == 0
  end

  failure_message do |actual|
    "expected #{actual} to be a multiple of #{expected}"
  end
end

expect(9).to be_a_multiple_of(3)
```

## Negation

All matchers support negation with `not_to` or `to_not`:

```ruby
expect(value).not_to eq(other)
expect(value).not_to be_nil
expect(arr).not_to include(42)
expect { code }.not_to raise_error
```
