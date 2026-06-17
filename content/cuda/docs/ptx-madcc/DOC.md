---
name: ptx-madcc
description: Multiply two values, extract high or low half of result, and add a third
  value with carry-out.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.2.5. Extended-Precision Arithmetic Instructions:mad.cc

---
title: "9.7.2.5. Extended-Precision Arithmetic Instructions:mad.cc"
section: 9.7.2.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.2.5. Extended-Precision Arithmetic Instructions:mad.cc


`mad.cc`

Multiply two values, extract high or low half of result, and add a third value with carry-out.

Syntax

mad{.hi,.lo}.cc.type  d, a, b, c;
    
    .type = { .u32, .s32, .u64, .s64 };

Description

Multiplies two values, extracts either the high or low part of the result, and adds a third value. Writes the result to the destination register and the carry-out from the addition into the condition code register.

Semantics

t = a * b;
    d = t<63..32> + c;    // for .hi variant
    d = t<31..0> + c;     // for .lo variant

carry-out from addition is written to `CC.CF`

Notes

Generally used in combination with `madc` and `addc` to implement extended-precision multi-word multiplication. See `madc` for an example.

PTX ISA Notes

32-bit `mad.cc` introduced in PTX ISA version 3.0.

64-bit `mad.cc` introduced in PTX ISA version 4.3.

Target ISA Notes

Requires target `sm_20` or higher.

Examples

@p  mad.lo.cc.u32 d,a,b,c;
        mad.lo.cc.u32 r,p,q,r;