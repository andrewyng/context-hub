---
name: ptx-rsqrtapproxftzf64
description: '`rsqrt.approx.ftz.f64`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.17. Floating Point Instructions:rsqrt.approx.ftz.f64

---
title: "9.7.3.17. Floating Point Instructions:rsqrt.approx.ftz.f64"
section: 9.7.3.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.17. Floating Point Instructions:rsqrt.approx.ftz.f64


`rsqrt.approx.ftz.f64`

Compute an approximation of the square root reciprocal of a value.

Syntax

rsqrt.approx.ftz.f64 d, a;

Description

Compute a double-precision (`.f64`) approximation of the square root reciprocal of a value. The least significant 32 bits of the double-precision (`.f64`) destination `d` are all zeros.

Semantics

tmp = a[63:32]; // upper word of a, 1.11.20 format
    d[63:32] = 1.0 / sqrt(tmp);
    d[31:0] = 0x00000000;

Notes

`rsqrt.approx.ftz.f64` implements a fast approximation of the square root reciprocal of a value.

Input | Result  
---|---  
-Inf | NaN  
-subnormal | -Inf  
-0.0 | -Inf  
+0.0 | +Inf  
+subnormal | +Inf  
+Inf | +0.0  
NaN | NaN

Input `NaN`s map to a canonical `NaN` with encoding `0x7fffffff00000000`.

Subnormal inputs and results are flushed to sign-preserving zero.

PTX ISA Notes

`rsqrt.approx.ftz.f64` introduced in PTX ISA version 4.0.

Target ISA Notes

`rsqrt.approx.ftz.f64` requires `sm_20` or higher.

Examples

rsqrt.approx.ftz.f64 xi,x;