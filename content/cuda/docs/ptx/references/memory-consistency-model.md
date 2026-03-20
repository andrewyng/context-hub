# Memory Consistency Model (9.2)
PTX consistency model is defined by “semantics + scope + proxy”. Asynchronous instructions are typically modeled as weak memory operations.

## Core Concepts

- Semantics: `relaxed`, `acquire`, `release`, etc.
- Scope: `cta`, `cluster`, `gpu`, `sys`
- Proxies: generic proxy / async proxy, etc.

## Focus for Asynchronous Paths

- `cp.async` and `cp.async.bulk` belong to asynchronous copy paths.
- The documentation states that there is no ordering guarantee between `cp.async` operations unless you explicitly synchronize.
- After `cp.async.bulk` / `cp.reduce.async.bulk` completes, an implicit generic-async proxy fence is applied (see the section notes).
- `mbarrier complete-tx` has `.release` at `.cluster` scope semantics in the corresponding description.

## Practical Recommendations

- Establish the relationship between “transfer completion” and “visibility to consumers” using the specified mechanisms.
- When mixing `atom`/`fence`/`mbarrier`, draw the happens-before relationships before writing code.

## Official Source Links (Fact Check)

- Memory Consistency Model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model
- Scope and applicability: https://docs.nvidia.com/cuda/parallel-thread-execution/#scope-and-applicability-of-the-model
- Parallel sync instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions
- Async operations and ordering notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19
