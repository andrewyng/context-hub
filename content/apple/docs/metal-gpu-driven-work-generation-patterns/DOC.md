---
name: metal-gpu-driven-work-generation-patterns
description: "Apple Metal GPU-driven work generation patterns: indirect command buffers, indirect arguments, residency, and when GPU-generated work reduces CPU round trips."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,gpu-driven,indirect-command-buffer,indirect-dispatch,argument-buffers,work-generation,submission,compute"
---

# Metal GPU-Driven Work Generation Patterns

Use this page when the GPU can determine later work more efficiently than round-tripping those decisions through the CPU.

## When This Pattern Helps

GPU-driven work generation matters when:

- one pass decides which later tasks are necessary
- the CPU does not need to inspect intermediate results
- repeated CPU readback and resubmission would stall the pipeline

This pattern is common in visibility-driven rendering, indirect work compaction, and resource-table-driven pipelines.

## What To Reach For

The relevant Metal building blocks are:

- indirect command buffers for reusable or GPU-generated command streams
- indirect argument patterns when draw or dispatch parameters are produced later
- argument buffers when resource tables are reached indirectly

The goal is to eliminate unnecessary CPU-GPU round trips, not to make every workload indirect by default.

## Good Usage Pattern

1. keep the producer pass entirely on the GPU
2. write indirect arguments or command state into GPU-visible memory
3. make indirectly referenced resources resident
4. execute the generated work in a later pass without CPU inspection

## Common Failure Modes

- the CPU still waits on generated results, defeating the point of the indirect path
- indirect resources are not marked resident
- indirect execution is introduced for trivial workloads where direct encoding was cheaper
- the generated work format is hard to validate, so correctness debugging becomes opaque

## Review Checklist

- Does the CPU truly need to read the intermediate decision data?
- Is the generated work reused enough to justify the setup cost?
- Are residency and synchronization rules explicit?
- Can the indirect path be validated against a direct baseline?

## Official Source Links (Fact Check)

- Encoding indirect command buffers on the CPU: https://developer.apple.com/documentation/metal/encoding-indirect-command-buffers-on-the-cpu
- Encoding indirect command buffers on the GPU: https://developer.apple.com/documentation/metal/encoding-indirect-command-buffers-on-the-gpu
- Indirect buffers best practices: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/IndirectBuffers.html
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes

Last cross-check date: 2026-03-21
