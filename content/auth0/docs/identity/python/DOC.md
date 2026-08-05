---
name: identity
description: "Auth0 Python SDK for OAuth, OIDC, and identity management in server-side applications"
metadata:
  languages: "python"
  versions: "5.6.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "auth0,identity,oauth,oidc,authentication"
---

# Auth0 Python SDK Coding Guidelines

You are an Auth0 API expert. Help me with writing code using the Auth0 SDK for Python applications.

You can find the official SDK documentation here:
https://auth0-python.readthedocs.io/en/latest/

## Golden Rule: Use the Correct Auth0 SDK

Always use the official Auth0 Python SDK for server-side authentication and user management operations. This is the standard library for all Auth0 Management API and Authentication API interactions in Python.

- **Library Name:** Auth0 Python SDK
- **PyPI Package:** `auth0-python`
- **Current Version:** 5.6.0
- **Minimum Python Version:** 3.8+

**Installation:**

```bash
pip install auth0-python
```

**Correct Usage:**

```python
from auth0.management import Auth0
from auth0.authentication import GetToken, Database
```

**Incorrect:**
- Using unofficial Auth0 packages
- Using deprecated versions of the SDK

## Environment Variables

Set up your environment variables for Auth0:

```
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_MANAGEMENT_API_AUDIENCE=https://your-tenant.us.auth0.com/api/v2/
```

## Installation and Setup

Install the Auth0 Python SDK:

```bash
pip install auth0-python
```

For specific versions:

```bash
pip install auth0-python==5.6.0
```

## Initialization

### Management API Client Initialization

The Management API client is used for administrative operations like user management, role assignment, and configuration.

**Basic initialization with token:**

```python
from auth0.management import Auth0
import os

domain = os.getenv('AUTH0_DOMAIN')
mgmt_api_token = os.getenv('AUTH0_MANAGEMENT_API_TOKEN')

auth0 = Auth0(domain, mgmt_api_token)
```

**Initialization with client credentials (recommended):**

```python
from auth0.authentication import GetToken
from auth0.management import Auth0
import os

domain = os.getenv('AUTH0_DOMAIN')
client_id = os.getenv('AUTH0_CLIENT_ID')
client_secret = os.getenv('AUTH0_CLIENT_SECRET')

# Get Management API token
get_token = GetToken(domain, client_id, client_secret=client_secret)
token = get_token.client_credentials(f'https://{domain}/api/v2/')
mgmt_api_token = token['access_token']

# Initialize Management client
auth0 = Auth0(domain, mgmt_api_token)
```

### Authentication API Client Initialization

The Authentication API provides methods for login, signup, and password management.

**Database authentication:**

```python
from auth0.authentication import Database
import os

domain = os.getenv('AUTH0_DOMAIN')
client_id = os.getenv('AUTH0_CLIENT_ID')

database = Database(domain, client_id)
```

**Token authentication:**

```python
from auth0.authentication import GetToken
import os

domain = os.getenv('AUTH0_DOMAIN')
client_id = os.getenv('AUTH0_CLIENT_ID')
client_secret = os.getenv('AUTH0_CLIENT_SECRET')

get_token = GetToken(domain, client_id, client_secret=client_secret)
```

## User Management

### Creating Users

```python
from auth0.management import Auth0

auth0 = Auth0(domain, mgmt_api_token)

def create_user(email, password):
    user = auth0.users.create({
        'email': email,
        'password': password,
        'connection': 'Username-Password-Authentication',
        'email_verified': False,
        'user_metadata': {
            'plan': 'premium',
            'preferences': {'theme': 'dark'}
        },
        'app_metadata': {
            'role': 'user'
        }
    })

    print(f"User created: {user['user_id']}")
    return user
```

### Getting User by ID

```python
def get_user(user_id):
    user = auth0.users.get(user_id)
    print(f"User: {user}")
    return user
```

### Getting User by Email

```python
def get_user_by_email(email):
    users = auth0.users_by_email.search_users_by_email(email)

    if users:
        print(f"User found: {users[0]}")
        return users[0]

    return None
```

### Updating User

```python
def update_user(user_id, updates):
    updated_user = auth0.users.update(user_id, {
        'email': 'newemail@example.com',
        'user_metadata': {
            'plan': 'enterprise'
        }
    })

    return updated_user
```

