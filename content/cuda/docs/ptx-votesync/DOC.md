---
name: ptx-votesync
description: Vote across thread group.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.9. Parallel Synchronization and Communication Instructions:vote.sync

---
title: "9.7.13.9. Parallel Synchronization and Communication Instructions:vote.sync"
section: 9.7.13.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.9. Parallel Synchronization and Communication Instructions:vote.sync


`vote.sync`

Vote across thread group.

Syntax

vote.sync.mode.pred  d, {!}a, membermask;
    vote.sync.ballot.b32 d, {!}a, membermask;  // 'ballot' form, returns bitmask
    
    .mode = { .all, .any, .uni };

Description

`vote.sync` will cause executing thread to wait until all non-exited threads corresponding to `membermask` have executed `vote.sync` with the same qualifiers and same `membermask` value before resuming execution.

Operand `membermask` specifies a 32-bit integer which is a mask indicating threads participating in this instruction where the bit position corresponds to thread’s `laneid`. Operand `a` is a predicate register.

In the _mode_ form, `vote.sync` performs a reduction of the source predicate across all non-exited threads in `membermask`. The destination operand `d` is a predicate register and its value is the same across all threads in `membermask`.

The reduction modes are:

`.all`
    

`True` if source predicate is `True` for all non-exited threads in `membermask`. Negate the source predicate to compute `.none`.

`.any`
    

`True` if source predicate is `True` for some thread in `membermask`. Negate the source predicate to compute `.not_all`.

`.uni`
    

`True` if source predicate has the same value in all non-exited threads in `membermask`. Negating the source predicate also computes `.uni`.

In the _ballot_ form, the destination operand `d` is a `.b32` register. In this form, `vote.sync.ballot.b32` simply copies the predicate from each thread in `membermask` into the corresponding bit position of destination register `d`, where the bit position corresponds to the thread’s lane id.

A thread not specified in `membermask` will contribute a 0 for its entry in `vote.sync.ballot.b32`.

The behavior of `vote.sync` is undefined if the executing thread is not in the `membermask`.

Note

For .target `sm_6x` or below, all threads in `membermask` must execute the same `vote.sync` instruction in convergence, and only threads belonging to some `membermask` can be active when the `vote.sync` instruction is executed. Otherwise, the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

Requires `sm_30` or higher.

Examples

vote.sync.all.pred    p,q,0xffffffff;
    vote.sync.ballot.b32  r1,p,0xffffffff;  // get 'ballot' across warp