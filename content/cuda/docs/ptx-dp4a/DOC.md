---
name: ptx-dp4a
description: Four-way byte dot product-accumulate.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.23. Integer Arithmetic Instructions:dp4a

---
title: "9.7.1.23. Integer Arithmetic Instructions:dp4a"
section: 9.7.1.23
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.23. Integer Arithmetic Instructions:dp4a


`dp4a`

Four-way byte dot product-accumulate.

Syntax

dp4a.atype.btype  d, a, b, c;
    
    .atype = .btype = { .u32, .s32 };

Description

Four-way byte dot product which is accumulated in 32-bit result.

Operand `a` and `b` are 32-bit inputs which hold 4 byte inputs in packed form for dot product.

Operand `c` has type `.u32` if both `.atype` and `.btype` are `.u32` else operand `c` has type `.s32`.

Semantics

d = c;
    
    // Extract 4 bytes from a 32bit input and sign or zero extend
    // based on input type.
    Va = extractAndSignOrZeroExt_4(a, .atype);
    Vb = extractAndSignOrZeroExt_4(b, .btype);
    
    for (i = 0; i < 4; ++i) {
        d += Va[i] * Vb[i];
    }

PTX ISA Notes

Introduced in PTX ISA version 5.0.

Target ISA Notes

Requires `sm_61` or higher.

Examples

dp4a.u32.u32           d0, a0, b0, c0;
    dp4a.u32.s32           d1, a1, b1, c1;