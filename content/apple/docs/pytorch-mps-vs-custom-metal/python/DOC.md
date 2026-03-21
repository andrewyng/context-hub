---
name: pytorch-mps-vs-custom-metal
description: "PyTorch MPS versus custom Metal kernels: backend boundaries, capability checks, and when to write a custom op."
metadata:
  languages: "python"
  versions: "2.10"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,pytorch,mps,metal,metal-performance-shaders,mps-graph,custom-op,custom-metal,torch.mps,macos"
---

# PyTorch MPS Vs Custom Metal

Use this page to avoid mixing four different layers:

- PyTorch `mps` device
- Metal Performance Shaders (MPS)
- MPS Graph
- custom Metal kernels or custom PyTorch operations

These are related, but they are not interchangeable.

## What `mps` Means In PyTorch

PyTorch's `mps` device is the PyTorch backend for Mac GPU execution.

According to the official PyTorch MPS notes and Apple Metal/PyTorch material:

- `torch.device("mps")` moves tensors and modules to the MPS backend
- that backend maps operations onto MPS Graph and tuned kernels provided by Metal Performance Shaders
- availability depends on both the installed PyTorch build and the machine/runtime environment

## Minimal Availability Check

```python
import torch

if torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")
```

If `is_available()` is false, check:

- `torch.backends.mps.is_built()`
- macOS version and device support

## What Custom Metal Means

Custom Metal means you are writing your own Metal kernel and host-side integration rather than relying entirely on stock PyTorch operators.

That is a different level of ownership:

- you own kernel code
- you own bindings and launch configuration
- you own debugging and correctness validation

Apple's `Customizing a PyTorch operation` sample exists specifically for this case.

## Choose The Right Layer

Stay with plain PyTorch `mps` when:

- standard PyTorch ops already express the computation
- performance is acceptable
- your main need is "run on Mac GPU"

Move toward a custom Metal or custom PyTorch op path when:

- a critical fused op is missing or too slow
- memory movement or launch overhead dominates
- you need kernel behavior that stock operators do not expose

## Important `torch.mps` APIs

The official `torch.mps` docs expose runtime tools such as:

- `device_count`
- `synchronize`
- memory reporting helpers
- `compile_shader`
- profiler and Metal-capture helpers

These are useful for debugging and runtime inspection, but they do not replace understanding the lower-level Metal execution model.

## Common Failure Modes

- Treating `mps` as if it were a direct custom-kernel API.
- Assuming every CUDA path has an equivalent `mps` kernel or feature surface.
- Using `mps` successfully for stock ops, then assuming custom Metal integration will require no host-side work.
- Confusing MPS Graph and custom Metal kernels in design discussions.

## Official Source Links (Fact Check)

- Apple: Accelerated PyTorch training on Mac: https://developer.apple.com/metal/pytorch/
- Apple: Customizing a PyTorch operation: https://developer.apple.com/documentation/metal/customizing-a-pytorch-operation
- PyTorch MPS backend notes: https://docs.pytorch.org/docs/stable/notes/mps
- PyTorch `torch.mps` package: https://docs.pytorch.org/docs/stable/mps.html
- PyTorch MPS environment variables: https://docs.pytorch.org/docs/stable/mps_environment_variables.html

Last cross-check date: 2026-03-21
