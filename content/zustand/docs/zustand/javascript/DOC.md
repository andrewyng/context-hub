---
name: zustand
description: "Zustand state management for JavaScript/TypeScript with React hook stores, vanilla stores, persistence, and middleware"
metadata:
  languages: "javascript"
  versions: "5.0.14"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "zustand,state,react,store,javascript"
---

# Zustand State Management Guide (JavaScript/TypeScript)

Use the official `zustand` package for both React state and non-React stores. Zustand gives you two main entry points:

- `create` from `zustand` for React hook-based stores
- `createStore` from `zustand/vanilla` for framework-agnostic stores

This guide targets `zustand` `5.0.14`.

## Installation and Prerequisites

```bash
npm install zustand
```

Zustand does not require API keys, authentication, or environment variables.

For React usage, create stores with `create` and read them in components. For non-React code, tests, service modules, or custom integrations, use `createStore` from `zustand/vanilla`.

## Create a React Store

Create a store once at module scope and export the hook. The initializer receives `set` and `get`: `set` updates state (shallow-merged by default), and `get` reads the current state from inside an action.

```javascript
// stores/counter-store.js
import { create } from 'zustand'

export const useCounterStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
  doubleAndLog: () => {
    const current = get().count
    set({ count: current * 2 })
    console.log('doubled from', current)
  },
  reset: () => set({ count: 0 }),
}))
```

## Selectors

In components, select the smallest slice you need so each component only re-renders when that slice changes.

```jsx
// components/Counter.jsx
import { useCounterStore } from '../stores/counter-store'

export function Counter() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const reset = useCounterStore((state) => state.reset)

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

### Selecting multiple values with `useShallow`

If you return an object or array from a selector, the default equality check is reference equality and the component will re-render on every store update. Wrap the selector with `useShallow` from `zustand/react/shallow` to compare the result shallowly.

```jsx
import { useShallow } from 'zustand/react/shallow'
import { useCounterStore } from '../stores/counter-store'

export function CounterControls() {
  const { increment, reset } = useCounterStore(
    useShallow((state) => ({
      increment: state.increment,
      reset: state.reset,
    })),
  )

  return (
    <>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </>
  )
}
```

For vanilla stores or `subscribe` callbacks, use the lower-level `shallow` comparator from `zustand/shallow`.

## Read and Update a Store Outside React

Stores created with `create` also expose the store API on the returned hook. This is useful for event handlers, non-React modules, tests, or debugging code.

```javascript
import { useCounterStore } from './stores/counter-store'

const unsubscribe = useCounterStore.subscribe((state, previousState) => {
  if (state.count !== previousState.count) {
    console.log('count changed:', state.count)
  }
})

useCounterStore.getState().increment()
useCounterStore.setState({ count: 10 })

unsubscribe()
```

`useCounterStore.getState()` and `useCounterStore.setState()` work the same outside React, which makes it easy to share state between React components and non-React modules without a separate vanilla store.

## Async Actions

Async actions are regular functions in the store. Fetch data, then call `set` when the result is ready.

```javascript
import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  loadUser: async (id) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/users/${id}`)

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`)
      }

      const user = await response.json()
      set({ user, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      })
    }
  },
}))
```

Use it in a component the same way as any other action:

```jsx
import { useEffect } from 'react'
import { useUserStore } from '../stores/user-store'

export function UserProfile({ userId }) {
  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)
  const error = useUserStore((state) => state.error)
  const loadUser = useUserStore((state) => state.loadUser)

  useEffect(() => {
    loadUser(userId)
  }, [loadUser, userId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!user) return null

  return <pre>{JSON.stringify(user, null, 2)}</pre>
}
```

## Split Large Stores into Slices

When a store grows, split it into slice creators and compose them into one store with spread.

```javascript
import { create } from 'zustand'

const createBearSlice = (set, get) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice = (set, get) => ({
  fish: 0,
  addFish: () => set((state) => ({ fish: state.fish + 1 })),
})

const createSharedSlice = (set, get) => ({
  feedAll: () => {
    get().addBear()
    get().addFish()
  },
})

