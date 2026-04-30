---
name: performance-debugging
description: "CUDA performance debugging essentials: when to use Nsight Systems vs Nsight Compute, key metrics, and how to read warp stalls."
metadata:
  languages: "cpp"
  versions: "2024.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,performance-debugging,nsight-compute,nsight-systems,warp-stalls,occupancy,bandwidth,profiling"
---

# CUDA Performance Debugging (C++)

Use this page when a kernel is correct but slow and you need to decide what to profile first.

## First Tool Choice

Use the tools for different questions:

- Nsight Systems: timeline, host/device orchestration, overlap, streams, events, graph behavior
- Nsight Compute: per-kernel metrics, throughput, occupancy, warp stalls, memory behavior

If you do not yet know whether the problem is on the host side or inside the kernel, start with Nsight Systems.

## Nsight Systems

Use Nsight Systems when you need to answer:

- are streams actually overlapping?
- are copies blocking kernels?
- is the CPU launch path the bottleneck?
- are events or graphs introducing serialization?

NVTX ranges are useful here for relating CPU regions to CUDA activity.

## Nsight Compute

Use Nsight Compute when you need to answer:

- is the kernel memory-bound or compute-bound?
- is occupancy too low?
- are schedulers issuing efficiently?
- what are the top warp stall reasons?

Useful report sections include:

- SpeedOfLight
- Occupancy
- SchedulerStats
- WarpStateStats

## Reading Stall Reasons Carefully

NVIDIA's profiling guide explicitly warns not to over-focus on stalls unless schedulers are failing to issue well.

Examples:

- high short-scoreboard stalls often point to shared-memory operations or similar MIO dependencies
- high barrier-related stalls often mean uneven work before synchronization
- high not-selected can simply indicate there are enough eligible warps

So stall interpretation should follow, not replace, a top-level throughput diagnosis.

## Practical Triage Order

1. check total runtime structure with Nsight Systems
2. identify the expensive kernel(s)
3. inspect throughput, occupancy, and warp states in Nsight Compute
4. map the dominant issue back to code:
   coalescing, bank conflicts, divergence, occupancy, or launch overhead

## Related Topics

- Occupancy tuning: `../occupancy/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`
- Nsight metrics interpretation cheatsheet: `../nsight-metrics-interpretation-cheatsheet/DOC.md`
- Memory-bound optimization playbook: `../memory-bound-kernel-optimization-playbook/DOC.md`
- Compute-bound optimization playbook: `../compute-bound-kernel-optimization-playbook/DOC.md`
- Launch-bound optimization playbook: `../launch-bound-optimization-playbook/DOC.md`
- CUDA Core optimization checklist: `../cuda-core-optimization-checklist/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`
- NVTX workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Error handling and debug build: `../error-handling-and-debug-build/DOC.md`
- Benchmarking methodology: `../benchmarking-methodology/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`
- Data layout and alignment: `../data-layout-and-alignment/DOC.md`
- Cache behavior and access policy: `../cache-behavior-and-access-policy/DOC.md`

## Official Source Links (Fact Check)

- Nsight Systems User Guide: https://docs.nvidia.com/nsight-systems/UserGuide/index.html
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html
- Older Nsight Compute profiling guide with stall explanations: https://docs.nvidia.com/nsight-compute/2022.4/ProfilingGuide/index.html

Last cross-check date: 2026-03-20
