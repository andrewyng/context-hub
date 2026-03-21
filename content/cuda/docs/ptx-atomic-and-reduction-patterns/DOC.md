---
name: ptx-atomic-and-reduction-patterns
description: "PTX atomic and reduction patterns: atom/cas/red/redux usage, scope/semantic choices, and lock-free update templates."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,ptx,atomics,reduction,atom,atom.cas,compare-and-swap,cas,cas-loop,red,redux,scope,acquire,release,lock-free,lockfree"
---

# PTX Atomic and Reduction Patterns

Use this page when designing concurrent PTX update paths with explicit scope and memory semantics.

## Instruction Families

- Atomic RMW: `atom.*`
- Compare-and-swap: `atom.cas`
- Reduction-update: `red.*`
- Warp/group reduction helper: `redux.sync`

## Scope and Semantics First

Correctness depends on selecting:

- target state space (shared/global/cluster forms as supported)
- scope (`cta`, `cluster`, `gpu`, `sys` as applicable)
- semantics (relaxed/acquire/release/acq_rel where available)

A wrong scope can appear correct in tests but fail under real concurrency.

## Canonical Patterns

- Lock-free queue/head update:
  CAS loop with explicit acquire/release semantics.
- Aggregation path:
  `red.*` for one-way accumulation where return value is not required.
- Predicate-guided lane aggregation:
  warp-level reduction then fewer global atomics.

## Failure Modes

- Missing acquire/release pairing between producer and consumer.
- Overly wide scope adds contention and latency.
- Excessive global atomics with no local aggregation stage.

## Verification Checklist

- Stress under high contention and varied scheduling.
- Validate determinism policy (if required) separately from correctness.
- Profile contention hotspots and retry-loop pressure.

## Related Topics

- PTX synchronization instructions: `../ptx/instructions/sync-comm/DOC.md`
- PTX memory consistency model: `../ptx/references/memory-consistency-model.md`
- PTX warp synchronization patterns: `../ptx-warp-synchronization-patterns/DOC.md`

## Official Source Links (Fact Check)

- PTX atom instruction family: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- PTX red instruction family: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-red
- PTX redux.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-redux-sync
- PTX Memory Consistency Model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-20
