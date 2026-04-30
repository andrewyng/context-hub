---
name: metal-memory-pressure-checklist
description: "Apple Metal memory pressure checklist: storage modes, heap strategy, transient allocation reuse, and debugger-driven memory-footprint review."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,memory-pressure,memory-footprint,storage-mode,heaps,resource-options,purgeable,allocation,compute"
---

# Metal Memory Pressure Checklist

Use this page when a Metal compute path works functionally but consumes too much memory, thrashes transient allocations, or behaves poorly under tight budgets.

## First Questions To Ask

- are resources using the right storage mode?
- are temporary resources recreated instead of reused?
- should several transient resources live on a heap?
- is the app tracking memory footprint with Metal debugging tools, or guessing?

Memory pressure is usually a resource-lifecycle problem before it is a shader problem.

## Storage Mode Review

Review whether each buffer or texture should be:

- CPU-visible and updated frequently
- GPU-private after upload
- truly temporary and a candidate for heap-backed reuse

Using the wrong storage mode or usage flags can waste memory bandwidth and increase footprint.

## Heap Review

Heaps are useful when:

- many transient resources have predictable lifetimes
- temporary resources do not all need to exist simultaneously
- allocation churn is becoming visible in profiling or debugging

Do not introduce aliasing until the non-aliased pipeline is already correct and measurable.

## Practical Checklist

- reuse steady-state buffers and textures
- prefer GPU-private resources when the CPU never reads them
- group transient resources by lifetime and type
- inspect memory reports in Metal debugging tools instead of inferring from symptoms

## Common Failure Modes

- a hot path reallocates temporary buffers every iteration
- long-lived and short-lived resources are mixed into one unmanaged pool
- heap aliasing is introduced before synchronization boundaries are understood
- memory usage is judged only by process RSS instead of Metal resource inspection

## Official Source Links (Fact Check)

- Resource options best practices: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/ResourceOptions.html
- Resource heaps: https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/ResourceHeaps/ResourceHeaps.html
- Implementing a multistage image filter using heaps and events: https://developer.apple.com/documentation/metal/implementing-a-multistage-image-filter-using-heaps-and-events
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
