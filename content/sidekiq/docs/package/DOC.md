---
name: package
description: "Sidekiq background job processor for Ruby — Redis-backed, multi-threaded job execution"
metadata:
  languages: "ruby"
  versions: "7.3.9"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "sidekiq,background,jobs,redis,queue,ruby"
---

# Sidekiq

Sidekiq is a background job processor for Ruby. It uses Redis for storage and runs jobs in threads for high throughput.

## Golden Rule

Use Sidekiq with Redis for production background jobs. Include `Sidekiq::Job` for native workers, or use ActiveJob adapter. Pass simple serializable arguments. Design workers to be idempotent and thread-safe.

## Setup

```ruby
# Gemfile
gem "sidekiq", "~> 7.3"
```

```bash
bundle install
```

Configure Redis connection:

```ruby
# config/initializers/sidekiq.rb
Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0") }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0") }
end
```

For Rails, set as the ActiveJob adapter:

```ruby
# config/application.rb
config.active_job.queue_adapter = :sidekiq
```

## Defining Workers

### Native Sidekiq worker

```ruby
class HardWorker
  include Sidekiq::Job

  sidekiq_options queue: "default", retry: 5

  def perform(user_id, action)
    user = User.find(user_id)
    user.send(action)
  end
end
```

### Via ActiveJob (Rails)

```ruby
class ProcessOrderJob < ApplicationJob
  queue_as :critical

  def perform(order_id)
    order = Order.find(order_id)
    OrderProcessor.run(order)
  end
end
```

## Enqueueing Jobs

```ruby
# Native Sidekiq
HardWorker.perform_async(user.id, "activate")
HardWorker.perform_in(5.minutes, user.id, "remind")
HardWorker.perform_at(3.hours.from_now, user.id, "expire")

# Via ActiveJob
ProcessOrderJob.perform_later(order.id)
ProcessOrderJob.set(wait: 5.minutes).perform_later(order.id)
```

## Job Options

```ruby
class ImportWorker
  include Sidekiq::Job

  sidekiq_options(
    queue: "bulk",
    retry: 10,
    backtrace: true,
    dead: false             # don't move to dead set after retries
    # lock: :until_executed — requires sidekiq-unique-jobs gem
  )

  def perform(file_path)
    CsvImporter.run(file_path)
  end
end
```

## Queues Configuration

```yaml
# config/sidekiq.yml
:concurrency: 10
:queues:
  - [critical, 3]
  - [default, 2]
  - [bulk, 1]
```

Start Sidekiq:

```bash
bundle exec sidekiq
bundle exec sidekiq -C config/sidekiq.yml
bundle exec sidekiq -q critical -q default
```

## Retry and Error Handling

Sidekiq retries failed jobs with exponential backoff by default (25 retries over ~21 days):

```ruby
class ReliableWorker
  include Sidekiq::Job

  sidekiq_options retry: 5  # max 5 retries

  sidekiq_retries_exhausted do |msg, exception|
    # Called after all retries fail
    ErrorTracker.notify(exception, job: msg)
  end

  def perform(id)
    record = Record.find(id)
    ExternalApi.sync(record)
  end
end
```

## Middleware

```ruby
# Server middleware (runs around job execution)
class LoggingMiddleware
  def call(job_instance, msg, queue)
    Rails.logger.info "Starting #{msg['class']}"
    yield
    Rails.logger.info "Finished #{msg['class']}"
  end
end

Sidekiq.configure_server do |config|
  config.server_middleware do |chain|
    chain.add LoggingMiddleware
  end
end
```

## Batches (Sidekiq Pro — paid)

```ruby
batch = Sidekiq::Batch.new
batch.description = "Import all CSVs"
batch.on(:complete, ImportCallback, notify: "admin@example.com")

batch.jobs do
  csv_files.each { |f| ImportWorker.perform_async(f) }
end
```

## Web UI

```ruby
# config/routes.rb
require "sidekiq/web"

Rails.application.routes.draw do
  authenticate :user, ->(u) { u.admin? } do
    mount Sidekiq::Web => "/sidekiq"
  end
end
```

## Testing

```ruby
require "sidekiq/testing"

# Fake mode (default in test) — jobs stored, not executed
Sidekiq::Testing.fake!

HardWorker.perform_async(1, "activate")
assert_equal 1, HardWorker.jobs.size

# Drain all queued jobs
HardWorker.drain

# Inline mode — jobs execute immediately
Sidekiq::Testing.inline! do
  HardWorker.perform_async(1, "activate")  # runs now
end
```

RSpec:

```ruby
RSpec.describe HardWorker do
  include Sidekiq::Testing

  before { Sidekiq::Testing.fake! }

  it "enqueues a job" do
    expect {
      HardWorker.perform_async(1, "activate")
    }.to change(HardWorker.jobs, :size).by(1)
  end

  it "processes the job" do
    HardWorker.perform_async(1, "activate")
    HardWorker.drain
    expect(User.find(1)).to be_active
  end
end
```

## Common Pitfalls

- **Don't pass complex objects**: Serialize only simple types (strings, numbers, arrays, hashes). Pass IDs and look up records in the job.
- **Jobs must be idempotent**: Jobs can run more than once. Design for safe re-execution.
- **Redis memory**: Monitor Redis memory usage. Large job payloads and high retry counts consume memory.
- **Thread safety**: Sidekiq is multi-threaded. Avoid shared mutable state in workers.
- **Connection pool**: Ensure your database pool size >= Sidekiq concurrency.

## Official Sources

- Sidekiq wiki: `https://github.com/sidekiq/sidekiq/wiki`
- Sidekiq best practices: `https://github.com/sidekiq/sidekiq/wiki/Best-Practices`
- RubyGems: `https://rubygems.org/gems/sidekiq`
