---
name: ptx-barwarpsync
description: Barrier synchronization for threads in a warp.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.2. Parallel Synchronization and Communication Instructions:bar.warp.sync

---
title: "9.7.13.2. Parallel Synchronization and Communication Instructions:bar.warp.sync"
section: 9.7.13.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.2. Parallel Synchronization and Communication Instructions:bar.warp.sync


`bar.warp.sync`

Barrier synchronization for threads in a warp.

Syntax

bar.warp.sync      membermask;

Description

`bar.warp.sync` will cause executing thread to wait until all threads corresponding to `membermask` have executed a `bar.warp.sync` with the same `membermask` value before resuming execution.

Operand `membermask` specifies a 32-bit integer which is a mask indicating threads participating in barrier where the bit position corresponds to thread’s `laneid`.

The behavior of `bar.warp.sync` is undefined if the executing thread is not in the `membermask`.

`bar.warp.sync` also guarantee memory ordering among threads participating in barrier. Thus, threads within warp that wish to communicate via memory can store to memory, execute `bar.warp.sync`, and then safely read values stored by other threads in warp.

Note

For .target `sm_6x` or below, all threads in `membermask` must execute the same `bar.warp.sync` instruction in convergence, and only threads belonging to some `membermask` can be active when the `bar.warp.sync` instruction is executed. Otherwise, the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

Requires `sm_30` or higher.

Examples

st.shared.u32 [r0],r1;         // write my result to shared memory
    bar.warp.sync  0xffffffff;     // arrive, wait for others to arrive
    ld.shared.u32 r2,[r3];         // read results written by other threads