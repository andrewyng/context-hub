---
name: ptx-electsync
description: Elect a leader thread from a set of threads.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.14. Parallel Synchronization and Communication Instructions:elect.sync

---
title: "9.7.13.14. Parallel Synchronization and Communication Instructions:elect.sync"
section: 9.7.13.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.14. Parallel Synchronization and Communication Instructions:elect.sync


`elect.sync`

Elect a leader thread from a set of threads.

Syntax

elect.sync d|p, membermask;

Description

`elect.sync` elects one predicated active leader thread from among a set of threads specified by `membermask`. `laneid` of the elected thread is returned in the 32-bit destination operand `d`. The sink symbol ‘_’ can be used for destination operand `d`. The predicate destination `p` is set to `True` for the leader thread, and `False` for all other threads.

Operand `membermask` specifies a 32-bit integer indicating the set of threads from which a leader is to be elected. The behavior is undefined if the executing thread is not in `membermask`.

Election of a leader thread happens deterministically, i.e. the same leader thread is elected for the same `membermask` every time.

The mandatory `.sync` qualifier indicates that `elect` causes the executing thread to wait until all threads in the `membermask` execute the `elect` instruction before resuming execution.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples

elect.sync    %r0|%p0, 0xffffffff;