export const useZooStore = create((...args) => ({
  ...createBearSlice(...args),
  ...createFishSlice(...args),
  ...createSharedSlice(...args),
}))
```

Each slice creator receives the full `set` and `get`, so a slice can read and write any part of the combined state.

## Persist State

Use `persist` from `zustand/middleware` to save store data to browser storage. If you omit `storage`, `persist` uses `localStorage`.

```javascript
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useSessionStore = create(
  persist(
    (set) => ({
      token: null,
      theme: 'light',
      setToken: (token) => set({ token }),
      setTheme: (theme) => set({ theme }),
      clearSession: () => set({ token: null }),
    }),
    {
      name: 'app-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, theme: state.theme }),
      version: 1,
    },
  ),
)
```

Use `partialize` to persist only the fields that should survive reloads. Do not persist transient flags like in-flight loading state unless you explicitly want that behavior.

## Immer Middleware for Nested Updates

`set` shallow-merges object updates by default, so deeply nested updates require manual spreading. Wrap the initializer with `immer` to write mutating-looking updates safely.

```javascript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useProfileStore = create(
  immer((set) => ({
    user: {
      id: null,
      profile: {
        displayName: '',
        preferences: { theme: 'light' },
      },
    },
    setDisplayName: (displayName) =>
      set((state) => {
        state.user.profile.displayName = displayName
      }),
    toggleTheme: () =>
      set((state) => {
        state.user.profile.preferences.theme =
          state.user.profile.preferences.theme === 'light' ? 'dark' : 'light'
      }),
  })),
)
```

`immer` composes with other middleware. A common stack is `persist(immer(...))` or `devtools(persist(immer(...)))`.

## Create a Vanilla Store

For non-React usage, create a store with `createStore`. This is the same API surface as the React `create` hook, minus the React binding.

```javascript
// stores/counter-store.js
import { createStore } from 'zustand/vanilla'

export const counterStore = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))
```

Read it directly:

```javascript
import { counterStore } from './stores/counter-store'

counterStore.getState().increment()

const unsubscribe = counterStore.subscribe((state) => {
  console.log(state.count)
})

counterStore.getState().reset()
unsubscribe()
```

Bind a vanilla store to React with `useStore`:

```jsx
import { useStore } from 'zustand'
import { counterStore } from '../stores/counter-store'

export function Counter() {
  const count = useStore(counterStore, (state) => state.count)
  const increment = useStore(counterStore, (state) => state.increment)

  return <button onClick={increment}>{count}</button>
}
```

## Common Middleware

### Redux DevTools Integration

Use `devtools` from `zustand/middleware` to inspect actions and state changes in Redux DevTools.

```javascript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useTodoStore = create(
  devtools(
    (set) => ({
      todos: [],
      addTodo: (title) =>
        set(
          (state) => ({
            todos: [...state.todos, { id: crypto.randomUUID(), title, done: false }],
          }),
          false,
          'todo/add',
        ),
      toggleTodo: (id) =>
        set(
          (state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id ? { ...todo, done: !todo.done } : todo,
            ),
          }),
          false,
          'todo/toggle',
        ),
    }),
    { name: 'todo-store' },
  ),
)
```

### Subscribe to a Selected Slice Outside React

If you need subscriptions with selectors in a vanilla store, wrap the store with `subscribeWithSelector`.

```javascript
import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'

export const positionStore = createStore(
  subscribeWithSelector((set) => ({
    x: 0,
    y: 0,
    setPosition: (x, y) => set({ x, y }),
  })),
)

const unsubscribe = positionStore.subscribe(
  (state) => state.x,
  (x, previousX) => {
    console.log('x changed', { x, previousX })
  },
)

positionStore.getState().setPosition(10, 20)
unsubscribe()
```

## Important Notes and Pitfalls

- `set` shallow-merges object updates by default. For nested objects, copy the nested object yourself or use the `immer` middleware.
- `setState(nextState, true)` replaces the entire state object instead of merging. If you replace state, include everything you need to keep, including action functions.
- In React components, subscribe to the smallest possible slice. When selecting multiple values into an object or array, use `useShallow` to avoid spurious re-renders.
- `persist` uses browser storage. Choose storage intentionally and avoid assuming `localStorage` or `sessionStorage` exists in server-rendered or test environments.
- In server-rendered React apps, do not share a module-scoped store instance across requests for request-specific data. Create per-request stores or keep request-specific state on the client.
- If you copy older examples from blogs, issues, or gists, confirm they match Zustand v5 APIs before using them in production code.

## Useful Links

- GitHub repository: `https://github.com/pmndrs/zustand`
- Documentation landing page: `https://zustand.docs.pmnd.rs/`
- `create` API: `https://zustand.docs.pmnd.rs/apis/create`
- `createStore` API: `https://zustand.docs.pmnd.rs/apis/create-store`
- Persist middleware: `https://zustand.docs.pmnd.rs/integrations/persisting-store-data`
- Immer middleware: `https://zustand.docs.pmnd.rs/integrations/immer-middleware`
- Devtools middleware: `https://zustand.docs.pmnd.rs/middlewares/devtools`
