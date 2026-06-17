---
name: ptx-shl
description: Shift bits left, zero-fill on right.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.8. Logic and Shift Instructions:shl

---
title: "9.7.8.8. Logic and Shift Instructions:shl"
section: 9.7.8.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.8. Logic and Shift Instructions:shl


`shl`

Shift bits left, zero-fill on right.

Syntax

shl.type d, a, b;
    
    .type = { .b16, .b32, .b64 };

Description

Shift `a` left by the amount specified by unsigned 32-bit value in `b`.

Semantics

d = a << b;

Notes

Shift amounts greater than the register width _N_ are clamped to _N_.

The sizes of the destination and first source operand must match, but not necessarily the type. The `b` operand must be a 32-bit value, regardless of the instruction type.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Example

shl.b32  q,a,2;