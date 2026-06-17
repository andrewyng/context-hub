---
name: ptx-multimemcpasyncbulk
description: '`multimem.cp.async.bulk`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.26. Data Movement and Conversion Instructions:multimem.cp.async.bulk

---
title: "9.7.9.26. Data Movement and Conversion Instructions:multimem.cp.async.bulk"
section: 9.7.9.26
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.26. Data Movement and Conversion Instructions:multimem.cp.async.bulk


`multimem.cp.async.bulk`

Initiates an asynchronous copy operation to a multimem address range.

Syntax

multimem.cp.async.bulk.dst.src.completion_mechanism{.cp_mask}
        [dstMem], [srcMem], size{, byteMask};
    
        .dst                  = { .global }
        .src                  = { .shared::cta }
        .completion_mechanism = { .bulk_group }

Description

Instruction `multimem.cp.async.bulk` initiates an asynchronous bulk-copy operation from source address range `[srcMem, srcMem + size)` to memory locations residing on each GPU’s memory referred to by the destination multimem address range `[dstMem, dstMem + size)`. The direction of bulk-copy is from the state space specified by the `.src` modifier to the state space specified by the `.dst` modifiers.

The 32-bit operand `size` specifies the amount of memory to be copied, in terms of number of bytes. Operand `size` must be a multiple of `16`. The memory range `[dstMem, dstMem + size)` must not overflow the destination multimem memory space. The memory range `[srcMem, srcMem + size)` must not overflow the source memory space. The addresses `dstMem` and `srcMem` must be aligned to `16` bytes. If any of these pre-conditions is not met, the behavior is undefined.

The modifier `.completion_mechanism` specifies the completion mechanism that is supported by the instruction. The modifier `.bulk_group` specifies that the `multimem.cp.async.bulk` instruction uses bulk async-group based completion mechanism.

When the optional modifier `.cp_mask` is specified, the argument `byteMask` is required. The i-th bit in the 16-bit wide `byteMask` operand specifies whether the i-th byte of each 16-byte wide chunk of source data is copied to the destination. If the bit is set, the byte is copied.

The reads and writes of the copy operation in `multimem.cp.async.bulk` are weak memory operations as described in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 9.1.

Target ISA Notes

Requires `sm_90` or higher.

Support for `.cp_mask` qualifier requires `sm_100` or higher.

Examples

multimem.cp.async.bulk.global.shared::cta.bulk_group [dstMem], [srcMem], size;
    
    multimem.cp.async.bulk.global.shared::cta.bulk_group [dstMem], [srcMem], 512;
    
    multimem.cp.async.bulk.global.shared::cta.bulk_group.cp_mask [dstMem], [srcMem], size, byteMask;