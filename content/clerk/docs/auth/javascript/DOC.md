---
name: auth
description: "Clerk JavaScript SDK for user authentication, session management, and identity workflows"
metadata:
  languages: "javascript"
  versions: "7.4.2"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "clerk,auth,authentication,user-management,session"
---

# Clerk JavaScript SDK Coding Guidelines

You are a Clerk authentication expert. Help me with writing code using the Clerk JavaScript SDK and its official libraries for user authentication and management.

This guide covers both vanilla JavaScript implementations using `@clerk/clerk-js` and framework-specific implementations using packages like `@clerk/nextjs` and `@clerk/react`.

Please follow the following guidelines when generating code.

You can find the official documentation and code samples here:
https://clerk.com/docs

## Important Context About This SDK

Clerk provides **two main approaches** for JavaScript authentication:
1. **Vanilla JavaScript (`@clerk/clerk-js`)**: Uses the browser SDK loaded via CDN or NPM, ideal for standalone HTML/JS apps
2. **Framework SDKs**: Specialized packages for Next.js, React, Vue, etc. with framework-specific optimizations

This context guide covers both approaches comprehensively.

## Golden Rule: Use the Correct Clerk Package for Your Framework

Always use the appropriate Clerk SDK for your specific framework or environment. Clerk provides specialized packages for different platforms that include framework-specific optimizations and integrations.

**Available Packages (current pinned versions):**
- **Next.js:** `@clerk/nextjs` `7.4.2`
- **React:** `@clerk/react`
- **Vanilla JavaScript:** `@clerk/clerk-js`
- **Backend (Node) SDK:** `@clerk/clerk-sdk-node` `5.1.6` (use `@clerk/backend` for new projects)
- **Vue:** `@clerk/vue`
- **Astro:** `@clerk/astro`
- **Remix:** `@clerk/remix`
- **Express:** `@clerk/express`
- **Fastify:** `@clerk/fastify`
- **Expo:** `@clerk/expo`

**Installation Examples:**
```bash
# For Next.js applications
npm install @clerk/nextjs

# For React applications  
npm install @clerk/react

# For vanilla JavaScript
npm install @clerk/clerk-js
```

## Prerequisites and Setup

- An existing Clerk application from the [Clerk Dashboard](https://dashboard.clerk.com/sign-up)
- For Next.js: Next.js 13.0.4 or later, React 18 or later, Node.js >=18.17.0
- For vanilla JavaScript: Any modern browser with ES6+ support

## Environment Variables

### For Framework Apps (Next.js, React, etc.)
Set up your environment variables in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### For Vanilla JavaScript Apps
Store your publishable key in a `.env` file and inject it into your HTML:
```
CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Important**: Only the publishable key is needed for client-side authentication. Never expose your secret key in browser code.

## Next.js Integration

### ClerkProvider Setup

Wrap your application with ClerkProvider:

```jsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Middleware Configuration

Use `clerkMiddleware` for route protection: 

```javascript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/protected(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  if (isAdminRoute(req)) {
    await auth.protect({ role: 'org:admin' });
  }
});
```

**Important:** Do not use the deprecated `authMiddleware`. Always use `clerkMiddleware` for new implementations.

## Client-Side Authentication Hooks

### useUser Hook

Access the current user information: 

```jsx
import { useUser } from '@clerk/nextjs';

function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded || !isSignedIn) {
    return null;
  }
  
  return <div>Hello, {user.firstName}!</div>;
}
```

### useAuth Hook

Access authentication state and methods:

```jsx
import { useAuth } from '@clerk/nextjs';

function AuthComponent() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  
  // Use authentication state
}
```

### useClerk Hook

Access the Clerk instance for advanced operations:

```jsx
import { useClerk } from '@clerk/nextjs';

function SignOutButton() {
  const { signOut } = useClerk();
  
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

## Server-Side Authentication

### auth() Helper (App Router)

Use the `auth()` helper in Server Components, Route Handlers, and Server Actions: 

```jsx
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div>Please sign in</div>;
  }
  
  return <div>User ID: {userId}</div>;
}
```

### currentUser() Helper

Get the full user object on the server side: 

```jsx
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user = await currentUser();
  
  if (!user) return <div>Not signed in</div>;
  
  return <div>Hello {user?.firstName}</div>;
}
```

### auth.protect() Method

Use `auth.protect()` for authentication and authorization checks: 

```jsx
import { auth } from '@clerk/nextjs/server';

