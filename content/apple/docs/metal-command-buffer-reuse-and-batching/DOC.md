---
name: metal-command-buffer-reuse-and-batching
description: "Apple Metal command buffer reuse and batching guidance: transient versus persistent objects, submission frequency, and indirect command buffer tradeoffs."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,command-buffer,batching,submission,indirect-command-buffer,persistent-objects,command-queue,reuse,icb"
---

# Metal Command Buffer Reuse And Batching

Use this page when CPU submission overhead starts to matter as much as the Metal kernel itself.

## First Principle

Apple distinguishes between transient and persistent objects.

Persistent objects should be created early and reused:

- `MTLDevice`
- `MTLCommandQueue`
- buffers
- textures
- pipeline states

Command buffers themselves are transient single-use objects.

That means:

- reuse pipeline and resource objects
- do not try to reuse committed command buffers
- reduce submission overhead by batching work intelligently

## Batching Guidance

Apple's best-practices material emphasizes submitting as few command buffers as practical without starving the GPU.

This usually means:

- group related work into fewer submissions
- avoid over-fragmenting compute work into many tiny command buffers
- profile CPU/GPU overlap before changing submission policy

## When Indirect Command Buffers Matter

Apple documents indirect command buffers (ICBs) as a way to reduce CPU overhead for repeated command patterns.

Use them when:

- command structure is repeated
- CPU encoding cost is significant
- the workload benefits from reusing encoded command structure

Do not reach for ICBs before validating that ordinary command submission is actually the bottleneck.

## Common Failure Modes

- wrapper code "optimizes" by caching the wrong objects and leaves command-buffer churn untouched
- work is split into too many tiny submissions
- submission count is reduced blindly and introduces dependency or latency issues
- ICB complexity is introduced before measuring CPU encoding cost

## Official Source Links (Fact Check)

- Command Organization and Execution Model: https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Cmd-Submiss/Cmd-Submiss.html
- Metal Best Practices Guide: Persistent Objects: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/PersistentObjects.html
- Metal Best Practices Guide: Command Buffers: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/CommandBuffers.html
- Encoding indirect command buffers on the CPU: https://developer.apple.com/documentation/metal/encoding-indirect-command-buffers-on-the-cpu

Last cross-check date: 2026-03-21
