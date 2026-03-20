# PTX 指令专题：cp.async

`cp.async` 是从 `.global` 到 `.shared` 的非阻塞异步拷贝指令，需配合 group 或 mbarrier 机制显式等待。

## 官方语法（节选）

```ptx
cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
cp.async.cg.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
```

## 关键语义

- 指令为 non-blocking，发起后线程继续执行。
- `src` 必须在 global，`dst` 必须在 shared。
- 可选 `src-size` 小于 `cp-size` 时，`dst` 剩余字节会被 zero-fill。
- `src-size > cp-size` 为 undefined behavior。

## 完成与可见性

- 文档明确：未显式同步时，两个 `cp.async` 之间无顺序保证。
- 可通过以下机制追踪完成：
  - `cp.async.commit_group` + `cp.async.wait_group` / `cp.async.wait_all`
  - `cp.async.mbarrier.arrive` + `mbarrier.test_wait/try_wait`

## 最小模式

```ptx
cp.async.ca.shared.global [smem_ptr], [gmem_ptr], 16;
cp.async.commit_group;
cp.async.wait_group 0;
```

## 官方来源链接（事实核验）

- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- cp.async.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-commit-group
- cp.async.wait_group / wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

最后核对日期：2026-03-19
