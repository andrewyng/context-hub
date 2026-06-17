---
name: ptx-and
description: Bitwise AND.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.1. Logic and Shift Instructions:and

---
title: "9.7.8.1. Logic and Shift Instructions:and"
section: 9.7.8.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.1. Logic and Shift Instructions:and


`and`

Bitwise AND.

Syntax

and.type d, a, b;
    
    .type = { .pred, .b16, .b32, .b64 };

Description

Compute the bit-wise and operation for the bits in `a` and `b`.

Semantics

d = a & b;

Notes

The size of the operands must match, but not necessarily the type.

Allowed types include predicate registers.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

and.b32  x,q,r;
    and.b32  sign,fpvalue,0x80000000;