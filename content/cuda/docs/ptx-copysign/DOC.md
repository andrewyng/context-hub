---
name: ptx-copysign
description: Copy sign of one input to another.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.2. Floating Point Instructions:copysign

---
title: "9.7.3.2. Floating Point Instructions:copysign"
section: 9.7.3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.2. Floating Point Instructions:copysign


`copysign`

Copy sign of one input to another.

Syntax

copysign.type  d, a, b;
    
    .type = { .f32, .f64 };

Description

Copy sign bit of `a` into value of `b`, and return the result as `d`.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

Requires `sm_20` or higher.

Examples

copysign.f32  x, y, z;
    copysign.f64  A, B, C;