---
name: ptx-add
description: Add 2 values.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.5.1. Mixed Precision Floating Point Instructions:add

---
title: "9.7.5.1. Mixed Precision Floating Point Instructions:add"
section: 9.7.5.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.5.1. Mixed Precision Floating Point Instructions:add


`add`

Add 2 values.

Syntax

add{.rnd}{.sat}.f32.atype  d, a, c;
    
    .atype = { .f16, .bf16};
    .rnd   = { .rn, .rz, .rm, .rp };

Description

Converts input operand `a` from `.atype` into `.f32` type. The converted value is then used for the addition. The resulting value is stored in the destination operand `d`.

Semantics

d = convert(a) + c;

Notes

Rounding modifiers:

`.rn`  
    

mantissa LSB rounds to nearest even

`.rz`
    

mantissa LSB rounds towards zero

`.rm`
    

mantissa LSB rounds towards negative infinity

`.rp`
    

mantissa LSB rounds towards positive infinity

The default value of rounding modifier is `.rn`. Note that an `add` instruction with an explicit rounding modifier is treated conservatively by the code optimizer. An `add` instruction with no rounding modifier defaults to round-to-nearest-even and may be optimized aggressively by the code optimizer. In particular, `mul`/`add` sequences with no rounding modifiers may be optimized to use fused-multiply-add instructions on the target device.

Subnormal numbers:
    

By default, subnormal numbers are supported.

Saturation modifier:
    

`add.sat` clamps the result to [0.0, 1.0]. `NaN` results are flushed to `+0.0f`.

PTX ISA Notes

`add.f32.{f16/bf16}` introduced in PTX ISA version 8.6.

Target ISA Notes

`add.f32.{f16/bf16}` requires `sm_100` or higher.

Examples

.reg .f32 fc, fd;
    .reg .b16 ba;
    add.rz.f32.bf16.sat   fd, fa, fc;