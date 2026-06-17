---
name: cuda-core
description: "CUDA Core path essentials: SIMT arithmetic pipelines, warp scheduling, ILP/occupancy tradeoffs, and practical optimization workflow."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cuda-core,simt,fp32,int32,warp,scheduler,ilp,occupancy,latency-hiding"
---

# CUDA Core Path (C++)

Use this page for kernels that run on ordinary SM arithmetic pipelines (the path developers usually call "CUDA Core path"), not Tensor Core matrix instructions.

## What This Means In Practice

For CUDA C++ kernels, "CUDA Core path" usually means:

- ordinary scalar or vector arithmetic instructions (FP32, INT32, FP64, and related ops)
- SIMT warp execution on standard SM arithmetic pipelines
- no explicit warp-matrix API (`wmma`) and no PTX warpgroup matrix instructions (`wgmma`)

There is no separate CUDA C++ API named "CUDA Core". The distinction is a performance and execution-model distinction.

## Typical Workloads

Kernels that usually remain on this path:

- elementwise transforms
- reductions and scans with limited matrix structure
- indexing-heavy or branch-heavy kernels
- irregular sparse kernels

Even in ML workloads, many preprocessing, activation, normalization, and indexing phases are CUDA Core dominated.

## Optimization Checklist

1. Make global memory access coalesced.
2. Remove avoidable divergence in hot warps.
3. Balance occupancy and register pressure instead of maximizing occupancy blindly.
4. Increase instruction-level parallelism where dependency chains are long.
5. Validate cache and shared-memory behavior before deep unrolling.

## Occupancy vs ILP Tradeoff

Two common failure modes:

- **High occupancy, low per-warp progress:** too little ILP, frequent dependency stalls.
- **High ILP, low occupancy:** register usage or shared-memory usage blocks enough resident warps.

Tune block size, unroll factors, and register usage together. Treat occupancy as a means to hide latency, not as the final objective.

## How To Verify You Are On This Path

In profiler output, check whether runtime is dominated by ordinary arithmetic instruction activity and not matrix instruction activity. Also check:

- warp stall reasons (dependency, memory throttling, execution dependency)
- achieved occupancy
- memory throughput utilization
- instruction mix consistency with kernel intent

If your intended Tensor Core kernel shows only ordinary arithmetic activity, the path selection is wrong.

## When To Escalate To Tensor Cores

Move to Tensor Cores when all are true:

- workload is dominated by dense matrix-multiply-accumulate
- data types and layouts match supported matrix instruction paths
- staging and synchronization overhead can be controlled
- numerical policy is acceptable (for example FP16/BF16/TF32 with chosen accumulation)

## Related Topics

- Execution model: `../execution-model/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Occupancy: `../occupancy/DOC.md`
- Warp primitives: `../warp-primitives/DOC.md`
- Tensor Cores: `../tensor-cores/DOC.md`
- Path selection guide: `../cuda-core-vs-tensor-core-path-selection/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, SIMT and warp execution: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Programming Guide, arithmetic instruction throughput interpretation: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- Turing Tuning Guide, latency hiding and scheduler behavior: https://docs.nvidia.com/cuda/archive/12.4.0/turing-tuning-guide/index.html

Last cross-check date: 2026-03-20