export default async function AdminPage() {
  // Protect route - redirects unauthenticated users
  await auth.protect();
  
  // Or protect with role check
  await auth.protect({ role: 'org:admin' });
  
  return <div>Protected content</div>;
}
```

## Authentication Components

### Sign-In and Sign-Up Buttons

Use pre-built buttons for authentication flows: 

```jsx
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <SignInButton mode='modal' forceRedirectUrl='/protected'>
        Sign in button
      </SignInButton>
      
      <SignUpButton mode='modal' forceRedirectUrl='/protected'>
        Sign up button  
      </SignUpButton>
    </main>
  );
}
```

### Pre-built Components

```jsx
import { 
  SignIn, 
  SignUp, 
  UserButton, 
  UserProfile 
} from '@clerk/nextjs';

// Drop-in authentication components
<SignIn />
<SignUp />
<UserButton />
<UserProfile />
```

## Organization Management

### Organization Roles and Permissions

Clerk supports role-based access control within organizations: 

```jsx
// Check organization permissions
await auth.protect({ 
  role: 'org:admin' 
});

// Custom permissions
await auth.protect({ 
  permission: 'org:sys_memberships:manage' 
});
```

### Organization Hooks

```jsx
import { 
  useOrganization, 
  useOrganizationList, 
  useUser 
} from '@clerk/nextjs';

function OrganizationComponent() {
  const { organization } = useOrganization();
  const { organizationList } = useOrganizationList();
  
  // Organization management logic
}
```

## Common Patterns

### Conditional Rendering Based on Auth State

```jsx
import { useUser } from '@clerk/nextjs';

function App() {
  const { isSignedIn } = useUser();
  
  return (
    <div>
      {isSignedIn ? (
        <AuthenticatedApp />
      ) : (
        <UnauthenticatedApp />
      )}
    </div>
  );
}
```

### Route Protection with Redirects

```jsx
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return <div>Protected content</div>;
}
```

## Vanilla JavaScript Integration (`@clerk/clerk-js`)

### Loading Clerk via CDN

The most common approach for vanilla JavaScript apps is loading Clerk from a CDN:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <!-- Your content here -->

    <!-- Load Clerk SDK -->
    <script
        async
        crossorigin="anonymous"
        data-clerk-publishable-key="pk_test_..."
        src="https://[your-clerk-domain].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
        type="text/javascript"
    ></script>

    <script src="app.js"></script>
</body>
</html>
```

**Important Implementation Details:**
- The Clerk SDK loads **asynchronously**, so you must wait for it to be ready
- Access the Clerk instance via `window.Clerk`
- Always call `await clerk.load()` before using any Clerk methods
- Listen for the `clerk:loaded` event as a fallback if the script hasn't loaded yet

### Initializing Clerk Properly

```javascript
// Wait for page to load
window.addEventListener('load', async () => {
    if (window.Clerk) {
        // Clerk is already available
        await initializeClerk(window.Clerk);
    } else {
        // Wait for Clerk to load
        window.addEventListener('clerk:loaded', async (event) => {
            await initializeClerk(event.detail);
        });
    }
});

async function initializeClerk(clerk) {
    try {
        // CRITICAL: Always call load() first
        await clerk.load();

        // Now you can safely use clerk methods
        const user = clerk.user;

        // Your authentication logic here
    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
}
```

### Accessing User Information

After Clerk is loaded, access the current user via `clerk.user`:

```javascript
async function initializeClerk(clerk) {
    await clerk.load();

    const user = clerk.user;

    if (user) {
        // User is authenticated
        console.log('User ID:', user.id);
        console.log('Name:', user.firstName, user.lastName);
        console.log('Email:', user.primaryEmailAddress?.emailAddress);
        console.log('Created:', new Date(user.createdAt));

        // Access other user properties
        console.log('Phone:', user.primaryPhoneNumber?.phoneNumber);
        console.log('Profile Image:', user.imageUrl);
    } else {
        // User is not signed in
        console.log('No user signed in');
    }
}
```

