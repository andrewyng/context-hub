---
name: ptx-mad24
description: Multiply two 24-bit integer values and add a third value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.6. Integer Arithmetic Instructions:mad24

---
title: "9.7.1.6. Integer Arithmetic Instructions:mad24"
section: 9.7.1.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.6. Integer Arithmetic Instructions:mad24


`mad24`

Multiply two 24-bit integer values and add a third value.

Syntax

mad24.mode.type  d, a, b, c;
    mad24.hi.sat.s32 d, a, b, c;
    
    .mode = { .hi, .lo };
    .type = { .u32, .s32 };

Description

Compute the product of two 24-bit integer values held in 32-bit source registers, and add a third, 32-bit value to either the high or low 32-bits of the 48-bit result. Return either the high or low 32-bits of the 48-bit result.

Semantics

t = a * b;
    d = t<47..16> + c;   // for .hi variant
    d = t<31..0> + c;    // for .lo variant

Notes

Integer multiplication yields a result that is twice the size of the input operands, i.e., 48-bits.

`mad24.hi` performs a 24x24-bit multiply and adds the high 32 bits of the 48-bit result to a third value.

`mad24.lo` performs a 24x24-bit multiply and adds the low 32 bits of the 48-bit result to a third value.

All operands are of the same type and size.

Saturation modifier:

`.sat`
    

limits result of 32-bit signed addition to `MININT..MAXINT` (no overflow). Applies only to `.s32` type in .hi mode.

`mad24.hi` may be less efficient on machines without hardware support for 24-bit multiply.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

mad24.lo.s32 d,a,b,c;   // low 32-bits of 24x24-bit signed multiply.