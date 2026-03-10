---
name: app-router
description: "Next.js App Router for building full-stack React applications with server components, routing, data fetching, and API routes"
metadata:
  languages: "javascript"
  versions: "15.3.0"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "nextjs,react,app-router,server-components,ssr,vercel"
---

# Next.js App Router — JavaScript/TypeScript Coding Guidelines

You are a Next.js App Router expert. Help me write code using Next.js 15 with the App Router.

Official documentation:
https://nextjs.org/docs

## Golden Rule: Use the App Router

Next.js 15 uses the **App Router** (`app/` directory) by default. Do not use the legacy Pages Router (`pages/`) for new projects.

- **Framework:** Next.js 15
- **NPM Package:** `next`
- **Current Version:** 15.3.0
- **React Version:** React 19

**Installation:**

```bash
npx create-next-app@latest my-app
```

**Key Conventions:**

- **Correct:** `app/` directory with `page.tsx`, `layout.tsx`, `loading.tsx`
- **Correct:** Server Components by default (no `"use client"` needed)
- **Correct:** `"use client"` directive for interactive components
- **Incorrect:** Using `pages/` directory for new routes
- **Incorrect:** `getServerSideProps` or `getStaticProps` (App Router uses `fetch` and async components)
- **Incorrect:** Importing `next/router` (use `next/navigation` in App Router)

## Project Structure

```
app/
  layout.tsx          # Root layout (required)
  page.tsx            # Home page (/)
  loading.tsx         # Loading UI
  error.tsx           # Error boundary
  not-found.tsx       # 404 page
  globals.css         # Global styles
  dashboard/
    page.tsx          # /dashboard
    layout.tsx        # Dashboard layout (nested)
    [id]/
      page.tsx        # /dashboard/:id (dynamic route)
  api/
    route.ts          # API route (/api)
    users/
      route.ts        # /api/users
      [id]/
        route.ts      # /api/users/:id
```

## Routing

### File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI (makes route accessible) |
| `layout.tsx` | Shared layout (persists across navigations) |
| `loading.tsx` | Loading UI (Suspense boundary) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint (no UI) |
| `template.tsx` | Like layout but re-renders on navigation |

### Dynamic Routes

```
app/blog/[slug]/page.tsx        → /blog/hello-world
app/shop/[...slug]/page.tsx     → /shop/a/b/c (catch-all)
app/shop/[[...slug]]/page.tsx   → /shop or /shop/a/b (optional catch-all)
```

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

### Route Groups

Organize routes without affecting the URL:

```
app/(marketing)/about/page.tsx   → /about
app/(marketing)/blog/page.tsx    → /blog
app/(shop)/cart/page.tsx          → /cart
```

## Server Components (Default)

Components in the `app/` directory are Server Components by default. They run on the server and can directly access databases, APIs, and the filesystem.

```typescript
// app/users/page.tsx — Server Component (default)
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**Server Components can:**
- `await` async operations directly
- Access backend resources (database, filesystem)
- Keep secrets on the server
- Reduce client bundle size

**Server Components cannot:**
- Use `useState`, `useEffect`, or other hooks
- Use browser APIs (`window`, `document`)
- Use event handlers (`onClick`, `onChange`)

## Client Components

Add `"use client"` at the top of files that need interactivity:

```typescript
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Rule of thumb:** Keep Client Components at the leaves of the component tree. Only add `"use client"` where you actually need interactivity.

## Layouts

