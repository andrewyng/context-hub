---
name: launch-bounds-and-registers
description: "CUDA launch bounds and register-pressure essentials: __launch_bounds__, occupancy tradeoffs, and spill-aware tuning."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,launch-bounds,__launch_bounds__,register-pressure,spills,occupancy,maxrregcount"
---

# CUDA Launch Bounds And Registers (C++)

Use this page when kernel performance depends on register pressure and block residency.

## What `__launch_bounds__` Does

`__launch_bounds__(maxThreadsPerBlock, minBlocksPerMultiprocessor)` gives the compiler launch-time assumptions.

- `maxThreadsPerBlock` constrains the intended block size
- optional `minBlocksPerMultiprocessor` asks the compiler to keep enough resources for a target block residency

This can change register allocation decisions and instruction scheduling.

## Why It Matters

Register pressure directly affects occupancy.

- too many registers per thread can reduce active blocks/warps
- too few registers can cause spills to local memory

So tuning is a balance: occupancy gain versus spill cost.

## Practical Tuning Pattern

1. Start from correctness and baseline performance.
2. Inspect occupancy and local-memory traffic in Nsight Compute.
3. Try `__launch_bounds__` with realistic block sizes.
4. Re-measure runtime, spills, and achieved occupancy.
5. Keep the setting only if end-to-end time improves.

## `-maxrregcount` Caution

Compiler flag `-maxrregcount` can cap registers globally, but it is blunt.

- it may improve occupancy
- it can also increase spills and hurt performance

Prefer targeted kernel-level tuning (`__launch_bounds__`) before applying global caps.

## Common Mistakes

- optimizing for occupancy percentage alone
- forcing low register count without checking spill metrics
- setting launch bounds that do not match actual launch configuration

## Related Topics

- Occupancy tuning: `../occupancy/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, launch bounds: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, occupancy and execution model discussion: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
