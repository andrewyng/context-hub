---
name: ptx-reduxsync
description: Perform reduction operation on the data from each predicated active thread
  in the thread group.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.12. Parallel Synchronization and Communication Instructions:redux.sync

---
title: "9.7.13.12. Parallel Synchronization and Communication Instructions:redux.sync"
section: 9.7.13.12
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.12. Parallel Synchronization and Communication Instructions:redux.sync


`redux.sync`

Perform reduction operation on the data from each predicated active thread in the thread group.

Syntax

redux.sync.op.type dst, src, membermask;
    .op   = {.add, .min, .max}
    .type = {.u32, .s32}
    
    redux.sync.op.b32 dst, src, membermask;
    .op   = {.and, .or, .xor}
    
    redux.sync.op{.abs.}{.NaN}.f32 dst, src, membermask;
    .op   = { .min, .max }

Description

`redux.sync` will cause the executing thread to wait until all non-exited threads corresponding to `membermask` have executed `redux.sync` with the same qualifiers and same `membermask` value before resuming execution.

Operand `membermask` specifies a 32-bit integer which is a mask indicating threads participating in this instruction where the bit position corresponds to thread’s `laneid`.

`redux.sync` performs a reduction operation `.op` of the 32 bit source register `src` across all non-exited threads in the `membermask`. The result of the reduction operation is written to the 32 bit destination register `dst`.

Reduction operation can be one of the bitwise operation in `.and`, `.or`, `.xor` or arithmetic operation in `.add`, `.min` , `.max`.

For the `.add` operation result is truncated to 32 bits.

For `.f32` instruction type, if the input value is 0.0 then +0.0 > -0.0.

If `.abs` qualifier is specified, then the absolute value of the input is considered for the reduction operation.

If the `.NaN` qualifier is specified, then the result of the reduction operation is canonical NaN if the input to the reduction operation from any participating thread is NaN.

In the absence of `.NaN` qualifier, only non-NaN values are considered for the reduction operation and the result will be canonical NaN when all inputs are NaNs.

The behavior of `redux.sync` is undefined if the executing thread is not in the `membermask`.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for `.f32` type is introduced in PTX ISA version 8.6.

Support for `.abs` and `.NaN` qualifiers is introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_80` or higher.

`.f32` type requires `sm_100a` and is supported on `sm_100f` from PTX ISA version 8.8.

Qualifiers `.abs` and `.NaN` require `sm_100a` and are supported on `sm_100f` or higher in the same family from PTX ISA version 8.8.

Release Notes

Note that `redux.sync` applies to threads in a single warp, not across an entire CTA.

Examples

.reg .b32 dst, src, init, mask;
    redux.sync.add.s32 dst, src, 0xff;
    redux.sync.xor.b32 dst, src, mask;
    
    redux.sync.min.abs.NaN.f32 dst, src, mask;