### Mounting Authentication Components

Clerk provides pre-built UI components that can be mounted into your HTML:

```javascript
async function initializeClerk(clerk) {
    await clerk.load();

    if (!clerk.user) {
        // Mount sign-in component for unauthenticated users
        clerk.mountSignIn(document.getElementById('sign-in-container'));
    } else {
        // Mount user button for authenticated users
        clerk.mountUserButton(document.getElementById('user-button-container'));
    }
}
```

**Available mount methods:**
- `clerk.mountSignIn(element)` - Full sign-in flow
- `clerk.mountSignUp(element)` - Full sign-up flow
- `clerk.mountUserButton(element)` - User profile dropdown button
- `clerk.mountUserProfile(element)` - Complete user profile management

### Listening to Authentication State Changes

Use `clerk.addListener()` to react to authentication changes:

```javascript
async function initializeClerk(clerk) {
    await clerk.load();

    // Initial UI update
    updateUI(clerk.user);

    // Listen for changes
    clerk.addListener((emission) => {
        // The emission object contains the changed properties
        if (emission.user !== undefined) {
            // User state changed (sign in, sign out, or profile update)
            updateUI(emission.user);
        }

        if (emission.session !== undefined) {
            // Session changed
            console.log('Session updated:', emission.session);
        }

        if (emission.organization !== undefined) {
            // Organization changed
            console.log('Organization updated:', emission.organization);
        }
    });
}

function updateUI(user) {
    const authenticatedView = document.getElementById('authenticated-view');
    const unauthenticatedView = document.getElementById('unauthenticated-view');

    if (user) {
        unauthenticatedView.classList.add('hidden');
        authenticatedView.classList.remove('hidden');
    } else {
        authenticatedView.classList.add('hidden');
        unauthenticatedView.classList.remove('hidden');
    }
}
```

### Implementing Sign Out

```javascript
async function handleSignOut(clerk) {
    try {
        await clerk.signOut();
        // UI will update automatically via listener
        console.log('Signed out successfully');
    } catch (error) {
        console.error('Sign out failed:', error);
    }
}

// Usage in your HTML
document.getElementById('sign-out-btn').addEventListener('click', () => {
    handleSignOut(window.Clerk);
});
```

### Complete Vanilla JavaScript Example

Here's a complete working example:

```javascript
// app.js
window.addEventListener('load', async () => {
    if (window.Clerk) {
        await initializeClerk(window.Clerk);
    } else {
        window.addEventListener('clerk:loaded', async (event) => {
            await initializeClerk(event.detail);
        });
    }
});

async function initializeClerk(clerk) {
    try {
        await clerk.load();

        const loadingView = document.getElementById('loading-view');
        const authenticatedView = document.getElementById('authenticated-view');
        const unauthenticatedView = document.getElementById('unauthenticated-view');
        const userInfo = document.getElementById('user-info');
        const signOutBtn = document.getElementById('sign-out-btn');

        function updateUI() {
            const user = clerk.user;
            loadingView.classList.add('hidden');

            if (user) {
                unauthenticatedView.classList.add('hidden');
                authenticatedView.classList.remove('hidden');

                userInfo.innerHTML = `
                    <h3>User Information</h3>
                    <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
                    <p><strong>Email:</strong> ${user.primaryEmailAddress?.emailAddress || 'N/A'}</p>
                    <p><strong>User ID:</strong> ${user.id}</p>
                    <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                `;
            } else {
                authenticatedView.classList.add('hidden');
                unauthenticatedView.classList.remove('hidden');
                clerk.mountSignIn(document.getElementById('clerk-sign-in'));
            }
        }

        updateUI();

        clerk.addListener((emission) => {
            if (emission.user !== undefined) {
                updateUI();
            }
        });

        signOutBtn.addEventListener('click', async () => {
            await clerk.signOut();
            updateUI();
        });

        clerk.mountUserButton(document.getElementById('clerk-user-button'));

    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
}
```

### Server-Side Key Injection Pattern

For production apps, inject the publishable key server-side to keep it out of version control:

