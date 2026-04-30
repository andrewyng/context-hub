---
name: ptx-setp
description: Compare two numeric values with a relational operator, and (optionally)
  combine this result with a predicate value by applying a Boolean operator.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.6.2. Comparison and Selection Instructions:setp

---
title: "9.7.6.2. Comparison and Selection Instructions:setp"
section: 9.7.6.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.6.2. Comparison and Selection Instructions:setp


`setp`

Compare two numeric values with a relational operator, and (optionally) combine this result with a predicate value by applying a Boolean operator.

Syntax

setp.CmpOp{.ftz}.type         p[|q], a, b;
    setp.CmpOp.BoolOp{.ftz}.type  p[|q], a, b, {!}c;
    
    .CmpOp  = { eq, ne, lt, le, gt, ge, lo, ls, hi, hs,
                equ, neu, ltu, leu, gtu, geu, num, nan };
    .BoolOp = { and, or, xor };
    .type   = { .b16, .b32, .b64,
                .u16, .u32, .u64,
                .s16, .s32, .s64,
                      .f32, .f64 };

Description

Compares two values and combines the result with another predicate value by applying a Boolean operator. This result is written to the first destination operand. A related value computed using the complement of the compare result is written to the second destination operand.

Applies to all numeric types. Operands `a` and `b` have type `.type`; operands `p`, `q`, and `c` have type `.pred`. The sink symbol ‘_’ may be used in place of any one of the destination operands.

Semantics

t = (a CmpOp b) ? 1 : 0;
    p = BoolOp(t, c);
    q = BoolOp(!t, c);

Integer Notes

The signed and unsigned comparison operators are `eq`, `ne`, `lt`, `le`, `gt`, `ge`.

For unsigned values, the comparison operators `lo`, `ls`, `hi`, and `hs` for lower, lower-or-same, higher, and higher-or-same may be used instead of `lt`, `le`, `gt`, `ge`, respectively.

The untyped, bit-size comparisons are `eq` and `ne`.

Floating Point Notes

The ordered comparisons are `eq`, `ne`, `lt`, `le`, `gt`, `ge`. If either operand is `NaN`, the result is `False`.

To aid comparison operations in the presence of `NaN` values, unordered versions are included: `equ`, `neu`, `ltu`, `leu`, `gtu`, `geu`. If both operands are numeric values (not `NaN`), then these comparisons have the same result as their ordered counterparts. If either operand is `NaN`, then the result of these comparisons is `True`.

`num` returns `True` if both operands are numeric values (not `NaN`), and `nan` returns `True` if either operand is `NaN`.

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`setp.ftz.dtype.f32` flushes subnormal inputs to sign-preserving zero.

`sm_1x`
    

`setp.dtype.f64` supports subnormal numbers.

`setp.dtype.f32` flushes subnormal inputs to sign-preserving zero.

Modifier `.ftz` applies only to `.f32` comparisons.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`setp` with `.f64` source type requires `sm_13` or higher.

Examples

setp.lt.and.s32  p|q,a,b,r;
    @q  setp.eq.u32      p,i,n;