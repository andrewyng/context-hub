---
name: ptx-bfi
description: Bit Field Insert.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.20. Integer Arithmetic Instructions:bfi

---
title: "9.7.1.20. Integer Arithmetic Instructions:bfi"
section: 9.7.1.20
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.20. Integer Arithmetic Instructions:bfi


`bfi`

Bit Field Insert.

Syntax

bfi.type  f, a, b, c, d;
    
    .type = { .b32, .b64 };

Description

Align and insert a bit field from `a` into `b`, and place the result in `f`. Source `c` gives the starting bit position for the insertion, and source `d` gives the bit field length in bits.

Operands `a`, `b`, and `f` have the same type as the instruction type. Operands `c` and `d` are type `.u32`, but are restricted to the 8-bit value range `0..255`.

If the bit field length is zero, the result is `b`.

If the start position is beyond the msb of the input, the result is `b`.

Semantics

msb = (.type==.b32) ? 31 : 63;
    pos = c & 0xff;  // pos restricted to 0..255 range
    len = d & 0xff;  // len restricted to 0..255 range
    
    f = b;
    for (i=0; i<len && pos+i<=msb; i++) {
        f[pos+i] = a[i];
    }

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`bfi` requires `sm_20` or higher.

Examples

bfi.b32  d,a,b,start,len;