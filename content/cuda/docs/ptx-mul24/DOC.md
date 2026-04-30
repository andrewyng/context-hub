---
name: ptx-mul24
description: Multiply two 24-bit integer values.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.5. Integer Arithmetic Instructions:mul24

---
title: "9.7.1.5. Integer Arithmetic Instructions:mul24"
section: 9.7.1.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.5. Integer Arithmetic Instructions:mul24


`mul24`

Multiply two 24-bit integer values.

Syntax

mul24.mode.type  d, a, b;
    
    .mode = { .hi, .lo };
    .type = { .u32, .s32 };

Description

Compute the product of two 24-bit integer values held in 32-bit source registers, and return either the high or low 32-bits of the 48-bit result.

Semantics

t = a * b;
    d = t<47..16>;    // for .hi variant
    d = t<31..0>;     // for .lo variant

Notes

Integer multiplication yields a result that is twice the size of the input operands, i.e., 48-bits.

`mul24.hi` performs a 24x24-bit multiply and returns the high 32 bits of the 48-bit result.

`mul24.lo` performs a 24x24-bit multiply and returns the low 32 bits of the 48-bit result.

All operands are of the same type and size.

`mul24.hi` may be less efficient on machines without hardware support for 24-bit multiply.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

mul24.lo.s32 d,a,b;   // low 32-bits of 24x24-bit signed multiply.