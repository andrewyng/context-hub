---
name: ptx-special-registersnctaid
description: Number of CTA ids per grid.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.7. Special Registers:%nctaid

---
title: "10.7. Special Registers:%nctaid"
section: 10.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.7. Special Registers:%nctaid


`%nctaid`

Number of CTA ids per grid.

Syntax (predefined)

.sreg .v4 .u32 %nctaid                      // Grid shape vector
    .sreg .u32 %nctaid.x,%nctaid.y,%nctaid.z;   // Grid dimensions

Description

A predefined, read-only special register initialized with the number of CTAs in each grid dimension. The `%nctaid` special register contains a 3D grid shape vector, with each element having a value of at least `1`. The fourth element is unused and always returns zero.

Maximum values of %nctaid.{x,y,z} are as follows:

.target architecture | %nctaid.x | %nctaid.y | %nctaid.z  
---|---|---|---  
`sm_1x`, `sm_20` | 65535 | 65535 | 65535  
`sm_3x`, `sm_5x`, `sm_6x`, `sm_7x`, `sm_8x`, `sm_9x`, `sm_10x`, `sm_12x` | 231 -1 | 65535 | 65535

PTX ISA Notes

Introduced in PTX ISA version 1.0 with type `.v4.u16`.

Redefined as type `.v4.u32` in PTX ISA version 2.0. For compatibility with legacy PTX code, 16-bit `mov` and `cvt` instructions may be used to read the lower 16-bits of each component of `%nctaid`.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32  %r0,%nctaid.x;
    mov.u16  %rh,%nctaid.x;     // legacy code