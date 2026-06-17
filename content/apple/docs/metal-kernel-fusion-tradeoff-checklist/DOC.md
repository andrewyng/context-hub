---
name: metal-kernel-fusion-tradeoff-checklist
description: "Apple Metal kernel fusion tradeoff checklist: bandwidth savings, intermediate lifetime reduction, occupancy risks, and debugging costs when fusing stages."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,kernel-fusion,fusion,tradeoff,bandwidth,occupancy,intermediate-resources,performance,compute"
---

# Metal Kernel Fusion Tradeoff Checklist

Use this page when deciding whether two or more Metal compute stages should remain separate or be fused into one kernel.

## What Fusion Can Improve

Fusion can help when it:

- removes intermediate reads and writes
- reduces temporary resource lifetime
- avoids extra submission overhead
- keeps data in registers or threadgroup memory longer

## What Fusion Can Hurt

Fusion is not free.

It can also:

- increase register pressure
- reduce occupancy or scheduling flexibility
- make debugging harder because intermediates disappear
- tie together stages that used to be independently measurable

## Safe Decision Process

- start from a validated unfused baseline
- measure whether bandwidth or submission overhead is the real bottleneck
- fuse only stages with a clear dataflow advantage
- keep one reproducible benchmark before and after the fusion

## Review Checklist

- does fusion remove a meaningful intermediate resource?
- will the fused kernel increase per-thread state too much?
- do the two stages share compatible dispatch geometry?
- is the performance problem actually bandwidth or CPU submission overhead?

## Common Failure Modes

- fusion is attempted before the per-stage baseline is validated
- bandwidth savings are assumed but register pressure becomes the new bottleneck
- stage-specific bugs become harder to isolate because intermediates vanish
- one stage's natural launch shape is a poor fit for the other stage

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Command buffers best practices: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/CommandBuffers.html
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
