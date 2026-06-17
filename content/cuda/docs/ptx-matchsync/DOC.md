---
name: ptx-matchsync
description: Broadcast and compare a value across threads in warp.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.10. Parallel Synchronization and Communication Instructions:match.sync

---
title: "9.7.13.10. Parallel Synchronization and Communication Instructions:match.sync"
section: 9.7.13.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.10. Parallel Synchronization and Communication Instructions:match.sync


`match.sync`

Broadcast and compare a value across threads in warp.

Syntax

match.any.sync.type  d, a, membermask;
    match.all.sync.type  d[|p], a, membermask;
    
    .type = { .b32, .b64 };

Description

`match.sync` will cause executing thread to wait until all non-exited threads from `membermask` have executed `match.sync` with the same qualifiers and same `membermask` value before resuming execution.

Operand `membermask` specifies a 32-bit integer which is a mask indicating threads participating in this instruction where the bit position corresponds to thread’s laneid.

`match.sync` performs broadcast and compare of operand `a` across all non-exited threads in `membermask` and sets destination `d` and optional predicate `p` based on mode.

Operand `a` has instruction type and `d` has `.b32` type.

Destination `d` is a 32-bit mask where bit position in mask corresponds to thread’s laneid.

The matching operation modes are:

`.all`
    

`d` is set to mask corresponding to non-exited threads in `membermask` if all non-exited threads in `membermask` have same value of operand `a`; otherwise `d` is set to 0. Optionally predicate `p` is set to true if all non-exited threads in `membermask` have same value of operand `a`; otherwise `p` is set to false. The sink symbol ‘_’ may be used in place of any one of the destination operands.

`.any`
    

`d` is set to mask of non-exited threads in `membermask` that have same value of operand `a`.

The behavior of `match.sync` is undefined if the executing thread is not in the `membermask`.

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

Requires `sm_70` or higher.

Release Notes

Note that `match.sync` applies to threads in a single warp, not across an entire CTA.

Examples

match.any.sync.b32    d, a, 0xffffffff;
    match.all.sync.b64    d|p, a, mask;