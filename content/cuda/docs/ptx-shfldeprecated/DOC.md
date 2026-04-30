---
name: ptx-shfldeprecated
description: '`shfl` (deprecated)'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.5. Data Movement and Conversion Instructions:shfl(deprecated)

---
title: "9.7.9.5. Data Movement and Conversion Instructions:shfl(deprecated)"
section: 9.7.9.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.5. Data Movement and Conversion Instructions:shfl(deprecated)


`shfl` (deprecated)

Register data shuffle within threads of a warp.

Syntax

shfl.mode.b32  d[|p], a, b, c;
    
    .mode = { .up, .down, .bfly, .idx };

Deprecation Note

The `shfl` instruction without a `.sync` qualifier is deprecated in PTX ISA version 6.0.

* Support for this instruction with `.target` lower than `sm_70` may be removed in a future PTX ISA version.

Removal Note

Support for `shfl` instruction without a `.sync` qualifier is removed in PTX ISA version 6.4 for `.target` `sm_70` or higher.

Description

Exchange register data between threads of a warp.

Each thread in the currently executing warp will compute a source lane index _j_ based on input operands `b` and `c` and the _mode_. If the computed source lane index _j_ is in range, the thread will copy the input operand `a` from lane _j_ into its own destination register `d`; otherwise, the thread will simply copy its own input `a` to destination `d`. The optional destination predicate `p` is set to `True` if the computed source lane is in range, and otherwise set to `False`.

Note that an out of range value of `b` may still result in a valid computed source lane index _j_. In this case, a data transfer occurs and the destination predicate `p` is True.

Note that results are undefined in divergent control flow within a warp, if an active thread sources a register from an inactive thread.

Operand `b` specifies a source lane or source lane offset, depending on the mode.

Operand `c` contains two packed values specifying a mask for logically splitting warps into sub-segments and an upper bound for clamping the source lane index.

Semantics

lane[4:0]  = [Thread].laneid;  // position of thread in warp
    bval[4:0] = b[4:0];            // source lane or lane offset (0..31)
    cval[4:0] = c[4:0];            // clamp value
    mask[4:0] = c[12:8];
    
    // get value of source register a if thread is active and
    // guard predicate true, else unpredictable
    if (isActive(Thread) && isGuardPredicateTrue(Thread)) {
        SourceA[lane] = a;
    } else {
        // Value of SourceA[lane] is unpredictable for
        // inactive/predicated-off threads in warp
    }
    maxLane = (lane[4:0] & mask[4:0]) | (cval[4:0] & ~mask[4:0]);
    minLane = (lane[4:0] & mask[4:0]);
    
    switch (.mode) {
        case .up:    j = lane - bval; pval = (j >= maxLane); break;
        case .down:  j = lane + bval; pval = (j <= maxLane); break;
        case .bfly:  j = lane ^ bval; pval = (j <= maxLane); break;
        case .idx:   j = minLane  | (bval[4:0] & ~mask[4:0]);
                                     pval = (j <= maxLane); break;
    }
    if (!pval) j = lane;  // copy from own lane
    d = SourceA[j];       // copy input a from lane j
    if (dest predicate selected)
        p = pval;

PTX ISA Notes

Introduced in PTX ISA version 3.0.

Deprecated in PTX ISA version 6.0 in favor of `shfl.sync`.

Not supported in PTX ISA version 6.4 for .target `sm_70` or higher.

Target ISA Notes

`shfl` requires `sm_30` or higher.

`shfl` is not supported on `sm_70` or higher starting PTX ISA version 6.4.

Examples

// Warp-level INCLUSIVE PLUS SCAN:
        //
        // Assumes input in following registers:
        //     - Rx  = sequence value for this thread
        //
        shfl.up.b32  Ry|p, Rx, 0x1,  0x0;
    @p  add.f32      Rx, Ry, Rx;
        shfl.up.b32  Ry|p, Rx, 0x2,  0x0;
    @p  add.f32      Rx, Ry, Rx;
        shfl.up.b32  Ry|p, Rx, 0x4,  0x0;
    @p  add.f32      Rx, Ry, Rx;
        shfl.up.b32  Ry|p, Rx, 0x8,  0x0;
    @p  add.f32      Rx, Ry, Rx;
        shfl.up.b32  Ry|p, Rx, 0x10, 0x0;
    @p  add.f32      Rx, Ry, Rx;
    
    
        // Warp-level INCLUSIVE PLUS REVERSE-SCAN:
        //
        // Assumes input in following registers:
        //     - Rx  = sequence value for this thread
        //
        shfl.down.b32  Ry|p, Rx, 0x1,  0x1f;
    @p  add.f32        Rx, Ry, Rx;
        shfl.down.b32  Ry|p, Rx, 0x2,  0x1f;
    @p  add.f32        Rx, Ry, Rx;
        shfl.down.b32  Ry|p, Rx, 0x4,  0x1f;
    @p  add.f32        Rx, Ry, Rx;
        shfl.down.b32  Ry|p, Rx, 0x8,  0x1f;
    @p  add.f32        Rx, Ry, Rx;
        shfl.down.b32  Ry|p, Rx, 0x10, 0x1f;
    @p  add.f32        Rx, Ry, Rx;
    
    
        // BUTTERFLY REDUCTION:
        //
        // Assumes input in following registers:
        //     - Rx  = sequence value for this thread
        //
        shfl.bfly.b32  Ry, Rx, 0x10, 0x1f;   // no predicate dest
        add.f32        Rx, Ry, Rx;
        shfl.bfly.b32  Ry, Rx, 0x8,  0x1f;
        add.f32        Rx, Ry, Rx;
        shfl.bfly.b32  Ry, Rx, 0x4,  0x1f;
        add.f32        Rx, Ry, Rx;
        shfl.bfly.b32  Ry, Rx, 0x2,  0x1f;
        add.f32        Rx, Ry, Rx;
        shfl.bfly.b32  Ry, Rx, 0x1,  0x1f;
        add.f32        Rx, Ry, Rx;
        //
        // All threads now hold sum in Rx