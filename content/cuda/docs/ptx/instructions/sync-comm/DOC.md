---
name: ptx-sync-comm-instructions
description: "PTX synchronization and communication instructions with scope-aware usage in ISA 9.2."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,synchronization,mbarrier,barrier"
---

# PTX Synchronization and Communication

This page covers core synchronization and communication primitives such as `barrier`, `mbarrier`, `atom`, `red`, and `fence`.

## Official Semantics Excerpts (Key Points)

- PTX documentation notes: asynchronous copy completion can be tracked via async-group or mbarrier mechanisms.
- For `cp.async`, if you do not use `wait_group/wait_all` or an mbarrier, the synchronization relationship does not hold.
- `cp.async.bulk`-related `complete-tx` operations on mbarrier provide `.release` and `.cluster` semantics (see the section definitions).

## Common Patterns

```ptx
// Initiate the async transfer first, then observe completion via mbarrier.
cp.async.bulk.shared::cta.global.mbarrier::complete_tx::bytes [dst], [src], size, [mbar];
// ...
mbarrier.test_wait.acquire.shared::cta.b64 p, [mbar], state;
```

## Usage Notes

- First determine the scope, then apply semantic modifiers (acquire/release/relaxed).
- Explicitly connect the producer completion point to the consumer-visible point.
- When using `atom` together with async copies, carefully review ordering relationships.

## Official Source Links (Fact Check)

- Parallel Synchronization and Communication Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- barrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-barrier
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19

## Single-instruction Topics

- `references/mbarrier-test-wait.md`
- `references/barrier.md`
- `references/atom.md`
- `references/membar-fence.md`
- `references/red.md`
- `references/elect-sync.md`
- `references/bar-sync.md`
- `references/atom-cas.md`
- `references/vote-sync.md`
- `references/match-sync.md`
- `references/shfl-sync.md`
- `references/mbarrier-arrive.md`
- `references/redux-sync.md`
- `references/mbarrier-arrive-drop.md`
- `references/cp-async-mbarrier-arrive.md`
- `references/bar-warp-sync.md`
- `references/fence-proxy.md`
- `references/membar-proxy.md`
