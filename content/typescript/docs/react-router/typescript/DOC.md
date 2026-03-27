---
name: react-router
description: "TypeScript declarations for React Router 5 core routers, route props, hooks, path helpers, and history-based navigation."
metadata:
  languages: "typescript"
  versions: "5.1.20"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react-router,routing,history,react,types,definitelytyped"
---

# React Router TypeScript Guide

## Golden Rule

Install `@types/react-router` for React Router 5.x projects that use the core `react-router` package.

This package only provides TypeScript declarations. It does not install the runtime router.

The `5.1.20` declarations describe the React Router 5 API surface, including `Route`, `Switch`, `Redirect`, `withRouter`, `useHistory`, `useLocation`, `useParams`, and `useRouteMatch`.

If your app uses `react-router-dom@5`, install `@types/react-router-dom@5` for the DOM-specific APIs. That package already depends on `@types/react-router`.

## Install

### Core `react-router` usage

Install the runtime package, React, and the matching type packages:

```bash
npm install react react-router@5
npm install -D typescript @types/react @types/react-router@5.1.20
```

Install `history@4` only when your app imports from `history` directly, such as a custom router setup:

```bash
npm install history@4
```

### Browser apps with `react-router-dom`

For browser apps, install the DOM runtime and its type package instead of installing `@types/react-router` separately:

```bash
npm install react react-router-dom@5
npm install -D typescript @types/react @types/react-router-dom@5
```

`@types/react-router-dom@5.3.3` depends on `@types/react-router`, so it brings in the core route and history types automatically.

## TypeScript Setup

There are no environment variables, credentials, or client objects to configure.

The practical setup is your compiler configuration and your runtime package versions.

`@types/react-router@5.1.20` declares `typeScriptVersion: "4.2"`, so use TypeScript 4.2 or newer.

The package also ships a `typesVersions` mapping for TypeScript `<=4.6`. Older compilers load the `ts4.6/` declaration tree automatically, while newer compilers use the root declarations.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "lib": ["ES2020", "DOM"]
  }
}
```

If your project restricts ambient packages with `compilerOptions.types`, include `react-router` explicitly:

```json
{
  "compilerOptions": {
    "types": ["react", "react-router"]
  }
}
```

For DOM apps that import `react-router-dom`, include that package instead:

```json
{
  "compilerOptions": {
    "types": ["react", "react-router-dom"]
  }
}
```

## Imports And Runtime Boundary

Import the core router APIs from `react-router`:

```ts
import {
  MemoryRouter,
  Redirect,
  Route,
  StaticRouter,
  Switch,
  generatePath,
  matchPath,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
  withRouter,
  type RouteComponentProps,
  type StaticRouterContext,
} from "react-router";
```

Browser-only components such as `BrowserRouter`, `HashRouter`, `Link`, and `NavLink` are not declared by this package. They belong to `react-router-dom`.

## Common Workflows

### Type route params and location state

Use `RouteComponentProps` for component props and `useParams` / `useLocation` in hook-based components.

```tsx
import React from "react";
import {
  Route,
  useLocation,
  useParams,
  type RouteComponentProps,
} from "react-router";

type UserParams = {
  userId: string;
};

type LocationState = {
  referrer?: "/teams" | "/search";
};

export function UserScreen() {
  const { userId } = useParams<UserParams>();
  const location = useLocation<LocationState>();

  return <div>{userId} {location.state?.referrer ?? "direct"}</div>;
}

type UserRouteProps = RouteComponentProps<UserParams, {}, LocationState>;

export function UserRoute({ match, location }: UserRouteProps) {
  return <div>{match.params.userId} {location.state?.referrer ?? "direct"}</div>;
}

export function AppRoutes() {
  return <Route path="/users/:userId" component={UserRoute} />;
}
```

`RouteComponentProps<Params, C, S>` uses three generics:

- `Params` for route params
- `C` for `staticContext` in server rendering
- `S` for `location.state`

### Type imperative navigation with `useHistory`

`useHistory<S>()` returns `History<S>`, so navigation state stays typed when you push or replace locations.

```tsx
import { useHistory } from "react-router";

type CheckoutState = {
  from: "/cart" | "/shipping";
};

