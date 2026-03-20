---
name: runtime
description: "CUDA Runtime API essentials for allocating memory, launching kernels, and managing streams."
metadata:
  languages: "cpp"
  versions: "12.4"
  revision: 1
  updated-on: "2026-03-18"
  source: community
  tags: "cuda,gpu,kernel,runtime,api"
---

# CUDA Runtime API (C++)

Use the CUDA Runtime API for most application-level kernel development. It provides a simpler model than the Driver API while still exposing streams, events, and device management.

## Minimal End-to-End Example

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

__global__ void saxpy(const float* x, const float* y, float* out, float a, int n) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  if (i < n) out[i] = a * x[i] + y[i];
}

int main() {
  const int n = 1 << 20;
  const size_t bytes = n * sizeof(float);
  float *h_x = (float*)malloc(bytes);
  float *h_y = (float*)malloc(bytes);
  float *h_out = (float*)malloc(bytes);

  float *d_x = nullptr, *d_y = nullptr, *d_out = nullptr;
  cudaMalloc(&d_x, bytes);
  cudaMalloc(&d_y, bytes);
  cudaMalloc(&d_out, bytes);

  cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
  cudaMemcpy(d_y, h_y, bytes, cudaMemcpyHostToDevice);

  const int threads = 256;
  const int blocks = (n + threads - 1) / threads;
  saxpy<<<blocks, threads>>>(d_x, d_y, d_out, 2.0f, n);

  cudaDeviceSynchronize();
  cudaMemcpy(h_out, d_out, bytes, cudaMemcpyDeviceToHost);

  cudaFree(d_x);
  cudaFree(d_y);
  cudaFree(d_out);
  free(h_x);
  free(h_y);
  free(h_out);
  return 0;
}
```

## Core Runtime APIs

Use these first when building kernels:

- `cudaMalloc`, `cudaFree` for device memory
- `cudaMemcpy`, `cudaMemcpyAsync` for transfers
- `cudaMemset` for initialization
- `cudaGetLastError`, `cudaDeviceSynchronize` for error detection
- `cudaStreamCreate`, `cudaStreamDestroy` for async execution
- `cudaEventCreate`, `cudaEventRecord`, `cudaEventElapsedTime` for timing

## Error Handling Pattern

Always check errors for:

- the kernel launch (use `cudaGetLastError`)
- the execution (use `cudaDeviceSynchronize` or stream sync)

See `references/error-handling.md` for a macro-based pattern.

## Common Pitfalls

- Forgetting to synchronize before reading results on the host
- Miscomputing grid size (off-by-one on tail elements)
- Assuming host memory is page-locked (use `cudaHostAlloc` if needed)
- Launching with too few blocks to cover all elements

## When to Use Streams

Use streams when:

- You need overlap of copy and compute (`cudaMemcpyAsync`)
- You want concurrent kernels
- You want explicit ordering without global device sync

## Related Topics

- Error handling macro and diagnostics: `references/error-handling.md`
