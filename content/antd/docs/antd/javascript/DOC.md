---
name: antd
description: "Ant Design React UI library for app layout, forms, data display, feedback, theming, and localization"
metadata:
  languages: "javascript"
  versions: "6.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "antd,ant-design,react,ui,components,design-system"
---

# Ant Design JavaScript Package Guide

## What It Is

`antd` is a React component library for building application UIs with ready-made components such as forms, tables, modals, date pickers, navigation, and layout primitives.

Use it when you need:

- consistent form and validation patterns
- data-heavy UI such as tables, filters, and pagination
- built-in feedback components such as messages, notifications, and modals
- app-wide theming and localization through a single provider

## Install

Install the main package in your React app:

```bash
npm install antd@6.3.2
```

Add companion packages only when you use those features directly:

```bash
npm install @ant-design/icons
npm install dayjs
```

- `@ant-design/icons` provides the icon components used in buttons, menus, and inputs.
- `dayjs` is useful when you need to create or serialize values for `DatePicker` and related date components.

## Setup Model

There is no client initialization, authentication flow, or required environment variable.

The minimum setup is:

1. install `antd`
2. import `antd/dist/reset.css` once near your app entry point
3. render your app inside `ConfigProvider`
4. wrap the tree with `App` if you want context-aware `message`, `notification`, and `modal` APIs

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, ConfigProvider, Button, Space } from 'antd';
import 'antd/dist/reset.css';

function Home() {
  return (
    <Space direction="vertical">
      <Button type="primary">Save</Button>
      <Button>Cancel</Button>
    </Space>
  );
}

const root = createRoot(document.getElementById('root'));

root.render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
      },
    }}
  >
    <App>
      <Home />
    </App>
  </ConfigProvider>
);
```

Import components from the root `antd` package rather than deep internal paths.

## Common Workflows

### Build a validated form

Use `Form` with `rules` for field validation and `onFinish` for successful submission.

```javascript
import React from 'react';
import { App, Button, Form, Input } from 'antd';

export default function ProfileForm() {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    console.log('submit payload', values);
    message.success('Profile saved');
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ name: 'Ada Lovelace' }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Enter a name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Enter an email address' },
          { type: 'email', message: 'Enter a valid email address' },
        ]}
      >
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
}
```

`rules` run inside the form system, so keep API-side validation separate and show server errors explicitly when the request fails.

### Show feedback with `App.useApp()`

Wrap the app in `<App>` once, then use `App.useApp()` inside components that need `message`, `notification`, or `modal`.

```javascript
import React from 'react';
import { App, Button } from 'antd';

export default function DeleteButton() {
  const { message, modal, notification } = App.useApp();

  const confirmDelete = () => {
    modal.confirm({
      title: 'Delete record?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        message.loading({ content: 'Deleting...', key: 'delete' });
        await Promise.resolve();
        message.success({ content: 'Deleted', key: 'delete' });
        notification.success({
          message: 'Record removed',
          description: 'The table can now be refreshed.',
        });
      },
    });
  };

  return (
    <Button danger onClick={confirmDelete}>
      Delete
    </Button>
  );
}
```

Use the hook-based API when your feedback components should inherit the current theme, locale, and provider context.

### Render tables with stable row keys

Pass `columns`, `dataSource`, and a stable `rowKey`. Use `render` only when a plain `dataIndex` is not enough.

```javascript
import React from 'react';
import { Space, Table, Tag } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>
    ),
  },
  {
    title: 'Owner',
    key: 'owner',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <span>{record.owner.name}</span>
        <span>{record.owner.email}</span>
      </Space>
    ),
  },
];

const dataSource = [
  {
    id: 'proj_1',
    name: 'Website refresh',
    status: 'active',
    owner: { name: 'Ada', email: 'ada@example.com' },
  },
  {
    id: 'proj_2',
    name: 'Billing migration',
    status: 'paused',
    owner: { name: 'Grace', email: 'grace@example.com' },
  },
];

export default function ProjectTable() {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      pagination={{ pageSize: 10 }}
    />
  );
}
```

Do not rely on array indexes as implicit keys when the dataset can be sorted, filtered, or refreshed from the server.

### Work with date values using Day.js

Date-related components work with Day.js values. Convert them before sending data to an API.

```javascript
import React from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Form } from 'antd';

export default function LaunchForm() {
  const onFinish = (values) => {
    const payload = {
      ...values,
      launchDate: values.launchDate
        ? values.launchDate.format('YYYY-MM-DD')
        : null,
    };

    console.log(payload);
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ launchDate: dayjs('2026-03-13', 'YYYY-MM-DD') }}
    >
      <Form.Item label="Launch date" name="launchDate">
        <DatePicker />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Schedule
      </Button>
    </Form>
  );
}
```

If your API expects ISO strings or timestamps, serialize the Day.js object in `onFinish` instead of posting it directly.

### Customize the app theme

Use `ConfigProvider` to define global design tokens once.

```javascript
import React from 'react';
import { ConfigProvider, Button, Space } from 'antd';

export default function ThemedApp() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0057b8',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Button: {
            controlHeight: 38,
          },
        },
      }}
    >
      <Space>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
      </Space>
    </ConfigProvider>
  );
}
```

Keep shared design tokens in one provider near the root instead of repeating style overrides per component.

## Localization

Set the Ant Design locale through `ConfigProvider`. When you localize date components, also set the matching Day.js locale in your app.

```javascript
import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import { ConfigProvider, DatePicker } from 'antd';

dayjs.locale('zh-cn');

export default function LocalizedDatePicker() {
  return (
    <ConfigProvider locale={locale}>
      <DatePicker />
    </ConfigProvider>
  );
}
```

Setting only the Ant Design locale is not enough for all date formatting cases; keep the Day.js locale aligned with the UI locale.

## Next.js and SSR

Ant Design uses CSS-in-JS for component styles. In SSR frameworks, use the maintainer SSR integration pattern instead of relying only on client-side style injection.

For Next.js App Router, the maintainer docs provide `@ant-design/nextjs-registry`:

```bash
npm install @ant-design/nextjs-registry
```

```javascript
import { AntdRegistry } from '@ant-design/nextjs-registry';
import 'antd/dist/reset.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
```

Use the official SSR guide for other renderers so styles are extracted on the server and hydration does not produce missing or duplicated styles.

## Important Pitfalls

- Import `antd/dist/reset.css` once. Re-importing it in multiple feature files makes styling harder to reason about.
- `DatePicker`, `RangePicker`, and related controls work with Day.js values, not plain `Date` objects or raw strings.
- Icons are not bundled into `antd`; import them from `@ant-design/icons`.
- Wrap the tree with `<App>` before calling `App.useApp()`.
- Give `Table` a stable `rowKey` whenever records come from an API.
- For SSR and Next.js, follow the official CSS-in-JS integration docs instead of treating Ant Design like a CSS-only component library.
