# Advanced Widget Usage

## Batch Operations

```javascript
const widgets = await client.widgets.createMany([
  { name: 'Widget A' },
  { name: 'Widget B' },
]);
```

## Error Handling

```javascript
try {
  await client.widgets.create({ name: '' });
} catch (err) {
  console.error(err.code, err.message);
}
```
