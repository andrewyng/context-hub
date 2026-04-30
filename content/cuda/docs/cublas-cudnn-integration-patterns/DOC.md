---
name: cublas-cudnn-integration-patterns
description: "CUDA library integration essentials: cuBLAS/cuDNN handle lifecycle, stream binding, workspace policy, and mixed custom-kernel pipelines."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cublas,cudnn,integration,handle,stream-binding,workspace,mixed-pipeline"
---

# cuBLAS/cuDNN Integration Patterns (C++)

Use this page when combining custom CUDA kernels with cuBLAS or cuDNN calls.

## Handle Lifecycle

Library handles should usually be:

- created once per host thread/context
- reused across iterations
- destroyed at controlled shutdown

Frequent create/destroy in hot paths adds overhead.

## Stream Binding Rule

Bind library handles to the correct stream before issuing calls.

- cuBLAS/cuDNN work should run in the intended stream
- stream mismatch causes accidental serialization or race-like ordering bugs

## Workspace Strategy

Many cuDNN and some cuBLAS paths use temporary workspace.

- allocate and reuse workspace buffers where possible
- avoid repeated malloc/free during steady-state loops
- keep workspace sizing policy consistent with algorithm selection

## Mixed Pipelines

Common pattern:

1. pre/post-processing in custom kernels
2. dense math in cuBLAS/cuDNN
3. follow-up custom kernels

Use events/stream ordering rather than global synchronization between stages.

## Determinism And Performance

Algorithm choices can trade determinism and speed.

- production training/inference pipelines should explicitly document determinism expectations
- benchmark with the exact settings that production will use

## Related Topics

- Streams and events: `../streams-and-events/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- cuBLAS documentation: https://docs.nvidia.com/cuda/cublas/index.html
- cuDNN documentation: https://docs.nvidia.com/deeplearning/cudnn/latest/
- CUDA Runtime API (stream interoperability): https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