```javascript
// server.js (Node.js example)
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        let html = fs.readFileSync('./index.html', 'utf-8');

        // Replace placeholder with actual key
        html = html.replace(
            'CLERK_PUBLISHABLE_KEY_PLACEHOLDER',
            process.env.CLERK_PUBLISHABLE_KEY
        );

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
});

server.listen(3000);
```

```html
<!-- index.html -->
<script
    data-clerk-publishable-key="CLERK_PUBLISHABLE_KEY_PLACEHOLDER"
    src="https://[your-domain].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
></script>
```

### Getting Authentication Tokens for API Calls

```javascript
async function makeAuthenticatedRequest(clerk) {
    try {
        // Get the current session token
        const token = await clerk.session.getToken();

        const response = await fetch('/api/protected-endpoint', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
    }
}
```

### Handling Session Lifecycle

```javascript
async function initializeClerk(clerk) {
    await clerk.load();

    // Check if session exists
    if (clerk.session) {
        console.log('Active session:', clerk.session.id);
        console.log('Session expires:', new Date(clerk.session.expireAt));

        // Get session token
        const token = await clerk.session.getToken();
        console.log('Session token:', token);
    }

    // Listen for session changes
    clerk.addListener((emission) => {
        if (emission.session !== undefined) {
            if (emission.session) {
                console.log('New session created');
            } else {
                console.log('Session ended');
            }
        }
    });
}
```

## API Endpoints and Backend Integration

### Backend Package

For backend-only applications, use `@clerk/backend`:

```javascript
import { clerkClient } from '@clerk/backend';

// Server-side user management
const user = await clerkClient.users.getUser(userId);
```

### Verifying Tokens on Your Backend

```javascript
// Node.js/Express example
const { verifyToken } = require('@clerk/backend');

app.get('/api/protected', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const claims = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        });

        // Token is valid, proceed with request
        res.json({ userId: claims.sub });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});
```

## Common Pitfalls and Best Practices

### Vanilla JavaScript Pitfalls

**Pitfall 1: Not waiting for Clerk to load**
```javascript
// WRONG - Clerk may not be loaded yet
window.Clerk.user; // May be undefined

// CORRECT - Wait for load event
window.addEventListener('load', async () => {
    if (window.Clerk) {
        await window.Clerk.load();
        const user = window.Clerk.user; // Now safe to use
    }
});
```

**Pitfall 2: Forgetting to call clerk.load()**
```javascript
// WRONG
async function initializeClerk(clerk) {
    const user = clerk.user; // May not be initialized yet
}

// CORRECT
async function initializeClerk(clerk) {
    await clerk.load(); // CRITICAL - must call first
    const user = clerk.user;
}
```

**Pitfall 3: Not handling both load scenarios**
```javascript
// INCOMPLETE - only handles one scenario
window.addEventListener('load', async () => {
    await initializeClerk(window.Clerk); // What if Clerk isn't loaded yet?
});

// COMPLETE - handles both scenarios
window.addEventListener('load', async () => {
    if (window.Clerk) {
        await initializeClerk(window.Clerk);
    } else {
        window.addEventListener('clerk:loaded', async (event) => {
            await initializeClerk(event.detail);
        });
    }
});
```

### Framework Best Practices

**Use loading states properly:**
```javascript
const { isLoaded, isSignedIn, user } = useUser();

// Always check isLoaded first
if (!isLoaded) {
    return <LoadingSpinner />;
}

if (!isSignedIn) {
    return <SignInPrompt />;
}

// Now safe to use user
return <UserProfile user={user} />;
```

**Avoid conditional hooks:**
```javascript
// WRONG
if (someCondition) {
    const { user } = useUser(); // Breaks rules of hooks
}

// CORRECT
const { user } = useUser();
if (someCondition && user) {
    // Use user here
}
```

### Security Best Practices

1. **Never expose secret keys** - Only use publishable keys in client-side code
2. **Verify tokens on the backend** - Don't trust client-side authentication alone
3. **Use HTTPS** - Always serve your app over HTTPS in production
4. **Implement CORS properly** - Configure allowed origins in Clerk Dashboard
5. **Handle token expiration** - Sessions expire and need refresh

### Performance Optimization

**For Next.js:**
- Use `auth()` instead of `currentUser()` when you only need the user ID
- `currentUser()` makes an API call while `auth()` reads from the request
- Implement proper caching strategies for user data

