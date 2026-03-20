# PTX 指令专题：cp.async.wait_group / cp.async.wait_all

`cp.async.wait_group` / `cp.async.wait_all` 用于等待 `cp.async` 组完成。

## 官方语法

```ptx
cp.async.wait_group N;
cp.async.wait_all;
```

## 关键语义

- `wait_group N`：等待直到最近的 pending 组不超过 N，且更早组全部完成。
- 当 `N=0` 时，等待此前所有 cp.async 组完成。
- 文档明确：该等待仅对 `cp.async` 完成有效，不保证其他内存操作的顺序/可见性。

## 使用建议

- 在消费 shared 目的数据前先执行等待。
- 不要把它当作通用 fence；仅用于 `cp.async` 完成语义。

## 官方来源链接（事实核验）

- cp.async.wait_group / wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

最后核对日期：2026-03-19
