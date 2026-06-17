---
name: ptx-rcpapproxftzf64
description: '`rcp.approx.ftz.f64`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.14. Floating Point Instructions:rcp.approx.ftz.f64

---
title: "9.7.3.14. Floating Point Instructions:rcp.approx.ftz.f64"
section: 9.7.3.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.14. Floating Point Instructions:rcp.approx.ftz.f64


`rcp.approx.ftz.f64`

Compute a fast, gross approximation to the reciprocal of a value.

Syntax

rcp.approx.ftz.f64  d, a;

Description

Compute a fast, gross approximation to the reciprocal as follows:

1. extract the most-significant 32 bits of `.f64` operand `a` in 1.11.20 IEEE floating-point format (i.e., ignore the least-significant 32 bits of `a`),

  2. compute an approximate `.f64` reciprocal of this value using the most-significant 20 bits of the mantissa of operand `a`,

  3. place the resulting 32-bits in 1.11.20 IEEE floating-point format in the most-significant 32-bits of destination `d`,and

  4. zero the least significant 32 mantissa bits of `.f64` destination `d`.

Semantics

tmp = a[63:32]; // upper word of a, 1.11.20 format
    d[63:32] = 1.0 / tmp;
    d[31:0] = 0x00000000;

Notes

`rcp.approx.ftz.f64` implements a fast, gross approximation to reciprocal.

Input a[63:32] | Result d[63:32]  
---|---  
-Inf | -0.0  
-subnormal | -Inf  
-0.0 | -Inf  
+0.0 | +Inf  
+subnormal | +Inf  
+Inf | +0.0  
NaN | NaN

Input `NaN`s map to a canonical `NaN` with encoding `0x7fffffff00000000`.

Subnormal inputs and results are flushed to sign-preserving zero.

PTX ISA Notes

`rcp.approx.ftz.f64` introduced in PTX ISA version 2.1.

Target ISA Notes

`rcp.approx.ftz.f64` requires `sm_20` or higher.

Examples

rcp.approx.ftz.f64  xi,x;