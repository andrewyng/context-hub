---
name: pytorch-cuda-extension-best-practices
description: "PyTorch CUDA extension essentials: CPython bindings, ATen tensor manipulations, stream synchronization, and dispatch mechanisms."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,cpp,pytorch,aten,pybind11,extension,dispatcher,streams,tensors"
---

# PyTorch CUDA Extension Best Practices (C++)

Use this page to wrap high-performance CUDA C++ kernels into a Python-callable PyTorch operator cleanly and safely.

## PyTorch C++ / ATen Interface

CUDA extensions in PyTorch use the ATen library for tensor representation and Pybind11 for Python exposure. 

A standard wrapper function structure looks like:

```cpp
#include <torch/extension.h>

torch::Tensor my_custom_kernel_forward(torch::Tensor input, torch::Tensor weight) {
    // 1. Validate inputs
    TORCH_CHECK(input.is_cuda(), "Input must be a CUDA tensor");
    TORCH_CHECK(input.is_contiguous(), "Input must be contiguous");
    
    // 2. Allocate output
    auto output = torch::empty_like(input);
    
    // 3. Extract pointers and launch configuration
    // (Launch the kernel...)
    
    return output;
}
```

## Validation Is Mandatory

Never assume Python will pass well-formed tensors. An extension must validate:
- **Device:** `tensor.is_cuda()`, `tensor.get_device() == expected_device`
- **Dtype:** Check against expected types or use `AT_DISPATCH_FLOATING_TYPES_AND_HALF`.
- **Contiguity:** `tensor.is_contiguous()`. If stride support is missing in the kernel, force contiguity via `tensor.contiguous()` (note: this allocates new memory silently).
- **Shape Constraints:** Ensure dimensions match standard MMA tile requirements.

## Stream Management

PyTorch manages its own CUDA streams to enable host-side concurrency. **Never launch kernels blindly onto the default stream (`0`).**

```cpp
#include <c10/cuda/CUDAStream.h>

cudaStream_t stream = at::cuda::getCurrentCUDAStream();
my_kernel<<<blocks, threads, shared_mem, stream>>>(...);
```

Using the default stream will break PyTorch's asynchronous execution model and can lead to silent data races when integrating with complex graphs.

## The ATen Dispatcher

To write templates that specialize on the datatype of the passed `torch::Tensor` at runtime, use the ATen dispatch macros:

```cpp
AT_DISPATCH_FLOATING_TYPES_AND_HALF(input.scalar_type(), "my_kernel_forward", ([&] {
    my_kernel<scalar_t><<<...>>>(
        input.data_ptr<scalar_t>(),
        output.data_ptr<scalar_t>()
    );
}));
```

## Triton vs Custom CUDA C++

When integrating into PyTorch:
- **Triton (`torch.compile` / `triton.jit`):** Best for elementwise fusion, Softmax variants, or kernels where compilation speed and iteration are high priority.
- **CUDA C++:** Use when you need precise `mbarrier` control, TMA routing, WGMMA instructions, or shared-memory bank conflict micro-optimizations that Triton cannot currently map. 

## Related Topics

- Error handling and debug build: `../error-handling-and-debug-build/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`

## Official Source Links (Fact Check)

- PyTorch Custom C++ and CUDA Extensions Tutorial: https://pytorch.org/tutorials/advanced/cpp_extension.html
- ATen Library Documentation: https://pytorch.org/cppdocs/

Last cross-check date: 2026-03-22
