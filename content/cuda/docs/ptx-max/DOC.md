---
name: ptx-max
description: Find the maximum of given values.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.12. Floating Point Instructions:max

---
title: "9.7.3.12. Floating Point Instructions:max"
section: 9.7.3.12
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.12. Floating Point Instructions:max


`max`

Find the maximum of given values.

Syntax

max{.ftz}{.NaN}{.xorsign.abs}.f32  d, a, b;
    max{.ftz}{.NaN}{.abs}.f32          d, a, b, c;
    max.f64                            d, a, b;

Description

Store the maximum of `a`, `b` and optionally `c` in `d`.

If `.NaN` modifier is specified, the result is canonical `NaN` if any of the inputs is `NaN`.

If `.abs` modifier is specified, the magnitude of destination operand `d` is the maximum of absolute values of the input arguments.

If `.xorsign` modifier is specified, the sign bit of destination `d` is equal to the XOR of the sign bits of the inputs: `a` and `b`. The `.xorsign` qualifier cannot be specified for three inputs operation.

Qualifier `.xorsign` requires qualifier `.abs` to be specified. In such cases, `.xorsign` considers the sign bit of both inputs before applying `.abs` operation.

If the result of `max` is `NaN` then the `.xorsign` and `.abs` modifiers will be ignored.

Semantics

def max_num (z, x, y) {
        if (isNaN(x) && isNaN(y))
            z = NaN;
        else if (isNaN(x))
            z = y;
        else if (isNaN(y))
            z = x;
        else
            // note: +0.0 > -0.0 here
            z = (x > y) ? x : y;
        return z;
    }
    
    def max_nan (z, x, y) {
        if (isNaN(x) || isNaN(y))
            z = NaN;
        else
            // note: +0.0 > -0.0 here
            z = (x > y) ? x : y;
        return z;
    }
    
    def two_inputs_max (z, x, y) {
        if (.NaN)
            z = max_nan(z, x, y);
        else
            z = max_num(z, x, y);
        return z;
    }
    
    if (.xorsign && !isPresent(c)) {
        xorsign = getSignBit(a) ^ getSignBit(b);
    }
    if (.abs) {
        a = |a|;
        b = |b|;
        if (isPresent(c)) {
            c = |c|;
        }
    }
    
    d = two_inputs_max (d, a, b)
    if (isPresent(c)) {
        d = two_inputs_max (d, d, c)
    }
    
    if (.xorsign && !isPresent(c) !isNaN(d)) {
        setSignBit(d, xorsign);
    }

Notes

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`max.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`max.f64` supports subnormal numbers.

`max.f32` flushes subnormal inputs and results to sign-preserving zero.

If values of both inputs are 0.0, then +0.0 > -0.0.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

`max.NaN` introduced in PTX ISA version 7.0.

`max.xorsign.abs` introduced in PTX ISA version 7.2.

`max` with three input arguments introduced in PTX ISA version 8.8.

Target ISA Notes

`max.f32` supported on all target architectures.

`max.f64` requires `sm_13` or higher.

`max.NaN` requires `sm_80` or higher.

`max.xorsign.abs` requires `sm_86` or higher.

`max` with three input arguments requires `sm_100` or higher.

Examples

max.ftz.f32  f0,f1,f2;
    max.f64      a,b,c;
    // fp32 max with .NaN
    max.NaN.f32  f0,f1,f2;
    // fp32 max with .xorsign.abs
    max.xorsign.abs.f32 Rd, Ra, Rb;