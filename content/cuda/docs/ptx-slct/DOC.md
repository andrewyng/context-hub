---
name: ptx-slct
description: Select one source operand, based on the sign of the third operand.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.6.4. Comparison and Selection Instructions:slct

---
title: "9.7.6.4. Comparison and Selection Instructions:slct"
section: 9.7.6.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.6.4. Comparison and Selection Instructions:slct


`slct`

Select one source operand, based on the sign of the third operand.

Syntax

slct.dtype.s32        d, a, b, c;
    slct{.ftz}.dtype.f32  d, a, b, c;
    
    .dtype = { .b16, .b32, .b64,
               .u16, .u32, .u64,
               .s16, .s32, .s64,
                     .f32, .f64 };

Description

Conditional selection. If `c` >= 0, `a` is stored in `d`, otherwise `b` is stored in `d`. Operands `d`, `a`, and `b` are treated as a bitsize type of the same width as the first instruction type; operand `c` must match the second instruction type (`.s32` or `.f32`). The selected input is copied to the output without modification.

Semantics

d = (c >= 0) ? a : b;

Floating Point Notes

For `.f32` comparisons, negative zero equals zero.

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`slct.ftz.dtype.f32` flushes subnormal values of operand `c` to sign-preserving zero, and operand `a` is selected.

`sm_1x`
    

`slct.dtype.f32` flushes subnormal values of operand `c` to sign-preserving zero, and operand `a` is selected.

Modifier `.ftz` applies only to `.f32` comparisons.

If operand `c` is `NaN`, the comparison is ordered and operand `b` is selected.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`slct.f64` requires `sm_13` or higher.

Examples

slct.u32.s32  x, y, z, val;
    slct.ftz.u64.f32  A, B, C, fval;