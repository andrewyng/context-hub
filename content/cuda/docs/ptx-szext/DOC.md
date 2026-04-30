---
name: ptx-szext
description: Sign-extend or Zero-extend.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.21. Integer Arithmetic Instructions:szext

---
title: "9.7.1.21. Integer Arithmetic Instructions:szext"
section: 9.7.1.21
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.21. Integer Arithmetic Instructions:szext


`szext`

Sign-extend or Zero-extend.

Syntax

szext.mode.type  d, a, b;
    
    .mode = { .clamp, .wrap };
    .type = { .u32, .s32 };

Description

Sign-extends or zero-extends an N-bit value from operand `a` where N is specified in operand `b`. The resulting value is stored in the destination operand `d`.

For the `.s32` instruction type, the value in `a` is treated as an N-bit signed value and the most significant bit of this N-bit value is replicated up to bit 31. For the `.u32` instruction type, the value in `a` is treated as an N-bit unsigned number and is zero-extended to 32 bits. Operand `b` is an unsigned 32-bit value.

If the value of N is 0, then the result of `szext` is 0. If the value of N is 32 or higher, then the result of `szext` depends upon the value of the `.mode` qualifier as follows:

* If `.mode` is `.clamp`, then the result is the same as the source operand `a`.

  * If `.mode` is `.wrap`, then the result is computed using the wrapped value of N.

Semantics

b1        = b & 0x1f;
    too_large = (b >= 32 && .mode == .clamp) ? true : false;
    mask      = too_large ? 0 : (~0) << b1;
    sign_pos  = (b1 - 1) & 0x1f;
    
    if (b1 == 0 || too_large || .type != .s32) {
        sign_bit = false;
    } else {
        sign_bit = (a >> sign_pos) & 1;
    }
    d = (a & ~mask) | (sign_bit ? mask | 0);

PTX ISA Notes

Introduced in PTX ISA version 7.6.

Target ISA Notes

`szext` requires `sm_70` or higher.

Examples

szext.clamp.s32 rd, ra, rb;
    szext.wrap.u32  rd, 0xffffffff, 0; // Result is 0.