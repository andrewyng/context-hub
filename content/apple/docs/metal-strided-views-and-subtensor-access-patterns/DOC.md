---
name: metal-strided-views-and-subtensor-access-patterns
description: "Apple Metal strided-view and subtensor access patterns: offset math, slice validity, and when to materialize a contiguous copy instead of using irregular strides."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,strided-view,subtensor,slice,offset-math,noncontiguous,layout,compute"
---

# Metal Strided Views And Subtensor Access Patterns

Use this page when a Metal kernel consumes a non-contiguous tensor view, a slice, or a subtensor defined by base offsets and strides.

## The Main Question

Should the kernel operate directly on the strided view, or should the wrapper materialize a contiguous copy first?

Direct strided access is attractive because it avoids a copy, but it can:

- complicate index math
- reduce memory locality
- make vectorization harder
- hide subtle shape or offset bugs

## Safe Decision Process

- start by proving the strided index math on tiny cases
- check whether the access pattern becomes highly irregular
- if the view is reused many times, consider packing once into a contiguous buffer
- choose the simpler path unless the copy cost is clearly the bottleneck

## What To Verify

- base offset is correct for the chosen slice
- each dimension's stride matches the view contract
- the logical shape of the view is passed separately from underlying storage size
- out-of-range elements are impossible under the view definition

## Common Failure Modes

- one dimension's stride is interpreted in bytes on one side and elements on the other
- the view shape is correct but the base offset is wrong
- a direct strided kernel is kept even though repeated reuse made a packed copy cheaper
- a contiguous fast path and strided slow path diverge semantically

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