**For Vanilla JS:**
- Load Clerk SDK asynchronously (use `async` attribute)
- Cache user data in memory to avoid repeated property access
- Use event listeners instead of polling for auth state changes

## Important Notes

### Framework-Specific Notes

- **Next.js Middleware Requirement:** `clerkMiddleware()` is required for server-side authentication helpers in Next.js App Router
- **Server-Only Functions:** Functions like `auth()` and `currentUser()` only work on the server side
- **Rate Limits:** Server-side user fetching counts towards Backend API rate limits
- **Deprecated APIs:** Do not use `authMiddleware` - use `clerkMiddleware` instead

### Vanilla JavaScript Notes

- **Asynchronous Loading:** The Clerk SDK loads asynchronously - always wait for it to be ready
- **Critical Load Step:** Always call `await clerk.load()` before accessing user/session data
- **Event-Driven Updates:** Use `clerk.addListener()` for reactive UI updates
- **Session Tokens:** Access tokens via `clerk.session.getToken()` for API authentication
- **Component Mounting:** Use mount methods (`mountSignIn`, etc.) for pre-built UI components 

## Useful Links

- **Documentation:** https://clerk.com/docs 
- **Quickstart Guides:** https://clerk.com/docs/quickstarts/overview 
- **Discord Community:** https://clerk.com/discord 
- **GitHub Repository:** https://github.com/clerk/javascript 

## Quick Reference: Choosing Your Implementation

### Use Vanilla JavaScript (`@clerk/clerk-js`) when:
- Building standalone HTML/JS applications
- Working without a framework
- Need simple drop-in authentication
- Want to use CDN-hosted SDK
- Building static sites with authentication

**Key Pattern:**
```javascript
window.addEventListener('load', async () => {
    if (window.Clerk) {
        await window.Clerk.load();
        // Use window.Clerk.user
    }
});
```

### Use Next.js SDK (`@clerk/nextjs`) when:
- Building Next.js applications (App Router or Pages Router)
- Need server-side authentication
- Want middleware-based route protection
- Building full-stack applications with Next.js

**Key Pattern:**
```javascript
// Client: useUser(), useAuth(), useClerk()
// Server: auth(), currentUser()
// Middleware: clerkMiddleware()
```

### Use React SDK (`@clerk/react`) when:
- Building React applications (not Next.js)
- Using Create React App or Vite
- Need client-side authentication hooks
- Working with React Router

**Key Pattern:**
```javascript
import { ClerkProvider, useUser } from '@clerk/react';
```

### Use Backend SDK (`@clerk/backend`) when:
- Building backend-only APIs
- Need to verify tokens server-side
- Managing users from your backend
- Integrating with Express, Fastify, etc.

**Key Pattern:**
```javascript
import { clerkClient, verifyToken } from '@clerk/backend';
```

## Summary

This guide covers the core Clerk JavaScript SDK patterns across multiple implementation approaches:

### Key Concepts
- **Clerk is framework-agnostic** - Choose the right package for your stack
- **Publishable keys are safe for client-side** - Secret keys are for backend only
- **Authentication is session-based** - Clerk manages sessions automatically
- **Pre-built components** - Drop-in UI for authentication flows
- **Event-driven updates** - React to auth state changes in real-time

### Critical Implementation Details

**For Vanilla JavaScript:**
1. Always wait for Clerk to load (`window.Clerk` + `clerk:loaded` event)
2. Call `await clerk.load()` before accessing user/session data
3. Use `clerk.addListener()` for reactive UI updates
4. Mount components with `clerk.mountSignIn()`, `clerk.mountUserButton()`, etc.

**For Next.js:**
1. Wrap app with `<ClerkProvider>`
2. Use `clerkMiddleware()` for route protection
3. Use hooks (`useUser()`, `useAuth()`) in client components
4. Use `auth()` and `currentUser()` in server components

**For Backend:**
1. Verify tokens with `verifyToken()` or middleware
2. Use `clerkClient` for user management operations
3. Never expose secret keys to the client

