---
name: ptx
description: "NVIDIA PTX ISA 9.2 guide: instruction model, constraints, and architecture mapping."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,isa,gpu,assembly,nvidia,wmma,tensor-core,tensorcore,matrix-multiply,matrix-multiply-accumulate,shared-memory,cp.async,mbarrier,bank-conflict,swizzling"
---

# PTX ISA 9.2 Navigation

This directory follows the PTX ISA 9.2 official documentation and provides executable, constrained, and traceable instruction semantics for agents.

## Coverage

- Program model: thread hierarchy, state spaces, data types, functions, and ABI
- Instruction format: predicates, opcodes, type suffixes, modifiers, and operands
- Memory model: scope + semantics (relaxed/acquire/release)
- Instruction families: integer, floating point, data movement, control flow, synchronization, WGMMA, and TMA
- Special registers: `%tid`, `%ctaid`, `%smid`, and related registers

## Recommended Reading Path

1. `references/programming-model.md`
2. `references/state-spaces-and-types.md`
3. `references/instruction-format-and-operands.md`
4. `references/memory-consistency-model.md`
5. `references/abi-and-calling-convention.md`
6. `instructions/*/DOC.md`

## Shared Memory Related Entry Points

- CUDA C++ shared memory base entry: `../shared-memory/DOC.md`
- CUDA C++ Tensor Core entry: `../tensor-cores/DOC.md`
- CUDA execution model entry: `../execution-model/DOC.md`
- CUDA throughput model entry: `../compute-throughput/DOC.md`
- CUDA Core path entry: `../cuda-core/DOC.md`
- CUDA path-selection entry: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- CUDA WMMA patterns entry: `../wmma-kernel-patterns/DOC.md`
- CUDA Tensor Core pipeline entry: `../tensor-core-pipeline-patterns/DOC.md`
- CUDA async copy entry: `../async-copy/DOC.md`
- CUDA Cooperative Groups entry: `../cooperative-groups/DOC.md`
- CUDA Cluster / DSM entry: `../thread-block-clusters/DOC.md`
- CUDA stream/event entry: `../streams-and-events/DOC.md`
- CUDA fence/ordering entry: `../memory-fences-and-ordering/DOC.md`
- CUDA Graphs entry: `../cuda-graphs/DOC.md`
- CUDA performance diagnostics entry: `../performance-debugging/DOC.md`
- CUDA launch bounds/registers entry: `../launch-bounds-and-registers/DOC.md`
- CUDA Unified Memory entry: `../unified-memory/DOC.md`
- CUDA pinned transfer entry: `../pinned-memory-and-transfers/DOC.md`
- CUDA multi-GPU/P2P entry: `../multi-gpu-and-peer-access/DOC.md`
- CUDA Dynamic Parallelism entry: `../dynamic-parallelism/DOC.md`
- CUDA debug-build/error-handling entry: `../error-handling-and-debug-build/DOC.md`
- CUDA cuBLAS/cuDNN integration entry: `../cublas-cudnn-integration-patterns/DOC.md`
- CUDA NVTX profiling entry: `../nvtx-and-profiling-workflow/DOC.md`
- CUDA numerics/precision entry: `../numerics-and-precision/DOC.md`
- CUDA reproducibility entry: `../randomness-and-reproducibility/DOC.md`
- CUDA fused-kernel design entry: `../fused-kernel-design-patterns/DOC.md`
- CUDA build/ABI compatibility entry: `../build-and-abi-compatibility/DOC.md`
- CUDA sparse/irregular kernels entry: `../sparse-and-irregular-kernels/DOC.md`
- CUDA collective communication patterns entry: `../collective-communication-patterns/DOC.md`
- CUDA benchmarking methodology entry: `../benchmarking-methodology/DOC.md`
- CUDA regression testing/CI entry: `../regression-testing-and-ci/DOC.md`
- CUDA data-layout/alignment entry: `../data-layout-and-alignment/DOC.md`
- CUDA cache behavior entry: `../cache-behavior-and-access-policy/DOC.md`
- CUDA persistent-kernel/work-queue entry: `../persistent-kernels-and-work-queues/DOC.md`
- CUDA production readiness checklist entry: `../production-readiness-checklist/DOC.md`
- CUDA kernel API design entry: `../kernel-api-design-guidelines/DOC.md`
- CUDA shape-specialization/autotuning entry: `../input-shape-specialization-and-autotuning/DOC.md`
- CUDA capability-detection/fallback entry: `../fallback-strategies-and-capability-detection/DOC.md`
- CUDA incident-response/rollback entry: `../incident-response-and-rollback-playbook/DOC.md`
- `.shared` state-space reference: `references/state-spaces-and-types.md`
- `cp.async` reference: `instructions/data-movement/references/cp-async.md`
- `mbarrier` reference: `instructions/sync-comm/DOC.md`
- TMA/shared-memory layout reference: `instructions/tma/DOC.md`

## PTX Pattern Playbooks

- Integer and bit-manipulation patterns: `../ptx-integer-bit-manipulation-patterns/DOC.md`
- Atomic and reduction patterns: `../ptx-atomic-and-reduction-patterns/DOC.md`
- mbarrier protocol patterns: `../ptx-mbarrier-protocol-patterns/DOC.md`
- Warp synchronization patterns: `../ptx-warp-synchronization-patterns/DOC.md`

## Instruction Category Entry Points

- Integer Arithmetic: `instructions/integer/DOC.md`
- Floating-Point: `instructions/floating-point/DOC.md`
- Data Movement: `instructions/data-movement/DOC.md`
- Control Flow: `instructions/control-flow/DOC.md`
- Synchronization and Communication: `instructions/sync-comm/DOC.md`
- Warpgroup MMA: `instructions/wgmma/DOC.md`
- Tensor Memory Accelerator: `instructions/tma/DOC.md`
- Special Registers: `instructions/special-registers/DOC.md`

## Documentation Reliability Notes

- Syntax and semantic claims in this directory map to NVIDIA PTX ISA sections.
- Each document includes section-level anchors for direct verification.
- If newer PTX versions are released, prioritize release-notes deltas.

## Official Source Links (fact check)

- PTX main documentation: https://docs.nvidia.com/cuda/parallel-thread-execution/
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- Release Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#release-notes

Last verified date: 2026-03-19

## B-series Special Entry Points

- H-series special instruction summary: `references/h-series-special-instructions.md`
- Architecture capability matrix: `references/b-series-arch-matrix.md`
- Delta vs Hopper: `references/b-series-delta-from-hopper.md`
- tcgen05 special topic: `instructions/tcgen05/DOC.md`
