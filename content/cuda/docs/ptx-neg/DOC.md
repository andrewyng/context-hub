---
name: ptx-neg
description: Arithmetic negate.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.10. Floating Point Instructions:neg

---
title: "9.7.3.10. Floating Point Instructions:neg"
section: 9.7.3.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.10. Floating Point Instructions:neg


`neg`

Arithmetic negate.

Syntax

neg{.ftz}.f32  d, a;
    neg.f64        d, a;

Description

Negate the sign of `a` and store the result in `d`.

Semantics

d = -a;

Notes

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

`neg.ftz.f32` flushes subnormal inputs and results to sign-preserving zero.

`sm_1x`
    

`neg.f64` supports subnormal numbers.

`neg.f32` flushes subnormal inputs and results to sign-preserving zero.

`NaN` inputs yield an unspecified `NaN`. Future implementations may comply with the IEEE 754 standard by preserving payload and modifying only the sign bit.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`neg.f32` supported on all target architectures.

`neg.f64` requires `sm_13` or higher.

Examples

neg.ftz.f32  x,f0;