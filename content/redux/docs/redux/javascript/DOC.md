---
name: redux
description: "Core Redux APIs for creating stores, reducers, middleware, and subscriptions in JavaScript applications."
metadata:
  languages: "javascript"
  versions: "5.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "redux,state,store,reducer,middleware,javascript"
---

# Redux Core Guide

This guide covers the standalone `redux` core package.

For most new Redux application code, the Redux maintainers recommend `@reduxjs/toolkit` instead of building directly on `createStore`. Use the core `redux` package when you want the low-level store primitives directly, are learning the Redux data flow, or are integrating Redux into a library.

## Install

```bash
npm install redux
```

`redux` has no environment variables, credentials, or client initialization step.

## Create a Store

In Redux 5, `createStore` is deprecated in favor of Redux Toolkit. If you intentionally want the core store API, import `legacy_createStore` and alias it locally.

```javascript
import { legacy_createStore as createStore } from "redux";

const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    case "counter/add":
      return { count: state.count + action.payload };
    default:
      return state;
  }
}

const store = createStore(counterReducer);

const unsubscribe = store.subscribe(() => {
  console.log("state", store.getState());
});

store.dispatch({ type: "counter/increment" });
store.dispatch({ type: "counter/add", payload: 3 });

unsubscribe();
```

Use `store.getState()` to read the current state, `store.dispatch()` to send actions, and `store.subscribe()` to react after every dispatch.

## Hydrate Initial State

Pass a second argument when you need to restore serialized state from the server or boot from saved data.

```javascript
import { legacy_createStore as createStore } from "redux";

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

const preloadedState = { count: 10 };

const store = createStore(counterReducer, preloadedState);
```

If you use `combineReducers`, the `preloadedState` object must use the same top-level keys as your combined reducers.

## Combine Multiple Reducers

`combineReducers` turns a map of slice reducers into one root reducer.

```javascript
import {
  combineReducers,
  legacy_createStore as createStore,
} from "redux";

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

function filterReducer(state = "all", action) {
  switch (action.type) {
    case "filter/set":
      return action.payload;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  counter: counterReducer,
  filter: filterReducer,
});

const store = createStore(rootReducer, {
  counter: { count: 5 },
  filter: "completed",
});

store.dispatch({ type: "filter/set", payload: "active" });
```

Each slice reducer must return its initial state when called with `undefined`, and must return the previous state for unknown actions.

## Add Middleware

Use `applyMiddleware` to wrap `dispatch()`.

```javascript
import {
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
} from "redux";

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  counter: counterReducer,
});

const logger = (storeAPI) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", storeAPI.getState());
  return result;
};

const store = createStore(rootReducer, applyMiddleware(logger));

store.dispatch({ type: "counter/increment" });
```

If you also need a preloaded state value, pass it as the second argument and the enhancer as the third:

```javascript
const store = createStore(rootReducer, { counter: { count: 1 } }, applyMiddleware(logger));
```

Middleware is the extension point you need when you want to dispatch values other than plain object actions.

## Bind Action Creators

`bindActionCreators` is a convenience helper that wraps action creators so they dispatch automatically.

```javascript
import {
  bindActionCreators,
  legacy_createStore as createStore,
} from "redux";

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    case "counter/add":
      return { count: state.count + action.payload };
    default:
      return state;
  }
}

const store = createStore(counterReducer);

const actions = bindActionCreators(
  {
    increment: () => ({ type: "counter/increment" }),
    add: (amount) => ({ type: "counter/add", payload: amount }),
  },
  store.dispatch,
);

actions.increment();
actions.add(5);
```

This is optional. Calling `store.dispatch(actionCreator())` directly is also valid.

## Replace the Root Reducer

Use `store.replaceReducer()` when the root reducer changes at runtime, such as after loading new reducer code.

```javascript
import {
  combineReducers,
  legacy_createStore as createStore,
} from "redux";

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "counter/increment":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

function todosReducer(state = [], action) {
  switch (action.type) {
    case "todos/add":
      return [...state, action.payload];
    default:
      return state;
  }
}

const store = createStore(
  combineReducers({
    counter: counterReducer,
  }),
);

store.replaceReducer(
  combineReducers({
    counter: counterReducer,
    todos: todosReducer,
  }),
);
```

Replacing the reducer dispatches an internal action so newly added reducers can populate their initial state.

## Important Pitfalls

- Prefer `@reduxjs/toolkit` for new application code. The Redux maintainers describe it as the standard way to write Redux today.
- `dispatch()` only accepts plain object actions by default. If you want to dispatch functions, promises, or other values, add middleware.
- Action objects must have a defined `type`, and in Redux 5 that `type` must be a string.
- Reducers must never return `undefined`. Return the previous state for unknown actions, and return the initial state when `state` is `undefined`.
- Do not handle Redux private action types such as `@@redux/*` directly.
- `combineReducers` validates each slice reducer. A single reducer that returns `undefined` will fail the whole store setup.
- Do not call `store.getState()`, `store.subscribe()`, or unsubscribe a listener while a reducer is executing.

## Version Notes for `redux@5`

- `createStore` is intentionally marked deprecated; use `legacy_createStore` if you still need the core store API.
- `redux@5` exports `isAction()` and `isPlainObject()` utility guards if you need to validate inputs in custom integrations.
- The TypeScript `AnyAction` type is deprecated in the package declarations in favor of stricter action typing.
