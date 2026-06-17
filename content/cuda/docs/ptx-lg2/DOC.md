---
name: ptx-lg2
description: Find the base-2 logarithm of a value.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.20. Floating Point Instructions:lg2

---
title: "9.7.3.20. Floating Point Instructions:lg2"
section: 9.7.3.20
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.20. Floating Point Instructions:lg2


`lg2`

Find the base-2 logarithm of a value.

Syntax

lg2.approx{.ftz}.f32  d, a;

Description

Determine the log2 of `a`.

Semantics

d = log(a) / log(2);

Notes

`lg2.approx.f32` implements a fast approximation to log2(a).

Input | Result  
---|---  
-Inf | NaN  
-normal | NaN  
-0.0 | -Inf  
+0.0 | -Inf  
+Inf | +Inf  
NaN | NaN

The maximum absolute error is 2-22 when the input operand is in the range (0.5, 2). For positive finite inputs outside of this interval, maximum relative error is 2-22.

Subnormal numbers:

`sm_20+`  
    

By default, subnormal numbers are supported.

`lg2.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

Subnormal inputs and results to sign-preserving zero.

PTX ISA Notes

`lg2.f32` introduced in PTX ISA version 1.0. Explicit modifiers `.approx` and `.ftz` introduced in PTX ISA version 1.4.

For PTX ISA version 1.4 and later, the `.approx` modifier is required.

For PTX ISA versions 1.0 through 1.3, `lg2.f32` defaults to `lg2.approx.ftz.f32`.

Target ISA Notes

Supported on all target architectures.

Examples

lg2.approx.ftz.f32  la, a;