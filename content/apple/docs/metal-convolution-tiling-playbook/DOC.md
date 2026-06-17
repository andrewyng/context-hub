---
name: metal-convolution-tiling-playbook
description: "Apple Metal convolution tiling playbook: halo regions, threadgroup staging, separable decomposition, and tile-size tradeoffs for filter kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,convolution,tiling,stencil,halo,threadgroup,image-filter,separable,compute"
---

# Metal Convolution Tiling Playbook

Use this page when a convolution or stencil kernel has moved past the naive baseline and needs a more structured tiling plan.

## What Tiling Adds

Compared with a direct neighborhood-read kernel, tiling tries to reuse nearby input data across threads in the same threadgroup.

For convolution-style kernels, this usually means:

- loading a tile of source data into `threadgroup` memory
- including halo elements around the core output region
- synchronizing before computation
- writing only the core output region

## The Halo Problem

The hardest part is rarely the multiply-accumulate loop itself.

The hard part is defining:

- which threads load the halo
- how the halo is clipped at image borders
- which staged region corresponds to each output pixel

If halo ownership is vague, the kernel is usually wrong at edges.

## Optimization Order

1. correct direct convolution baseline
2. explicit border policy
3. separable decomposition when mathematically valid
4. threadgroup tiling with halo handling
5. tile-size tuning only after correctness is stable

## Common Failure Modes

- the staged tile omits halo pixels needed by the filter radius
- border handling in the tiled kernel no longer matches the untiled reference
- tile size improves reuse but increases synchronization or threadgroup-memory cost too much
- dispatch geometry and output-core tile dimensions drift apart

## Review Checklist

- What filter radius determines halo width?
- Is the border policy identical between reference and optimized kernels?
- Does each output pixel read only staged data that was initialized?
- Is the separable path available, and is it actually mathematically valid for this filter?

## Official Source Links (Fact Check)

- Processing a texture in a compute function: https://developer.apple.com/documentation/metal/processing-a-texture-in-a-compute-function
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Implementing a multistage image filter using heaps and events: https://developer.apple.com/documentation/metal/implementing-a-multistage-image-filter-using-heaps-and-events
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
