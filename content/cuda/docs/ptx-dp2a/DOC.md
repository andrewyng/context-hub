---
name: ptx-dp2a
description: Two-way dot product-accumulate.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.24. Integer Arithmetic Instructions:dp2a

---
title: "9.7.1.24. Integer Arithmetic Instructions:dp2a"
section: 9.7.1.24
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.24. Integer Arithmetic Instructions:dp2a


`dp2a`

Two-way dot product-accumulate.

Syntax

dp2a.mode.atype.btype  d, a, b, c;
    
    .atype = .btype = { .u32, .s32 };
    .mode = { .lo, .hi };

Description

Two-way 16-bit to 8-bit dot product which is accumulated in 32-bit result.

Operand `a` and `b` are 32-bit inputs. Operand `a` holds two 16-bits inputs in packed form and operand `b` holds 4 byte inputs in packed form for dot product.

Depending on the `.mode` specified, either lower half or upper half of operand `b` will be used for dot product.

Operand `c` has type `.u32` if both `.atype` and `.btype` are `.u32` else operand `c` has type `.s32`.

Semantics

d = c;
    // Extract two 16-bit values from a 32-bit input and sign or zero extend
    // based on input type.
    Va = extractAndSignOrZeroExt_2(a, .atype);
    
    // Extract four 8-bit values from a 32-bit input and sign or zer extend
    // based on input type.
    Vb = extractAndSignOrZeroExt_4(b, .btype);
    
    b_select = (.mode == .lo) ? 0 : 2;
    
    for (i = 0; i < 2; ++i) {
        d += Va[i] * Vb[b_select + i];
    }

PTX ISA Notes

Introduced in PTX ISA version 5.0.

Target ISA Notes

Requires `sm_61` or higher.

Examples

dp2a.lo.u32.u32           d0, a0, b0, c0;
    dp2a.hi.u32.s32           d1, a1, b1, c1;