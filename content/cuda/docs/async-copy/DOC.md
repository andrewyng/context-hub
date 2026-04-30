---
name: async-copy
description: "CUDA async copy essentials: cooperative_groups::memcpy_async, cuda::pipeline, wait rules, and the bridge to cp.async/TMA."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,async-copy,memcpy_async,cuda::pipeline,cuda::barrier,cp.async,tma,shared-memory"
---

# CUDA Async Copy (C++)

Use this page for the CUDA C++ view of asynchronous copies from global memory to shared memory and the synchronization rules around them.

## What Problem It Solves

A conventional copy into shared memory:

```cpp
shared[idx] = global[idx];
```

typically expands into:

1. load from global memory into a register
2. store from register into shared memory

Async copy can avoid that register staging path on supported hardware and can overlap data movement with computation.

## Main CUDA C++ Entry Points

Two common interfaces appear in NVIDIA documentation:

- `cooperative_groups::memcpy_async(...)`
- `cuda::memcpy_async(...)` together with `cuda::pipeline` or `cuda::barrier`

At a high level, both start an async transfer and require an explicit wait before the data in shared memory is consumed.

## Fundamental Safety Rule

After initiating the async copy:

- do not read the destination shared memory until the corresponding wait completes
- do not modify the source or destination participating region while the transfer is in flight

Until the wait completes, reading or writing the participating data can create a data race.

## Cooperative Groups Pattern

```cpp
namespace cg = cooperative_groups;

auto block = cg::this_thread_block();
extern __shared__ float smem[];

cg::memcpy_async(block, smem, gmem_ptr, bytes);
cg::wait(block);
block.sync();
```

Use `cg::wait(group)` before consuming the copied shared-memory data.

## Pipeline Pattern

For newer CUDA C++ paths, `cuda::pipeline` can express staged copy/compute overlap.

The common structure is:

1. acquire / start pipeline stage
2. issue `cuda::memcpy_async`
3. commit or advance the stage
4. wait for the prior stage
5. compute on the completed shared-memory tile

This is the higher-level CUDA C++ bridge to lower-level async copy hardware behavior.

## When Hardware Acceleration Matters

NVIDIA documents that on compute capability 8.0 and higher, async copies from global to shared memory can benefit from hardware acceleration that avoids an intermediate register path.

That does not remove the need for:

- alignment discipline
- correct wait behavior
- sensible shared-memory layout

## When To Escalate To PTX / TMA

Stay in CUDA C++ docs when:

- you are using `memcpy_async`
- you need pipeline-level copy/compute overlap
- you want a supported C++ interface

Drop to PTX / TMA docs when:

- you need precise `cp.async` group semantics
- you need bulk async copies or TMA
- you need `mbarrier` or cluster-scope completion behavior

## Related Topics

- Shared memory usage: `../shared-memory/DOC.md`
- Synchronization rules: `../synchronization/DOC.md`
- Cooperative Groups: `../cooperative-groups/DOC.md`
- PTX `cp.async`: `../ptx/instructions/data-movement/references/cp-async.md`
- PTX TMA: `../ptx/instructions/tma/DOC.md`

## Official Source Links (Fact Check)

- CUDA Programming Guide, Asynchronous Data Copies: https://docs.nvidia.com/cuda/archive/13.1.1/cuda-programming-guide/04-special-topics/async-copies.html
- CUDA Programming Guide, Cooperative Groups async copy examples: https://docs.nvidia.com/cuda/archive/11.8.0/cuda-c-programming-guide/index.html
- CUDA Programming Guide, `memcpy_async` and `cuda::pipeline`: https://docs.nvidia.com/cuda/archive/11.6.2/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
