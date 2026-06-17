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
- Memory hierarchy overview: `../memory-hierarchy/DOC.md`
- Shared memory overview: `../shared-memory/DOC.md`
- Synchronization overview: `../synchronization/DOC.md`
- Coalescing overview: `../coalescing/DOC.md`
- Occupancy tuning: `../occupancy/DOC.md`
- Warp-level primitives: `../warp-primitives/DOC.md`
- Execution model: `../execution-model/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- CUDA Core path: `../cuda-core/DOC.md`
- CUDA Core optimization checklist: `../cuda-core-optimization-checklist/DOC.md`
- Tensor Core usage: `../tensor-cores/DOC.md`
- WMMA kernel patterns: `../wmma-kernel-patterns/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`
- Memory-bound optimization playbook: `../memory-bound-kernel-optimization-playbook/DOC.md`
- Compute-bound optimization playbook: `../compute-bound-kernel-optimization-playbook/DOC.md`
- Launch-bound optimization playbook: `../launch-bound-optimization-playbook/DOC.md`
- Nsight metrics interpretation cheatsheet: `../nsight-metrics-interpretation-cheatsheet/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Cooperative Groups: `../cooperative-groups/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Thread Block Clusters: `../thread-block-clusters/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- Memory fences and ordering: `../memory-fences-and-ordering/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`
- Launch bounds and registers: `../launch-bounds-and-registers/DOC.md`
- Unified Memory: `../unified-memory/DOC.md`
- Pinned memory and transfers: `../pinned-memory-and-transfers/DOC.md`
- Multi-GPU and peer access: `../multi-gpu-and-peer-access/DOC.md`
- Dynamic Parallelism: `../dynamic-parallelism/DOC.md`
- Error handling and debug build: `../error-handling-and-debug-build/DOC.md`
- cuBLAS/cuDNN integration patterns: `../cublas-cudnn-integration-patterns/DOC.md`
- NVTX and profiling workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Randomness and reproducibility: `../randomness-and-reproducibility/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`
- Build and ABI compatibility: `../build-and-abi-compatibility/DOC.md`
- Sparse and irregular kernels: `../sparse-and-irregular-kernels/DOC.md`
- Collective communication patterns: `../collective-communication-patterns/DOC.md`
- Benchmarking methodology: `../benchmarking-methodology/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`
- Data layout and alignment: `../data-layout-and-alignment/DOC.md`
- Cache behavior and access policy: `../cache-behavior-and-access-policy/DOC.md`
- Persistent kernels and work queues: `../persistent-kernels-and-work-queues/DOC.md`
- Production readiness checklist: `../production-readiness-checklist/DOC.md`
- Kernel API design guidelines: `../kernel-api-design-guidelines/DOC.md`
- Shape specialization and autotuning: `../input-shape-specialization-and-autotuning/DOC.md`
- Fallback strategies and capability detection: `../fallback-strategies-and-capability-detection/DOC.md`
- Incident response and rollback playbook: `../incident-response-and-rollback-playbook/DOC.md`
- PTX shared-memory async path: `../ptx/instructions/data-movement/references/cp-async.md`
