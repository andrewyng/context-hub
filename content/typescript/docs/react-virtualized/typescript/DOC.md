---
name: react-virtualized
description: "TypeScript declarations for react-virtualized lists, tables, AutoSizer, InfiniteLoader, and CellMeasurer workflows."
metadata:
  languages: "typescript"
  versions: "9.22.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-virtualized,virtualization,list,table,types,definitelytyped"
---

# react-virtualized TypeScript Guide

`@types/react-virtualized` provides the TypeScript declarations for the `react-virtualized` runtime package. Install it when your React app renders virtualized lists, tables, or measurement helpers and you want typed component props and callback signatures.

This package only ships `.d.ts` files. Your application imports from `react-virtualized`; TypeScript reads the declarations from `@types/react-virtualized`.

## Install

Install the runtime package first, then add the declaration package and the React TypeScript dependencies.

```bash
npm install react react-dom react-virtualized
npm install -D typescript @types/react @types/react-dom @types/react-virtualized
```

If your app already has React and `react-virtualized`, add only the missing type package:

```bash
npm install -D @types/react-virtualized
```

Keep `react-virtualized` and `@types/react-virtualized` aligned when you upgrade.

There are no environment variables, authentication settings, or client initialization objects to configure.

## TypeScript Setup

Import from `react-virtualized`, not from `@types/react-virtualized`.

For a browser React app, keep JSX and DOM libraries enabled:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  }
}
```

TypeScript usually discovers the declarations automatically once `@types/react-virtualized` is installed.

## Common Workflows

### Render a typed virtualized list

Derive callback argument types from the component props when you want the declaration package to drive your local helper signatures.

```tsx
import { type ComponentProps } from "react";
import { AutoSizer, List } from "react-virtualized";

type TodoRow = {
  id: string;
  title: string;
};

type ListRowRendererProps = Parameters<
  NonNullable<ComponentProps<typeof List>["rowRenderer"]>
>[0];

export function TodoList({ rows }: { rows: TodoRow[] }) {
  function rowRenderer({ index, key, style }: ListRowRendererProps) {
    const row = rows[index];

    return (
      <div key={key} style={style}>
        {row.title}
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            rowCount={rows.length}
            rowHeight={48}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  );
}
```

`AutoSizer` measures its parent, so the wrapper element must have a real height and width at render time.

### Type custom table cells

For `Table` and `Column`, derive the renderer argument type from the `Column` props so your custom cell logic stays aligned with the installed declarations.

```tsx
import { type ComponentProps } from "react";
import { Column, Table } from "react-virtualized";

type UserRow = {
  id: string;
  email: string;
  logins: number;
};

type ColumnCellRendererProps = Parameters<
  NonNullable<ComponentProps<typeof Column>["cellRenderer"]>
>[0];

function renderLoginsCell({ cellData }: ColumnCellRendererProps) {
  return <strong>{cellData}</strong>;
}

export function UsersTable({ rows }: { rows: UserRow[] }) {
  return (
    <Table
      width={720}
      height={320}
      headerHeight={40}
      rowHeight={44}
      rowCount={rows.length}
      rowGetter={({ index }) => rows[index]}
    >
      <Column label="Email" dataKey="email" width={420} />
      <Column
        label="Logins"
        dataKey="logins"
        width={120}
        cellRenderer={renderLoginsCell}
      />
    </Table>
  );
}
```

Keep the `dataKey` values in sync with the object shape returned by `rowGetter()`.

### Type incremental loading with `InfiniteLoader`

`InfiniteLoader` is a practical place to derive request ranges from the declaration package instead of duplicating `{ startIndex, stopIndex }` shapes by hand.

```tsx
import { type ComponentProps } from "react";
import { InfiniteLoader, List } from "react-virtualized";

type TodoRow = {
  id: string;
  title: string;
};

type LoadMoreRowsArgs = Parameters<
  NonNullable<ComponentProps<typeof InfiniteLoader>["loadMoreRows"]>
>[0];

type IsRowLoadedArgs = Parameters<
  NonNullable<ComponentProps<typeof InfiniteLoader>["isRowLoaded"]>
>[0];

type ListRowRendererProps = Parameters<
  NonNullable<ComponentProps<typeof List>["rowRenderer"]>
>[0];

type RemoteListProps = {
  rowCount: number;
  rows: TodoRow[];
  loadRange: (startIndex: number, stopIndex: number) => Promise<void>;
};

export function RemoteTodoList({ rowCount, rows, loadRange }: RemoteListProps) {
  function isRowLoaded({ index }: IsRowLoadedArgs) {
    return index < rows.length;
  }

  async function loadMoreRows({ startIndex, stopIndex }: LoadMoreRowsArgs) {
    await loadRange(startIndex, stopIndex);
  }

  function rowRenderer({ index, key, style }: ListRowRendererProps) {
    const row = rows[index];

    return (
      <div key={key} style={style}>
        {row ? row.title : "Loading..."}
      </div>
    );
  }

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreRows}
      rowCount={rowCount}
    >
      {({ onRowsRendered, registerChild }) => (
        <List
          ref={registerChild}
          height={400}
          width={720}
          rowCount={rowCount}
          rowHeight={48}
          onRowsRendered={onRowsRendered}
          rowRenderer={rowRenderer}
        />
      )}
    </InfiniteLoader>
  );
}
```

### Measure dynamic row heights with `CellMeasurer`

For variable-height content, pair `CellMeasurer` with `CellMeasurerCache` and pass the cache back into `List`.

```tsx
import { type ComponentProps } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
} from "react-virtualized";

type ArticleRow = {
  id: string;
  title: string;
  summary: string;
};

type ListRowRendererProps = Parameters<
  NonNullable<ComponentProps<typeof List>["rowRenderer"]>
>[0];

const cache = new CellMeasurerCache({
  defaultHeight: 80,
  fixedWidth: true,
});

export function ArticleList({ rows }: { rows: ArticleRow[] }) {
  function rowRenderer({ index, key, parent, style }: ListRowRendererProps) {
    const row = rows[index];

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div style={style}>
          <h3>{row.title}</h3>
          <p>{row.summary}</p>
        </div>
      </CellMeasurer>
    );
  }

  return (
    <div style={{ height: 480 }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            deferredMeasurementCache={cache}
            height={height}
            rowCount={rows.length}
            rowHeight={cache.rowHeight}
            rowRenderer={rowRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    </div>
  );
}
```

## Common Pitfalls

- Install `react-virtualized` separately; `@types/react-virtualized` does not include runtime JavaScript.
- Import components from `react-virtualized`, not from `@types/react-virtualized`.
- Give `AutoSizer` a parent element with a non-zero size or it will pass unusable dimensions.
- Pass concrete numeric `height`, `width`, `rowCount`, and row sizing values into `List` and `Table`.
- Keep JSX and DOM libraries enabled in browser projects so React element and style types resolve normally.
- Reuse a `CellMeasurerCache` instance instead of recreating it during each render.

## Official Sources

- https://www.npmjs.com/package/@types/react-virtualized
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-virtualized
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-virtualized/index.d.ts
- https://www.npmjs.com/package/react-virtualized
- https://github.com/bvaughn/react-virtualized
- https://github.com/bvaughn/react-virtualized/blob/master/docs/README.md
