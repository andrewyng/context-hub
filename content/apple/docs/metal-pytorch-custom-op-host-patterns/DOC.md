---
name: metal-pytorch-custom-op-host-patterns
description: "Apple Metal PyTorch custom-op host patterns: deciding when to leave MPS, structuring the host path, and validating custom op integration."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,pytorch,custom-op,host-wrapper,mps,cpp-extension,torch-library,metal-custom-op,opcheck"
---

# Metal PyTorch Custom-Op Host Patterns

Use this page when PyTorch `mps` is no longer enough and you need a custom operation backed by Metal.

## When To Leave Plain `mps`

Stay with stock PyTorch `mps` when:

- the op graph is already expressible with built-in operators
- performance is acceptable
- your main goal is device portability, not custom kernel ownership

Move to a custom-op path when:

- a fused op is missing
- launch or memory overhead dominates
- kernel behavior must be controlled directly

## Host-Side Responsibility Split

There are two distinct layers:

- PyTorch custom-op registration and dispatch boundary
- Metal-side wrapper that owns pipeline creation, binding, and dispatch

Keep them separate.

That means:

- PyTorch-facing code validates tensor shapes, dtypes, and device placement
- Metal-facing code handles buffers, pipeline state, and launch geometry

## Good Integration Pattern

1. Validate tensor arguments at the PyTorch boundary.
2. Convert or view storage into the expected Metal wrapper inputs.
3. Dispatch a dedicated Metal wrapper for the op.
4. Return tensors whose lifetime and synchronization rules are clear.
5. Test the custom op independently from model-level integration.

## Why This Matters

Without a clean boundary:

- debugging mixes PyTorch registration bugs with Metal launch bugs
- tensor layout assumptions leak into shader logic
- synchronization ownership becomes unclear

## Testing Strategy

Use both:

- PyTorch-side correctness tests for the registered op
- lower-level Metal-side tests for binding and dispatch correctness

PyTorch's custom operator guidance and `torch.library.opcheck` are relevant here for validating the operator boundary itself.

## Common Failure Modes

- PyTorch boundary accepts tensors the Metal wrapper does not actually support
- wrapper assumes contiguous layout but op registration never enforces it
- custom op is "correct" on CPU fallback but incorrect on Metal because launch geometry differs
- model-level tests hide whether the failure is registration, layout, or shader execution

## Official Source Links (Fact Check)

- Apple: Customizing a PyTorch operation: https://developer.apple.com/documentation/metal/customizing-a-pytorch-operation
- Apple: Accelerated PyTorch training on Mac: https://developer.apple.com/metal/pytorch/
- PyTorch custom C++/CUDA operators tutorial: https://docs.pytorch.org/tutorials/advanced/cpp_custom_ops.html
- PyTorch MPS backend notes: https://docs.pytorch.org/docs/stable/notes/mps

Last cross-check date: 2026-03-21
