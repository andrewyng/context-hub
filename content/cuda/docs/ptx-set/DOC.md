---
name: ptx-set
description: Compare two numeric values with a relational operator, and optionally
  combine this result with a predicate value by applying a Boolean operator.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.6.1. Comparison and Selection Instructions:set

---
title: "9.7.6.1. Comparison and Selection Instructions:set"
section: 9.7.6.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.6.1. Comparison and Selection Instructions:set


`set`

Compare two numeric values with a relational operator, and optionally combine this result with a predicate value by applying a Boolean operator.

Syntax

set.CmpOp{.ftz}.dtype.stype         d, a, b;
    set.CmpOp.BoolOp{.ftz}.dtype.stype  d, a, b, {!}c;
    
    .CmpOp  = { eq, ne, lt, le, gt, ge, lo, ls, hi, hs,
                equ, neu, ltu, leu, gtu, geu, num, nan };
    .BoolOp = { and, or, xor };
    .dtype  = { .u32, .s32, .f32 };
    .stype  = { .b16, .b32, .b64,
                .u16, .u32, .u64,
                .s16, .s32, .s64,
                      .f32, .f64 };

Description

Compares two numeric values and optionally combines the result with another predicate value by applying a Boolean operator. If this result is `True`, `1.0f` is written for floating-point destination types, and `0xffffffff` is written for integer destination types. Otherwise, `0x00000000` is written.

Operand `d` has type `.dtype`; operands `a` and `b` have type `.stype`; operand `c` has type `.pred`.

Semantics

t = (a CmpOp b) ? 1 : 0;
    if (isFloat(dtype))
        d = BoolOp(t, c) ? 1.0f : 0x00000000;
    else
        d = BoolOp(t, c) ? 0xffffffff : 0x00000000;

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

`set.ftz.dtype.f32` flushes subnormal inputs to sign-preserving zero.

`sm_1x`
    

`set.dtype.f64` supports subnormal numbers.

`set.dtype.f32` flushes subnormal inputs to sign-preserving zero.

Modifier `.ftz` applies only to `.f32` comparisons.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`set` with `.f64` source type requires `sm_13` or higher.

Examples

@p  set.lt.and.f32.s32  d,a,b,r;
        set.eq.u32.u32      d,i,n;