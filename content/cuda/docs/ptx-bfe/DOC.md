---
name: ptx-bfe
description: Bit Field Extract.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.19. Integer Arithmetic Instructions:bfe

---
title: "9.7.1.19. Integer Arithmetic Instructions:bfe"
section: 9.7.1.19
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.19. Integer Arithmetic Instructions:bfe


`bfe`

Bit Field Extract.

Syntax

bfe.type  d, a, b, c;
    
    .type = { .u32, .u64,
              .s32, .s64 };

Description

Extract bit field from `a` and place the zero or sign-extended result in `d`. Source `b` gives the bit field starting bit position, and source `c` gives the bit field length in bits.

Operands `a` and `d` have the same type as the instruction type. Operands `b` and `c` are type `.u32`, but are restricted to the 8-bit value range `0..255`.

The sign bit of the extracted field is defined as:

`.u32`, `.u64`:
    

zero

`.s32`, `.s64`:
    

`msb` of input a if the extracted field extends beyond the `msb` of a `msb` of extracted field, otherwise

If the bit field length is zero, the result is zero.

The destination `d` is padded with the sign bit of the extracted field. If the start position is beyond the `msb` of the input, the destination `d` is filled with the replicated sign bit of the extracted field.

Semantics

msb = (.type==.u32 || .type==.s32) ? 31 : 63;
    pos = b & 0xff;  // pos restricted to 0..255 range
    len = c & 0xff;  // len restricted to 0..255 range
    
    if (.type==.u32 || .type==.u64 || len==0)
        sbit = 0;
    else
        sbit = a[min(pos+len-1,msb)];
    
    d = 0;
    for (i=0; i<=msb; i++) {
        d[i] = (i<len && pos+i<=msb) ? a[pos+i] : sbit;
    }

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`bfe` requires `sm_20` or higher.

Examples

bfe.b32  d,a,start,len;