---
name: ptx-data-movement-instructions
description: "PTX data movement instructions, addressing rules, and cache-related modifiers in ISA 9.2."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,load,store,memory"
---

# PTX Data Movement

本页覆盖同步和异步数据搬运，包括 `ld/st` 与 `cp.async` 系列。

## 官方语法摘录（关键）

```ptx
cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
cp.async.commit_group;
cp.async.wait_group N;
cp.async.wait_all;
```

## 官方语义要点

- `cp.async` 为 non-blocking，`src` 在 `.global`，`dst` 在 `.shared`。
- `src-size < cp-size` 时，目的剩余字节会被 zero-fill。
- 未显式同步时，不同 `cp.async` 之间无完成顺序保证。

## 最小使用模式

```ptx
cp.async.ca.shared.global [smem_ptr], [gmem_ptr], 16;
cp.async.commit_group;
cp.async.wait_group 0;
```

## 约束与坑点

- `src-size > cp-size` 为未定义行为。
- 不能用普通 barrier/fence 替代 `cp.async` 完成等待机制。
- cache hint/prefetch 仅在支持变体下可用。

## 官方来源链接（事实核验）

- Data Movement and Conversion Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions
- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- cp.async.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-commit-group
- cp.async.wait_group/wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld

最后核对日期：2026-03-19

## 单指令专题

- `references/cp-async.md`
- `references/cp-async-bulk.md`
- `references/ld.md`
- `references/st.md`
- `references/cp-async-wait-group.md`
- `references/prefetch.md`
- `references/cvta.md`
- `references/mov.md`
- `references/cvt.md`
- `references/ld-global-nc.md`
- `references/st-async.md`
- `references/st-bulk.md`
- `references/cvt-pack.md`
- `references/ldu.md`
