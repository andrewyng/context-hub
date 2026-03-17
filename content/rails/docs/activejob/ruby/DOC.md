---
name: activejob
description: "Rails ActiveJob framework for declaring and running background jobs with various queue backends"
metadata:
  languages: "ruby"
  versions: "8.0.2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "rails,jobs,background,queue,activejob,ruby"
---

# Rails ActiveJob

ActiveJob is Rails' framework for declaring background jobs and running them on various queue backends (Sidekiq, Resque, Delayed Job, Solid Queue, etc.).

## Generating Jobs

```bash
bin/rails generate job ProcessPayment
```

Creates `app/jobs/process_payment_job.rb`.

## Defining Jobs

```ruby
class ProcessPaymentJob < ApplicationJob
  queue_as :default

  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3
  discard_on ActiveJob::DeserializationError

  def perform(order_id)
    order = Order.find(order_id)
    PaymentService.charge(order)
  end
end
```

## Enqueueing Jobs

```ruby
# Enqueue for immediate processing
ProcessPaymentJob.perform_later(order.id)

# Enqueue for later
ProcessPaymentJob.set(wait: 5.minutes).perform_later(order.id)
ProcessPaymentJob.set(wait_until: Date.tomorrow.noon).perform_later(order.id)

# Specify queue
ProcessPaymentJob.set(queue: :critical).perform_later(order.id)

# Run synchronously (for testing/debugging)
ProcessPaymentJob.perform_now(order.id)
```

## Queue Configuration

```ruby
class ProcessPaymentJob < ApplicationJob
  queue_as :critical
end

class SendNewsletterJob < ApplicationJob
  queue_as :low_priority
end

# Dynamic queue
class RoutableJob < ApplicationJob
  queue_as do
    if self.arguments.first.priority == "high"
      :critical
    else
      :default
    end
  end
end
```

## Callbacks

```ruby
class ReportJob < ApplicationJob
  before_enqueue :check_quota
  before_perform :log_start
  after_perform :log_completion
  around_perform :measure_duration

  private

  def check_quota
    throw :abort if RateLimiter.exceeded?
  end

  def measure_duration
    start = Time.current
    yield
    Rails.logger.info "Job took #{Time.current - start}s"
  end
end
```

## Error Handling

```ruby
class ImportJob < ApplicationJob
  retry_on Net::OpenTimeout, wait: :polynomially_longer, attempts: 5
  retry_on Timeout::Error, wait: 10.seconds, attempts: 3
  discard_on ImportError

  # Custom error handler after all retries exhausted
  retry_on ExternalApiError, attempts: 3 do |job, error|
    ErrorNotifier.notify(error, job_id: job.job_id)
  end

  def perform(file_path)
    ImportService.run(file_path)
  end
end
```

## Argument Serialization

ActiveJob serializes arguments using GlobalID for ActiveRecord objects:

```ruby
# Pass AR objects directly — they serialize via GlobalID
SendWelcomeEmailJob.perform_later(user)  # serializes as gid://app/User/42

# Supported argument types:
# - Basic types: String, Integer, Float, BigDecimal, NilClass, TrueClass, FalseClass
# - Date, Time, DateTime, ActiveSupport::TimeWithZone
# - ActiveSupport::Duration
# - Hash, Array, Range (of supported types)
# - ActiveRecord objects (via GlobalID)
```

## Backend Configuration

```ruby
# config/application.rb or config/environments/production.rb
config.active_job.queue_adapter = :sidekiq    # production
config.active_job.queue_adapter = :solid_queue # Rails 8 default
config.active_job.queue_adapter = :async       # dev/test (in-process)
config.active_job.queue_adapter = :test        # test (stores jobs for inspection)
```

## Testing

```ruby
# test/jobs/process_payment_job_test.rb
class ProcessPaymentJobTest < ActiveJob::TestCase
  test "enqueues job" do
    assert_enqueued_with(job: ProcessPaymentJob, args: [42]) do
      ProcessPaymentJob.perform_later(42)
    end
  end

  test "performs job" do
    order = orders(:pending)
    assert_changes -> { order.reload.status }, to: "paid" do
      ProcessPaymentJob.perform_now(order.id)
    end
  end

  test "retries on timeout" do
    assert_enqueued_with(job: ProcessPaymentJob) do
      ProcessPaymentJob.perform_later(1)
    end
    perform_enqueued_jobs
  end
end
```

## Common Pitfalls

- **Don't pass complex objects**: Serialize only IDs or simple types. AR objects work via GlobalID but the record must exist when the job runs.
- **Jobs are not transactions**: A job can fail mid-way. Design jobs to be idempotent.
- **Test adapter in test env**: Use `config.active_job.queue_adapter = :test` to avoid actually running jobs in tests.

## Official Sources

- ActiveJob basics: `https://guides.rubyonrails.org/active_job_basics.html`
- RubyGems: `https://rubygems.org/gems/activejob`
