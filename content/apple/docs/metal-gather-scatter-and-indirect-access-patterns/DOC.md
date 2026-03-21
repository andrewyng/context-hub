---
name: metal-gather-scatter-and-indirect-access-patterns
description: "Apple Metal gather, scatter, and indirect access patterns: index-buffer workflows, resource tables, irregular memory traffic, and correctness-first design."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,gather,scatter,indirect-access,indexing,argument-buffers,resource-table,irregular-memory,compute"
---

# Metal Gather, Scatter, And Indirect Access Patterns

Use this page when a Metal kernel reads or writes through index arrays, indirection tables, or argument-buffer-backed resource tables.

## Why Indirect Access Is Different

Indirect kernels usually lose the regular memory behavior that makes dense kernels easy to optimize.

Typical examples include:

- gather from a source buffer using an index list
- scatter updates to output positions selected at runtime
- table-driven resource access through argument buffers
- sparse or graph-like traversal patterns

## Good Baseline Strategy

- first prove that index validity and output ownership are correct
- separate gather-only cases from scatter-with-conflicts cases
- keep the resource table or indirection structure explicit in host code
- add performance tuning only after bounds and ownership rules are stable

## Gather Versus Scatter

Gather is usually easier:

- each thread reads from an indirect source location
- writes go to a predictable output slot

Scatter is riskier:

- many threads may target the same destination
- update ordering may matter
- atomics or staged conflict-resolution may be required

## Resource-Table Cases

If the kernel reaches resources indirectly through argument buffers:

- keep the table layout stable
- make all indirectly referenced resources resident
- verify that the host and shader agree on table indexing

## Common Failure Modes

- the index buffer contains out-of-range values and validation is too weak to catch them
- a scatter kernel assumes one-writer ownership when the workload has write conflicts
- the host rebuilds a resource table but the dispatch still uses stale bindings
- indirect access is tuned for speed before correctness on duplicate indices is understood

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Improving CPU performance by using argument buffers: https://developer.apple.com/documentation/metal/improving-cpu-performance-by-using-argument-buffers
- Encoding indirect command buffers on the GPU: https://developer.apple.com/documentation/metal/encoding-indirect-command-buffers-on-the-gpu
- Metal shader converter: https://developer.apple.com/metal/shader-converter/

Last cross-check date: 2026-03-21
