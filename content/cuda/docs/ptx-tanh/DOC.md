---
name: ptx-tanh
description: Find the hyperbolic tangent of a value (in radians)
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.4.9. Half Precision Floating Point Instructions:tanh

---
title: "9.7.4.9. Half Precision Floating Point Instructions:tanh"
section: 9.7.4.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.4.9. Half Precision Floating Point Instructions:tanh


`tanh`

Find the hyperbolic tangent of a value (in radians)

Syntax

tanh.approx.type d, a;
    
    .type = {.f16, .f16x2, .bf16, .bf16x2}

Description

Take hyperbolic tangent value of `a`.

The type of operands `d` and `a` are as specified by `.type`.

For `.f16x2` or `.bf16x2` instruction type, each of the half-word operands are operated in parallel and the results are packed appropriately into a `.f16x2` or `.bf16x2`.

Semantics

if (.type == .f16 || .type == .bf16) {
      d = tanh(a)
    } else if (.type == .f16x2 || .type == .bf16x2) {
      fA[0] = a[0:15];
      fA[1] = a[16:31];
      d[0] = tanh(fA[0])
      d[1] = tanh(fA[1])
    }

Notes

`tanh.approx.{f16, f16x2, bf16, bf16x2}` implements an approximate hyperbolic tangent in the target format.

Results of `tanh` for various corner-case inputs are as follows:

Input | Result  
---|---  
-Inf | -1.0  
-0.0 | -0.0  
+0.0 | +0.0  
+Inf | 1.0  
NaN | NaN

The maximum absolute error for `.f16` type is 2-10.987. The maximum absolute error for `.bf16` type is 2-8.

The subnormal numbers are supported.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

`tanh.approx.{bf16/bf16x2}` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_75` or higher.

`tanh.approx.{bf16/bf16x2}` requires `sm_90` or higher.

Examples

tanh.approx.f16    h1, h0;
    tanh.approx.f16x2  hd1, hd0;
    tanh.approx.bf16   b1, b0;
    tanh.approx.bf16x2 hb1, hb0;