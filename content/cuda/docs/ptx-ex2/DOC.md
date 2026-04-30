---
name: ptx-ex2
description: Find the base-2 exponent of input.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.4.10. Half Precision Floating Point Instructions:ex2

---
title: "9.7.4.10. Half Precision Floating Point Instructions:ex2"
section: 9.7.4.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.4.10. Half Precision Floating Point Instructions:ex2


`ex2`

Find the base-2 exponent of input.

Syntax

ex2.approx.atype     d, a;
    ex2.approx.ftz.btype d, a;
    
    .atype = { .f16,  .f16x2}
    .btype = { .bf16, .bf16x2}

Description

Raise 2 to the power `a`.

The type of operands `d` and `a` are as specified by `.type`.

For `.f16x2` or `.bf16x2` instruction type, each of the half-word operands are operated in parallel and the results are packed appropriately into a `.f16x2` or `.bf16x2`.

Semantics

if (.type == .f16 || .type == .bf16) {
      d = 2 ^ a
    } else if (.type == .f16x2 || .type == .bf16x2) {
      fA[0] = a[0:15];
      fA[1] = a[16:31];
      d[0] = 2 ^ fA[0]
      d[1] = 2 ^ fA[1]
    }

Notes

`ex2.approx.{f16, f16x2, bf16, bf16x2}` implement a fast approximation to 2a.

For the `.f16` type, subnormal inputs are supported. `ex2.approx.ftz.bf16` flushes subnormal inputs and results to sign-preserving zero.

Results of `ex2.approx.ftz.bf16` for various corner-case inputs are as follows:

Input | Result  
---|---  
-Inf | +0.0  
-subnormal | +1.0  
-0.0 | +1.0  
+0.0 | +1.0  
+subnormal | +1.0  
+Inf | +Inf  
NaN | NaN

Results of `ex2.approx.f16` for various corner-case inputs are as follows:

Input | Result  
---|---  
-Inf | +0.0  
-0.0 | +1.0  
+0.0 | +1.0  
+Inf | +Inf  
NaN | NaN

The maximum relative error for `.f16` type is 2-9.9. The maximum relative error for `.bf16` type is 2-7.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

`ex2.approx.ftz.{bf16/bf16x2}` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_75` or higher.

`ex2.approx.ftz.{bf16/bf16x2}` requires `sm_90` or higher.

Examples

ex2.approx.f16         h1, h0;
    ex2.approx.f16x2       hd1, hd0;
    ex2.approx.ftz.bf16    b1, b2;
    ex2.approx.ftz.bf16x2  hb1, hb2;