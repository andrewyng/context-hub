---
name: ptx-sin
description: Find the sine of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.18. Floating Point Instructions:sin

---
title: "9.7.3.18. Floating Point Instructions:sin"
section: 9.7.3.18
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.18. Floating Point Instructions:sin


`sin`

Find the sine of a value.

Syntax

sin.approx{.ftz}.f32  d, a;

Description

Find the sine of the angle `a` (in radians).

Semantics

d = sin(a);

Notes

`sin.approx.f32` implements a fast approximation to sine.

Input | Result  
---|---  
-Inf | NaN  
-0.0 | -0.0  
+0.0 | +0.0  
+Inf | NaN  
NaN | NaN

The maximum absolute error over input range is as follows:

Range | [-2pi .. 2pi] | [-100pi .. +100pi]  
---|---|---  
Error | 2-20.5 | 2-14.7

Outside of the range [-100pi .. +100pi], only best effort is provided. There are no defined error guarantees.

Subnormal numbers:

`sm_20+`  
    

By default, subnormal numbers are supported.

`sin.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

Subnormal inputs and results to sign-preserving zero.

PTX ISA Notes

`sin.f32` introduced in PTX ISA version 1.0. Explicit modifiers `.approx` and `.ftz` introduced in PTX ISA version 1.4.

For PTX ISA version 1.4 and later, the .approx modifier is required.

For PTX ISA versions 1.0 through 1.3, `sin.f32` defaults to `sin.approx.ftz.f32`.

Target ISA Notes

Supported on all target architectures.

Examples

sin.approx.ftz.f32  sa, a;