### Deleting User

```python
def delete_user(user_id):
    auth0.users.delete(user_id)
    print('User deleted')
```

### Listing Users

```python
def list_users(page=0, per_page=50):
    users = auth0.users.list(page=page, per_page=per_page)
    return users
```

### Searching Users

```python
def search_users(query):
    users = auth0.users.list(
        q=query,
        search_engine='v3'
    )
    return users

# Example usage
users = search_users('email:"*@example.com"')
```

### Getting All Users (with pagination)

```python
def get_all_users():
    all_users = []
    page = 0
    per_page = 100

    while True:
        users = auth0.users.list(page=page, per_page=per_page)

        if not users['users']:
            break

        all_users.extend(users['users'])

        # Check if there are more pages
        if len(users['users']) < per_page:
            break

        page += 1

    return all_users
```

## Authentication Operations

### User Signup

```python
from auth0.authentication import Database

database = Database(domain, client_id)

def signup_user(email, password):
    result = database.signup(
        email=email,
        password=password,
        connection='Username-Password-Authentication'
    )

    print(f"User signed up: {result}")
    return result
```

### User Login (Resource Owner Password Grant)

```python
from auth0.authentication import GetToken

get_token = GetToken(domain, client_id, client_secret=client_secret)

def login_user(username, password):
    token_response = get_token.login(
        username=username,
        password=password,
        realm='Username-Password-Authentication',
        scope='openid profile email',
        audience='https://api.example.com'
    )

    print(f"Access Token: {token_response['access_token']}")
    print(f"ID Token: {token_response.get('id_token')}")

    return token_response
```

### Client Credentials Grant

```python
def get_client_credentials_token(audience):
    token = get_token.client_credentials(audience)

    print(f"Access Token: {token['access_token']}")
    return token
```

### Authorization Code Exchange

```python
def exchange_authorization_code(code, redirect_uri):
    token = get_token.authorization_code(
        code=code,
        redirect_uri=redirect_uri
    )

    return token
```

### Refresh Token

```python
def refresh_access_token(refresh_token):
    token = get_token.refresh_token(refresh_token)

    print(f"New Access Token: {token['access_token']}")
    return token
```

### Password Reset

```python
def request_password_reset(email):
    database.change_password(
        email=email,
        connection='Username-Password-Authentication'
    )

    print('Password reset email sent')
```

### Password Realm Grant

```python
def password_realm_grant(username, password, realm):
    token = get_token.login(
        username=username,
        password=password,
        realm=realm,
        scope='openid profile email'
    )

    return token
```

## Role and Permission Management

### Creating a Role

```python
def create_role(name, description):
    role = auth0.roles.create({
        'name': name,
        'description': description
    })

    print(f"Role created: {role['id']}")
    return role
```

### Getting All Roles

```python
def get_all_roles():
    roles = auth0.roles.list()
    return roles
```

### Getting Role by ID

```python
def get_role(role_id):
    role = auth0.roles.get(role_id)
    return role
```

### Updating a Role

```python
def update_role(role_id, name, description):
    role = auth0.roles.update(role_id, {
        'name': name,
        'description': description
    })

    return role
```

### Deleting a Role

```python
def delete_role(role_id):
    auth0.roles.delete(role_id)
    print('Role deleted')
```

### Assigning Roles to User

```python
def assign_roles_to_user(user_id, role_ids):
    auth0.users.add_roles(user_id, {'roles': role_ids})
    print('Roles assigned to user')
```

### Getting User Roles

```python
def get_user_roles(user_id):
    roles = auth0.users.list_roles(user_id)
    print(f"User Roles: {roles}")
    return roles
```

### Removing Roles from User

```python
def remove_roles_from_user(user_id, role_ids):
    auth0.users.remove_roles(user_id, {'roles': role_ids})
    print('Roles removed from user')
```

### Adding Permissions to Role

```python
def add_permissions_to_role(role_id, permissions):
    auth0.roles.add_permissions(role_id, {
        'permissions': [
            {
                'permission_name': 'read:messages',
                'resource_server_identifier': 'https://api.example.com'
            },
            {
                'permission_name': 'write:messages',
                'resource_server_identifier': 'https://api.example.com'
            }
        ]
    })

    print('Permissions added to role')
```

