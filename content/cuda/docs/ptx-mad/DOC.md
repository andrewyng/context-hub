---
name: ptx-mad
description: Multiply two values, optionally extract the high or low half of the intermediate
  result, and add a third value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.4. Integer Arithmetic Instructions:mad

---
title: "9.7.1.4. Integer Arithmetic Instructions:mad"
section: 9.7.1.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.4. Integer Arithmetic Instructions:mad


`mad`

Multiply two values, optionally extract the high or low half of the intermediate result, and add a third value.

Syntax

mad.mode.type  d, a, b, c;
    mad.hi.sat.s32 d, a, b, c;
    
    .mode = { .hi, .lo, .wide };
    .type = { .u16, .u32, .u64,
              .s16, .s32, .s64 };

Description

Multiplies two values, optionally extracts the high or low half of the intermediate result, and adds a third value. Writes the result into a destination register.

Semantics

t = a * b;
    n = bitwidth of type;
    d = t + c;           // for .wide
    d = t<2n-1..n> + c;  // for .hi variant
    d = t<n-1..0> + c;   // for .lo variant

Notes

The type of the operation represents the types of the `a` and `b` operands. If .hi or .lo is specified, then `d` and `c` are the same size as `a` and `b`, and either the upper or lower half of the result is written to the destination register. If `.wide` is specified, then `d` and `c` are twice as wide as `a` and `b` to receive the result of the multiplication.

The `.wide` suffix is supported only for 16-bit and 32-bit integer types.

Saturation modifier:

`.sat`
    

limits result to `MININT..MAXINT` (no overflow) for the size of the operation.

Applies only to `.s32` type in `.hi` mode.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

@p  mad.lo.s32 d,a,b,c;
        mad.lo.s32 r,p,q,r;