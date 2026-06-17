---
name: metal-tensor-packing-and-unpacking-patterns
description: "Apple Metal tensor packing and unpacking patterns: contiguous staging, vector-friendly layouts, and explicit shape or stride contracts for data transform kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,tensor-packing,unpacking,layout-transform,contiguous,vectorization,shape-contract,stride,compute"
---

# Metal Tensor Packing And Unpacking Patterns

Use this page when a Metal workflow needs to rearrange tensor data into a layout that is easier for later kernels to consume.

## Why Packing Exists

Packing and unpacking kernels are usually inserted to:

- convert between framework layout and kernel-friendly layout
- make later accesses contiguous or vector-friendly
- batch several small logical tensors into one regular representation

These kernels do little arithmetic, so correctness and memory behavior matter more than ALU throughput.

## Safe Baseline Pattern

- define the source logical shape and destination logical shape explicitly
- write one direct mapping kernel first
- validate that unpacking reconstructs the original tensor
- only then tune for vector-width alignment or tiled movement

## What To Verify

- packed layout contract is documented in both host code and the kernel
- destination strides or offsets are derived from the intended packed format
- padding regions are defined explicitly
- later kernels actually use the new layout as intended

## Common Failure Modes

- packing logic is correct but the consumer still assumes the old layout
- padding bytes or elements are left uninitialized and later treated as valid
- the host wrapper allocates for logical size, not packed size
- pack and unpack kernels drift apart and stop being inverses

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Calculating threadgroup and grid sizes: https://developer.apple.com/documentation/metal/calculating-threadgroup-and-grid-sizes
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