### Getting Role Permissions

```python
def get_role_permissions(role_id):
    permissions = auth0.roles.get_permissions(role_id)
    return permissions
```

### Removing Permissions from Role

```python
def remove_permissions_from_role(role_id, permissions):
    auth0.roles.remove_permissions(role_id, {'permissions': permissions})
    print('Permissions removed from role')
```

### Getting User Permissions

```python
def get_user_permissions(user_id):
    permissions = auth0.users.list_permissions(user_id)
    print(f"User Permissions: {permissions}")
    return permissions
```

### Assigning Permissions to User

```python
def assign_permissions_to_user(user_id):
    auth0.users.add_permissions(user_id, {
        'permissions': [
            {
                'permission_name': 'read:messages',
                'resource_server_identifier': 'https://api.example.com'
            }
        ]
    })

    print('Permissions assigned to user')
```

### Removing Permissions from User

```python
def remove_permissions_from_user(user_id, permissions):
    auth0.users.remove_permissions(user_id, {'permissions': permissions})
    print('Permissions removed from user')
```

## Organization Management

### Creating an Organization

```python
def create_organization(name, display_name):
    org = auth0.organizations.create({
        'name': name,
        'display_name': display_name
    })

    print(f"Organization created: {org['id']}")
    return org
```

### Getting All Organizations

```python
def get_all_organizations():
    orgs = auth0.organizations.list()
    return orgs
```

### Getting Organization by ID

```python
def get_organization(org_id):
    org = auth0.organizations.get(org_id)
    return org
```

### Updating an Organization

```python
def update_organization(org_id, updates):
    org = auth0.organizations.update(org_id, updates)
    return org
```

### Deleting an Organization

```python
def delete_organization(org_id):
    auth0.organizations.delete(org_id)
    print('Organization deleted')
```

### Adding Members to Organization

```python
def add_member_to_organization(org_id, user_ids):
    auth0.organizations.create_members(org_id, {'members': user_ids})
    print('Members added to organization')
```

### Getting Organization Members

```python
def get_organization_members(org_id):
    members = auth0.organizations.list_members(org_id)
    return members
```

### Removing Members from Organization

```python
def remove_members_from_organization(org_id, user_ids):
    for user_id in user_ids:
        auth0.organizations.delete_member(org_id, user_id)

    print('Members removed from organization')
```

### Assigning Roles to Organization Member

```python
def assign_org_roles(org_id, user_id, role_ids):
    auth0.organizations.create_member_roles(
        org_id,
        user_id,
        {'roles': role_ids}
    )

    print('Organization roles assigned')
```

### Getting Organization Member Roles

```python
def get_org_member_roles(org_id, user_id):
    roles = auth0.organizations.list_member_roles(org_id, user_id)
    return roles
```

## Connection Management

### Getting All Connections

```python
def get_all_connections():
    connections = auth0.connections.all()
    return connections
```

### Getting Connection by ID

```python
def get_connection(connection_id):
    connection = auth0.connections.get(connection_id)
    return connection
```

### Creating a Database Connection

```python
def create_database_connection(name):
    connection = auth0.connections.create({
        'name': name,
        'strategy': 'auth0',
        'enabled_clients': [client_id]
    })

    return connection
```

### Updating a Connection

```python
def update_connection(connection_id, updates):
    connection = auth0.connections.update(connection_id, updates)
    return connection
```

### Deleting a Connection

```python
def delete_connection(connection_id):
    auth0.connections.delete(connection_id)
    print('Connection deleted')
```

## Client Application Management

### Getting All Clients

```python
def get_all_clients():
    clients = auth0.clients.all()
    return clients
```

### Getting Client by ID

```python
def get_client(client_id):
    client = auth0.clients.get(client_id)
    return client
```

### Creating a Client

```python
def create_client(name, app_type):
    client = auth0.clients.create({
        'name': name,
        'app_type': app_type,  # 'native', 'spa', 'regular_web', 'non_interactive'
        'callbacks': ['http://localhost:3000/callback'],
        'allowed_logout_urls': ['http://localhost:3000']
    })

    return client
```

### Updating a Client

