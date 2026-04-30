---
name: occupancy
description: "CUDA occupancy essentials: active warps, launch configuration APIs, and the tradeoff with registers and shared memory."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,occupancy,launch-configuration,block-size,register-pressure,shared-memory,cudaOccupancyMaxPotentialBlockSize"
---

# CUDA Occupancy (C++)

Use this page when tuning block size, shared memory size, or register usage and you need to reason about how many warps and blocks can stay active on an SM.

## What Occupancy Means

Occupancy is the ratio of active warps on an SM to the maximum supported warps on that SM.

In practice, occupancy is constrained by:

- threads per block
- registers used per thread
- shared memory used per block
- architectural limits on blocks and warps per SM

## Important Caveat

Higher occupancy is not automatically better.

- low occupancy can hurt latency hiding
- very high occupancy can be unnecessary if the kernel is already bandwidth-limited or instruction-efficient
- reducing registers just to raise occupancy can backfire if it causes spills to local memory

Treat occupancy as a constraint and diagnostic, not a standalone optimization target.

## Runtime APIs

CUDA provides helper APIs for launch configuration:

- `cudaOccupancyMaxActiveBlocksPerMultiprocessor`
- `cudaOccupancyMaxPotentialBlockSize`
- `cudaOccupancyMaxPotentialBlockSizeVariableSMem`

Use them to estimate a reasonable starting block size based on register and shared-memory usage.

Minimal pattern:

```cpp
int minGridSize = 0;
int blockSize = 0;
cudaOccupancyMaxPotentialBlockSize(
    &minGridSize,
    &blockSize,
    my_kernel,
    0,
    0);
```

This gives a good starting point, not a final answer.

## What Usually Lowers Occupancy

- large dynamic shared memory allocations
- high register pressure
- overly large block sizes
- cluster or architecture-specific launch constraints on newer GPUs

## Practical Tuning Rules

- start in the 128 to 256 threads-per-block range unless you have a strong reason otherwise
- prefer a multiple of warp size
- if a kernel frequently calls `__syncthreads()`, several smaller blocks can outperform one very large block
- if reducing block size barely changes runtime, the kernel may not be occupancy-limited

## Common Misread

If performance is poor, ask these in order:

1. Is memory access coalesced?
2. Are there bank conflicts?
3. Is there divergence?
4. Is occupancy actually the limiting factor?

Very often, memory behavior matters more than squeezing out a few more active warps.

## Related Topics

- Execution model: `../execution-model/DOC.md`
- Compute throughput model: `../compute-throughput/DOC.md`
- Shared memory constraints: `../shared-memory/DOC.md`
- Memory hierarchy overview: `../memory-hierarchy/DOC.md`
- Synchronization behavior: `../synchronization/DOC.md`
- Coalesced global memory access: `../coalescing/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, occupancy calculator APIs: https://docs.nvidia.com/cuda/archive/11.8.0/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, thread/block sizing guidance: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA Driver API occupancy reference: https://docs.nvidia.com/cuda/archive/11.4.4/cuda-driver-api/group__CUDA__OCCUPANCY.html

Last cross-check date: 2026-03-20
