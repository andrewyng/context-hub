---
name: metal-performance-tuning
description: "Apple Metal performance tuning: dispatch sizing, pipeline reuse, synchronization costs, and profiling-first optimization."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,performance,profiling,dispatchthreads,threadsperthreadgroup,command-buffer,pipeline-state,managed-resource,instruments"
---

# Metal Performance Tuning

Use this page for practical optimization decisions on Metal compute workloads.

## Start With The Correct Bottleneck

For Metal kernels, performance problems usually come from one of these classes:

- dispatch sizing is poor
- memory access is inefficient
- CPU submission overhead is too high
- synchronization is too frequent
- pipeline creation or resource setup happens in hot paths

Measure first, then tune.

## High-Value Tuning Areas

### Dispatch Shape

- choose threadgroup sizes that match the kernel's locality pattern
- do not assume one fixed threadgroup size is optimal for every kernel
- keep bounds-check overhead small by dispatching close to true workload extent

### Pipeline Reuse

- create `MTLComputePipelineState` objects once and reuse them
- avoid recompiling libraries or pipelines inside steady-state execution loops

### CPU/GPU Synchronization

- do not wait on command buffers unless the CPU truly needs the result immediately
- minimize synchronization points, especially on resource-sharing paths

### Managed Resources On macOS

Apple documents that managed resources on macOS require explicit synchronization between CPU and GPU views.

This matters especially on Intel Macs or external GPU workflows:

- synchronization has real cost
- extra sync points can damage throughput
- resource mode assumptions should be reviewed when code moves across Mac hardware configurations

## Tools That Matter

Apple's Metal developer tools are the primary source of truth for optimization work:

- Metal debugger in Xcode
- runtime validation
- performance counters
- Metal System Trace in Instruments

These tools are better than guessing from output values alone.

## Common Failure Modes

- Dispatch size is copied from another kernel with different memory behavior.
- Command buffers are committed and waited on too frequently.
- Pipeline compilation is left in a hot code path.
- Resource synchronization is correct but far more frequent than necessary.
- Kernel tuning changes are made without inspecting counters or traces.

## Tuning Order

1. Make the kernel correct.
2. Cache pipeline and resource setup.
3. Profile dispatch and memory behavior.
4. Reduce synchronization and submission overhead.
5. Revisit threadgroup sizing and data layout.

## Official Source Links (Fact Check)

- Metal developer tools: https://developer.apple.com/metal/tools/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Synchronizing a managed resource in macOS: https://developer.apple.com/documentation/metal/synchronizing-a-managed-resource-in-macos
- Metal overview: https://developer.apple.com/metal/

Last cross-check date: 2026-03-21
