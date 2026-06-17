---
name: metal-transpose-and-layout-reorder-patterns
description: "Apple Metal transpose and layout reorder patterns: tile-based remapping, threadgroup staging, edge handling, and correctness checks for data-layout kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,transpose,layout,reorder,permute,tile,threadgroup,data-layout,memory-access,compute"
---

# Metal Transpose And Layout Reorder Patterns

Use this page when implementing tensor transpose, matrix transpose, channel reordering, or other layout-conversion kernels in Metal.

## Why These Kernels Are Tricky

Transpose and reorder kernels usually do little arithmetic.

The real problems are:

- read and write coordinates change together
- memory access patterns become strided or permuted
- edge tiles are easy to mishandle
- a kernel that is logically correct can still perform badly because writes lose locality

## Safe Baseline Pattern

- start with a direct coordinate remap kernel
- make source and destination indexing explicit
- verify shape and stride assumptions on tiny non-square inputs
- only then introduce tile-based threadgroup staging

This is more reliable than optimizing the access pattern before the permutation logic is stable.

## When Tiling Helps

Threadgroup staging is useful when:

- neighboring threads read a coherent input tile
- the output layout would otherwise produce highly strided access
- the tile shape can be matched cleanly to the dispatch geometry

The common structure is:

1. load an input tile
2. synchronize the threadgroup
3. write the transposed or reordered tile

## What To Verify

- source index math matches the original logical shape
- destination index math matches the new logical shape
- non-square shapes and partial edge tiles are handled explicitly
- host-side output allocation matches the reordered logical dimensions

## Common Failure Modes

- the kernel is tested only on square shapes where row/column mistakes cancel out
- edge tiles read or write out of range
- transpose logic is correct but the wrapper still interprets output with the old layout
- a threadgroup tile is introduced without updating bounds checks for the staged region

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Calculating threadgroup and grid sizes: https://developer.apple.com/documentation/metal/calculating-threadgroup-and-grid-sizes
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
