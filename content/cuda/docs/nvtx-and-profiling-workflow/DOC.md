---
name: nvtx-and-profiling-workflow
description: "CUDA NVTX and profiling workflow essentials: annotation strategy, Nsight Systems correlation, and handoff to Nsight Compute."
metadata:
  languages: "cpp"
  versions: "2024.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,nvtx,profiling,nsight-systems,nsight-compute,annotation,timeline"
---

# NVTX And Profiling Workflow (C++)

Use this page for a repeatable profiling workflow across host code and CUDA kernels.

## Why NVTX First

NVTX markers make timeline analysis actionable.

- they label logical phases in host code
- Nsight Systems can correlate those ranges with stream activity and kernel launches
- this reduces guesswork before deep kernel-level profiling

## Recommended Workflow

1. add NVTX ranges around pipeline phases.
2. run Nsight Systems to identify timeline bottlenecks.
3. select top kernels from the timeline.
4. run Nsight Compute for per-kernel microanalysis.

This avoids premature micro-optimization of non-critical kernels.

## Annotation Guidelines

- annotate coarse phases first (data load, preprocess, compute, postprocess)
- add finer ranges only where needed
- keep naming stable across runs for easy diffing

## Common Mistakes

- profiling kernels without timeline context
- over-annotating every tiny function
- changing workload shape between profiling runs

## Related Topics

- Performance debugging: `../performance-debugging/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`

## Official Source Links (Fact Check)

- NVTX documentation: https://nvidia.github.io/NVTX/
- Nsight Systems User Guide: https://docs.nvidia.com/nsight-systems/UserGuide/index.html
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20
