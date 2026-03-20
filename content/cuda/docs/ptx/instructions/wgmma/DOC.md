---
name: ptx-wgmma-instructions
description: "PTX warpgroup-level matrix multiply-accumulate instructions and constraints for ISA 9.2."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,wgmma,mma,tensorcore,wmma,tensor-core,matrix-multiply,matrix-multiply-accumulate"
---

# PTX WGMMA

WGMMA is used for warpgroup-level matrix multiply-accumulate and targets high-throughput Tensor Core paths.

## Feature Positioning

- Compared with traditional `mma`, WGMMA is designed for higher-level cooperative execution.
- It is commonly combined with asynchronous movement (e.g., TMA) to reduce data waiting.

## Key Constraints

- The combination of tile shape, layout, and dtype must fully match the specification.
- Instruction availability depends on the target architecture (see the Target ISA notes).
- Asynchronous compute paths require corresponding wait/synchronization mechanisms.

## Example (Structural Illustrative)

```ptx
// Specific operand formats should follow the official section.
wgmma.mma_async.sync.aligned ...;
```

## Official Source Links (Fact Check)

- Asynchronous Warpgroup Level Matrix Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async
- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions

Last cross-check date: 2026-03-19

## Single-instruction Topics

- `references/wgmma-mma-async.md`
- `references/wgmma-commit-group.md`
- `references/wgmma-wait-group.md`
- `references/wgmma-fence.md`
