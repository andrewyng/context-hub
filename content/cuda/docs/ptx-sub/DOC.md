---
name: ptx-sub
description: Subtract one value from another.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.4. Floating Point Instructions:sub

---
title: "9.7.3.4. Floating Point Instructions:sub"
section: 9.7.3.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.4. Floating Point Instructions:sub


`sub`

Subtract one value from another.

Syntax

sub{.rnd}{.ftz}{.sat}.f32  d, a, b;
    sub{.rnd}{.ftz}.f32x2      d, a, b;
    sub{.rnd}.f64              d, a, b;
    
    .rnd = { .rn, .rz, .rm, .rp };

Description

Performs subtraction and writes the resulting value into a destination register.

For `.f32x2` instruction type, forms input vectors of single precision (`.f32`) values from source operands. Single precision (`.f32`) operands are then subtracted in parallel to produce `.f32x2` result in destination.

For `.f32x2` instruction type, operands `d`, `a` and `b` have `.b64` type.

Semantics

if (type == f32 || type == f64) {
        d = a - b;
    } else if (type == f32x2) {
        fA[0] = a[0:31];
        fA[1] = a[32:63];
        fB[0] = b[0:31];
        fB[1] = b[32:63];
        for (i = 0; i < 2; i++) {
            d[i] = fA[i] - fB[i];
        }
    }

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

The default value of rounding modifier is `.rn`. Note that a `sub` instruction with an explicit rounding modifier is treated conservatively by the code optimizer. A `sub` instruction with no rounding modifier defaults to round-to-nearest-even and may be optimized aggressively by the code optimizer. In particular, `mul`/`sub` sequences with no rounding modifiers may be optimized to use fused-multiply-add instructions on the target device.

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`sub.ftz.f32`, `sub.ftz.f32x2` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`sub.f64` supports subnormal numbers.

`sub.f32` flushes subnormal inputs and results to sign-preserving zero.

Saturation modifier:

`sub.sat.f32` clamps the result to [0.0, 1.0]. NaN results are flushed to `+0.0f`.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

`sub.f32x2` introduced in PTX ISA version 8.6.

Target ISA Notes

`sub.f32` supported on all target architectures.

`sub.f64` requires `sm_13` or higher.

Rounding modifiers have the following target requirements:

`.rn`, `.rz`
    

available for all targets

`.rm`, `.rp`
    

for `sub.f64`, requires `sm_13` or higher.

for `sub.f32`, requires `sm_20` or higher.

`sub.f32x2` requires `sm_100` or higher.

Examples

sub.f32 c,a,b;
    sub.rn.ftz.f32  f1,f2,f3;