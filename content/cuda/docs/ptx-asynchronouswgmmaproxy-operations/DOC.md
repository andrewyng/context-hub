---
name: ptx-asynchronouswgmmaproxy-operations
description: This section describes warpgroup level `wgmma.fence`, `wgmma.commit_group`
  and `wgmma.wait_group` instructions.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.15.7. AsynchronouswgmmaProxy Operations

---
title: "9.7.15.7. AsynchronouswgmmaProxy Operations"
section: 9.7.15.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.15.7. AsynchronouswgmmaProxy Operations


This section describes warpgroup level `wgmma.fence`, `wgmma.commit_group` and `wgmma.wait_group` instructions.

#####  9.7.15.7.1. [Asynchronous Multiply-and-Accumulate Instruction: `wgmma.fence`](<#asynchronous-warpgroup-level-matrix-instructions-wgmma-fence>)

`wgmma.fence`

Enforce an ordering of register accesses between `wgmma.mma_async` and other operations.

Syntax
    
    
    wgmma.fence.sync.aligned;
    

Description

`wgmma.fence` instruction establishes an ordering between prior accesses to any warpgroup registers and subsequent accesses to the same registers by a `wgmma.mma_async` instruction. Only the accumulator register and the input registers containing the fragments of matrix A require this ordering.

The `wgmma.fence` instruction must be issued by all warps of the warpgroup at the following locations:

  * Before the first `wgmma.mma_async` operation in a warpgroup.

  * Between a register access by a thread in the warpgroup and any `wgmma.mma_async` instruction that accesses the same registers, either as accumulator or input register containing fragments of matrix A, except when these are accumulator register accesses across multiple `wgmma.mma_async` instructions of the same shape. In the latter case, an ordering guarantee is provided by default.


Otherwise, the behavior is undefined.

An async proxy fence must be used to establish an ordering between prior writes to shared memory matrices and subsequent reads of the same matrices in a `wgmma.mma_async` instruction.

The mandatory `.sync` qualifier indicates that `wgmma.fence` instruction causes the executing thread to wait until all threads in the warp execute the same `wgmma.fence` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warpgroup must execute the same `wgmma.fence` instruction. In conditionally executed code, an `wgmma.fence` instruction should only be used if it is known that all threads in the warpgroup evaluate the condition identically, otherwise the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90a`.

Examples
    
    
    // Example 1, first use example:
    wgmma.fence.sync.aligned;    // Establishes an ordering w.r.t. prior accesses to the registers s32d<0-3>
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.u8  {s32d0, s32d1, s32d2, s32d3},
                                                      descA, descB, scaleD;
    wgmma.commit_group.sync.aligned;
    wgmma.wait_group.sync.aligned 0;
    
    // Example 2, use-case with the input value updated in between:
    wgmma.fence.sync.aligned;
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.u8  {s32d0, s32d1, s32d2, s32d3},
                                                      descA, descB, scaleD;
    ...
    mov.b32 s32d0, new_val;
    wgmma.fence.sync.aligned;
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.u8  {s32d4, s32d5, s32d6, s32d7},
                                                     {s32d0, s32d1, s32d2, s32d3},
                                                      descB, scaleD;
    wgmma.commit_group.sync.aligned;
    wgmma.wait_group.sync.aligned 0;

#####  9.7.15.7.2. [Asynchronous Multiply-and-Accumulate Instruction: `wgmma.commit_group`](<#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group>)

`wgmma.commit_group`

Commits all prior uncommitted `wgmma.mma_async` operations into a _wgmma-group_.

Syntax
    
    
    wgmma.commit_group.sync.aligned;
    

Description

`wgmma.commit_group` instruction creates a new wgmma-group per warpgroup and batches all prior `wgmma.mma_async` instructions initiated by the executing warp but not committed to any wgmma-group into the new wgmma-group. If there are no uncommitted `wgmma.mma_async` instructions then `wgmma.commit_group` results in an empty wgmma-group.

An executing thread can wait for the completion of all `wgmma.mma_async` operations in a wgmma-group by using `wgmma.wait_group`.

The mandatory `.sync` qualifier indicates that `wgmma.commit_group` instruction causes the executing thread to wait until all threads in the warp execute the same `wgmma.commit_group` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warpgroup must execute the same `wgmma.commit_group` instruction. In conditionally executed code, an `wgmma.commit_group` instruction should only be used if it is known that all threads in the warpgroup evaluate the condition identically, otherwise the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90a`.

Examples
    
    
    wgmma.commit_group.sync.aligned;

#####  9.7.15.7.3. [Asynchronous Multiply-and-Accumulate Instruction: `wgmma.wait_group`](<#asynchronous-warpgroup-level-matrix-instructions-wgmma-wait-group>)

`wgmma.wait_group`

Signal the completion of a preceding warpgroup operation.

Syntax
    
    
    wgmma.wait_group.sync.aligned N;
    

Description

`wgmma.wait_group` instruction will cause the executing thread to wait until only N or fewer of the most recent wgmma-groups are pending and all the prior wgmma-groups committed by the executing threads are complete. For example, when N is 0, the executing thread waits on all the prior wgmma-groups to complete. Operand N is an integer constant.

Accessing the accumulator register or the input register containing the fragments of matrix A of a `wgmma.mma_async` instruction without first performing a `wgmma.wait_group` instruction that waits on a _wgmma-group_ including that `wgmma.mma_async` instruction is undefined behavior.

The mandatory `.sync` qualifier indicates that `wgmma.wait_group` instruction causes the executing thread to wait until all threads in the warp execute the same `wgmma.wait_group` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warpgroup must execute the same `wgmma.wait_group` instruction. In conditionally executed code, an `wgmma.wait_group` instruction should only be used if it is known that all threads in the warpgroup evaluate the condition identically, otherwise the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90a`.

Examples
    
    
    wgmma.fence.sync.aligned;
    
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.u8  {s32d0, s32d1, s32d2, s32d3},
                                                      descA, descB, scaleD;
    wgmma.commit_group.sync.aligned;
    
    wgmma.mma_async.sync.aligned.m64n8k16.f32.f16.f16 {f32d0, f32d1, f32d2, f32d3},
                                                      {f16a0, f16a1, f16a2, f16a3},
                                                       descB, 1, -1, -1, 1;
    wgmma.commit_group.sync.aligned;
    
    wgmma.wait_group.sync.aligned 0;