```python
def update_client(client_id, updates):
    client = auth0.clients.update(client_id, updates)
    return client
```

### Deleting a Client

```python
def delete_client(client_id):
    auth0.clients.delete(client_id)
    print('Client deleted')
```

## Email and Verification

### Sending Email Verification

```python
def send_verification_email(user_id):
    job = auth0.jobs.send_verification_email({
        'user_id': user_id
    })

    print(f"Verification email job created: {job}")
    return job
```

### Creating Email Verification Ticket

```python
def create_email_verification_ticket(user_id):
    ticket = auth0.tickets.create_email_verification({
        'user_id': user_id,
        'result_url': 'https://example.com/verified'
    })

    print(f"Verification URL: {ticket['ticket']}")
    return ticket
```

### Creating Password Change Ticket

```python
def create_password_change_ticket(user_id):
    ticket = auth0.tickets.create_pswd_change({
        'user_id': user_id,
        'result_url': 'https://example.com/password-changed'
    })

    print(f"Password change URL: {ticket['ticket']}")
    return ticket
```

## Logs and Monitoring

### Getting Logs

```python
def get_logs(page=0, per_page=100):
    logs = auth0.logs.search(page=page, per_page=per_page)
    return logs
```

### Getting Logs with Query

```python
def get_login_logs():
    logs = auth0.logs.search(q='type:s', per_page=100)  # 's' = successful login
    return logs
```

### Getting Log by ID

```python
def get_log_by_id(log_id):
    log = auth0.logs.get(log_id)
    return log
```

## Guardian (MFA) Management

### Getting User Enrollments

```python
def get_user_mfa_enrollments(user_id):
    enrollments = auth0.users.get_guardian_enrollments(user_id)
    return enrollments
```

### Deleting User Enrollment

```python
def delete_mfa_enrollment(user_id, enrollment_id):
    auth0.guardian.delete_enrollment(enrollment_id)
    print('MFA enrollment deleted')
```

### Getting Guardian Factors

```python
def get_guardian_factors():
    factors = auth0.guardian.all_factors()
    return factors
```

### Updating Guardian Factor

```python
def update_guardian_factor(factor_name, enabled):
    auth0.guardian.update_factor(factor_name, {'enabled': enabled})
    print(f"Guardian factor {factor_name} updated")
```

## User Blocking

### Getting User Blocks by Identifier

```python
def get_user_blocks(identifier):
    blocks = auth0.user_blocks.get_by_identifier(identifier)
    return blocks
```

### Unblocking User by Identifier

```python
def unblock_user(identifier):
    auth0.user_blocks.unblock_by_identifier(identifier)
    print('User unblocked')
```

### Getting User Blocks by ID

```python
def get_user_blocks_by_id(user_id):
    blocks = auth0.user_blocks.get(user_id)
    return blocks
```

### Unblocking User by ID

```python
def unblock_user_by_id(user_id):
    auth0.user_blocks.unblock(user_id)
    print('User unblocked')
```

## Grants Management

### Getting All Grants

```python
def get_all_grants():
    grants = auth0.grants.all()
    return grants
```

### Getting Grants by User ID

```python
def get_user_grants(user_id):
    grants = auth0.grants.all(user_id=user_id)
    return grants
```

### Deleting Grant

```python
def delete_grant(grant_id):
    auth0.grants.delete(grant_id)
    print('Grant deleted')
```

## Resource Servers (APIs)

### Getting All Resource Servers

```python
def get_all_resource_servers():
    apis = auth0.resource_servers.get_all()
    return apis
```

### Creating a Resource Server

```python
def create_resource_server(identifier, name):
    api = auth0.resource_servers.create({
        'identifier': identifier,
        'name': name,
        'signing_alg': 'RS256',
        'scopes': [
            {'value': 'read:messages', 'description': 'Read messages'},
            {'value': 'write:messages', 'description': 'Write messages'}
        ]
    })

    return api
```

### Getting Resource Server by ID

```python
def get_resource_server(resource_server_id):
    api = auth0.resource_servers.get(resource_server_id)
    return api
```

### Updating Resource Server

```python
def update_resource_server(resource_server_id, updates):
    api = auth0.resource_servers.update(resource_server_id, updates)
    return api
```

### Deleting Resource Server

