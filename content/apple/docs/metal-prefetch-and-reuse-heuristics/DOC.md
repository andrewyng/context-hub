---
name: metal-prefetch-and-reuse-heuristics
description: "Apple Metal prefetch and reuse heuristics: when staged loads help, how to reason about locality, and how to avoid overcomplicating memory traffic."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,prefetch,reuse,locality,threadgroup-memory,memory-traffic,heuristics,compute"
---

# Metal Prefetch And Reuse Heuristics

Use this page when deciding whether a Metal kernel should explicitly stage data into `threadgroup` memory or continue reading directly from device memory.

## The Main Question

Will staging actually increase reuse, or just add barriers and complexity?

Prefetch-like staging helps only when:

- several nearby threads reuse the same source region
- the staged footprint fits the threadgroup plan
- the extra synchronization cost is lower than the saved memory traffic

## Good Heuristic

Prefer explicit staging when all of the following are true:

- the same source values are consumed repeatedly by nearby threads
- access is regular enough to load cooperatively
- the kernel already has a natural threadgroup structure

Prefer direct loads when:

- reuse is weak or highly irregular
- the staged region would need complex halo logic
- the kernel is small and synchronization would dominate

## What To Verify

- the staged tile is consumed enough times to justify the load
- barriers are placed only around the actual reuse window
- edge or halo handling does not erase the benefit
- the staged working set does not make threadgroup sizing worse

## Common Failure Modes

- prefetch logic is added to a kernel with little real reuse
- threadgroup staging improves one synthetic benchmark but hurts realistic edge cases
- staged regions are larger than needed, increasing pressure without clear gain
- reuse assumptions are copied from CUDA-style kernels without checking Metal-specific dispatch costs

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
