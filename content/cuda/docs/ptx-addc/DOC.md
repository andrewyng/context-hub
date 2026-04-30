---
name: ptx-addc
description: Add two values with carry-in and optional carry-out.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.2.2. Extended-Precision Arithmetic Instructions:addc

---
title: "9.7.2.2. Extended-Precision Arithmetic Instructions:addc"
section: 9.7.2.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.2.2. Extended-Precision Arithmetic Instructions:addc


`addc`

Add two values with carry-in and optional carry-out.

Syntax

addc{.cc}.type  d, a, b;
    
    .type = { .u32, .s32, .u64, .s64 };

Description

Performs integer addition with carry-in and optionally writes the carry-out value into the condition code register.

Semantics

d = a + b + CC.CF;

if `.cc` specified, carry-out written to `CC.CF`

Notes

No integer rounding modifiers.

No saturation.

Behavior is the same for unsigned and signed integers.

PTX ISA Notes

32-bit `addc` introduced in PTX ISA version 1.2.

64-bit `addc` introduced in PTX ISA version 4.3.

Target ISA Notes

32-bit `addc` is supported on all target architectures.

64-bit `addc` requires `sm_20` or higher.

Examples

@p  add.cc.u32   x1,y1,z1;   // extended-precision addition of
    @p  addc.cc.u32  x2,y2,z2;   // two 128-bit values
    @p  addc.cc.u32  x3,y3,z3;
    @p  addc.u32     x4,y4,z4;