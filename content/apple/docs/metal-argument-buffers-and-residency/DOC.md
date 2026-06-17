---
name: metal-argument-buffers-and-residency
description: "Apple Metal argument buffer patterns: encoding resource tables, residency requirements, and useResource or useHeap rules for compute workloads."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,argument-buffers,residency,useresource,useheap,resource-binding,indirect-access,compute,mtlargumentencoder"
---

# Metal Argument Buffers And Residency

Use this page when a Metal compute kernel needs many resources, indirect resource access, or lower CPU-side binding overhead.

## What Argument Buffers Solve

Argument buffers let you encode resource references into a buffer-backed table instead of rebinding many individual buffers or textures for every dispatch.

This is useful when:

- one kernel reads many buffers or textures
- the set of resources changes per dispatch
- the resource table is reused across many dispatches
- GPU-driven or indirection-heavy workflows need resource tables

## Core Host-Side Pattern

The usual structure is:

1. create an `MTLArgumentEncoder`
2. allocate a backing `MTLBuffer`
3. encode resource references into that buffer
4. bind the argument buffer to the kernel
5. make indirect resources resident before dispatch

The last step is the part people miss most often.

## Residency Rules Matter

If a kernel reaches resources through an argument buffer, those resources must be resident for the duration of the compute pass.

In practice this means:

- call `useResource(_:usage:)` for resources reached indirectly through an argument buffer
- call `useHeap(_:)` when residency is managed through a heap
- do this before the encoded dispatch that consumes those resources

If you bind a resource directly to a kernel argument, you do not need the extra residency call for that direct binding path.

## Good Usage Pattern

- keep the argument buffer layout stable across many dispatches
- separate "table rebuild" work from "per-dispatch scalar parameter" work
- prefer argument buffers when the binding count is the CPU bottleneck
- keep residency calls explicit and near the dispatch site

## Common Failure Modes

- a resource is encoded into the argument buffer but never made resident
- the argument buffer is updated but a stale resource table is still reused
- CPU-side code mutates resident resources during the compute pass
- argument buffers are introduced for tiny fixed-bind workloads that did not need them

## Review Checklist

- Does the kernel really access resources indirectly?
- Are all indirectly referenced buffers or textures marked resident?
- Is the argument buffer rebuilt only when the table actually changes?
- Is the performance goal CPU submission overhead rather than kernel ALU time?

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Improving CPU performance by using argument buffers: https://developer.apple.com/documentation/metal/improving-cpu-performance-by-using-argument-buffers
- `useResource(_:usage:)`: https://developer.apple.com/documentation/metal/mtlcomputecommandencoder/useresource%28_%3Ausage%3A%29
- Metal shader converter binding model and argument buffer notes: https://developer.apple.com/metal/shader-converter/

Last cross-check date: 2026-03-21
