---
name: package
description: "Devise authentication library for Rails — user registration, login, password reset, and session management"
metadata:
  languages: "ruby"
  versions: "4.9.4"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "devise,authentication,rails,ruby,auth"
---

# Devise

Devise is a flexible authentication solution for Rails. It handles user registration, login, logout, password reset, email confirmation, account locking, and more.

## Golden Rule

Use Devise for authentication in Rails apps. Configure modules in the model, not globally. Use `devise_parameter_sanitizer` for custom fields. For API-only apps, pair with `devise-jwt` or roll token auth.

## Setup

```ruby
# Gemfile
gem "devise", "~> 4.9"
```

```bash
bundle install
bin/rails generate devise:install
bin/rails generate devise User
bin/rails db:migrate
```

This creates:
- `config/initializers/devise.rb` — configuration
- `app/models/user.rb` — User model with Devise modules
- Migration for the users table

## Devise Modules

Configure modules in the User model:

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :lockable, :trackable, :timeoutable
end
```

| Module | What it does |
|--------|-------------|
| `database_authenticatable` | Password hashing and login |
| `registerable` | Sign up, edit, delete account |
| `recoverable` | Password reset via email |
| `rememberable` | "Remember me" cookie |
| `validatable` | Email/password validations |
| `confirmable` | Email confirmation before login |
| `lockable` | Lock account after failed attempts |
| `trackable` | Track sign-in count, timestamps, IPs |
| `timeoutable` | Session expiry after inactivity |
| `omniauthable` | OAuth via OmniAuth |

## Configuration

```ruby
# config/initializers/devise.rb
Devise.setup do |config|
  config.mailer_sender = "noreply@example.com"
  config.password_length = 8..128
  config.timeout_in = 30.minutes
  config.maximum_attempts = 5          # lockable
  config.confirm_within = 3.days       # confirmable
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
  config.navigational_formats = ["*/*", :html, :turbo_stream]
end
```

## Routes

```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Custom paths
  devise_for :users, path: "auth", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "register"
  }

  # Scoped routes
  devise_for :admins, class_name: "User", path: "admin"
end
```

Generated routes:

```
new_user_session_path      # GET  /users/sign_in
user_session_path          # POST /users/sign_in
destroy_user_session_path  # DELETE /users/sign_out
new_user_registration_path # GET  /users/sign_up
new_user_password_path     # GET  /users/password/new
```

## Controller Helpers

Available in all controllers:

```ruby
# Authentication
before_action :authenticate_user!     # require login

# Current user
current_user                          # logged-in User or nil
user_signed_in?                       # boolean

# For other scopes
current_admin
admin_signed_in?
authenticate_admin!
```

## Customizing Controllers

```bash
bin/rails generate devise:controllers users
```

```ruby
# app/controllers/users/registrations_controller.rb
class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_permitted_parameters

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :phone])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :phone])
  end

  def after_sign_up_path_for(resource)
    dashboard_path
  end
end

# config/routes.rb
devise_for :users, controllers: {
  registrations: "users/registrations",
  sessions: "users/sessions"
}
```

## Customizing Views

```bash
bin/rails generate devise:views
# Or scoped:
bin/rails generate devise:views users
```

Generates views in `app/views/devise/` (or `app/views/users/`) for sessions, registrations, passwords, etc.

## API Authentication

For token-based API auth, Devise works with JWT gems:

```ruby
# Gemfile
gem "devise"
gem "devise-jwt"
```

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :jwt_authenticatable, jwt_revocation_strategy: Denylist
end
```

Or use a simpler token approach:

```ruby
class User < ApplicationRecord
  has_secure_token :api_token
end

class ApiController < ApplicationController
  before_action :authenticate_api_user!

  private

  def authenticate_api_user!
    token = request.headers["Authorization"]&.remove("Bearer ")
    @current_user = User.find_by(api_token: token)
    head :unauthorized unless @current_user
  end
end
```

## Testing with Devise

```ruby
# test/test_helper.rb or spec/rails_helper.rb
class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end

# In controller/integration tests
class PostsControllerTest < ActionDispatch::IntegrationTest
  test "requires authentication" do
    get posts_path
    assert_redirected_to new_user_session_path
  end

  test "shows posts for logged in user" do
    sign_in users(:alice)
    get posts_path
    assert_response :success
  end
end

# RSpec
RSpec.describe PostsController, type: :controller do
  include Devise::Test::ControllerHelpers

  before { sign_in create(:user) }

  it "returns success" do
    get :index
    expect(response).to have_http_status(:success)
  end
end
```

## Common Pitfalls

- **Turbo/Hotwire compatibility**: Rails 7+ with Turbo requires `config.navigational_formats = ["*/*", :html, :turbo_stream]` and error responses with `status: :unprocessable_entity`.
- **Strong parameters**: Use `devise_parameter_sanitizer.permit` for custom fields, not controller-level `params.permit`.
- **Email delivery**: Devise sends emails (confirmation, reset). Ensure Action Mailer is configured in production.
- **sign_out_via**: Must match your logout link method (`:delete` by default).

## Official Sources

- Devise GitHub: `https://github.com/heartcombo/devise`
- Devise wiki: `https://github.com/heartcombo/devise/wiki`
- RubyGems: `https://rubygems.org/gems/devise`