```typescript
// app/layout.tsx — Root Layout (required)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Nested Layouts

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

## Data Fetching

### In Server Components (Recommended)

```typescript
// Fetch data directly in async Server Components
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "force-cache",       // default: cache indefinitely
    // cache: "no-store",       // always fresh
    // next: { revalidate: 60 }, // revalidate every 60 seconds
  });
  const json = await data.json();
  return <div>{json.title}</div>;
}
```

### Caching Behavior

| Option | Behavior |
|--------|----------|
| `cache: "force-cache"` | Cache indefinitely (default) |
| `cache: "no-store"` | No caching, always fresh |
| `next: { revalidate: N }` | Revalidate every N seconds (ISR) |
| `next: { tags: ["posts"] }` | Tag-based revalidation |

### Revalidation

```typescript
// app/actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function refreshPosts() {
  revalidateTag("posts");   // revalidate by tag
  revalidatePath("/blog");  // revalidate by path
}
```

## Server Actions

Server Actions are async functions that run on the server, called from Client Components.

```typescript
// app/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.post.create({ data: { title, content } });
  revalidatePath("/posts");
}
```

```typescript
// app/posts/new/page.tsx
import { createPost } from "@/app/actions";

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Server Actions in Client Components

```typescript
"use client";

import { useTransition } from "react";
import { createPost } from "@/app/actions";

export default function CreateForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => createPost(formData));
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

## API Routes (Route Handlers)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  const users = await db.user.findMany({
    where: query ? { name: { contains: query } } : undefined,
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Dynamic API Routes

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

## Navigation

### Link Component

```typescript
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href={`/blog/${slug}`}>Post</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <button onClick={() => router.push("/dashboard")}>
      Go to Dashboard
    </button>
  );
}
```

### Redirects

```typescript
import { redirect, permanentRedirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/login"); // 307 temporary
  }
  // permanentRedirect("/new-path"); // 308 permanent
}
```

## Middleware

```typescript
// middleware.ts (root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check auth
  const token = request.cookies.get("token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Add headers
  const response = NextResponse.next();
  response.headers.set("x-custom-header", "value");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Metadata and SEO

### Static Metadata

```typescript
// app/layout.tsx or app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Description here",
  openGraph: {
    title: "My App",
    description: "Description here",
    images: ["/og-image.png"],
  },
};
```

### Dynamic Metadata

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## Static Generation

```typescript
// Generate static params at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// This page will be statically generated for each slug
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

## Image Optimization

```typescript
import Image from "next/image";

// Local image
import heroImage from "./hero.png";

export default function Page() {
  return (
    <>
      {/* Local image — auto width/height */}
      <Image src={heroImage} alt="Hero" priority />

      {/* Remote image — must specify width/height */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        width={800}
        height={600}
      />

      {/* Fill container */}
      <div style={{ position: "relative", width: "100%", height: 400 }}>
        <Image src="/bg.jpg" alt="Background" fill style={{ objectFit: "cover" }} />
      </div>
    </>
  );
}
```

Configure remote image domains in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
```

## Loading and Error States

```typescript
// app/dashboard/loading.tsx — automatic Suspense boundary
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/error.tsx — automatic error boundary
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Environment Variables

```
# .env.local (git-ignored)
DATABASE_URL=postgresql://...
API_SECRET=secret123

# Public (exposed to browser) — must start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.example.com
```

- Server-only: `process.env.DATABASE_URL` (only in Server Components, Route Handlers, Server Actions)
- Client-accessible: `process.env.NEXT_PUBLIC_API_URL` (available everywhere)

## Parallel and Intercepting Routes

### Parallel Routes (Slots)

```
app/
  @modal/
    page.tsx          # Renders in parallel with main page
  layout.tsx          # Receives both children and modal
  page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

### Intercepting Routes

```
app/
  feed/
    page.tsx
    (..)photo/[id]/
      page.tsx        # Intercepts /photo/[id] when navigating from /feed
  photo/[id]/
    page.tsx          # Full page (direct navigation or refresh)
```

## Common next.config.ts Options

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.example.com" },
    ],
  },
  redirects: async () => [
    { source: "/old", destination: "/new", permanent: true },
  ],
  rewrites: async () => [
    { source: "/api/:path*", destination: "https://backend.example.com/:path*" },
  ],
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
      ],
    },
  ],
};

export default nextConfig;
```
