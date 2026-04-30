---
name: ptx-rsqrt
description: Take the reciprocal of the square root of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.16. Floating Point Instructions:rsqrt

---
title: "9.7.3.16. Floating Point Instructions:rsqrt"
section: 9.7.3.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.16. Floating Point Instructions:rsqrt


`rsqrt`

Take the reciprocal of the square root of a value.

Syntax

rsqrt.approx{.ftz}.f32  d, a;
    rsqrt.approx.f64        d, a;

Description

Compute `1/sqrt(a)` and store the result in `d`.

Semantics

d = 1/sqrt(a);

Notes

`rsqrt.approx` implements an approximation to the reciprocal square root.

Input | Result  
---|---  
-Inf | NaN  
-normal | NaN  
-0.0 | -Inf  
+0.0 | +Inf  
+Inf | +0.0  
NaN | NaN

The maximum relative error for `rsqrt.f32` over the entire positive finite floating-point range is 2-22.9.

Subnormal numbers:

`sm_20+`  
    

By default, subnormal numbers are supported.

`rsqrt.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`rsqrt.f64` supports subnormal numbers.

`rsqrt.f32` flushes subnormal inputs and results to sign-preserving zero.

Note that `rsqrt.approx.f64` is emulated in software and are relatively slow.

PTX ISA Notes

`rsqrt.f32` and `rsqrt.f64` were introduced in PTX ISA version 1.0. Explicit modifiers `.approx` and `.ftz` were introduced in PTX ISA version 1.4.

For PTX ISA version 1.4 and later, the `.approx` modifier is required.

For PTX ISA versions 1.0 through 1.3, `rsqrt.f32` defaults to `rsqrt.approx.ftz.f32`, and `rsqrt.f64` defaults to `rsqrt.approx.f64`.

Target ISA Notes

`rsqrt.f32` supported on all target architectures.

`rsqrt.f64` requires `sm_13` or higher.

Examples

rsqrt.approx.ftz.f32  isr, x;
    rsqrt.approx.f64      ISR, X;