---
name: ptx-subcc
description: Subtract one value from another, with borrow-out.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.2.3. Extended-Precision Arithmetic Instructions:sub.cc

---
title: "9.7.2.3. Extended-Precision Arithmetic Instructions:sub.cc"
section: 9.7.2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.2.3. Extended-Precision Arithmetic Instructions:sub.cc


`sub.cc`

Subtract one value from another, with borrow-out.

Syntax

sub.cc.type  d, a, b;
    
    .type = { .u32, .s32, .u64, .s64 };

Description

Performs integer subtraction and writes the borrow-out value into the condition code register.

Semantics

d = a - b;

borrow-out written to `CC.CF`

Notes

No integer rounding modifiers.

No saturation.

Behavior is the same for unsigned and signed integers.

PTX ISA Notes

32-bit `sub.cc` introduced in PTX ISA version 1.2.

64-bit `sub.cc` introduced in PTX ISA version 4.3.

Target ISA Notes

32-bit `sub.cc` is supported on all target architectures.

64-bit `sub.cc` requires `sm_20` or higher.

Examples

@p  sub.cc.u32   x1,y1,z1;   // extended-precision subtraction
    @p  subc.cc.u32  x2,y2,z2;   // of two 128-bit values
    @p  subc.cc.u32  x3,y3,z3;
    @p  subc.u32     x4,y4,z4;