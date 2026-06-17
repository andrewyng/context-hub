---
name: ptx-rcp
description: Take the reciprocal of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.13. Floating Point Instructions:rcp

---
title: "9.7.3.13. Floating Point Instructions:rcp"
section: 9.7.3.13
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.13. Floating Point Instructions:rcp


`rcp`

Take the reciprocal of a value.

Syntax

rcp.approx{.ftz}.f32  d, a;  // fast, approximate reciprocal
    rcp.rnd{.ftz}.f32     d, a;  // IEEE 754 compliant rounding
    rcp.rnd.f64           d, a;  // IEEE 754 compliant rounding
    
    .rnd = { .rn, .rz, .rm, .rp };

Description

Compute `1/a`, store result in `d`.

Semantics

d = 1 / a;

Notes

Fast, approximate single-precision reciprocal:

`rcp.approx.f32` implements a fast approximation to reciprocal. The maximum ulp error is 1 across the full range of inputs.

Input | Result  
---|---  
-Inf | -0.0  
-0.0 | -Inf  
+0.0 | +Inf  
+Inf | +0.0  
NaN | NaN

Reciprocal with IEEE 754 compliant rounding:

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

`rcp.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`rcp.f64` supports subnormal numbers.

`rcp.f32` flushes subnormal inputs and results to sign-preserving zero.

PTX ISA Notes

`rcp.f32` and `rcp.f64` introduced in PTX ISA version 1.0. `rcp.rn.f64` and explicit modifiers `.approx` and `.ftz` were introduced in PTX ISA version 1.4. General rounding modifiers were added in PTX ISA version 2.0.

For PTX ISA version 1.4 and later, one of `.approx` or `.rnd` is required.

For PTX ISA versions 1.0 through 1.3, `rcp.f32` defaults to `rcp.approx.ftz.f32`, and `rcp.f64` defaults to `rcp.rn.f64`.

Target ISA Notes

`rcp.approx.f32` supported on all target architectures.

`rcp.rnd.f32` requires `sm_20` or higher.

`rcp.rn.f64` requires `sm_13` or higher, or `.target map_f64_to_f32.`

`rcp.{rz,rm,rp}.f64` requires `sm_20` or higher.

Examples

rcp.approx.ftz.f32  ri,r;
    rcp.rn.ftz.f32      xi,x;
    rcp.rn.f64          xi,x;