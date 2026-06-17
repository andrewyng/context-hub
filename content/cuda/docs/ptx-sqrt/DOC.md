---
name: ptx-sqrt
description: Take the square root of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.15. Floating Point Instructions:sqrt

---
title: "9.7.3.15. Floating Point Instructions:sqrt"
section: 9.7.3.15
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.15. Floating Point Instructions:sqrt


`sqrt`

Take the square root of a value.

Syntax

sqrt.approx{.ftz}.f32  d, a; // fast, approximate square root
    sqrt.rnd{.ftz}.f32     d, a; // IEEE 754 compliant rounding
    sqrt.rnd.f64           d, a; // IEEE 754 compliant rounding
    
    .rnd = { .rn, .rz, .rm, .rp };

Description

Compute sqrt(`a`) and store the result in `d`.

Semantics

d = sqrt(a);

Notes

`sqrt.approx.f32` implements a fast approximation to square root. The maximum relative error over the entire positive finite floating-point range is 2-23.

For various corner-case inputs, results of `sqrt` instruction are shown in below table:

Input | Result  
---|---  
-Inf | NaN  
-normal | NaN  
-0.0 | -0.0  
+0.0 | +0.0  
+Inf | +Inf  
NaN | NaN

Square root with IEEE 754 compliant rounding:

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

`sqrt.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`sqrt.f64` supports subnormal numbers.

`sqrt.f32` flushes subnormal inputs and results to sign-preserving zero.

PTX ISA Notes

`sqrt.f32` and `sqrt.f64` introduced in PTX ISA version 1.0. `sqrt.rn.f64` and explicit modifiers `.approx` and `.ftz` were introduced in PTX ISA version 1.4. General rounding modifiers were added in PTX ISA version 2.0.

For PTX ISA version 1.4 and later, one of `.approx` or `.rnd` is required.

For PTX ISA versions 1.0 through 1.3, `sqrt.f32` defaults to `sqrt.approx.ftz.f32`, and `sqrt.f64` defaults to `sqrt.rn.f64`.

Target ISA Notes

`sqrt.approx.f32` supported on all target architectures.

`sqrt.rnd.f32` requires `sm_20` or higher.

`sqrt.rn.f64` requires `sm_13` or higher, or `.target map_f64_to_f32`.

`sqrt.{rz,rm,rp}.f64` requires `sm_20` or higher.

Examples

sqrt.approx.ftz.f32  r,x;
    sqrt.rn.ftz.f32      r,x;
    sqrt.rn.f64          r,x;