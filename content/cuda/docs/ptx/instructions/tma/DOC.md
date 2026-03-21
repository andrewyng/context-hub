---
name: ptx-tma-instructions
description: "PTX Tensor Memory Accelerator related instructions and usage constraints in ISA 9.2."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,tma,async,memory"
---

# PTX TMA

Tensor Memory Accelerator (TMA) instructions move tensor tiles asynchronously with explicit completion protocols.

## Representative Syntax

```ptx
cp.async.bulk.tensor.1d.shared::cta.global.mbarrier::complete_tx::bytes.tile [dstMem], [tensorMap, {tc}], [mbar];
```

This is a representative form. Actual variants add dimension, source/destination state-space, completion mechanism, and multicast/reduction modifiers.

## Key Semantics

- TMA operations are asynchronous and require explicit completion handling before consumer use.
- Completion may use mbarrier-based `complete_tx` or bulk-group wait mechanisms depending on variant.
- Memory visibility and ordering follow PTX asynchronous-operation rules and proxy semantics.

## Common Constraints

- `tensorMap` descriptors and coordinate operands must be valid for the selected dimension/layout form.
- Variant-specific modifiers (for example multicast/reduce forms) require matching operand lists.
- Alignment, shape, and state-space combinations must match ISA restrictions for the target architecture.

## Usage Recommendations

- First validate correctness with a single-stage movement/compute loop.
- Add staged pipelining only after synchronization boundaries are explicit and correct.
- Keep a fallback path for architectures or types that do not support your chosen TMA variant.

## Official Source Links (fact check)

- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- Tensor Map: https://docs.nvidia.com/cuda/parallel-thread-execution/#tensor-map
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last verified date: 2026-03-19

## Single-Instruction References

- `references/cp-async-bulk-tensor.md`
- `references/cp-reduce-async-bulk.md`
- `references/multimem-cp-reduce-async-bulk.md`