export function ContinueButton() {
  const history = useHistory<CheckoutState>();

  return (
    <button
      onClick={() => {
        history.push("/checkout/review", { from: "/shipping" });
      }}
    >
      Continue
    </button>
  );
}
```

`useLocation<S>()` reads the same state shape on the destination route.

### Generate URLs from typed path patterns

`generatePath()` uses the `ExtractRouteParams` helper type, so inline string literals produce a typed params object.

```ts
import { generatePath } from "react-router";

const userRoute = "/users/:userId" as const;
const teamMemberRoute = "/teams/:teamId/members/:memberId" as const;

const userUrl = generatePath(userRoute, { userId: "42" });
const memberUrl = generatePath(teamMemberRoute, {
  teamId: "a-team",
  memberId: "u-17",
});
```

Keep route patterns as string literals or `as const`. If a path value widens to plain `string`, TypeScript can no longer infer the expected params.

### Match routes outside a `<Route>` component

Use `matchPath()` for manual checks and `useRouteMatch()` when a component needs the current match.

```tsx
import { matchPath, useRouteMatch } from "react-router";

type TeamParams = {
  teamId: string;
};

export function isTeamPath(pathname: string) {
  return matchPath<TeamParams>(pathname, {
    path: "/teams/:teamId",
    exact: true,
  });
}

export function TeamBadge() {
  const match = useRouteMatch<TeamParams>("/teams/:teamId");

  if (!match) {
    return null;
  }

  return <span>{match.params.teamId}</span>;
}
```

`useRouteMatch()` without arguments returns the nearest current match. With a path or route props object, it returns `match | null`.

### Wrap legacy class components with `withRouter`

`withRouter()` is the main compatibility path for class components and older function components that still expect injected route props.

```tsx
import React from "react";
import { withRouter, type RouteComponentProps } from "react-router";

type Params = {
  projectId: string;
};

type OwnProps = {
  title: string;
};

type Props = OwnProps & RouteComponentProps<Params>;

class ProjectPage extends React.Component<Props> {
  render() {
    return <h1>{this.props.title}: {this.props.match.params.projectId}</h1>;
  }
}

export default withRouter(ProjectPage);
```

The declaration file documents a known TypeScript limitation for decorators: use `withRouter(Component)` on a separate line instead of `@withRouter`.

### Type test renders with `MemoryRouter`

`MemoryRouter` is the practical test router because the type package covers `initialEntries`, `initialIndex`, and custom confirmation callbacks.

```tsx
import React from "react";
import { MemoryRouter, Route } from "react-router";

export function TestApp() {
  return (
    <MemoryRouter initialEntries={["/users/42"]}>
      <Route path="/users/:userId" render={() => <div>ready</div>} />
    </MemoryRouter>
  );
}
```

### Type server-rendered routing with `StaticRouter`

`StaticRouterContext` lets server code read redirects and status from the render pass.

```tsx
import React from "react";
import { StaticRouter, type StaticRouterContext } from "react-router";

const context: StaticRouterContext = {};

export function ServerApp({ url }: { url: string }) {
  return (
    <StaticRouter location={url} context={context}>
      <div>server render</div>
    </StaticRouter>
  );
}

if (context.url) {
  console.log("redirect to", context.url);
}
```

The typed context surface includes `url`, `action`, `location`, and the base `statusCode` field from `StaticContext`.

## Important Pitfalls

- `@types/react-router@5.1.20` is for React Router 5.x, not the v6 or v7 API.
- These declarations include `Switch`, `Redirect`, `withRouter`, and `useHistory`; they do not declare `Routes`, `Navigate`, or `useNavigate`.
- This package covers the core router only. DOM-specific components live in `react-router-dom`.
- The package depends on `@types/history` and models the `history` v4 API shape used by React Router 5.
- Install the runtime packages separately. Type packages alone do not make routes work at runtime.

## Version Notes

- Package version `5.1.20` was published from DefinitelyTyped and points to the `types/react-router` source tree.
- The declaration package depends on `@types/history@^4.7.11` and `@types/react`.
- The runtime `react-router` package has moved on to newer major versions, so use this type package only when your app still targets the 5.x router API.
