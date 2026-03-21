---
name: metal-persistent-objects-and-submission-overhead
description: "Apple Metal persistent object and submission-overhead guidance: reuse devices, queues, pipelines, resources, and minimize command-buffer churn."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,persistent-objects,command-buffer,command-queue,pipeline-reuse,submission-overhead,device,compute,performance"
---

# Metal Persistent Objects And Submission Overhead

Use this page when a Metal compute path is functionally correct but wastes time rebuilding objects or submitting work too granularly.

## The Main Rule

Create persistent Metal objects early and reuse them often.

For compute code, this usually means:

- one long-lived `MTLDevice` per GPU
- one long-lived `MTLCommandQueue` for the main compute path
- long-lived `MTLComputePipelineState` objects
- reusable buffers and textures when sizes are stable

Do not rebuild these objects in the hot dispatch loop unless the workload genuinely requires it.

## Where Submission Overhead Comes From

The most common CPU-side overhead sources are:

- too many tiny command buffers
- repeatedly rebuilding pipeline state
- creating short-lived resources every iteration
- rebinding or recomputing state that could be cached

The fix is usually structural, not a shader micro-optimization.

## Good Baseline Pattern

1. create device, queue, libraries, and pipelines at initialization
2. preallocate reusable resources for steady-state shapes
3. batch related compute work into as few command buffers as practical
4. profile CPU encoding time separately from GPU execution time

## Practical Review Questions

- Is the wrapper creating a command buffer per tiny operation?
- Is pipeline creation happening outside initialization?
- Are resources reused, or recreated every invocation?
- Is the bottleneck CPU submission time rather than GPU execution time?

## Common Failure Modes

- command buffers are fragmented into many tiny submissions
- a stable pipeline is recreated every dispatch
- dynamic-shape support is implemented by reallocating everything every time
- GPU slowdown is assumed when the real issue is CPU encoding churn

## Official Source Links (Fact Check)

- Persistent objects best practices: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/PersistentObjects.html
- Command buffers best practices: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/CommandBuffers.html
- Command organization and execution model: https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Cmd-Submiss/Cmd-Submiss.html
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
