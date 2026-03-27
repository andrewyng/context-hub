---
name: react-router-dom
description: "TypeScript declarations for React Router DOM v5 routers, route props, hooks, navigation helpers, and server-side routing helpers."
metadata:
  languages: "typescript"
  versions: "5.3.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-router,react-router-dom,routing,types,definitelytyped"
---

# React Router DOM TypeScript Guide

## Golden Rule

Install `@types/react-router-dom` alongside the real `react-router-dom` runtime package.

`@types/react-router-dom` only provides TypeScript declarations. Your app imports and runs `react-router-dom`; the declaration package adds types for the v5 DOM router API, including `BrowserRouter`, `HashRouter`, `MemoryRouter`, `StaticRouter`, `Route`, `Switch`, `Redirect`, `Link`, `NavLink`, `Prompt`, `generatePath`, `matchPath`, `withRouter`, `useHistory`, `useLocation`, `useParams`, and `useRouteMatch`.

## Install

Install the runtime packages first, then add the declaration packages to the same TypeScript project.

```bash
npm install react react-dom react-router-dom@5
npm install -D typescript @types/react @types/react-dom @types/react-router-dom
```

If your app already depends on `react`, `react-dom`, and `react-router-dom@5`, add only the missing declarations:

```bash
npm install -D @types/react @types/react-dom @types/react-router-dom
```

`@types/react-router-dom` pulls in the related router and history declarations it needs through its own package dependencies.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The main setup points are your runtime package version, your imports, and your TypeScript compiler settings.

### Import from `react-router-dom`

Always import runtime values and exported types from `react-router-dom`, not from `@types/react-router-dom`.

```tsx
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import type { RouteComponentProps } from "react-router-dom";
```

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If your app still uses the classic React JSX transform, `"jsx": "react"` also works.

## Common Workflows

### Type route params with `RouteComponentProps`

Use `RouteComponentProps<Params>` when a component is rendered through a v5 `Route` and reads `match`, `location`, or `history` from route props.

```tsx
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import type { RouteComponentProps } from "react-router-dom";

type ProjectRouteParams = {
  projectId: string;
};

function ProjectPage({ match }: RouteComponentProps<ProjectRouteParams>) {
  return <h1>Project {match.params.projectId}</h1>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/projects/alpha" />} />
        <Route path="/projects/:projectId" component={ProjectPage} />
      </Switch>
    </BrowserRouter>
  );
}
```

This pattern matches the v5 `Route` API where `component`, `render`, and `children` are the main render strategies.

### Type hooks for params, location state, and navigation

The hook APIs let function components work directly with typed route params and navigation state.

```tsx
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";

type UserParams = {
  userId: string;
};

type AppLocationState = {
  from?: string;
};

export function UserToolbar() {
  const history = useHistory<AppLocationState>();
  const location = useLocation<AppLocationState>();
  const { userId } = useParams<UserParams>();
  const settingsMatch = useRouteMatch<UserParams>("/users/:userId/settings");

  function goToCheckout() {
    history.push("/checkout", { from: location.pathname });
  }

  return (
    <div>
      <p>Current user: {userId}</p>
      <p>Settings route active: {settingsMatch ? "yes" : "no"}</p>
      <button onClick={goToCheckout}>Checkout</button>
    </div>
  );
}
```

Use the same state shape generic anywhere you read or write `location.state` so `history.push()` and `useLocation()` stay aligned.

### Build and match typed URLs with `generatePath` and `matchPath`

Use the helper functions when you want route-aware strings without duplicating path templates.

```tsx
import { generatePath, matchPath } from "react-router-dom";

const detailsPath = generatePath("/orgs/:orgId/users/:userId", {
  orgId: "acme",
  userId: "42",
});

const match = matchPath<{ orgId: string; userId: string }>(detailsPath, {
  path: "/orgs/:orgId/users/:userId",
  exact: true,
});

if (match) {
  console.log(match.params.orgId, match.params.userId);
}
```

This is useful in helpers, menu builders, and tests where you want the route pattern and the generated URL to stay consistent.

### Keep older class components working with `withRouter`

`withRouter` is still useful in v5 codebases that use class components or higher-order components instead of hooks.

```tsx
import React from "react";
import { withRouter } from "react-router-dom";
import type { RouteComponentProps } from "react-router-dom";

type AccountParams = {
  accountId: string;
};

type Props = RouteComponentProps<AccountParams> & {
  loadAccount(id: string): void;
};

class AccountScreen extends React.Component<Props> {
  componentDidMount() {
    this.props.loadAccount(this.props.match.params.accountId);
  }

  render() {
    return <div>Account {this.props.match.params.accountId}</div>;
  }
}

export default withRouter(AccountScreen);
```

`withRouter` injects the same route props you would otherwise receive from a `Route` render.

### Use `MemoryRouter` in tests and `StaticRouter` on the server

The declarations cover the non-browser routers too, so you can type components consistently across tests and server rendering.

```tsx
import { MemoryRouter, Route, StaticRouter } from "react-router-dom";

export function TestHarness() {
  return (
    <MemoryRouter initialEntries={["/projects/alpha"]}>
      <Route path="/projects/:projectId" render={() => <div>ok</div>} />
    </MemoryRouter>
  );
}

export function ServerRouter({ location }: { location: string }) {
  const context: { url?: string } = {};

  return (
    <StaticRouter location={location} context={context}>
      <Route path="/login" render={() => <div>Login</div>} />
    </StaticRouter>
  );
}
```

Use `MemoryRouter` for isolated tests and `StaticRouter` when a server render needs to capture redirects through the `context` object.

## Important Pitfalls

- `@types/react-router-dom@5.3.3` is for the v5 API surface. Do not pair it with `react-router-dom` v6 or v7.
- Import from `react-router-dom`, never from `@types/react-router-dom`.
- URL params from `RouteComponentProps`, `useParams()`, and `matchPath()` are strings. Convert them yourself if your app uses numeric IDs.
- Keep your `location.state` generic consistent across `useHistory()`, `useLocation()`, route props, and redirect flows.
- `Switch`, `Redirect`, `withRouter`, and `useHistory` are v5-specific patterns. If your runtime code uses `Routes`, `Navigate`, or `useNavigate`, you are on a newer React Router line and should not use this declaration package.

## Official Sources

- https://www.npmjs.com/package/@types/react-router-dom
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-router-dom
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router-dom/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router-dom/react-router-dom-tests.tsx
