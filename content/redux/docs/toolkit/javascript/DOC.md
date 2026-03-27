---
name: toolkit
description: "Redux Toolkit for configuring Redux stores, creating slice reducers, handling async logic, and using RTK Query in JavaScript apps"
metadata:
  languages: "javascript"
  versions: "2.11.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "redux,redux-toolkit,state-management,rtk-query,javascript"
---

# Redux Toolkit for JavaScript

Use `@reduxjs/toolkit` to build Redux stores with `configureStore`, feature state with `createSlice`, async flows with `createAsyncThunk`, and data fetching with RTK Query. For React apps, pair it with `react-redux`.

## Golden Rules

- Install `@reduxjs/toolkit` for Redux logic, and add `react-redux` when the app uses React components.
- Create stores with `configureStore` instead of `createStore`.
- Put reducer logic and action creators in `createSlice`.
- Use `createAsyncThunk` for request lifecycles you manage yourself, or RTK Query for API caching and generated hooks.
- Keep Redux state and actions serializable unless you intentionally customize the default middleware checks.
- Import RTK Query from `@reduxjs/toolkit/query/react` in React apps, or from `@reduxjs/toolkit/query` in non-React code.

## Install

```bash
npm install @reduxjs/toolkit
npm install react-redux
```

`react-redux` is only required if you render Redux state from React components.

## Prerequisites

Redux Toolkit is a local state-management library. It does not require API keys or built-in authentication.

If you use RTK Query against an HTTP API, set your app's API base URL however your runtime expects. For a Vite app, for example:

```bash
export VITE_API_URL="https://api.example.com"
```

## Create a Store and Slice

`configureStore` is the standard entry point. When `reducer` is an object, it combines those slice reducers under the same keys. It also adds Redux Thunk and the default development middleware checks for immutable and serializable state, and enables Redux DevTools.

`src/features/counter/counterSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
    },
    reset() {
      return { value: 0 };
    },
  },
});

export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions;

export default counterSlice.reducer;
```

`src/app/store.js`

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

## Connect Redux to React

Wrap the app with `Provider` from `react-redux`, then read and dispatch state from components.

`src/main.jsx`

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

`src/features/counter/Counter.jsx`

```javascript
import { useDispatch, useSelector } from "react-redux";
import {
  decrement,
  increment,
  incrementByAmount,
} from "./counterSlice";

export function Counter() {
  const value = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {value}</p>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}
```

## Handle Async Logic with `createAsyncThunk`

Use `createAsyncThunk` when you want explicit `pending` / `fulfilled` / `rejected` action types and reducer cases.

`src/features/users/usersSlice.js`

```javascript
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (userId) => {
    const response = await fetch(`${apiBaseUrl}/users/${userId}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    entities: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Request failed";
      });
  },
});

export default usersSlice.reducer;
```

Add the reducer to the store so the slice state is available at `state.users`.

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import usersReducer from "../features/users/usersSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    users: usersReducer,
  },
});
```

When dispatching the thunk, call `.unwrap()` if you want the returned promise to resolve with the fulfilled payload or throw the rejected error.

```javascript
import { useDispatch } from "react-redux";
import { fetchUserById } from "./usersSlice";

export function LoadUserButton() {
  const dispatch = useDispatch();

  async function handleClick() {
    try {
      const user = await dispatch(fetchUserById(42)).unwrap();
      console.log(user.name);
    } catch (error) {
      console.error(error);
    }
  }

  return <button onClick={handleClick}>Load user</button>;
}
```

## Customize Default Middleware

`configureStore` uses `getDefaultMiddleware()` unless you replace it. Use the callback form to keep the defaults and adjust their options.

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
```

Only disable a check when your app really needs it. The defaults are helpful for catching accidental state mutations and non-serializable values during development.

## Use RTK Query for API Data

RTK Query is included in Redux Toolkit. In React apps, create an API slice with `createApi`, add its reducer and middleware to the store, call `setupListeners`, and use the generated hooks.

`src/services/postsApi.js`

```javascript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
    }),
    addPost: builder.mutation({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postsApi;
```

`src/app/store.js`

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import counterReducer from "../features/counter/counterSlice";
import { postsApi } from "../services/postsApi";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});

setupListeners(store.dispatch);
```

`src/features/posts/PostsList.jsx`

```javascript
import { useState } from "react";
import {
  useAddPostMutation,
  useGetPostsQuery,
} from "../../services/postsApi";

export function PostsList() {
  const { data: posts = [], isLoading, isError } = useGetPostsQuery();
  const [addPost, { isLoading: isSaving }] = useAddPostMutation();
  const [title, setTitle] = useState("");

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Could not load posts.</p>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await addPost({ title }).unwrap();
    setTitle("");
  }

  return (
    <>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New post title"
        />
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add post"}
        </button>
      </form>
    </>
  );
}
```

Call `setupListeners(store.dispatch)` once after store creation if you want RTK Query features such as `refetchOnFocus` and `refetchOnReconnect`.

## Pitfalls

- Reducers created with `createSlice` may appear to mutate state because Redux Toolkit uses Immer internally. That only applies inside reducer logic. Outside reducers, treat state as immutable.
- Reassigning `state = someValue` inside a case reducer does not replace the current state. Return the new value instead.
- Non-serializable values such as functions, class instances, DOM nodes, `Map`, `Set`, or promises can trigger the default middleware warnings.
- RTK Query needs both `postsApi.reducer` and `postsApi.middleware` added to the store. Missing either one causes broken cache behavior.
- Generated RTK Query hooks come from `@reduxjs/toolkit/query/react`. If you import from `@reduxjs/toolkit/query`, you do not get React hooks.