```python
def delete_resource_server(resource_server_id):
    auth0.resource_servers.delete(resource_server_id)
    print('Resource server deleted')
```

## Error Handling

The SDK raises exceptions for API errors that should be handled appropriately.

```python
from auth0.exceptions import Auth0Error

def safe_get_user(user_id):
    try:
        user = auth0.users.get(user_id)
        return user
    except Auth0Error as e:
        print(f"Auth0 Error: {e}")
        print(f"Status Code: {e.status_code}")
        print(f"Error Code: {e.error_code}")
        print(f"Message: {e.message}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```

### Common Error Handling Patterns

```python
def handle_user_creation(email, password):
    try:
        user = auth0.users.create({
            'email': email,
            'password': password,
            'connection': 'Username-Password-Authentication'
        })
        return {'success': True, 'user': user}
    except Auth0Error as e:
        if e.status_code == 409:
            return {'success': False, 'error': 'User already exists'}
        elif e.status_code == 400:
            return {'success': False, 'error': 'Invalid request'}
        elif e.status_code == 429:
            return {'success': False, 'error': 'Rate limit exceeded'}
        else:
            return {'success': False, 'error': str(e)}
```

## Rate Limiting

Handle rate limits with exponential backoff:

```python
import time

def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Auth0Error as e:
            if e.status_code == 429 and attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Rate limited. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
                continue
            raise

    raise Exception("Max retries exceeded")

# Usage
result = retry_with_backoff(lambda: auth0.users.get(user_id))
```

## Complete Example: User Registration and Login Flow

```python
from auth0.authentication import Database, GetToken
from auth0.management import Auth0
import os

# Configuration
domain = os.getenv('AUTH0_DOMAIN')
client_id = os.getenv('AUTH0_CLIENT_ID')
client_secret = os.getenv('AUTH0_CLIENT_SECRET')

# Initialize clients
database = Database(domain, client_id)
get_token = GetToken(domain, client_id, client_secret=client_secret)

# Get Management API token
token = get_token.client_credentials(f'https://{domain}/api/v2/')
mgmt_api_token = token['access_token']
auth0 = Auth0(domain, mgmt_api_token)

def register_and_login(email, password):
    # 1. Sign up user
    signup_result = database.signup(
        email=email,
        password=password,
        connection='Username-Password-Authentication'
    )
    print(f"User signed up: {signup_result}")

    # 2. Get user by email
    users = auth0.users_by_email.search_users_by_email(email)
    user = users[0] if users else None

    if not user:
        raise Exception("User not found after signup")

    print(f"User ID: {user['user_id']}")

    # 3. Update user metadata
    auth0.users.update(user['user_id'], {
        'user_metadata': {
            'first_name': 'John',
            'last_name': 'Doe'
        }
    })

    # 4. Send verification email
    auth0.jobs.send_verification_email({
        'user_id': user['user_id']
    })
    print("Verification email sent")

    # 5. Login user (after email verification)
    token_response = get_token.login(
        username=email,
        password=password,
        realm='Username-Password-Authentication',
        scope='openid profile email',
        audience=f'https://{domain}/api/v2/'
    )

    print(f"Access Token: {token_response['access_token']}")
    print(f"ID Token: {token_response.get('id_token')}")

    return {
        'user': user,
        'tokens': token_response
    }

# Usage
if __name__ == '__main__':
    result = register_and_login('john.doe@example.com', 'SecurePassword123!')
    print(f"Registration and login complete: {result}")
```

## Advanced Patterns

### Batch User Creation

```python
def batch_create_users(users_data):
    created_users = []
    errors = []

    for user_data in users_data:
        try:
            user = auth0.users.create(user_data)
            created_users.append(user)
        except Auth0Error as e:
            errors.append({
                'email': user_data.get('email'),
                'error': str(e)
            })

    return {
        'created': created_users,
        'errors': errors
    }
```

### User Search with Filters

```python
def search_users_advanced(email_domain=None, created_after=None, metadata_filters=None):
    queries = []

    if email_domain:
        queries.append(f'email:"*@{email_domain}"')

    if created_after:
        queries.append(f'created_at:[{created_after} TO *]')

    if metadata_filters:
        for key, value in metadata_filters.items():
            queries.append(f'user_metadata.{key}:"{value}"')

    query = ' AND '.join(queries) if queries else None

    users = auth0.users.list(q=query, search_engine='v3')
    return users
```

