---
name: metal-scatter-conflict-resolution-patterns
description: "Apple Metal scatter conflict-resolution patterns: ownership rules, atomics, staged merges, and validation for write-conflict-heavy kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,scatter,conflict-resolution,atomics,write-conflict,merge,indirect-access,compute"
---

# Metal Scatter Conflict-Resolution Patterns

Use this page when several threads may write to the same output location and a plain scatter kernel is no longer safe.

## Why Scatter Is Risky

Scatter kernels are not defined just by index math.

They also need a conflict policy:

- one-writer ownership
- atomic accumulation or update
- local staging followed by a merge
- deterministic winner selection if ordering matters

Without an explicit policy, the kernel is only accidentally correct.

## Safe Design Order

1. prove whether writes are unique or conflicting
2. choose the conflict policy
3. validate the policy on duplicate-heavy inputs
4. only then optimize for throughput

## Typical Strategies

- if writes are unique, keep the kernel simple and document the invariant
- if writes collide, use atomics or a staged merge path
- if ordering matters, define a deterministic winner rule instead of relying on timing

## Common Failure Modes

- scatter is treated like gather and duplicate destinations are ignored
- atomics are added, but the operation is still not semantically correct for the workload
- a staged merge path is introduced without validating duplicate-heavy cases
- tests contain mostly unique indices, so collisions are underrepresented

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Encoding indirect command buffers on the GPU: https://developer.apple.com/documentation/metal/encoding-indirect-command-buffers-on-the-gpu

Last cross-check date: 2026-03-21
