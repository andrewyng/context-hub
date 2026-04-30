---
name: metal-ragged-tensors-and-masked-kernels
description: "Apple Metal ragged tensor and masked kernel patterns: variable-length work, explicit masks, bounds-safe dispatch, and divergence-aware validation."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,ragged,masked-kernel,variable-length,bounds-check,divergence,tail-processing,compute"
---

# Metal Ragged Tensors And Masked Kernels

Use this page when logical rows, sequences, or tiles have variable length and the kernel cannot assume a dense rectangular workload.

## What Changes In Ragged Workloads

Dense kernels often assume that every launched thread owns one valid element.

Ragged workloads break that assumption:

- valid work per row or segment may differ
- the launched grid is often rounded up beyond the real element count
- some lanes are active only under an explicit mask

If this is not modeled clearly, the kernel either reads out of range or silently includes invalid elements in the result.

## Safe Baseline Pattern

- dispatch a simple rectangular superset
- pass explicit logical lengths, masks, or prefix offsets
- guard each load and store with the real validity condition
- validate with very uneven row lengths and short tails

## Design Questions

- is validity expressed by lengths, offsets, or a boolean mask?
- is masked-off work supposed to write zero, skip the write, or keep the previous value?
- does divergence only affect performance, or can it change reduction semantics?

## Common Failure Modes

- bounds checks protect loads but not stores
- masked-out lanes still participate in reductions or normalizations
- the wrapper rounds dispatch size correctly but passes the wrong logical lengths
- only near-dense cases are tested, so pathological ragged shapes never run

## Review Checklist

- What defines the valid region for each row, segment, or tile?
- Do masked lanes avoid both invalid reads and invalid writes?
- Are reductions and normalizations computed only over valid elements?
- Are tail and empty-row cases part of the test set?

## Official Source Links (Fact Check)

- Calculating threadgroup and grid sizes: https://developer.apple.com/documentation/metal/calculating-threadgroup-and-grid-sizes
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