### Authentication Flow
1. User visits your app
2. Clerk SDK initializes and checks for existing session
3. If no session, show sign-in UI
4. User authenticates (email, OAuth, etc.)
5. Clerk creates session and returns user object
6. Your app reacts to auth state and shows user content
7. Session tokens can be used for API authentication

Clerk handles the complexity of authentication, session management, and user profiles, allowing you to focus on building your application.

## Common Use Cases & Patterns

### Protected Routes (Vanilla JS)
```javascript
async function initializeClerk(clerk) {
    await clerk.load();

    // Protect specific pages
    const protectedPaths = ['/dashboard', '/profile', '/settings'];
    const currentPath = window.location.pathname;

    if (protectedPaths.includes(currentPath) && !clerk.user) {
        // Redirect to sign-in
        window.location.href = '/sign-in';
    }
}
```

### Protected Routes (Next.js Middleware)
```javascript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect(); // Redirects if not authenticated
    }
});
```

### Displaying User-Specific Content
```javascript
// Vanilla JS
if (clerk.user) {
    document.getElementById('welcome').textContent =
        `Welcome back, ${clerk.user.firstName}!`;
}

// Next.js/React
const { user } = useUser();
return user ? <div>Welcome back, {user.firstName}!</div> : null;
```

### Making Authenticated API Requests
```javascript
// Vanilla JS
const token = await clerk.session.getToken();
const response = await fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Next.js/React
const { getToken } = useAuth();
const token = await getToken();
const response = await fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

### Handling OAuth Sign-In
```javascript
// Clerk handles OAuth automatically through its UI components
// Just mount the sign-in component and it includes OAuth buttons

// Vanilla JS
clerk.mountSignIn(document.getElementById('sign-in'));

// Next.js/React
<SignIn />
```

### Custom OAuth Redirect URLs
```jsx
<SignInButton
    mode='modal'
    forceRedirectUrl='/dashboard'
    signUpForceRedirectUrl='/onboarding'
>
    Sign in
