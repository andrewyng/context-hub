---
name: ptx-cos
description: Find the cosine of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.19. Floating Point Instructions:cos

---
title: "9.7.3.19. Floating Point Instructions:cos"
section: 9.7.3.19
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.19. Floating Point Instructions:cos


`cos`

Find the cosine of a value.

Syntax

cos.approx{.ftz}.f32  d, a;

Description

Find the cosine of the angle `a` (in radians).

Semantics

d = cos(a);

Notes

`cos.approx.f32` implements a fast approximation to cosine.

Input | Result  
---|---  
-Inf | NaN  
-0.0 | +1.0  
+0.0 | +1.0  
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

`cos.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

Subnormal inputs and results to sign-preserving zero.

PTX ISA Notes

`cos.f32` introduced in PTX ISA version 1.0. Explicit modifiers `.approx` and `.ftz` introduced in PTX ISA version 1.4.

For PTX ISA version 1.4 and later, the `.approx` modifier is required.

For PTX ISA versions 1.0 through 1.3, `cos.f32` defaults to `cos.approx.ftz.f32`.

Target ISA Notes

Supported on all target architectures.

Examples

cos.approx.ftz.f32  ca, a;