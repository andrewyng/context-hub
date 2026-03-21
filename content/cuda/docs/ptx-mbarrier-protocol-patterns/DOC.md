---
name: ptx-mbarrier-protocol-patterns
description: "PTX mbarrier protocol patterns: arrive/test_wait/arrive_drop flows, async-copy integration, and phase-safety rules."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,ptx,mbarrier,arrive,test_wait,arrive_drop,cp.async,cp-async-mbarrier-arrive,cp.async.wait_group,cp.async.wait_all,async-proxy,phase,completion-protocol,producer-consumer"
---

# PTX mbarrier Protocol Patterns

Use this page for robust phase-based synchronization protocols around async copy/compute pipelines.

## Core Operations

- Producer-side phase signal: `mbarrier.arrive`
- Participant drop from future phases: `mbarrier.arrive_drop`
- Consumer-side wait/poll: `mbarrier.test_wait` / `mbarrier.try_wait`
- Async-copy completion bridge: `cp.async.mbarrier.arrive`

## Protocol Template

1. Initialize barrier state and participant expectations.
2. Issue producer operations (for example async copy).
3. Signal completion with appropriate arrive semantics.
4. Wait on consumer side before data use.
5. Advance phases safely and apply `arrive_drop` when participation changes.

## Phase Safety Rules

- Keep producer and consumer on the same phase contract.
- Respect no-complete restrictions for `.noComplete` variants.
- Use sink `_` rules correctly for remote cluster-only flows.
- Avoid mixing unrelated work into the same mbarrier protocol.

## Common Failure Modes

- Deadlock from mismatched participant counts.
- Premature consumer reads due to missing wait checks.
- Undefined behavior by allowing `.noComplete` variant to complete a phase.

## Related Topics

- PTX data-movement async references: `../ptx/instructions/data-movement/references/cp-async.md`
- PTX TMA instructions: `../ptx/instructions/tma/DOC.md`
- PTX synchronization instructions: `../ptx/instructions/sync-comm/DOC.md`

## Official Source Links (Fact Check)

- PTX mbarrier instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- PTX cp.async.mbarrier.arrive: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-cp-async-mbarrier-arrive
- PTX Asynchronous Operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-20
