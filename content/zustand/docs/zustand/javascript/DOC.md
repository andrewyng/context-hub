---
name: zustand
description: "Zustand state management for JavaScript/TypeScript with React hook stores, vanilla stores, persistence, and middleware"
metadata:
  languages: "javascript"
  versions: "5.0.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "zustand,state,react,store,javascript"
---

# Zustand State Management Guide (JavaScript/TypeScript)

Use the official `zustand` package for both React state and non-React stores. Zustand gives you two main entry points:

- `create` from `zustand` for React hook-based stores
- `createStore` from `zustand/vanilla` for framework-agnostic stores

This guide targets `zustand` `5.0.11`.

## Installation and Prerequisites

```bash
npm install zustand
```

Zustand does not require API keys, authentication, or environment variables.

For React usage, create stores with `create` and read them in components. For non-React code, tests, service modules, or custom integrations, use `createStore` from `zustand/vanilla`.

## Create a React Store

Create a store once at module scope and export the hook.

```javascript
// stores/counter-store.js
import { create } from 'zustand'

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
  reset: () => set({ count: 0 }),
}))
```

Use selectors in components so each component subscribes only to the state it needs.

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

Zustand does not require a provider for this basic pattern.

## Read and Update a Store Outside React

Stores created with `create` also expose the store API on the returned hook. This is useful for event handlers, non-React modules, or debugging code.

```javascript
import { useCounterStore } from './stores/counter-store'

const unsubscribe = useCounterStore.subscribe((state) => {
  console.log('count changed:', state.count)
})

useCounterStore.getState().increment()
useCounterStore.setState({ count: 10 })

unsubscribe()
```

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
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
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
    },
  ),
)
```

Use `partialize` to persist only the fields that should survive reloads. Do not persist transient flags like in-flight loading state unless you explicitly want that behavior.

## Create a Vanilla Store

For non-React usage, create a store with `createStore`.

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

## Split Large Stores into Slices

When a store grows, split it into slice creators and compose them into one store.

```javascript
import { create } from 'zustand'

const createBearSlice = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice = (set) => ({
  fish: 0,
  addFish: () => set((state) => ({ fish: state.fish + 1 })),
})

export const useZooStore = create((...args) => ({
  ...createBearSlice(...args),
  ...createFishSlice(...args),
}))
```

This keeps actions and state grouped without forcing everything into one large initializer function.

## Important Notes and Pitfalls

- `set` shallow-merges object updates by default. For nested objects, copy the nested object yourself.
- `setState(nextState, true)` replaces the entire state object instead of merging. If you replace state, include everything you need to keep, including action functions.
- In React components, subscribe to the smallest possible slice. Avoid selecting a large object if a component only needs one field or one action.
- `persist` uses browser storage. Choose storage intentionally and avoid assuming `localStorage` or `sessionStorage` exists in server-rendered or test environments.
- In server-rendered React apps, do not share a module-scoped store instance across requests for request-specific data. Create per-request stores or keep request-specific state on the client.
- If you copy older examples from blogs, issues, or gists, confirm they match Zustand v5 APIs before using them in production code.

Nested updates should stay immutable:

```javascript
set((state) => ({
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      displayName: 'Ada',
    },
  },
}))
```

## Useful Links

- GitHub repository: `https://github.com/pmndrs/zustand`
- Documentation landing page: `https://zustand.docs.pmnd.rs/`
- `create` API: `https://zustand.docs.pmnd.rs/apis/create`
- `createStore` API: `https://zustand.docs.pmnd.rs/apis/create-store`
- Persist middleware: `https://zustand.docs.pmnd.rs/integrations/persisting-store-data`
- Devtools middleware: `https://zustand.docs.pmnd.rs/middlewares/devtools`
