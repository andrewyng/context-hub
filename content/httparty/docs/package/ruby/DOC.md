---
name: package
description: "HTTParty HTTP client for Ruby — simple API for GET, POST, and REST API consumption"
metadata:
  languages: "ruby"
  versions: "0.22.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "httparty,http,client,api,ruby,rest"
---

# HTTParty

HTTParty is a simple HTTP client for Ruby. It provides class-level methods and a module mixin for consuming REST APIs with minimal boilerplate.

## Setup

```ruby
# Gemfile
gem "httparty", "~> 0.22"
```

## Quick Requests

```ruby
require "httparty"

# GET
response = HTTParty.get("https://api.example.com/users")
response.code    # 200
response.body    # raw string
response.parsed_response  # auto-parsed (JSON → Hash/Array)
response.headers # response headers

# GET with query params
response = HTTParty.get("https://api.example.com/users", query: { page: 1, per: 20 })

# POST with JSON
response = HTTParty.post("https://api.example.com/users",
  body: { name: "Alice", email: "a@b.com" }.to_json,
  headers: { "Content-Type" => "application/json" }
)

# POST with form data
response = HTTParty.post("https://api.example.com/login",
  body: { username: "alice", password: "secret" }
)
```

## Class-Based API Clients

The most common pattern — include HTTParty in a class:

```ruby
class GitHubApi
  include HTTParty
  base_uri "https://api.github.com"
  headers "Accept" => "application/vnd.github.v3+json"
  format :json

  def initialize(token)
    @options = { headers: { "Authorization" => "Bearer #{token}" } }
  end

  def user(username)
    self.class.get("/users/#{username}", @options)
  end

  def repos(username)
    self.class.get("/users/#{username}/repos", @options.merge(query: { per_page: 100 }))
  end

  def create_repo(name, private: false)
    self.class.post("/user/repos",
      @options.merge(body: { name: name, private: private }.to_json)
    )
  end
end

client = GitHubApi.new(ENV["GITHUB_TOKEN"])
user = client.user("octocat")
puts user["login"]
```

## Configuration Options

```ruby
class ApiClient
  include HTTParty

  base_uri "https://api.example.com"
  headers "Content-Type" => "application/json"
  format :json                     # auto-parse JSON responses
  default_timeout 10               # seconds
  debug_output $stdout             # log requests (dev only)

  # Basic auth
  basic_auth "user", "password"

  # Bearer token
  headers "Authorization" => "Bearer #{ENV['API_TOKEN']}"

  # Custom parser
  parser ->(body, format) { JSON.parse(body, symbolize_names: true) }
end
```

## HTTP Methods

```ruby
HTTParty.get(url, options)
HTTParty.post(url, options)
HTTParty.put(url, options)
HTTParty.patch(url, options)
HTTParty.delete(url, options)
HTTParty.head(url, options)
HTTParty.options(url, options)
```

Common options:

```ruby
{
  query: { key: "value" },           # query string params
  body: "raw body",                   # request body
  headers: { "X-Custom" => "val" },  # headers
  basic_auth: { username: "u", password: "p" },
  digest_auth: { username: "u", password: "p" },
  timeout: 10,                        # total timeout
  format: :json,                      # force response format
  follow_redirects: true,             # default: true
  limit: 5,                           # max redirects
  verify: false,                      # skip SSL verification (dev only)
  stream_body: true,                  # stream response
}
```

## Response Handling

```ruby
response = HTTParty.get("https://api.example.com/users")

# Status
response.code          # 200
response.success?      # true (2xx)
response.ok?           # true (200)
response.created?      # true (201)
response.not_found?    # true (404)

# Body
response.body          # raw string
response.parsed_response  # parsed (Hash for JSON, Nokogiri for XML)
response["key"]        # access parsed response directly

# Headers
response.headers       # Hash-like
response.headers["content-type"]

# Inspect
response.request       # the request object
response.uri           # final URI (after redirects)
```

## Error Handling

```ruby
begin
  response = HTTParty.get("https://api.example.com/data", timeout: 5)

  case response.code
  when 200
    process(response.parsed_response)
  when 404
    puts "Not found"
  when 401
    puts "Unauthorized"
  when 500..599
    puts "Server error: #{response.code}"
  end
rescue HTTParty::Error => e
  puts "HTTParty error: #{e.message}"
rescue Net::OpenTimeout
  puts "Connection timed out"
rescue Net::ReadTimeout
  puts "Read timed out"
rescue SocketError
  puts "Could not connect"
end
```

## File Upload

```ruby
response = HTTParty.post("https://api.example.com/upload",
  body: {
    file: File.open("/path/to/file.pdf"),
    description: "My document"
  },
  multipart: true
)
```

## Streaming Responses

```ruby
HTTParty.get("https://example.com/large-file", stream_body: true) do |fragment|
  file.write(fragment)
end
```

## Common Pitfalls

- **No automatic retries**: HTTParty doesn't retry failed requests. Implement retry logic yourself or use Faraday if you need middleware.
- **JSON body encoding**: Pass `.to_json` for JSON bodies and set `Content-Type: application/json`. HTTParty doesn't auto-encode hashes to JSON.
- **Response parsing**: HTTParty auto-parses based on Content-Type. Use `format: :plain` to disable parsing.
- **Thread safety**: HTTParty class methods use class-level state. For concurrent use, create separate classes or use instance-based patterns.
- **SSL verification**: Never set `verify: false` in production.

## Official Sources

- HTTParty GitHub: `https://github.com/jnunemaker/httparty`
- HTTParty docs: `https://www.rubydoc.info/gems/httparty`
- RubyGems: `https://rubygems.org/gems/httparty`
