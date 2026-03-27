---
name: gatsby
description: "Gatsby JavaScript guide for creating React-based static sites with file routes, GraphQL data queries, plugins, images, and build-time page generation"
metadata:
  languages: "javascript"
  versions: "5.16.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "gatsby,javascript,react,graphql,ssg,meta-framework"
---

# Gatsby JavaScript Guide

## Golden Rule

For `gatsby@5.16.1`, treat Gatsby as a React framework with build-time data loading:

- put URL-based pages in `src/pages/`
- configure site metadata and plugins in `gatsby-config.js`
- use `gatsby-node.js` for build-time APIs such as `createPages`
- use page queries only in page components and templates
- use `useStaticQuery()` for shared components that are not pages
- use `Link` for internal navigation and `Head` for document metadata

There is no Gatsby client to initialize and no framework-level auth step. Setup is package installation, config files, plugins, environment variables, and React components.

## Install

For a new site, use Gatsby's project initializer:

```bash
npm init gatsby
cd my-site
npm run develop
```

To add Gatsby to an existing JavaScript project:

```bash
npm install gatsby@5.16.1 react react-dom
```

Add the standard scripts to `package.json`:

```json
{
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve",
    "clean": "gatsby clean"
  }
}
```

## Minimal Project Setup

Create the core files:

```text
gatsby-config.js
src/pages/index.js
src/pages/about.js
```

`gatsby-config.js`:

```js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: 'My Gatsby Site',
    siteUrl: process.env.GATSBY_SITE_URL || 'http://localhost:8000',
  },
  plugins: [],
}
```

`src/pages/index.js`:

```js
import * as React from 'react'
import { Link, graphql } from 'gatsby'

export default function HomePage({ data }) {
  return (
    <main>
      <h1>{data.site.siteMetadata.title}</h1>
      <p>Welcome to Gatsby.</p>
      <Link to="/about/">About</Link>
    </main>
  )
}

export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export function Head() {
  return (
    <>
      <title>Home</title>
      <meta name="description" content="Homepage for my Gatsby site" />
    </>
  )
}
```

`src/pages/about.js`:

```js
import * as React from 'react'
import { Link } from 'gatsby'

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>This page is created automatically from its file path.</p>
      <Link to="/">Back home</Link>
    </main>
  )
}
```

Run local development:

```bash
npm run develop
```

During development, Gatsby exposes GraphiQL at `http://localhost:8000/___graphql` so you can inspect the schema and test queries.

## Environment Variables

Gatsby supports environment-specific `.env.*` files, but browser-exposed variables must be prefixed with `GATSBY_`.

`.env.development`:

```dotenv
CMS_API_TOKEN=secret-build-token
GATSBY_SITE_URL=http://localhost:8000
GATSBY_PUBLIC_API_BASE=https://api.example.com
```

Load variables in Node-side Gatsby files such as `gatsby-config.js` or `gatsby-node.js`:

```js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

console.log(process.env.CMS_API_TOKEN)
console.log(process.env.GATSBY_SITE_URL)
```

Use only `GATSBY_` variables in browser-rendered React code:

```js
import * as React from 'react'

export default function SettingsPage() {
  return <pre>{process.env.GATSBY_PUBLIC_API_BASE}</pre>
}
```

If a variable is not prefixed with `GATSBY_`, do not expect it to be available in page components or other client-side code.

## Query Data In Pages

Page components can export a GraphQL page query. Gatsby injects the result into the component as the `data` prop.

```js
import * as React from 'react'
import { graphql } from 'gatsby'

export default function SiteInfoPage({ data }) {
  const { title, siteUrl } = data.site.siteMetadata

  return (
    <main>
      <h1>{title}</h1>
      <p>{siteUrl}</p>
    </main>
  )
}

export const query = graphql`
  query SiteInfoPageQuery {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
  }
`
```

Use page queries in:

- files under `src/pages/`
- page template components used by `createPage()`

Do not put page queries in shared UI components. Gatsby only runs them for page components and templates.

## Query Shared Data With `useStaticQuery`

For headers, footers, nav, and other shared components, use `useStaticQuery()`.

`src/components/site-header.js`:

```js
import * as React from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'

export default function SiteHeader() {
  const data = useStaticQuery(graphql`
    query SiteHeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header>
      <Link to="/">{data.site.siteMetadata.title}</Link>
    </header>
  )
}
```

Use this pattern when the query is static and reused across multiple pages.

## Add Optimized Images

For Gatsby image optimization, install the image plugin and its Sharp dependencies:

```bash
npm install gatsby-plugin-image gatsby-plugin-sharp gatsby-transformer-sharp
```

Enable them in `gatsby-config.js`:

```js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: 'My Gatsby Site',
    siteUrl: process.env.GATSBY_SITE_URL || 'http://localhost:8000',
  },
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
  ],
}
```

Use `StaticImage` for straightforward images referenced directly from a component:

```js
import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <StaticImage
        src="../images/team.jpg"
        alt="Team working together"
        width={720}
        placeholder="blurred"
      />
    </main>
  )
}
```

If you need GraphQL-driven image data, use `GatsbyImage` with a file query instead. For simple local assets, `StaticImage` is the fastest path.

## Create Pages Programmatically

Use `gatsby-node.js` when routes depend on build-time data rather than the file system alone.

`gatsby-node.js`:

```js
exports.createPages = async ({ actions }) => {
  const { createPage } = actions

  const docsPages = [
    { slug: '/docs/getting-started/', title: 'Getting Started' },
    { slug: '/docs/deploying/', title: 'Deploying' },
  ]

  docsPages.forEach((page) => {
    createPage({
      path: page.slug,
      component: require.resolve('./src/templates/doc-page.js'),
      context: {
        title: page.title,
      },
    })
  })
}
```

`src/templates/doc-page.js`:

```js
import * as React from 'react'

export default function DocPage({ pageContext }) {
  return (
    <main>
      <h1>{pageContext.title}</h1>
      <p>This page was created with Gatsby's Node API.</p>
    </main>
  )
}
```

Use `context` for small route-specific values you need in the generated page. For larger content datasets, create the page from sourced data and query that data in the template.

## Common Commands

```bash
npm run develop
npm run build
npm run serve
npm run clean
```

- `develop` starts the local dev server
- `build` creates the production site
- `serve` serves the built output locally
- `clean` removes Gatsby caches and generated artifacts

`gatsby clean` is useful when schema changes, plugin changes, or stale caches cause confusing local failures.

## Common Pitfalls

- Use `Link` from `gatsby` for internal links. Use a normal `<a>` for external URLs.
- Keep secrets in unprefixed variables and access them only in Node-side Gatsby files.
- Prefix browser-exposed variables with `GATSBY_`, or they will not be available in client code.
- Keep page queries in page components and templates only; use `useStaticQuery()` elsewhere.
- Add the Sharp companion plugins when using `gatsby-plugin-image`, or image processing will not work.
- Prefer the built-in `Head` export for page metadata rather than older third-party head-management patterns.

## Version Notes

This guide targets `gatsby@5.16.1` and uses the current Gatsby v5 conventions documented by the maintainer docs: file-based pages in `src/pages/`, `Head` exports for metadata, `Link` for internal routing, GraphQL page queries, `useStaticQuery()` for shared components, and the Gatsby Image plugin stack for optimized images.
