---
name: ptx-shflsync
description: Register data shuffle within threads of a warp.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.6. Data Movement and Conversion Instructions:shfl.sync

---
title: "9.7.9.6. Data Movement and Conversion Instructions:shfl.sync"
section: 9.7.9.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.6. Data Movement and Conversion Instructions:shfl.sync


`shfl.sync`

Register data shuffle within threads of a warp.

Syntax

shfl.sync.mode.b32  d[|p], a, b, c, membermask;
    
    .mode = { .up, .down, .bfly, .idx };

Description

Exchange register data between threads of a warp.

`shfl.sync` will cause executing thread to wait until all non-exited threads corresponding to `membermask` have executed `shfl.sync` with the same qualifiers and same `membermask` value before resuming execution.

Operand `membermask` specifies a 32-bit integer which is a mask indicating threads participating in barrier where the bit position corresponds to thread’s `laneid`.

`shfl.sync` exchanges register data between threads in `membermask`.

Each thread in the currently executing warp will compute a source lane index _j_ based on input operands `b` and `c` and the _mode_. If the computed source lane index _j_ is in range, the thread will copy the input operand `a` from lane _j_ into its own destination register `d`; otherwise, the thread will simply copy its own input `a` to destination `d`. The optional destination predicate `p` is set to `True` if the computed source lane is in range, and otherwise set to `False`.

Note that an out of range value of `b` may still result in a valid computed source lane index _j_. In this case, a data transfer occurs and the destination predicate `p` is True.

Note that results are undefined if a thread sources a register from an inactive thread or a thread that is not in `membermask`.

Operand `b` specifies a source lane or source lane offset, depending on the mode.

Operand `c` contains two packed values specifying a mask for logically splitting warps into sub-segments and an upper bound for clamping the source lane index.

The behavior of `shfl.sync` is undefined if the executing thread is not in the `membermask`.

Note

For .target `sm_6x` or below, all threads in `membermask` must execute the same `shfl.sync` instruction in convergence, and only threads belonging to some `membermask` can be active when the `shfl.sync` instruction is executed. Otherwise, the behavior is undefined.

Semantics

// wait for all threads in membermask to arrive
    wait_for_specified_threads(membermask);
    
    lane[4:0]  = [Thread].laneid;  // position of thread in warp
    bval[4:0] = b[4:0];            // source lane or lane offset (0..31)
    cval[4:0] = c[4:0];            // clamp value
    segmask[4:0] = c[12:8];
    
    // get value of source register a if thread is active and
    // guard predicate true, else unpredictable
    if (isActive(Thread) && isGuardPredicateTrue(Thread)) {
        SourceA[lane] = a;
    } else {
        // Value of SourceA[lane] is unpredictable for
        // inactive/predicated-off threads in warp
    }
    maxLane = (lane[4:0] & segmask[4:0]) | (cval[4:0] & ~segmask[4:0]);
    minLane = (lane[4:0] & segmask[4:0]);
    
    switch (.mode) {
        case .up:    j = lane - bval; pval = (j >= maxLane); break;
        case .down:  j = lane + bval; pval = (j <= maxLane); break;
        case .bfly:  j = lane ^ bval; pval = (j <= maxLane); break;
        case .idx:   j = minLane  | (bval[4:0] & ~segmask[4:0]);
                                     pval = (j <= maxLane); break;
    }
    if (!pval) j = lane;  // copy from own lane
    d = SourceA[j];       // copy input a from lane j
    if (dest predicate selected)
        p = pval;

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

Requires `sm_30` or higher.

Examples

shfl.sync.up.b32  Ry|p, Rx, 0x1,  0x0, 0xffffffff;