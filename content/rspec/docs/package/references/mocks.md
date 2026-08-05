# RSpec Mocks Reference

## Doubles (Test Doubles)

```ruby
# Basic double
user = double("User")
user = double("User", name: "Alice", email: "a@b.com")

# Verified double — raises if methods don't exist on the real class
user = instance_double("User", name: "Alice")
user = class_double("User", count: 42)
user = object_double(User.new, name: "Alice")
```

Prefer verified doubles (`instance_double`, `class_double`) — they catch method signature mismatches.

## Stubs (allow)

```ruby
# Stub a method
allow(user).to receive(:name).and_return("Alice")
allow(user).to receive(:save).and_return(true)

# Stub with block
allow(service).to receive(:fetch) { |id| "item_#{id}" }

# Stub chain
allow(User).to receive_message_chain(:active, :recent, :first).and_return(user)

# Stub any instance (use sparingly)
allow_any_instance_of(User).to receive(:valid?).and_return(true)
```

## Return Values

```ruby
allow(obj).to receive(:method).and_return("value")
allow(obj).to receive(:method).and_return(1, 2, 3)  # returns 1, then 2, then 3
allow(obj).to receive(:method).and_raise(RuntimeError, "boom")
allow(obj).to receive(:method).and_throw(:halt)
allow(obj).to receive(:method).and_yield("block_arg")
allow(obj).to receive(:method).and_call_original    # call real implementation
allow(obj).to receive(:method).and_wrap_original do |m, *args|
  m.call(*args) + " modified"
end
```

## Expectations (expect...to receive)

```ruby
# Expect a method to be called
expect(mailer).to receive(:send_email).with(user.email, anything)

# Expect with specific count
expect(logger).to receive(:info).once
expect(logger).to receive(:info).twice
expect(logger).to receive(:info).exactly(3).times
expect(logger).to receive(:info).at_least(:once)
expect(logger).to receive(:info).at_most(5).times

# Expect not called
expect(mailer).not_to receive(:send_email)

# Ordered expectations
expect(obj).to receive(:first).ordered
expect(obj).to receive(:second).ordered
```

## Argument Matchers

```ruby
expect(obj).to receive(:method).with("exact")
expect(obj).to receive(:method).with(anything)
expect(obj).to receive(:method).with(any_args)
expect(obj).to receive(:method).with(no_args)
expect(obj).to receive(:method).with(hash_including(key: "val"))
expect(obj).to receive(:method).with(hash_excluding(key: "val"))
expect(obj).to receive(:method).with(array_including(1, 2))
expect(obj).to receive(:method).with(a_string_matching(/pattern/))
expect(obj).to receive(:method).with(an_instance_of(String))
expect(obj).to receive(:method).with(duck_type(:to_s, :length))
expect(obj).to receive(:method).with(boolean)  # true or false
```

## Spying (have_received)

Test after the fact instead of setting expectations before:

```ruby
# Arrange
allow(mailer).to receive(:send_email)

# Act
service.process(user)

# Assert
expect(mailer).to have_received(:send_email).with(user.email)
expect(mailer).to have_received(:send_email).once
```

This is often cleaner than `expect(...).to receive(...)` because it follows arrange-act-assert.

## Partial Doubles (stubbing real objects)

```ruby
user = User.new(name: "Alice")

# Stub one method on a real object
allow(user).to receive(:expensive_calculation).and_return(42)

# The rest of the object works normally
expect(user.name).to eq("Alice")
expect(user.expensive_calculation).to eq(42)
```

## Stubbing Constants

```ruby
stub_const("ENV_NAME", "test")
stub_const("Config::MAX_RETRIES", 5)
stub_const("ExternalService", class_double("ExternalService", call: "mocked"))
```

## Null Object Doubles

```ruby
# Returns itself for any undefined method (useful for chaining)
logger = double("Logger").as_null_object
logger.info("test")   # doesn't raise
logger.unknown_method  # returns the double itself
```

## Best Practices

- **Prefer verified doubles** (`instance_double`) over plain `double` — catches interface changes.
- **Prefer spies** (`have_received`) over expectations (`receive`) — follows arrange-act-assert.
- **Don't mock what you don't own** — wrap third-party APIs in your own adapter, mock the adapter.
- **Avoid `allow_any_instance_of`** — it's a code smell; refactor to inject dependencies instead.
- **Mock at boundaries** — mock external services, not internal collaborators.
