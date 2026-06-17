---
name: metal-convolution-and-stencil-patterns
description: "Apple Metal convolution and stencil kernel patterns: neighborhood loads, edge handling, temporary storage, and multi-pass image filtering structure."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,convolution,stencil,image-filter,neighborhood,texture,threadgroup,image-processing,gaussian-blur,compute"
---

# Metal Convolution And Stencil Patterns

Use this page when implementing image filters, local neighborhood operators, or stencil-style kernels in Metal.

## Typical Workloads

This pattern covers:

- box blur or Gaussian blur
- Sobel or edge filters
- local stencil updates on 2D grids
- any kernel where each output depends on nearby input elements

## Core Design Questions

Before tuning, decide:

- is the source better represented as a texture or a linear buffer?
- how are border pixels handled?
- is a one-pass kernel enough, or is a separable multi-pass filter better?
- does threadgroup staging reduce enough repeated neighborhood reads to be worth the complexity?

## Safe Baseline Pattern

- start with a correct kernel that loads neighbors directly
- make border handling explicit
- validate against a CPU reference on tiny inputs
- only then consider threadgroup staging or separable decomposition

This keeps correctness separate from optimization.

## Edge Handling Rules

Stencil kernels fail most often on boundaries.

Choose and document one border policy:

- clamp to edge
- zero pad
- mirror
- skip out-of-range contributions

Do not leave edge behavior implicit between host and kernel code.

## Optimization Path

For larger filters, common improvements are:

- separable two-pass decomposition where mathematically valid
- threadgroup staging for reused neighborhoods
- batching several filter passes while minimizing temporary resource churn

## Common Failure Modes

- border handling is inconsistent with the reference implementation
- staging layout is correct for interior tiles but wrong on halo regions
- texture versus buffer choice is made late and forces wrapper rewrites
- a multi-pass filter is encoded without a clean intermediate-resource plan

## Official Source Links (Fact Check)

- Processing a texture in a compute function: https://developer.apple.com/documentation/metal/processing-a-texture-in-a-compute-function
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Implementing a multistage image filter using heaps and events: https://developer.apple.com/documentation/metal/implementing-a-multistage-image-filter-using-heaps-and-events
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
