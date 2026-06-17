---
name: metal-broadcast-kernel-patterns
description: "Apple Metal broadcast kernel patterns: scalar or vector expansion, shape alignment, masked edges, and correctness checks for broadcast-heavy compute code."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,broadcast,shape-alignment,elementwise,tensor-shapes,masked-edges,compute"
---

# Metal Broadcast Kernel Patterns

Use this page when a Metal kernel combines tensors of different logical shapes using broadcast semantics.

## Why Broadcast Bugs Are Common

Broadcast kernels look simple because the math is usually elementwise.

The real complexity is shape alignment:

- which dimensions are expanded
- which dimensions are equal
- whether one operand is scalar, row-wise, column-wise, or channel-wise

If the shape contract is vague, the kernel may appear correct on square or fully dense cases while failing on realistic shapes.

## Safe Baseline Pattern

- align shapes explicitly in host code before launch
- pass logical sizes needed for each broadcasted dimension
- write one straightforward reference kernel
- test cases where only one dimension is broadcast, then several

## What To Verify

- broadcasted dimensions reuse the intended source index
- non-broadcasted dimensions advance normally
- output shape is derived from the broadcast rule, not copied from one operand blindly
- masked tails or rounded dispatches cannot write past the real output shape

## Common Failure Modes

- one dimension is broadcast on the host side but advanced in the kernel
- scalar and vector broadcast paths behave differently
- the kernel passes tests where all dimensions match, hiding broken broadcast logic
- the output allocation follows one input shape instead of the broadcasted result shape

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Calculating threadgroup and grid sizes: https://developer.apple.com/documentation/metal/calculating-threadgroup-and-grid-sizes
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
