---
name: ptx-shr
description: Shift bits right, sign or zero-fill on left.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.9. Logic and Shift Instructions:shr

---
title: "9.7.8.9. Logic and Shift Instructions:shr"
section: 9.7.8.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.9. Logic and Shift Instructions:shr


`shr`

Shift bits right, sign or zero-fill on left.

Syntax

shr.type d, a, b;
    
    .type = { .b16, .b32, .b64,
              .u16, .u32, .u64,
              .s16, .s32, .s64 };

Description

Shift `a` right by the amount specified by unsigned 32-bit value in `b`. Signed shifts fill with the sign bit, unsigned and untyped shifts fill with `0`.

Semantics

d = a >> b;

Notes

Shift amounts greater than the register width _N_ are clamped to _N_.

The sizes of the destination and first source operand must match, but not necessarily the type. The `b` operand must be a 32-bit value, regardless of the instruction type.

Bit-size types are included for symmetry with `shl`.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Example

shr.u16  c,a,2;
    shr.s32  i,i,1;
    shr.b16  k,i,j;