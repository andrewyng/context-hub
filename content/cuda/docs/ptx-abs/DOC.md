---
name: ptx-abs
description: Absolute value
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.4.6. Half Precision Floating Point Instructions:abs

---
title: "9.7.4.6. Half Precision Floating Point Instructions:abs"
section: 9.7.4.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.4.6. Half Precision Floating Point Instructions:abs


`abs`

Absolute value

Syntax

abs{.ftz}.f16    d, a;
    abs{.ftz}.f16x2  d, a;
    abs.bf16         d, a;
    abs.bf16x2       d, a;

Description

Take absolute value of `a` and store the result in `d`.

For `.f16x2` and `.bf16x2` instruction type, forms input vector by extracting half word values from the source operand. Absolute values of half-word operands are then computed in parallel to produce `.f16x2` or `.bf16x2` result in destination.

For `.f16` instruction type, operands `d` and `a` have `.f16` or `.b16` type. For `.f16x2` instruction type, operands `d` and `a` have `.f16x2` or `.b32` type. For `.bf16` instruction type, operands `d` and `a` have `.b16` type. For `.bf16x2` instruction type, operands `d` and `a` have `.b32` type.

Semantics

if (type == f16 || type == bf16) {
        d = |a|;
    } else if (type == f16x2 || type == bf16x2) {
        fA[0] = a[0:15];
        fA[1] = a[16:31];
        for (i = 0; i < 2; i++) {
             d[i] = |fA[i]|;
        }
    }

Notes

Subnormal numbers:
    

By default, subnormal numbers are supported. `abs.ftz.{f16, f16x2}` flushes subnormal inputs and results to sign-preserving zero.

`NaN` inputs yield an unspecified `NaN`. Future implementations may comply with the IEEE 754 standard by preserving payload and modifying only the sign bit.

PTX ISA Notes

Introduced in PTX ISA version 6.5.

`abs.bf16` and `abs.bf16x2` introduced in PTX ISA 7.0.

Target ISA Notes

Requires `sm_53` or higher.

`abs.bf16` and `abs.bf16x2` requires architecture `sm_80` or higher.

Examples

abs.ftz.f16  x,f0;
    abs.bf16     x,b0;
    abs.bf16x2   x1,b1;