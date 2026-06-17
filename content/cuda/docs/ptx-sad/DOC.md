---
name: ptx-sad
description: Sum of absolute differences.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.7. Integer Arithmetic Instructions:sad

---
title: "9.7.1.7. Integer Arithmetic Instructions:sad"
section: 9.7.1.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.7. Integer Arithmetic Instructions:sad


`sad`

Sum of absolute differences.

Syntax

sad.type  d, a, b, c;
    
    .type = { .u16, .u32, .u64,
              .s16, .s32, .s64 };

Description

Adds the absolute value of `a-b` to `c` and writes the resulting value into `d`.

Semantics

d = c + ((a<b) ? b-a : a-b);

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

sad.s32  d,a,b,c;
    sad.u32  d,a,b,d;  // running sum