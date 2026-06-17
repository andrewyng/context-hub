---
name: ptx-xor
description: Bitwise exclusive-OR (inequality).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.3. Logic and Shift Instructions:xor

---
title: "9.7.8.3. Logic and Shift Instructions:xor"
section: 9.7.8.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.3. Logic and Shift Instructions:xor


`xor`

Bitwise exclusive-OR (inequality).

Syntax

xor.type d, a, b;
    
    .type = { .pred, .b16, .b32, .b64 };

Description

Compute the bit-wise exclusive-or operation for the bits in `a` and `b`.

Semantics

d = a ^ b;

Notes

The size of the operands must match, but not necessarily the type.

Allowed types include predicate registers.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

xor.b32  d,q,r;
    xor.b16  d,x,0x0001;