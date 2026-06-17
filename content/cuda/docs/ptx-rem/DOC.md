---
name: ptx-rem
description: The remainder of integer division.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.9. Integer Arithmetic Instructions:rem

---
title: "9.7.1.9. Integer Arithmetic Instructions:rem"
section: 9.7.1.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.9. Integer Arithmetic Instructions:rem


`rem`

The remainder of integer division.

Syntax

rem.type  d, a, b;
    
    .type = { .u16, .u32, .u64,
              .s16, .s32, .s64 };

Description

Divides `a` by `b`, store the remainder in `d`.

Semantics

d = a % b;

Notes

The behavior for negative numbers is machine-dependent and depends on whether divide rounds towards zero or negative infinity.

Division by zero yields an unspecified, machine-specific value.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

rem.s32  x,x,8;    // x = x%8;