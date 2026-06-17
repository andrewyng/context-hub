---
name: metal-threadgroup-sizing-playbook
description: "Apple Metal threadgroup sizing playbook: dispatch geometry, pipeline limits, locality tradeoffs, and measurement-first tuning."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,threadgroup,threadsperthreadgroup,dispatchthreads,threadexecutionwidth,maxTotalThreadsPerThreadgroup,occupancy,tiling"
---

# Metal Threadgroup Sizing Playbook

Use this page when a Metal kernel is correct but performance or scaling depends heavily on threadgroup shape.

## The Two Inputs You Must Balance

Threadgroup sizing is driven by both:

- algorithm locality
- hardware and pipeline execution limits

Apple exposes pipeline and device properties that matter here, including:

- `threadExecutionWidth`
- `maxTotalThreadsPerThreadgroup`

These should guide threadgroup sizing instead of hard-coded folklore.

## Baseline Strategy

1. Start with a simple threadgroup shape that maps naturally to the data layout.
2. Confirm correctness and bounds handling.
3. Read pipeline limits.
4. Sweep a small set of candidate threadgroup shapes.
5. Keep the best measured configuration for the target kernel family.

## What Shapes Tend To Work Well

- 1D kernels: choose widths that align naturally with the pipeline execution width
- 2D tiled kernels: make threadgroup shape match tile layout and local reuse pattern
- threadgroup-memory kernels: size the group jointly with threadgroup memory footprint

The right shape is kernel-specific. Reuse only after measurement.

## Constraints To Respect

- total threads in a threadgroup must not exceed pipeline/device limits
- threadgroup memory usage scales with group shape
- larger groups can reduce scheduling flexibility or increase local-memory pressure

## Common Failure Modes

- one universal threadgroup size is applied to every kernel
- threadgroup size is chosen without checking `threadExecutionWidth`
- size is increased for throughput, but threadgroup memory footprint becomes the real bottleneck
- 2D kernels use a shape that is convenient for indexing but poor for locality

## Tuning Order

1. make indexing and bounds logic correct
2. pick a shape consistent with data layout
3. check `threadExecutionWidth` and `maxTotalThreadsPerThreadgroup`
4. benchmark a small grid of candidate shapes
5. keep the chosen size documented in the wrapper or kernel-selection logic

## Official Source Links (Fact Check)

- `threadExecutionWidth`: https://developer.apple.com/documentation/metal/mtlcomputepipelinestate/threadexecutionwidth
- `maxTotalThreadsPerThreadgroup`: https://developer.apple.com/documentation/metal/mtlcomputepipelinestate/maxtotalthreadsperthreadgroup
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu

Last cross-check date: 2026-03-21
