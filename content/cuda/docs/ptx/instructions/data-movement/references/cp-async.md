# PTX Instruction Note: cp.async

`cp.async` is a non-blocking async copy instruction from `.global` to `.shared`, and requires explicit waiting via group or mbarrier mechanisms.

## Official Syntax (Excerpt)

```ptx
cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
cp.async.cg.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
```

## Key Semantics

- The instruction is non-blocking; the issuing thread continues execution.
- `src` must be in global memory and `dst` must be in shared memory.
- If optional `src-size` is smaller than `cp-size`, remaining `dst` bytes are zero-filled.
- `src-size > cp-size` is undefined behavior.

## Completion and Visibility

- Without explicit synchronization, ordering between `cp.async` operations is not guaranteed.
- Completion can be tracked through:
  - `cp.async.commit_group` + `cp.async.wait_group` / `cp.async.wait_all`
  - `cp.async.mbarrier.arrive` + `mbarrier.test_wait/try_wait`

## Minimal Pattern

```ptx
cp.async.ca.shared.global [smem_ptr], [gmem_ptr], 16;
cp.async.commit_group;
cp.async.wait_group 0;
```

## Official Source Links (fact check)

- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- cp.async.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-commit-group
- cp.async.wait_group / wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last verified date: 2026-03-19
