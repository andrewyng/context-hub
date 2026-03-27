# Users

Create and manage user accounts, generate login links, and assume user identity for API operations.

## List Users

```bash
curl -d "app={app}&secret={secret}" \
  https://www.edubase.net/api/v1/users
```

Returns managed, non-generated users. Supports `search`, `limit` (default: 16), and `page` parameters.

## Get User

```bash
# Get current user (API owner)
curl -d "app={app}&secret={secret}" \
  https://www.edubase.net/api/v1/user:me

# Get specific user
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user
```

Returns: `user` (ID), `name`, `status` (enabled/disabled), `exam` (whether it's an exam-only account).

## Create User

```bash
curl -X POST "https://www.edubase.net/api/v1/user" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "username=jsmith" \
  --data "first_name=John" \
  --data "last_name=Smith" \
  --data "email=john.smith@example.com"
# Returns: {"user":"...","username":"jsmith","password":"..."}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `username` | 4-64 characters |
| `first_name` | 1-64 characters |
| `last_name` | 1-64 characters |
| `email` | Valid email address |

### Optional Fields

| Field | Description |
|-------|-------------|
| `password` | 4-64 chars (auto-generated if omitted) |
| `full_name` | Override auto-generated full name |
| `display_name` | Override display name |
| `phone` | Format: `+prefix number` (e.g. `+1 1234567890`) |
| `gender` | `male`, `female`, `other` |
| `birthdate` | `YYYY-MM-DD` |
| `exam` | `true` for exam-only accounts (default: `false`) |
| `group` | User group name |
| `template` | Account template: `corporate_test`, `corporate_user`, `corporate_reporter`, `corporate_supervisor`, `corporate_teacher`, `corporate_admin`, `streaming` |
| `language` | ISO 639-1 code (default: API owner's language) |
| `timezone` | Timezone (default: API owner's timezone) |
| `color` | Favorite color: `default`, `branding`, `red`, `blue`, `yellow`, `green`, `purple`, `gray` |
| `must_change_password` | `true` to force password change on first login |
| `notify` | `true` to send welcome email/SMS |
| `custom_{field}` | Custom field data (if configured for instance) |

## Update User

```bash
# Enable/disable user
curl -X PATCH -d "app={app}&secret={secret}&user={user_id}&active=false" \
  https://www.edubase.net/api/v1/user
```

## Delete User

```bash
curl -X DELETE -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user
```

## User Name

```bash
# Get name
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:name

# Update name
curl -X POST "https://www.edubase.net/api/v1/user:name" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "user={user_id}" \
  --data "first_name=Jane" \
  --data "last_name=Doe"
```

## User Group

```bash
# Get group
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:group

# Update group
curl -X POST -d "app={app}&secret={secret}&user={user_id}&group=teachers" \
  https://www.edubase.net/api/v1/user:group
```

## Search User

Look up users by email, username, or code:

```bash
curl -d "app={app}&secret={secret}&query=john@example.com" \
  https://www.edubase.net/api/v1/user:search
# Returns: {"user":"...","exam":false}
```

## Login Links

Generate magic login links for users. Links can be single-use or reusable.

### Get Existing Link

```bash
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:login
```

### Generate New Link

```bash
curl -X POST "https://www.edubase.net/api/v1/user:login" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "user={user_id}" \
  --data "expires=7" \
  --data "logins=1"
# Returns: {"user":"...","url":"...","valid":"...","count":1}
```

| Field | Description |
|-------|-------------|
| `expires` | Days (1-30) or date `YYYY-MM-DD` (default: 1 day) |
| `logins` | Max uses, up to 255 (default: unlimited) |
| `redirect` | URI path or `[{content_type}:{tag}]` to redirect after login |
| `exam` | Exam ID to redirect user to (user must be on exam) |
| `template` | Login link template identifier |
| `short` | `true` for shortened eduba.se link (if enabled) |

### Invalidate Link

```bash
curl -X DELETE -d "app={app}&secret={secret}&user={user_id}&url={login_url}" \
  https://www.edubase.net/api/v1/user:login
```

## Assume User

Perform API operations as a different user. Useful for administrative tasks.

### Request Assume Token

```bash
curl -X POST "https://www.edubase.net/api/v1/user:assume" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "user={user_id}"
# Returns: {"user":"...","token":"...","valid":"..."}
```

The `user` field accepts: user identification string, username, or email address. Optionally include `password` or user secret for additional verification.

### Use Assume Token

Include the token in subsequent requests:

```bash
curl -d "app={app}&secret={secret}&assume={token}" \
  https://www.edubase.net/api/v1/exams
```

### Revoke Assume Token

Always revoke tokens when done:

```bash
curl -X DELETE -d "app={app}&secret={secret}&token={assume_token}" \
  https://www.edubase.net/api/v1/user:assume
```

## User Organizations

```bash
# List user's organizations
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:organizations

# Add user to organizations
curl -X POST "https://www.edubase.net/api/v1/user:organizations" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "user={user_id}" \
  --data "organizations=org1,org2" \
  --data "permission_organization=teacher" \
  --data "permission_content=modify"

# Remove user from organizations
curl -X DELETE -d "app={app}&secret={secret}&user={user_id}&organizations=org1,org2" \
  https://www.edubase.net/api/v1/user:organizations
```

## User Classes

```bash
# List user's classes
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:classes

# Add user to classes
curl -X POST -d "app={app}&secret={secret}&user={user_id}&classes=cls1,cls2&expires=30" \
  https://www.edubase.net/api/v1/user:classes

# Remove user from classes
curl -X DELETE -d "app={app}&secret={secret}&user={user_id}&classes=cls1,cls2" \
  https://www.edubase.net/api/v1/user:classes
```
