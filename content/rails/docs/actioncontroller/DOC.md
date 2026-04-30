---
name: actioncontroller
description: "Rails ActionController for handling HTTP requests, routing, params, filters, and rendering responses"
metadata:
  languages: "ruby"
  versions: "8.0.2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "rails,controller,routing,http,ruby"
---

# Rails ActionController

ActionController handles HTTP requests in Rails. It receives requests via routes, processes params, interacts with models, and renders responses.

## Golden Rule

Use resourceful routes and strong parameters. Prefer `before_action` for shared logic. Return proper HTTP status codes. Never pass raw `params` to models.

## Setup

ActionController ships with Rails. In a Rails app, it's available automatically. For standalone use: `gem 'actionpack'`.

## Routing

Define routes in `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  # RESTful resources
  resources :users
  resources :posts do
    resources :comments, only: [:create, :destroy]
  end

  # Single resource (no index, no ID in URL)
  resource :profile, only: [:show, :edit, :update]

  # Custom routes
  get "dashboard", to: "pages#dashboard"
  post "search", to: "search#create"

  # Namespaced
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create]
    end
  end

  # Root
  root "pages#home"
end
```

Route helpers generated:

```ruby
users_path          # /users
user_path(user)     # /users/42
new_user_path       # /users/new
edit_user_path(user) # /users/42/edit
```

Check routes:

```bash
bin/rails routes
bin/rails routes -g user   # grep for "user"
```

## Controllers

```ruby
class UsersController < ApplicationController
  def index
    @users = User.all
  end

  def show
    @user = User.find(params[:id])
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to @user, notice: "User created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      redirect_to @user
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy
    redirect_to users_path, notice: "User deleted."
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :role)
  end
end
```

## Strong Parameters

Always filter params before passing to models:

```ruby
# Single model
params.require(:user).permit(:name, :email)

# Nested attributes
params.require(:post).permit(:title, :body, tags: [], comments_attributes: [:id, :body, :_destroy])

# Array of permitted scalars
params.require(:user).permit(:name, role_ids: [])

# Conditional
def user_params
  permitted = [:name, :email]
  permitted << :role if current_user.admin?
  params.require(:user).permit(*permitted)
end
```

## Filters (Callbacks)

```ruby
class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  around_action :set_time_zone
  after_action :track_action
end

class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :destroy]
  skip_before_action :authenticate_user!, only: [:index, :show]

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def set_time_zone(&block)
    Time.use_zone(current_user.time_zone, &block)
  end
end
```

## Rendering Responses

```ruby
# Implicit: renders app/views/users/show.html.erb

# Explicit render
render :new                          # same controller template
render "posts/show"                  # different controller template
render plain: "OK"                   # plain text
render json: @user                   # JSON
render json: @user, status: :created
render json: { error: "Not found" }, status: :not_found

# Head-only response
head :no_content                     # 204
head :not_found                      # 404

# Redirect
redirect_to @user                    # to show
redirect_to users_path
redirect_to root_path, notice: "Welcome"
redirect_back fallback_location: root_path
```

## JSON API Controllers

```ruby
class Api::V1::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    users = User.where(active: true).select(:id, :name, :email)
    render json: users
  end

  def show
    user = User.find(params[:id])
    render json: user, only: [:id, :name, :email], include: { posts: { only: [:id, :title] } }
  end

  def create
    user = User.new(user_params)
    if user.save
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

## Error Handling

```ruby
class ApplicationController < ActionController::Base
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActionController::ParameterMissing, with: :bad_request

  private

  def not_found
    respond_to do |format|
      format.html { render file: Rails.public_path.join("404.html"), status: :not_found, layout: false }
      format.json { render json: { error: "Not found" }, status: :not_found }
    end
  end

  def bad_request(exception)
    render json: { error: exception.message }, status: :bad_request
  end
end
```

## Sessions and Cookies

```ruby
# Session (server-side, cookie-backed by default)
session[:user_id] = user.id
current_user_id = session[:user_id]
session.delete(:user_id)

# Cookies
cookies[:theme] = "dark"
cookies[:theme] = { value: "dark", expires: 1.year, httponly: true }
cookies.encrypted[:token] = "secret"
cookies.delete(:theme)
```

## Common Pitfalls

- **Missing strong parameters**: Never pass `params` directly to model methods. Always use `permit`.
- **Double render**: A controller action can only render or redirect once. Use `and return` after early renders.
- **CSRF in APIs**: Disable `verify_authenticity_token` for API-only controllers, but ensure you have alternative auth (tokens, JWT).
- **N+1 in views**: Eager load associations in the controller, not in the view.

## Official Sources

- Rails routing guide: `https://guides.rubyonrails.org/routing.html`
- ActionController overview: `https://guides.rubyonrails.org/action_controller_overview.html`
- Strong parameters: `https://guides.rubyonrails.org/action_controller_overview.html#strong-parameters`
