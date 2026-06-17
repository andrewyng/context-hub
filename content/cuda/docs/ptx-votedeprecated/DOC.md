---
name: ptx-votedeprecated
description: '`vote` (deprecated)'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.8. Parallel Synchronization and Communication Instructions:vote(deprecated)

---
title: "9.7.13.8. Parallel Synchronization and Communication Instructions:vote(deprecated)"
section: 9.7.13.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.8. Parallel Synchronization and Communication Instructions:vote(deprecated)


`vote` (deprecated)

Vote across thread group.

Syntax

vote.mode.pred  d, {!}a;
    vote.ballot.b32 d, {!}a;  // 'ballot' form, returns bitmask
    
    .mode = { .all, .any, .uni };

Deprecation Note

The `vote` instruction without a `.sync` qualifier is deprecated in PTX ISA version 6.0.

* Support for this instruction with `.target` lower than `sm_70` may be removed in a future PTX ISA version.

Removal Note

Support for `vote` instruction without a `.sync` qualifier is removed in PTX ISA version 6.4 for `.target` `sm_70` or higher.

Description

Performs a reduction of the source predicate across all active threads in a warp. The destination predicate value is the same across all threads in the warp.

The reduction modes are:

`.all`
    

`True` if source predicate is `True` for all active threads in warp. Negate the source predicate to compute `.none`.

`.any`
    

`True` if source predicate is `True` for some active thread in warp. Negate the source predicate to compute `.not_all`.

`.uni`
    

`True` if source predicate has the same value in all active threads in warp. Negating the source predicate also computes `.uni`.

In the _ballot_ form, `vote.ballot.b32` simply copies the predicate from each thread in a warp into the corresponding bit position of destination register `d`, where the bit position corresponds to the thread’s lane id.

An inactive thread in warp will contribute a 0 for its entry when participating in `vote.ballot.b32`.

PTX ISA Notes

Introduced in PTX ISA version 1.2.

Deprecated in PTX ISA version 6.0 in favor of `vote.sync`.

Not supported in PTX ISA version 6.4 for .target `sm_70` or higher.

Target ISA Notes

`vote` requires `sm_12` or higher.

`vote.ballot.b32` requires `sm_20` or higher.

`vote` is not supported on `sm_70` or higher starting PTX ISA version 6.4.

Release Notes

Note that `vote` applies to threads in a single warp, not across an entire CTA.

Examples

vote.all.pred    p,q;
    vote.uni.pred    p,q;
    vote.ballot.b32  r1,p;  // get 'ballot' across warp