### Token Management Helper

```python
class TokenManager:
    def __init__(self, domain, client_id, client_secret):
        self.domain = domain
        self.client_id = client_id
        self.client_secret = client_secret
        self.get_token = GetToken(domain, client_id, client_secret=client_secret)
        self._token = None
        self._token_expiry = 0

    def get_management_token(self):
        import time

        # Check if token is still valid (with 5-minute buffer)
        if self._token and time.time() < self._token_expiry - 300:
            return self._token

        # Get new token
        token_response = self.get_token.client_credentials(
            f'https://{self.domain}/api/v2/'
        )

        self._token = token_response['access_token']
        self._token_expiry = time.time() + token_response.get('expires_in', 86400)

        return self._token

# Usage
token_manager = TokenManager(domain, client_id, client_secret)
auth0 = Auth0(domain, token_manager.get_management_token())
```

## Important Notes

### Security Best Practices

1. **Never expose client secrets** - Keep credentials secure on the server side
2. **Use environment variables** - Store sensitive data in environment variables
3. **Validate tokens** - Always validate tokens on the server side
4. **Use HTTPS** - Always use HTTPS in production
5. **Implement rate limiting** - Protect against brute force attacks
6. **Rotate credentials** - Regularly rotate API tokens and secrets

### Management API Token Lifecycle

- Management API tokens expire after 24 hours by default
- Use client credentials grant for long-running applications
- Cache tokens and refresh before expiration
- Implement token refresh logic in production applications

### Python Version Support

The SDK follows Python's official support schedule:
- Python 3.12: Supported through October 2028
- Python 3.11: Supported through October 2027
- Python 3.10: Supported through October 2026
- Python 3.9: Supported through October 2025
- Python 3.8: End of life October 2024
- Python 3.7: End of life October 2023

### User Search Syntax

Use Lucene query syntax for user searches:

```python
# Search by email domain
q = 'email:"*@example.com"'

# Search by metadata
q = 'user_metadata.plan:"premium"'

# Search by multiple fields
q = 'email:"*@example.com" AND user_metadata.plan:"premium"'

# Search by created date
q = 'created_at:[2024-01-01 TO 2024-12-31]'

# Complex query
q = '(email:"*@example.com" OR email:"*@test.com") AND user_metadata.active:true'
```

### Common Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Success) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., user already exists) |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |

## JWT and Token Verification

The Auth0 Python SDK does not bundle a JWT verifier; use the companion `auth0-python` `authentication` module for `userinfo` lookups and `PyJWT` + `jwks-client` (built into `PyJWT >= 2.0`) for ID/access token validation.

### Validate ID Token via UserInfo

```python
from auth0.authentication import Users

users_client = Users(domain)
profile = users_client.userinfo(access_token='Bearer-access-token')
print(profile['sub'])
```

### Verify a JWT signature with PyJWT + JWKS

```python
import jwt
from jwt import PyJWKClient
import os

domain = os.getenv('AUTH0_DOMAIN')
audience = os.getenv('AUTH0_API_AUDIENCE')

jwks_client = PyJWKClient(f'https://{domain}/.well-known/jwks.json')

def verify_access_token(token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token).key
    return jwt.decode(
        token,
        signing_key,
        algorithms=['RS256'],
        audience=audience,
        issuer=f'https://{domain}/',
    )
```

### Flask Bearer-Token Middleware

```python
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'missing_token'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            request.auth = verify_access_token(token)
        except jwt.PyJWTError as exc:
            return jsonify({'error': 'invalid_token', 'detail': str(exc)}), 401
        return f(*args, **kwargs)
    return wrapper
```

## Useful Links

- Official Documentation: https://auth0.com/docs
- Python SDK Documentation: https://auth0-python.readthedocs.io/
- GitHub Repository: https://github.com/auth0/auth0-python
- Example Code: https://github.com/auth0/auth0-python/blob/master/EXAMPLES.md
- Community Forum: https://community.auth0.com/
- Auth0 Dashboard: https://manage.auth0.com/
- API Rate Limits: https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy
