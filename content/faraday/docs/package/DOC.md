---
name: package
description: "Faraday HTTP client library for Ruby — composable middleware, adapters, and request/response handling"
metadata:
  languages: "ruby"
  versions: "2.14.1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "faraday,http,client,api,ruby,middleware"
---

# Faraday

Faraday is an HTTP client library for Ruby with a middleware architecture. It supports pluggable adapters (Net::HTTP, Typhoeus, etc.) and composable request/response middleware.

## Golden Rule

Use Faraday when you need composable middleware (retries, logging, auth). Build a `Faraday.new` connection object and reuse it. Middleware order matters: request middleware first, response last, adapter at the very end.

## Setup

```ruby
# Gemfile
gem "faraday", "~> 2.14"

# Optional adapters
gem "faraday-typhoeus"
gem "faraday-net_http_persistent"

# Optional middleware
gem "faraday-retry"
gem "faraday-multipart"
```

## Basic Requests

```ruby
require "faraday"

# Simple GET
response = Faraday.get("https://api.example.com/users")
response.status  # 200
response.body    # response body string
response.headers # response headers hash

# With params
response = Faraday.get("https://api.example.com/users", { page: 1, per: 20 })

# POST with JSON body
response = Faraday.post("https://api.example.com/users") do |req|
  req.headers["Content-Type"] = "application/json"
  req.body = { name: "Alice", email: "a@b.com" }.to_json
end
```

## Connection Objects

Build reusable connections with shared configuration:

```ruby
conn = Faraday.new(
  url: "https://api.example.com",
  headers: {
    "Authorization" => "Bearer #{token}",
    "Content-Type" => "application/json",
    "Accept" => "application/json"
  }
) do |f|
  f.request :json                  # encode request body as JSON
  f.response :json                 # decode response body from JSON
  f.response :raise_error          # raise on 4xx/5xx
  f.request :retry, max: 3        # retry on failures
  f.response :logger               # log requests (dev only)
end

# Use the connection
response = conn.get("/users")
response.body  # already parsed as Hash/Array

response = conn.get("/users", page: 2)

response = conn.post("/users", { name: "Alice", email: "a@b.com" })
# body auto-serialized to JSON by :json request middleware
```

## HTTP Methods

```ruby
conn.get("/path", { key: "value" })      # GET with params
conn.post("/path", { key: "value" })     # POST with body
conn.put("/path", { key: "value" })      # PUT
conn.patch("/path", { key: "value" })    # PATCH
conn.delete("/path")                      # DELETE
conn.head("/path")                        # HEAD
```

## Request Configuration

```ruby
response = conn.get("/slow-endpoint") do |req|
  req.options.timeout = 10        # total timeout (seconds)
  req.options.open_timeout = 5    # connection open timeout
  req.headers["X-Custom"] = "value"
  req.params["filter"] = "active"
end
```

## Middleware

### Built-in middleware

```ruby
conn = Faraday.new(url: base_url) do |f|
  # Request middleware
  f.request :json              # serialize body to JSON
  f.request :url_encoded       # form-encode body
  f.request :authorization, "Bearer", token  # auth header

  # Response middleware
  f.response :json             # parse JSON response
  f.response :raise_error      # raise Faraday::Error on 4xx/5xx
  f.response :logger           # log to stdout

  # Adapter (must be last)
  f.adapter :net_http          # default
end
```

### Retry middleware

```ruby
require "faraday/retry"

conn = Faraday.new(url: base_url) do |f|
  f.request :retry,
    max: 3,
    interval: 0.5,
    interval_randomness: 0.5,
    backoff_factor: 2,
    retry_statuses: [429, 500, 502, 503],
    methods: %i[get head options],
    retry_if: ->(env, _exc) { env.request.context[:retryable] }
end
```

### Custom middleware

```ruby
class TimingMiddleware < Faraday::Middleware
  def on_request(env)
    env[:timing_start] = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  end

  def on_complete(env)
    duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - env[:timing_start]
    puts "Request took #{duration.round(3)}s"
  end
end

conn = Faraday.new(url: base_url) do |f|
  f.use TimingMiddleware
  f.request :json
  f.response :json
end
```

## Error Handling

```ruby
conn = Faraday.new(url: base_url) do |f|
  f.response :raise_error  # must include this middleware
  f.request :json
  f.response :json
end

begin
  response = conn.get("/users/999")
rescue Faraday::ResourceNotFound => e
  puts "Not found: #{e.response[:status]}"
rescue Faraday::ClientError => e       # 4xx errors
  puts "Client error: #{e.response[:status]}"
rescue Faraday::ServerError => e       # 5xx errors
  puts "Server error: #{e.response[:status]}"
rescue Faraday::ConnectionFailed
  puts "Connection failed"
rescue Faraday::TimeoutError
  puts "Request timed out"
end
```

Error hierarchy: `Faraday::Error` → `Faraday::ClientError` (4xx) / `Faraday::ServerError` (5xx).

## File Upload

```ruby
require "faraday/multipart"

conn = Faraday.new(url: base_url) do |f|
  f.request :multipart
  f.request :url_encoded
end

payload = {
  file: Faraday::Multipart::FilePart.new("/path/to/file.pdf", "application/pdf"),
  description: "My document"
}

response = conn.post("/upload", payload)
```

## Testing with Stubs

```ruby
stubs = Faraday::Adapter::Test::Stubs.new do |stub|
  stub.get("/users") { [200, { "Content-Type" => "application/json" }, '[{"id":1}]'] }
  stub.post("/users") { [201, {}, '{"id":2}'] }
end

conn = Faraday.new do |f|
  f.response :json
  f.adapter :test, stubs
end

response = conn.get("/users")
response.body  # [{"id" => 1}]

stubs.verify_stubbed_calls  # raises if stubs weren't called
```

## Common Pitfalls

- **Middleware order matters**: Request middleware runs top-to-bottom, response middleware bottom-to-top. Put `:json` request before `:retry`, and `:raise_error` before `:json` response.
- **Adapter must be last**: Always declare the adapter as the last line in the connection block.
- **raise_error placement**: If you want parsed error bodies, put `:raise_error` after `:json` response middleware.
- **Thread safety**: `Faraday::Connection` objects are thread-safe. Create once, share across threads.

## Official Sources

- Faraday documentation: `https://lostisland.github.io/faraday/`
- Faraday GitHub: `https://github.com/lostisland/faraday`
- RubyGems: `https://rubygems.org/gems/faraday`