</SignInButton>
```

## Troubleshooting Common Issues

### Issue: "Clerk is not defined"
**Cause:** Clerk SDK hasn't loaded yet
**Solution:** Use the proper loading pattern with both `window.Clerk` check and `clerk:loaded` event

### Issue: "User is null after sign-in"
**Cause:** Forgot to call `clerk.load()` or checking too early
**Solution:** Always call `await clerk.load()` and use event listeners for updates

### Issue: "Cannot read property 'user' of undefined"
**Cause:** Accessing Clerk before initialization
**Solution:** Wrap all Clerk usage in the initialization function after `load()` completes

### Issue: "CORS errors when calling Clerk API"
**Cause:** Domain not configured in Clerk Dashboard
**Solution:** Add your domain to allowed origins in Clerk Dashboard settings

### Issue: "Session token expired"
**Cause:** Sessions expire after period of inactivity
**Solution:** Clerk automatically refreshes tokens; ensure you call `getToken()` fresh each time

### Issue: "Middleware not protecting routes"
**Cause:** Incorrect middleware configuration or matcher pattern
**Solution:** Verify `clerkMiddleware` is exported as default and matcher patterns are correct

### Issue: "Can't access user data in Server Component"
**Cause:** Using client-side hooks on the server
**Solution:** Use `auth()` or `currentUser()` instead of `useUser()` in Server Components

### Debugging Tips

1. **Check Clerk Dashboard:** Verify your API keys are correct
2. **Console logging:** Add `console.log('Clerk loaded:', clerk)` after `load()`
3. **Network tab:** Check for failed requests to Clerk API
4. **Browser console:** Look for Clerk SDK errors or warnings
5. **Version compatibility:** Ensure your Clerk package versions are up to date

## Prerequisites

- Next.js 13.0.4 or later
- React 18 or later
- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_nextjs).

## Getting Started

### Next.js Installation

The fastest way to get started with Clerk is by following the [Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs?utm_source=github&utm_medium=clerk_nextjs).

You'll learn how to install `@clerk/nextjs`, set up your environment keys, add `<ClerkProvider>` to your application, use the Clerk middleware, and use Clerk's prebuilt components.

### JavaScript Installation

The fastest way to get started with Clerk is by following the [JavaScript Quickstart](https://clerk.com/docs/quickstarts/javascript?utm_source=github&utm_medium=clerk_js).

You'll learn how to add the ClerkJS SDK to your application (either through `<script>` tag or NPM module) and use Clerk's prebuilt components.

## Community

- Join our official community [Discord server](https://clerk.com/discord)

## Advanced Middleware Configuration

```typescript
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    await auth.protect({ role: 'org:admin' });
  }

  if (isCSPRoute(req)) {
    req.headers.set('Content-Security-Policy', csp.replace(/\n/g, ''));
  }
});
```

```typescript
export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)',
  ], // Run middleware on API routes
};
```

## Example Components

```typescript
function GreetingWithHook() {
  // Use the useUser hook to get the Clerk.user object
  // This hook causes a re-render on user changes
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    // You can handle the loading or signed state separately
    return null;
  }

  return <div>Hello, {user.firstName}!</div>;
}
```

## Authentication Protection Details

`auth` includes a single property, the `protect()` method, which you can use in two ways:
- to check if a user is authenticated (signed in)
- to check if a user is authorized (has the correct roles or permissions) to access something, such as a component or a route handler

The following table describes how auth.protect() behaves based on user authentication or authorization status:

| Authenticated | Authorized | `auth.protect()` will |
| - | - | - |
| Yes | Yes | Return the [`Auth`](https://clerk.com/docs/references/backend/types/auth-object) object. |
| Yes | No | Return a `404` error. |
| No | No | Redirect the user to the sign-in page*. |

> [!IMPORTANT]
> *For non-document requests, such as API requests, `auth.protect()` returns a `404` error to users who aren't authenticated.

`auth.protect()` can be used to check if a user is authenticated or authorized to access certain parts of your application or even entire routes. See detailed examples in the [dedicated guide](https://clerk.com/docs/organizations/verify-user-permissions).

## auth() Helper Details

The `auth()` helper returns the [`Auth`](https://clerk.com/docs/references/backend/types/auth-object) object of the currently active user, as well as the [`redirectToSignIn()`](https://clerk.com/docs/references/nextjs/auth#redirect-to-sign-in) method.

- Only available for App Router.
- Only works on the server-side, such as in Server Components, Route Handlers, and Server Actions.
- Requires [`clerkMiddleware()`](https://clerk.com/docs/references/nextjs/clerk-middleware) to be configured.

## currentUser() Details

- calls `fetch()`, so it is automatically deduped per request.
- uses the [`GET /v1/users/{user_id}`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser) endpoint.
- counts towards the [Backend API request rate limit](https://clerk.com/docs/backend-requests/resources/rate-limits).

**Example:**
```tsx
// app/page.tsx
import { currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const user = await currentUser()

  if (!user) return <div>Not signed in</div>

  return <div>Hello {user?.firstName}</div>
}
```

## Advanced SignIn Button Examples

```tsx
<SignInButton
  mode='modal'
  forceRedirectUrl='/protected'
  signUpForceRedirectUrl='/protected'
>
  Sign in button (force)
</SignInButton>

<SignInButton
  mode='modal'
  oauthFlow='popup'
  forceRedirectUrl='/protected'
  signUpForceRedirectUrl='/protected'
>
  Sign in button (force, popup)
</SignInButton>
```

## Type Definitions

```typescript
import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';
import type { OrganizationMembershipJSONSnapshot } from './snapshots';
import type { Autocomplete } from './utils';

interface Base {
  permission: string;
  role: string;
}
```

## About Clerk

Clerk helps developers build user management. We provide streamlined user experiences for your users to sign up, sign in, and manage their profile.

This repository contains all the Clerk JavaScript SDKs under the `@clerk` namespace.

## Documentation

Clerk's full documentation is available at [clerk.com/docs](https://clerk.com/docs?utm_source=github&utm_medium=clerk_js_repo_readme).

- **We recommend starting with the [quickstart guides](https://clerk.com/docs/quickstarts/overview?utm_source=github&utm_medium=clerk_js_repo_readme).** They'll help you quickly add Clerk to your application. If you're starting a new project and aren't sure what to pick, check out our most popular quickstart: [Next.js](https://clerk.com/docs/quickstarts/nextjs?utm_source=github&utm_medium=clerk_js_repo_readme).

