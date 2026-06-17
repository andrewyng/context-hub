---
name: ptx-or
description: Biwise OR.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.2. Logic and Shift Instructions:or

---
title: "9.7.8.2. Logic and Shift Instructions:or"
section: 9.7.8.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.2. Logic and Shift Instructions:or


`or`

Biwise OR.

Syntax

or.type d, a, b;
    
    .type = { .pred, .b16, .b32, .b64 };

Description

Compute the bit-wise or operation for the bits in `a` and `b`.

Semantics

d = a | b;

Notes

The size of the operands must match, but not necessarily the type.

Allowed types include predicate registers.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

or.b32  mask mask,0x00010001
    or.pred  p,q,r;