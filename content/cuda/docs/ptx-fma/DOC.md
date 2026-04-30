---
name: ptx-fma
description: Fused multiply-add.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.6. Floating Point Instructions:fma

---
title: "9.7.3.6. Floating Point Instructions:fma"
section: 9.7.3.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.6. Floating Point Instructions:fma


`fma`

Fused multiply-add.

Syntax

fma.rnd{.ftz}{.sat}.f32  d, a, b, c;
    fma.rnd{.ftz}.f32x2      d, a, b, c;
    fma.rnd.f64              d, a, b, c;
    
    .rnd = { .rn, .rz, .rm, .rp };

Description

Performs a fused multiply-add with no loss of precision in the intermediate product and addition.

For `.f32x2` instruction type, forms input vectors of single precision (`.f32`) values from source operands. Single precision (`.f32`) operands are then operated in parallel to produce `.f32x2` result in destination.

For `.f32x2` instruction type, operands `d`, `a`, `b` and `c` have `.b64` type.

Semantics

if (type == f32 || type == f64) {
        d = a * b + c;
    } else if (type == f32x2) {
        fA[0] = a[0:31];
        fA[1] = a[32:63];
        fB[0] = b[0:31];
        fB[1] = b[32:63];
        fC[0] = c[0:31];
        fC[1] = c[32:63];
        for (i = 0; i < 2; i++) {
            d[i] = fA[i] * fB[i] + fC[i];
        }
    }

Notes

`fma.f32` computes the product of `a` and `b` to infinite precision and then adds `c` to this product, again in infinite precision. The resulting value is then rounded to single precision using the rounding mode specified by `.rnd`.

`fma.f64` computes the product of `a` and `b` to infinite precision and then adds `c` to this product, again in infinite precision. The resulting value is then rounded to double precision using the rounding mode specified by `.rnd`.

`fma.f64` is the same as `mad.f64`.

Rounding modifiers (no default):

`.rn`
    

mantissa LSB rounds to nearest even

`.rz`
    

mantissa LSB rounds towards zero

`.rm`
    

mantissa LSB rounds towards negative infinity

`.rp`
    

mantissa LSB rounds towards positive infinity

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`fma.ftz.f32`, `fma.ftz.f32x2` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`fma.f64` supports subnormal numbers.

`fma.f32` is unimplemented for `sm_1x` targets.

Saturation:

`fma.sat.f32` clamps the result to [0.0, 1.0]. `NaN` results are flushed to `+0.0f`.

PTX ISA Notes

`fma.f64` introduced in PTX ISA version 1.4.

`fma.f32` introduced in PTX ISA version 2.0.

`fma.f32x2` introduced in PTX ISA version 8.6.

Target ISA Notes

`fma.f32` requires `sm_20` or higher.

`fma.f64` requires `sm_13` or higher.

`fma.f32x2` requires `sm_100` or higher.

Examples

fma.rn.ftz.f32  w,x,y,z;
    @p  fma.rn.f64      d,a,b,c;
        fma.rp.ftz.f32x2 p,q,r,s;