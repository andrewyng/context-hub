---
name: ptx-bfind
description: Find most significant non-sign bit.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.16. Integer Arithmetic Instructions:bfind

---
title: "9.7.1.16. Integer Arithmetic Instructions:bfind"
section: 9.7.1.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.16. Integer Arithmetic Instructions:bfind


`bfind`

Find most significant non-sign bit.

Syntax

bfind.type           d, a;
    bfind.shiftamt.type  d, a;
    
    .type = { .u32, .u64,
              .s32, .s64 };

Description

Find the bit position of the most significant non-sign bit in `a` and place the result in `d`. Operand `a` has the instruction type, and destination `d` has type `.u32`. For unsigned integers, `bfind` returns the bit position of the most significant `1`. For signed integers, `bfind` returns the bit position of the most significant `0` for negative inputs and the most significant `1` for non-negative inputs.

If `.shiftamt` is specified, `bfind` returns the shift amount needed to left-shift the found bit into the most-significant bit position.

`bfind` returns `0xffffffff` if no non-sign bit is found.

Semantics

msb = (.type==.u32 || .type==.s32) ? 31 : 63;
    // negate negative signed inputs
    if ( (.type==.s32 || .type==.s64) && (a & (1<<msb)) ) {
        a = ~a;
    }
    .u32  d = 0xffffffff;
    for (.s32 i=msb; i>=0; i--) {
        if (a & (1<<i))  { d = i; break; }
    }
    if (.shiftamt && d != 0xffffffff)  { d = msb - d; }

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`bfind` requires `sm_20` or higher.

Examples

bfind.u32  d, a;
    bfind.shiftamt.s64  cnt, X;  // cnt is .u32