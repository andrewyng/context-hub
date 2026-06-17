---
name: metal-prefix-scan-patterns
description: "Apple Metal prefix scan patterns: inclusive or exclusive scan structure, threadgroup staging, multi-pass composition, and validation strategy."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,prefix-scan,scan,exclusive-scan,inclusive-scan,parallel-prefix,threadgroup,compute,multi-pass"
---

# Metal Prefix Scan Patterns

Use this page when implementing prefix sum or scan-style kernels in Metal.

## What Makes Scan Different

A scan is not just a reduction.

It preserves a prefix value for every element, which means:

- local threadgroup work is only one stage of the algorithm
- large arrays usually require multiple passes
- correctness depends on both local scan logic and inter-block carry propagation

## Safe Decomposition

A practical structure is:

1. scan data within each threadgroup
2. write one block total per threadgroup
3. scan the block totals
4. add scanned block offsets back to the per-element outputs

This keeps local and global logic separate.

## Validation Strategy

- test inclusive and exclusive semantics separately
- test sizes smaller than one threadgroup and much larger than one threadgroup
- test non-power-of-two sizes
- compare against a simple CPU scan on tiny arrays

Scan bugs often hide until odd lengths or multi-block carry propagation is exercised.

## Performance Notes

- threadgroup memory is usually the first optimization tool
- dispatch geometry and block size must match the carry propagation logic
- a fast local scan is not enough if global offset propagation is poorly structured

## Common Failure Modes

- exclusive and inclusive semantics are mixed
- block totals are written correctly but not added back correctly
- logic assumes power-of-two sizes everywhere
- scan is treated as a one-pass problem on arrays that require hierarchical composition

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
