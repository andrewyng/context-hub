# H-Series (Hopper) Specialized Instructions and Mechanisms (Summary)

This document is intended for engineering use and organizes capabilities in the PTX documentation that can be classified as first introduced in the H-Series (`sm_90/sm_90a`) or strongly related to it.

## Key Takeaways

- Hopper introduced and systematized the **cluster + async proxy + mbarrier + TMA + WGMMA** capability combination.
- Many of these capabilities were later extended in the B-Series, so they should be understood as “**H debuted, later inherited**.”
- For code generation, prefer capability gating over only looking at architecture codenames.

## A. Core Capabilities Debuted in H and Inherited Later

### 1) WGMMA Asynchronous Matrix Multiply-Accumulate Path

- Representative instructions: `wgmma.mma_async`, `wgmma.fence`, `wgmma.commit_group`, `wgmma.wait_group`
- Typical meaning: a warpgroup-level asynchronous MMA protocol (initiate / commit / wait)

### 2) TMA / Tensor Asynchronous Copy Path

- Representative instruction: `cp.async.bulk.tensor`
- Related objects: `tensormap`, `prefetch.*.tensormap`
- Typical meaning: high-throughput tensor movement + dedicated completion mechanisms

### 3) mbarrier Completion-Tracking System

- Representative instructions: `mbarrier.arrive`, `mbarrier.arrive_drop`, `mbarrier.test_wait`, `mbarrier.try_wait`
- Related instruction: `cp.async.mbarrier.arrive`
- Typical meaning: explicitly ties asynchronous completion to visibility synchronization

### 4) Cluster and Cross-Proxy Synchronization Mechanisms

- Representative capabilities: `.cluster` scope, `fence.proxy.async`
- Typical meaning: ordering guarantees across paths for generic/async proxies

## B. Common “requires sm_90+” Signals on the H Path (Examples)

- Multiple `.cluster` scope instructions/modifiers are marked `requires sm_90 or higher`
- `.tensormap`-related paths are marked `requires sm_90 or higher`
- `fence.proxy.async` is marked `requires sm_90 or higher`
- Some bf16/bf16x2 and mixed-precision variants have explicit thresholds on the H path

## Engineering Implementation Suggestions

1. Break capabilities into feature flags (e.g., `has_wgmma`, `has_tma`, `has_mbarrier_cluster`, `has_proxy_async_fence`).
2. Do “capability detection -> instruction template selection” first, then perform kernel generation.
3. Reuse the same semantic checks for H and B, but apply different fallbacks based on `sm`.

## Official Source Links (Fact Check)

- PTX main document: https://docs.nvidia.com/cuda/parallel-thread-execution/
- WGMMA: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async
- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- mbarrier family: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- cp.async.mbarrier.arrive: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-cp-async-mbarrier-arrive
- membar/fence (including proxy semantics): https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-membar-fence
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations
- Target ISA notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes

Last cross-check date: 2026-03-19
